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
    const category = searchParams.get('category') || '';
    const complianceStatus = searchParams.get('complianceStatus') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (complianceStatus) {
      where.complianceStatus = complianceStatus;
    }

    const allowedSortFields = ['createdAt', 'name', 'code', 'rating', 'qualityScore', 'deliveryScore'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { purchaseOrders: true, inventoryItems: true, contracts: true },
          },
        },
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, code, email, phone, address, city, state, country, abn, contactPerson, category, paymentTerms, leadTimeDays, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const existingCode = await prisma.supplier.findUnique({ where: { code } });
    if (existingCode) {
      return NextResponse.json({ error: 'A supplier with this code already exists' }, { status: 409 });
    }

    const validPaymentTerms = ['NET30', 'NET60', 'NET90', 'COD'];
    if (paymentTerms && !validPaymentTerms.includes(paymentTerms)) {
      return NextResponse.json(
        { error: `paymentTerms must be one of: ${validPaymentTerms.join(', ')}` },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || 'Australia',
        abn: abn || null,
        contactPerson: contactPerson || null,
        category: category || null,
        paymentTerms: paymentTerms || 'NET30',
        leadTimeDays: leadTimeDays && typeof leadTimeDays === 'number' ? leadTimeDays : 7,
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
