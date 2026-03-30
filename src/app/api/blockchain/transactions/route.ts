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
    const method = searchParams.get('method') || '';
    const referenceType = searchParams.get('referenceType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { txHash: { contains: search } },
        { from: { contains: search } },
        { to: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }

    if (status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'FAILED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (referenceType) {
      const validTypes = ['PURCHASE_ORDER', 'CONTRACT', 'PAYMENT'];
      if (!validTypes.includes(referenceType)) {
        return NextResponse.json(
          { error: `referenceType must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      where.referenceType = referenceType;
    }

    const allowedSortFields = ['createdAt', 'blockNumber', 'status', 'method'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [transactions, total] = await Promise.all([
      prisma.blockchainTransaction.findMany({
        where,
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.blockchainTransaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blockchain transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain transactions' },
      { status: 500 }
    );
  }
}
