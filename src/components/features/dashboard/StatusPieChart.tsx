'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const sampleOrderStatus = [
  { name: 'Draft', value: 8, color: '#94a3b8' },
  { name: 'Pending', value: 12, color: '#eab308' },
  { name: 'Approved', value: 18, color: '#3b82f6' },
  { name: 'Ordered', value: 25, color: '#6366f1' },
  { name: 'Shipped', value: 15, color: '#a855f7' },
  { name: 'Delivered', value: 42, color: '#22c55e' },
];

export default function StatusPieChart() {
  return (
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
  );
}
