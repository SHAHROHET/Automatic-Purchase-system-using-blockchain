import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const supplierId = searchParams.get('supplierId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { notes: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        (where.orderDate as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.orderDate as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const allowedSortFields = ['createdAt', 'orderDate', 'totalAmount', 'orderNumber', 'status', 'priority'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          items: true,
          _count: { select: { shipments: true } },
        },
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { supplierId, createdById, priority, expectedDelivery, notes, items, isAutomated } = body;

    if (!supplierId || typeof supplierId !== 'string') {
      return NextResponse.json(
        { error: 'supplierId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!createdById || typeof createdById !== 'string') {
      return NextResponse.json(
        { error: 'createdById is required and must be a string' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || typeof item.description !== 'string') {
        return NextResponse.json(
          { error: `Item ${i + 1}: description is required` },
          { status: 400 }
        );
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Item ${i + 1}: quantity must be a positive number` },
          { status: 400 }
        );
      }
      if (item.unitPrice === undefined || typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        return NextResponse.json(
          { error: `Item ${i + 1}: unitPrice must be a non-negative number` },
          { status: 400 }
        );
      }
    }

    const [supplierExists, userExists] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: supplierId } }),
      prisma.user.findUnique({ where: { id: createdById } }),
    ]);

    if (!supplierExists) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate order number: PO-YYYY-NNNNN
    const year = new Date().getFullYear();
    const lastOrder = await prisma.purchaseOrder.findFirst({
      where: { orderNumber: { startsWith: `PO-${year}-` } },
      orderBy: { orderNumber: 'desc' },
    });

    let nextSeq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
    const orderNumber = `PO-${year}-${String(nextSeq).padStart(5, '0')}`;

    // Calculate totals
    const processedItems = items.map((item: { description: string; sku?: string; quantity: number; unitPrice: number; unit?: string; inventoryItemId?: string }) => ({
      description: item.description,
      sku: item.sku || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      unit: item.unit || 'EA',
      inventoryItemId: item.inventoryItemId || null,
    }));

    const subtotal = processedItems.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% GST for Australia
    const shippingCost = body.shippingCost || 0;
    const totalAmount = subtotal + tax + shippingCost;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        createdById,
        status: 'DRAFT',
        priority: priority || 'MEDIUM',
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        notes: notes || null,
        isAutomated: isAutomated || false,
        items: {
          create: processedItems,
        },
      },
      include: {
        supplier: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({ data: purchaseOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
