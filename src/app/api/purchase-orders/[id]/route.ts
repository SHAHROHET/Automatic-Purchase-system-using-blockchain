import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            inventoryItem: { select: { id: true, name: true, sku: true, currentStock: true } },
          },
        },
        shipments: {
          include: {
            events: { orderBy: { timestamp: 'desc' }, take: 5 },
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json({ data: purchaseOrder });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    const {
      status,
      priority,
      expectedDelivery,
      actualDelivery,
      notes,
      approvalNotes,
      shippingCost,
      blockchainTxHash,
      blockchainStatus,
      items,
    } = body;

    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (expectedDelivery !== undefined) updateData.expectedDelivery = expectedDelivery ? new Date(expectedDelivery) : null;
    if (actualDelivery !== undefined) updateData.actualDelivery = actualDelivery ? new Date(actualDelivery) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (approvalNotes !== undefined) updateData.approvalNotes = approvalNotes;
    if (blockchainTxHash !== undefined) updateData.blockchainTxHash = blockchainTxHash;
    if (blockchainStatus !== undefined) updateData.blockchainStatus = blockchainStatus;

    // If items are provided, recalculate totals
    if (items && Array.isArray(items)) {
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

      // Delete existing items and recreate
      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });

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
      const tax = subtotal * 0.1;
      const finalShippingCost = shippingCost !== undefined ? shippingCost : existing.shippingCost;

      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.shippingCost = finalShippingCost;
      updateData.totalAmount = subtotal + tax + finalShippingCost;
      updateData.items = { create: processedItems };
    } else if (shippingCost !== undefined) {
      updateData.shippingCost = shippingCost;
      updateData.totalAmount = existing.subtotal + existing.tax + shippingCost;
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({ data: purchaseOrder });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { shipments: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    if (!['DRAFT', 'CANCELLED'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Only DRAFT or CANCELLED purchase orders can be deleted' },
        { status: 400 }
      );
    }

    if (existing.shipments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a purchase order with associated shipments' },
        { status: 400 }
      );
    }

    await prisma.purchaseOrder.delete({ where: { id } });

    return NextResponse.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}
