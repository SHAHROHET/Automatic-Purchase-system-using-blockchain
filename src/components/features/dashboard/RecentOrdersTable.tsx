'use client';

import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatAUD } from '@/utils/format';

interface RecentOrder {
  id: string;
  orderNumber: string;
  supplier: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500 mt-0.5">Latest purchase orders</p>
        </div>
        <Link href="/purchase-orders" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all &rarr;
        </Link>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-primary-600">
                    <Link href={`/purchase-orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td>{order.supplier?.name || 'N/A'}</td>
                  <td className="font-medium">{formatAUD(order.totalAmount)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-AU')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <p className="text-sm text-gray-500">No recent orders found</p>
                    <Link href="/purchase-orders/new" className="btn-primary text-xs mt-1">
                      Create First Order
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
