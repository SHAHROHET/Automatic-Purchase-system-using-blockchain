'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatAUD } from '@/utils/format';

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

export default function SpendChart() {
  return (
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
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatAUD(value), 'Spend']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
