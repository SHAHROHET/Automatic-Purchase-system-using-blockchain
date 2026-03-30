'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatAUD } from '@/utils/format';



// Sample data for charts
const monthlySpendData = [
  { month: 'Apr 25', spend: 42000 },
  { month: 'May 25', spend: 38500 },
  { month: 'Jun 25', spend: 55200 },
  { month: 'Jul 25', spend: 47800 },
  { month: 'Aug 25', spend: 61300 },
  { month: 'Sep 25', spend: 53100 },
  { month: 'Oct 25', spend: 49700 },
  { month: 'Nov 25', spend: 58400 },
  { month: 'Dec 25', spend: 64200 },
  { month: 'Jan 26', spend: 52800 },
  { month: 'Feb 26', spend: 71000 },
  { month: 'Mar 26', spend: 67500 },
];

const topSuppliersData = [
  { name: 'TechCorp AU', value: 185000 },
  { name: 'Industrial Supply Co', value: 142000 },
  { name: 'Office Pro Supplies', value: 98000 },
  { name: 'PackRight Solutions', value: 76000 },
  { name: 'Melbourne Materials', value: 62000 },
  { name: 'Sydney Electronics', value: 54000 },
];

const orderStatusData = [
  { name: 'Draft', value: 8, color: '#94a3b8' },
  { name: 'Pending', value: 12, color: '#eab308' },
  { name: 'Approved', value: 18, color: '#3b82f6' },
  { name: 'Ordered', value: 25, color: '#6366f1' },
  { name: 'Shipped', value: 15, color: '#a855f7' },
  { name: 'Delivered', value: 42, color: '#22c55e' },
  { name: 'Cancelled', value: 3, color: '#ef4444' },
];

const categoryBreakdownData = [
  { category: 'Electronics', amount: 245000 },
  { category: 'Raw Materials', amount: 178000 },
  { category: 'Office Supplies', amount: 92000 },
  { category: 'Packaging', amount: 67000 },
  { category: 'Machinery', amount: 156000 },
  { category: 'Services', amount: 43000 },
];

interface AnalyticsStats {
  avgOrderValue: number;
  avgLeadTime: number;
  costSavings: number;
  supplierCompliance: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const kpiCards = [
    {
      title: 'Avg Order Value',
      value: formatAUD(stats?.avgOrderValue ?? 4850),
      trend: '+5.2%',
      trendUp: true,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
    },
    {
      title: 'Avg Lead Time',
      value: `${stats?.avgLeadTime ?? 7.2} days`,
      trend: '-0.8 days',
      trendUp: false,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      title: 'Cost Savings',
      value: `${stats?.costSavings ?? 12.4}%`,
      trend: '+2.1%',
      trendUp: true,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
        </svg>
      ),
    },
    {
      title: 'Supplier Compliance',
      value: `${stats?.supplierCompliance ?? 96.8}%`,
      trend: '+1.5%',
      trendUp: true,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card"><div className="h-20 loading-shimmer rounded-lg" /></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card"><div className="h-72 loading-shimmer rounded-lg m-6" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-green-600'}`}>
                {card.trend}
              </span>
              <span className="text-sm text-gray-400">vs last quarter</span>
            </div>
          </div>
        ))}
      </div>

      {/* Spending Trends */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Spending Trends</h3>
          <p className="text-sm text-gray-500 mt-0.5">Monthly procurement spend over the last 12 months</p>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlySpendData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatAUD(value), 'Spend']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers by Value */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Top Suppliers by Value</h3>
            <p className="text-sm text-gray-500 mt-0.5">Highest spend suppliers (AUD)</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSuppliersData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                <Tooltip
                  formatter={(value: number) => [formatAUD(value), 'Total Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Order Status Distribution</h3>
            <p className="text-sm text-gray-500 mt-0.5">Current order breakdown</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} orders`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Category Breakdown</h3>
          <p className="text-sm text-gray-500 mt-0.5">Procurement spend by category</p>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBreakdownData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatAUD(value), 'Amount']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {categoryBreakdownData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#2563eb', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
