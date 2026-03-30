'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatAUD } from '@/utils/format';

interface Supplier {
  id: string;
  name: string;
  code: string;
}

interface LineItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}



const createEmptyItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  sku: '',
  quantity: 1,
  unitPrice: 0,
});

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [notes, setNotes] = useState('');
  const [recordOnBlockchain, setRecordOnBlockchain] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch('/api/suppliers');
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data.data || data.suppliers || data || []);
        }
      } catch {
        // Silently handle
      }
    };
    fetchSuppliers();
  }, []);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (items.some((item) => !item.description || item.quantity <= 0)) {
      setError('Please fill in all line item details');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          priority,
          expectedDelivery: expectedDelivery || null,
          items: items.map(({ description, sku, quantity, unitPrice }) => ({
            description,
            sku,
            quantity,
            unitPrice,
          })),
          notes,
          shippingCost,
          recordOnBlockchain,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/purchase-orders/${data.id || ''}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to create purchase order');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Order Details</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  className="select-field"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="select-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                <input
                  type="date"
                  className="input-field"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-xs">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Item
            </button>
          </div>
          <div className="card-body space-y-3">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">SKU</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="sm:col-span-4">
                  <label className="sm:hidden block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="sm:hidden block text-xs font-medium text-gray-500 mb-1">SKU</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="SKU"
                    value={item.sku}
                    onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="sm:hidden block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="sm:hidden block text-xs font-medium text-gray-500 mb-1">Unit Price (AUD)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="sm:col-span-1 flex items-center">
                  <label className="sm:hidden block text-xs font-medium text-gray-500 mb-1 mr-2">Total</label>
                  <span className="text-sm font-medium text-gray-900">
                    {formatAUD(item.quantity * item.unitPrice)}
                  </span>
                </div>
                <div className="sm:col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="input-field min-h-[100px]"
                    placeholder="Additional notes or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost (AUD)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="blockchain"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={recordOnBlockchain}
                    onChange={(e) => setRecordOnBlockchain(e.target.checked)}
                  />
                  <label htmlFor="blockchain" className="text-sm text-gray-700">
                    Record on Blockchain
                    <span className="block text-xs text-gray-400">Create an immutable record of this order</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatAUD(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">GST (10%)</span>
                  <span className="font-medium text-gray-900">{formatAUD(gst)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-gray-900">{formatAUD(shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary-600">{formatAUD(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/purchase-orders')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Purchase Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
