import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, code: true } },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        orderItems: {
          include: {
            purchaseOrder: {
              select: { id: true, orderNumber: true, status: true, orderDate: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const {
      name, description, category, supplierId, currentStock,
      minimumStock, maximumStock, reorderPoint, reorderQuantity,
      unitPrice, unit, location, abcCategory, leadTimeDays,
      averageDailyUsage, safetyStock, economicOrderQty, status,
      lastRestocked,
    } = body;

    if (supplierId !== undefined && supplierId !== null) {
      const supplierExists = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplierExists) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
    }

    const validStatuses = ['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    if (unitPrice !== undefined && (typeof unitPrice !== 'number' || unitPrice < 0)) {
      return NextResponse.json({ error: 'unitPrice must be a non-negative number' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (currentStock !== undefined) updateData.currentStock = currentStock;
    if (minimumStock !== undefined) updateData.minimumStock = minimumStock;
    if (maximumStock !== undefined) updateData.maximumStock = maximumStock;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
    if (reorderQuantity !== undefined) updateData.reorderQuantity = reorderQuantity;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (unit !== undefined) updateData.unit = unit;
    if (location !== undefined) updateData.location = location;
    if (abcCategory !== undefined) updateData.abcCategory = abcCategory;
    if (leadTimeDays !== undefined) updateData.leadTimeDays = leadTimeDays;
    if (averageDailyUsage !== undefined) updateData.averageDailyUsage = averageDailyUsage;
    if (safetyStock !== undefined) updateData.safetyStock = safetyStock;
    if (economicOrderQty !== undefined) updateData.economicOrderQty = economicOrderQty;
    if (status !== undefined) updateData.status = status;
    if (lastRestocked !== undefined) updateData.lastRestocked = lastRestocked ? new Date(lastRestocked) : null;

    // Track stock changes with a movement record
    if (currentStock !== undefined && currentStock !== existing.currentStock) {
      const diff = currentStock - existing.currentStock;
      await prisma.stockMovement.create({
        data: {
          inventoryItemId: id,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          reference: 'MANUAL_ADJUSTMENT',
          notes: `Stock adjusted from ${existing.currentStock} to ${currentStock}`,
        },
      });
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inventory item referenced by purchase order items. Consider marking as DISCONTINUED instead.' },
        { status: 400 }
      );
    }

    // Delete related stock movements first
    await prisma.stockMovement.deleteMany({ where: { inventoryItemId: id } });
    await prisma.inventoryItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
