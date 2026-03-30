import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: { select: { id: true, name: true, code: true } },
            items: true,
          },
        },
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({ data: shipment });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.shipment.findUnique({
      where: { id },
      include: { purchaseOrder: { select: { id: true, status: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const {
      trackingNumber, carrier, status, origin, destination,
      estimatedArrival, actualArrival, weight, notes,
    } = body;

    const validStatuses = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'RETURNED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (status !== undefined) updateData.status = status;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (estimatedArrival !== undefined) updateData.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : null;
    if (actualArrival !== undefined) updateData.actualArrival = actualArrival ? new Date(actualArrival) : null;
    if (weight !== undefined) updateData.weight = weight;
    if (notes !== undefined) updateData.notes = notes;

    updateData.lastUpdate = new Date();

    // Create a shipment event if status changed
    if (status && status !== existing.status) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: id,
          status,
          location: body.eventLocation || null,
          description: body.eventDescription || `Status updated to ${status}`,
        },
      });

      // If delivered, update the purchase order
      if (status === 'DELIVERED') {
        updateData.actualArrival = updateData.actualArrival || new Date();

        await prisma.purchaseOrder.update({
          where: { id: existing.purchaseOrderId },
          data: {
            status: 'DELIVERED',
            actualDelivery: new Date(),
          },
        });
      }
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        purchaseOrder: {
          select: { id: true, orderNumber: true, status: true },
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    return NextResponse.json({ data: shipment });
  } catch (error) {
    console.error('Error updating shipment:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}
