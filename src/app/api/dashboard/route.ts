import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      draftOrders,
      orderedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSuppliers,
      activeSuppliers,
      inventoryItems,
      activeShipments,
      monthlyOrders,
      lastMonthOrders,
      deliveredWithDates,
      recentOrders,
      topSuppliers,
    ] = await Promise.all([
      // Total orders
      prisma.purchaseOrder.count(),

      // Pending approval orders
      prisma.purchaseOrder.count({ where: { status: 'PENDING_APPROVAL' } }),

      // Approved orders
      prisma.purchaseOrder.count({ where: { status: 'APPROVED' } }),

      // Draft orders
      prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),

      // Ordered (placed with supplier)
      prisma.purchaseOrder.count({ where: { status: 'ORDERED' } }),

      // Shipped
      prisma.purchaseOrder.count({ where: { status: 'SHIPPED' } }),

      // Delivered
      prisma.purchaseOrder.count({ where: { status: 'DELIVERED' } }),

      // Cancelled
      prisma.purchaseOrder.count({ where: { status: 'CANCELLED' } }),

      // Total suppliers
      prisma.supplier.count(),

      // Active suppliers
      prisma.supplier.count({ where: { status: 'ACTIVE' } }),

      // All inventory items for value + low stock calculation
      prisma.inventoryItem.findMany({
        select: { currentStock: true, unitPrice: true, reorderPoint: true },
      }),

      // Active shipments (not delivered or returned)
      prisma.shipment.count({
        where: { status: { notIn: ['DELIVERED', 'RETURNED'] } },
      }),

      // This month's orders for monthly spend
      prisma.purchaseOrder.aggregate({
        where: {
          orderDate: { gte: startOfMonth },
          status: { notIn: ['CANCELLED', 'DRAFT'] },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Last month's orders for comparison
      prisma.purchaseOrder.aggregate({
        where: {
          orderDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { notIn: ['CANCELLED', 'DRAFT'] },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Delivered orders with expected and actual dates for on-time calculation
      prisma.purchaseOrder.findMany({
        where: {
          status: 'DELIVERED',
          actualDelivery: { not: null },
          expectedDelivery: { not: null },
        },
        select: { expectedDelivery: true, actualDelivery: true },
      }),

      // Recent orders
      prisma.purchaseOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          orderDate: true,
          supplier: { select: { name: true } },
        },
      }),

      // Top suppliers by order count
      prisma.supplier.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { purchaseOrders: { _count: 'desc' } },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          rating: true,
          _count: { select: { purchaseOrders: true } },
        },
      }),
    ]);

    // Calculate inventory value and low stock count
    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.currentStock * item.unitPrice,
      0
    );

    const lowStockCount = inventoryItems.filter(
      (item) => item.currentStock <= item.reorderPoint
    ).length;

    // Calculate on-time delivery rate
    let onTimeDeliveryRate = 0;
    if (deliveredWithDates.length > 0) {
      const onTimeCount = deliveredWithDates.filter(
        (order) => order.actualDelivery! <= order.expectedDelivery!
      ).length;
      onTimeDeliveryRate = Math.round((onTimeCount / deliveredWithDates.length) * 100);
    }

    // Monthly spend
    const monthlySpend = monthlyOrders._sum.totalAmount || 0;
    const lastMonthSpend = lastMonthOrders._sum.totalAmount || 0;
    const spendChange = lastMonthSpend > 0
      ? Math.round(((monthlySpend - lastMonthSpend) / lastMonthSpend) * 100)
      : 0;

    return NextResponse.json({
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          totalSuppliers,
          activeSuppliers,
          inventoryValue: Math.round(inventoryValue * 100) / 100,
          lowStockCount,
          monthlySpend: Math.round(monthlySpend * 100) / 100,
          lastMonthSpend: Math.round(lastMonthSpend * 100) / 100,
          spendChange,
          onTimeDeliveryRate,
          activeShipments,
        },
        ordersByStatus: {
          draft: draftOrders,
          pendingApproval: pendingOrders,
          approved: approvedOrders,
          ordered: orderedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        monthlyOrderCount: monthlyOrders._count,
        recentOrders,
        topSuppliers,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
