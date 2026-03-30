'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatAUD } from '@/utils/format';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: { name: string };
  items: { id: string }[];
  totalAmount: number;
  priority: string;
  status: string;
  createdAt: string;
}



const statuses = ['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const priorities = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
        if (search) params.set('search', search);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const res = await fetch(`/api/purchase-orders?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data || data.orders || data || []);
        }
      } catch {
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter, priorityFilter, search, dateFrom, dateTo]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link href="/purchase-orders/new" className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Purchase Order
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              className="select-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              className="select-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input
              type="text"
              className="input-field"
              placeholder="Order #, Supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-container">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 loading-shimmer rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0h3m-3 0v3m0-3V15m-6-2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or create a new purchase order.</p>
              <Link href="/purchase-orders/new" className="btn-primary">Create Purchase Order</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/purchase-orders/${order.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td>{order.supplier?.name || 'N/A'}</td>
                    <td>
                      <span className="badge badge-neutral">{order.items?.length || 0} items</span>
                    </td>
                    <td className="font-medium">{formatAUD(order.totalAmount)}</td>
                    <td><StatusBadge status={order.priority} /></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-AU')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/purchase-orders/${order.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </Link>
                        <button
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
