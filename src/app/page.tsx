'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatAUD } from '@/utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalInventoryValue: number;
  lowStockItems: number;
  monthlySpend: number;
  onTimeDeliveryRate: number;
  blockchainTransactions: number;
  activeShipments: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  supplier: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}



const sampleMonthlySpend = [
  { name: 'Jul', spend: 42000 },
  { name: 'Aug', spend: 38000 },
  { name: 'Sep', spend: 55000 },
  { name: 'Oct', spend: 47000 },
  { name: 'Nov', spend: 61000 },
  { name: 'Dec', spend: 53000 },
  { name: 'Jan', spend: 49000 },
  { name: 'Feb', spend: 58000 },
  { name: 'Mar', spend: 64000 },
  { name: 'Apr', spend: 52000 },
  { name: 'May', spend: 71000 },
  { name: 'Jun', spend: 67000 },
];

const sampleOrderStatus = [
  { name: 'Draft', value: 8, color: '#94a3b8' },
  { name: 'Pending', value: 12, color: '#eab308' },
  { name: 'Approved', value: 18, color: '#3b82f6' },
  { name: 'Ordered', value: 25, color: '#6366f1' },
  { name: 'Shipped', value: 15, color: '#a855f7' },
  { name: 'Delivered', value: 42, color: '#22c55e' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/purchase-orders?limit=5'),
        ]);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.data || ordersData.orders || ordersData || []);
        }
      } catch {
        // Use fallback data on error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpiCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 120,
      trend: '+12%',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingOrders ?? 8,
      trend: '-3',
      trendUp: false,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Active Suppliers',
      value: stats?.activeSuppliers ?? 24,
      trend: '+2',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockItems ?? 5,
      trend: '+1',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  const extraCards = [
    {
      title: 'Monthly Spend',
      value: formatAUD(stats?.monthlySpend ?? 67000),
      subtitle: 'AUD this month',
      trend: '+8.2%',
      trendUp: true,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      title: 'On-Time Delivery',
      value: `${stats?.onTimeDeliveryRate ?? 94.5}%`,
      subtitle: 'Delivery rate',
      trend: '+2.1%',
      trendUp: true,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="h-20 loading-shimmer rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-64 loading-shimmer rounded-lg m-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {card.trendUp ? (
                  <svg className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                ) : (
                  <svg className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" /></svg>
                )}
                {' '}{card.trend}
              </span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Spend & On-Time Delivery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {extraCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className="text-sm font-medium text-green-600">
                <svg className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                {' '}{card.trend}
              </span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Bar Chart */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Monthly Procurement Spend</h3>
            <p className="text-sm text-gray-500 mt-0.5">Last 12 months (AUD)</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleMonthlySpend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatAUD(value), 'Spend']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Bar dataKey="spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Order Status</h3>
            <p className="text-sm text-gray-500 mt-0.5">Current distribution</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleOrderStatus}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sampleOrderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
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
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-primary-600">
                      <Link href={`/purchase-orders/${order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td>{order.supplier?.name || 'N/A'}</td>
                    <td className="font-medium">{formatAUD(order.totalAmount)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-AU')}</td>
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
    </div>
  );
}
