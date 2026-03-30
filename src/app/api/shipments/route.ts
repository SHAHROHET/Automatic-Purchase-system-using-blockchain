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
    const carrier = searchParams.get('carrier') || '';
    const purchaseOrderId = searchParams.get('purchaseOrderId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { carrier: { contains: search } },
        { origin: { contains: search } },
        { destination: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (carrier) {
      where.carrier = carrier;
    }

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    const allowedSortFields = ['createdAt', 'estimatedArrival', 'status', 'lastUpdate'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          purchaseOrder: {
            select: { id: true, orderNumber: true, status: true, totalAmount: true },
          },
          events: {
            orderBy: { timestamp: 'desc' },
            take: 3,
          },
        },
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      purchaseOrderId, trackingNumber, carrier, origin, destination,
      estimatedArrival, weight, notes,
    } = body;

    if (!purchaseOrderId || typeof purchaseOrderId !== 'string') {
      return NextResponse.json({ error: 'purchaseOrderId is required' }, { status: 400 });
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    if (!['APPROVED', 'ORDERED', 'SHIPPED'].includes(purchaseOrder.status)) {
      return NextResponse.json(
        { error: 'Shipments can only be created for APPROVED, ORDERED, or SHIPPED purchase orders' },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.create({
      data: {
        purchaseOrderId,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        origin: origin || null,
        destination: destination || '45 St Georges Terrace, Perth WA 6000',
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        weight: typeof weight === 'number' ? weight : null,
        notes: notes || null,
        events: {
          create: {
            status: 'PENDING',
            description: 'Shipment created',
          },
        },
      },
      include: {
        purchaseOrder: {
          select: { id: true, orderNumber: true, status: true },
        },
        events: true,
      },
    });

    // Update PO status to SHIPPED if it's currently ORDERED
    if (purchaseOrder.status === 'ORDERED') {
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: 'SHIPPED' },
      });
    }

    return NextResponse.json({ data: shipment }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}
