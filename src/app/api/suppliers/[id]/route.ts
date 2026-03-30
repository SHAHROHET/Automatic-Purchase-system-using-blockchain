import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderDate: true,
          },
        },
        inventoryItems: {
          select: { id: true, name: true, sku: true, currentStock: true, unitPrice: true },
        },
        contracts: {
          orderBy: { endDate: 'desc' },
          select: {
            id: true,
            contractNumber: true,
            title: true,
            startDate: true,
            endDate: true,
            value: true,
            status: true,
          },
        },
        _count: { select: { purchaseOrders: true, inventoryItems: true, contracts: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const {
      name, email, phone, address, city, state, country, abn,
      contactPerson, category, rating, status, paymentTerms,
      leadTimeDays, qualityScore, deliveryScore, complianceStatus, notes,
    } = body;

    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const validPaymentTerms = ['NET30', 'NET60', 'NET90', 'COD'];
    if (paymentTerms && !validPaymentTerms.includes(paymentTerms)) {
      return NextResponse.json(
        { error: `paymentTerms must be one of: ${validPaymentTerms.join(', ')}` },
        { status: 400 }
      );
    }

    const validComplianceStatuses = ['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW'];
    if (complianceStatus && !validComplianceStatuses.includes(complianceStatus)) {
      return NextResponse.json(
        { error: `complianceStatus must be one of: ${validComplianceStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (abn !== undefined) updateData.abn = abn;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (category !== undefined) updateData.category = category;
    if (rating !== undefined) updateData.rating = rating;
    if (status !== undefined) updateData.status = status;
    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms;
    if (leadTimeDays !== undefined) updateData.leadTimeDays = leadTimeDays;
    if (qualityScore !== undefined) updateData.qualityScore = qualityScore;
    if (deliveryScore !== undefined) updateData.deliveryScore = deliveryScore;
    if (complianceStatus !== undefined) updateData.complianceStatus = complianceStatus;
    if (notes !== undefined) updateData.notes = notes;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: { select: { purchaseOrders: true, inventoryItems: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    if (existing._count.purchaseOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with associated purchase orders. Consider marking as INACTIVE instead.' },
        { status: 400 }
      );
    }

    if (existing._count.inventoryItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with associated inventory items. Consider marking as INACTIVE instead.' },
        { status: 400 }
      );
    }

    // Delete related contracts first
    await prisma.supplierContract.deleteMany({ where: { supplierId: id } });
    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
