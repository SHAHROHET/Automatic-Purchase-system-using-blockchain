import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const supplierId = searchParams.get('supplierId') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (lowStock) {
      // Items where currentStock <= reorderPoint
      where.currentStock = { lte: prisma.inventoryItem.fields?.reorderPoint };
      // Prisma doesn't support field-to-field comparison directly in where,
      // so we use a raw approach: fetch all and filter, or use a workaround.
      // For SQLite compatibility, we'll use a simpler approach.
      delete where.currentStock;
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
      ];
      // We'll fetch and filter in post-processing for low stock
    }

    const allowedSortFields = ['createdAt', 'name', 'sku', 'currentStock', 'unitPrice', 'category'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    if (lowStock) {
      // For low stock, fetch all matching items and filter
      const allItems = await prisma.inventoryItem.findMany({
        where: (() => {
          const w = { ...where };
          delete w.AND;
          return w;
        })(),
        include: {
          supplier: { select: { id: true, name: true, code: true } },
        },
        orderBy: { [orderByField]: sortOrder },
      });

      const lowStockItems = allItems.filter(item => item.currentStock <= item.reorderPoint);
      const total = lowStockItems.length;
      const paginatedItems = lowStockItems.slice(skip, skip + limit);

      return NextResponse.json({
        data: paginatedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Clean up empty AND if present
    if (Array.isArray(where.AND) && where.AND.length === 0) {
      delete where.AND;
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, code: true } },
        },
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name, sku, description, category, supplierId, currentStock,
      minimumStock, maximumStock, reorderPoint, reorderQuantity,
      unitPrice, unit, location, abcCategory, leadTimeDays,
      averageDailyUsage, safetyStock, economicOrderQty,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
      return NextResponse.json({ error: 'sku is required' }, { status: 400 });
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }

    const existingSku = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ error: 'An item with this SKU already exists' }, { status: 409 });
    }

    if (supplierId) {
      const supplierExists = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplierExists) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
    }

    if (unitPrice !== undefined && (typeof unitPrice !== 'number' || unitPrice < 0)) {
      return NextResponse.json({ error: 'unitPrice must be a non-negative number' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description || null,
        category,
        supplierId: supplierId || null,
        currentStock: typeof currentStock === 'number' ? currentStock : 0,
        minimumStock: typeof minimumStock === 'number' ? minimumStock : 10,
        maximumStock: typeof maximumStock === 'number' ? maximumStock : 100,
        reorderPoint: typeof reorderPoint === 'number' ? reorderPoint : 20,
        reorderQuantity: typeof reorderQuantity === 'number' ? reorderQuantity : 50,
        unitPrice: typeof unitPrice === 'number' ? unitPrice : 0,
        unit: unit || 'EA',
        location: location || null,
        abcCategory: abcCategory || null,
        leadTimeDays: typeof leadTimeDays === 'number' ? leadTimeDays : 7,
        averageDailyUsage: typeof averageDailyUsage === 'number' ? averageDailyUsage : 0,
        safetyStock: typeof safetyStock === 'number' ? safetyStock : 5,
        economicOrderQty: typeof economicOrderQty === 'number' ? economicOrderQty : null,
      },
      include: {
        supplier: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
