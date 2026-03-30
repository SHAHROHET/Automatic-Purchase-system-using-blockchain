import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/search?q=<query>
 * Global search across purchase orders, suppliers, and inventory items.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const [orders, suppliers, inventory] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q } },
            { notes: { contains: q } },
            { supplier: { name: { contains: q } } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          supplier: { select: { name: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),

      prisma.supplier.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
            { email: { contains: q } },
            { category: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          category: true,
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),

      prisma.inventoryItem.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          currentStock: true,
          status: true,
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      results: {
        orders: orders.map((o) => ({
          id: o.id,
          label: o.orderNumber,
          sublabel: o.supplier?.name || '',
          status: o.status,
          type: 'order' as const,
          href: `/purchase-orders/${o.id}`,
        })),
        suppliers: suppliers.map((s) => ({
          id: s.id,
          label: s.name,
          sublabel: `${s.code} · ${s.category || ''}`,
          status: s.status,
          type: 'supplier' as const,
          href: `/suppliers`,
        })),
        inventory: inventory.map((i) => ({
          id: i.id,
          label: i.name,
          sublabel: `${i.sku} · ${i.currentStock} in stock`,
          status: i.status,
          type: 'inventory' as const,
          href: `/inventory`,
        })),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
