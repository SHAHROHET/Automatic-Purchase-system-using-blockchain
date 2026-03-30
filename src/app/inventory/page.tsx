'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatAUD } from '@/utils/format';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  unitPrice: number;
  abcCategory: string;
  status: string;
}

interface ReorderRecommendation {
  sku: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  estimatedCost: number;
}



const inventoryCategories = ['ALL', 'Electronics', 'Raw Materials', 'Office Supplies', 'Packaging', 'Machinery'];
const inventoryStatuses = ['ALL', 'ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'];
const abcCategories = ['ALL', 'A', 'B', 'C'];

function StockBar({ current, max, reorderPoint }: { current: number; max: number; reorderPoint: number }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isLow = current <= reorderPoint;
  const color = isLow ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium ${isLow ? 'text-red-600' : 'text-gray-600'}`}>{current}</span>
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [abcFilter, setAbcFilter] = useState('ALL');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (abcFilter !== 'ALL') params.set('abcCategory', abcFilter);
        const res = await fetch(`/api/inventory?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || data.items || data || []);
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [categoryFilter, statusFilter, abcFilter]);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/inventory/optimize', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || data || []);
        setShowRecommendations(true);
      }
    } catch {
      // Use fallback sample recommendations
      const lowStockItems = items.filter((item) => item.currentStock <= item.reorderPoint);
      setRecommendations(
        lowStockItems.map((item) => ({
          sku: item.sku,
          name: item.name,
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          suggestedQuantity: item.maximumStock - item.currentStock,
          estimatedCost: (item.maximumStock - item.currentStock) * item.unitPrice,
        }))
      );
      setShowRecommendations(true);
    } finally {
      setOptimizing(false);
    }
  };

  const totalItems = items.length;
  const lowStockAlerts = items.filter((i) => i.currentStock <= i.reorderPoint && i.currentStock > 0).length;
  const outOfStock = items.filter((i) => i.currentStock === 0).length;
  const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.unitPrice, 0);

  const statCards = [
    { title: 'Total Items', value: totalItems, icon: 'box', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Low Stock Alerts', value: lowStockAlerts, icon: 'alert', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { title: 'Out of Stock', value: outOfStock, icon: 'empty', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    { title: 'Total Value', value: formatAUD(totalValue), icon: 'value', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg}`}>
                <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  {card.icon === 'box' && <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />}
                  {card.icon === 'alert' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />}
                  {card.icon === 'empty' && <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />}
                  {card.icon === 'value' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card card-body">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select className="select-field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {inventoryCategories.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select className="select-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {inventoryStatuses.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ABC Classification</label>
              <select className="select-field" value={abcFilter} onChange={(e) => setAbcFilter(e.target.value)}>
                {abcCategories.map((a) => <option key={a} value={a}>{a === 'ALL' ? 'All Classes' : `Class ${a}`}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleRunOptimization} disabled={optimizing} className="btn-primary whitespace-nowrap">
            {optimizing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Optimizing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
                Run Optimization
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reorder Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="card border-blue-200 bg-blue-50/30 animate-fade-in">
          <div className="card-header flex items-center justify-between border-blue-200">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Reorder Recommendations</h3>
              <p className="text-sm text-gray-500 mt-0.5">{recommendations.length} items need restocking</p>
            </div>
            <button onClick={() => setShowRecommendations(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Current Stock</th>
                  <th>Reorder Point</th>
                  <th>Suggested Qty</th>
                  <th>Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recommendations.map((rec) => (
                  <tr key={rec.sku}>
                    <td className="font-mono text-xs">{rec.sku}</td>
                    <td className="font-medium">{rec.name}</td>
                    <td className="text-red-600 font-medium">{rec.currentStock}</td>
                    <td>{rec.reorderPoint}</td>
                    <td className="font-medium text-primary-600">{rec.suggestedQuantity}</td>
                    <td className="font-medium">{formatAUD(rec.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 loading-shimmer rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No inventory items found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min / Max</th>
                  <th>Reorder Point</th>
                  <th>Unit Price</th>
                  <th>ABC</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const isLowStock = item.currentStock <= item.reorderPoint;
                  return (
                    <tr key={item.id} className={isLowStock ? 'bg-red-50/50' : ''}>
                      <td className="font-mono text-xs">{item.sku}</td>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <StockBar current={item.currentStock} max={item.maximumStock} reorderPoint={item.reorderPoint} />
                      </td>
                      <td className="text-gray-500 text-xs">{item.minimumStock} / {item.maximumStock}</td>
                      <td>{item.reorderPoint}</td>
                      <td className="font-medium">{formatAUD(item.unitPrice)}</td>
                      <td>
                        <span className={`badge ${
                          item.abcCategory === 'A' ? 'badge-success' :
                          item.abcCategory === 'B' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {item.abcCategory}
                        </span>
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
