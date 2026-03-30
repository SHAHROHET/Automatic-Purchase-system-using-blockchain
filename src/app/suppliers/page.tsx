'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  rating: number;
  status: string;
  complianceStatus: string;
  qualityScore: number;
  deliveryScore: number;
  address: string;
}

const categories = ['ALL', 'Electronics', 'Raw Materials', 'Office Supplies', 'Packaging', 'Machinery', 'Services'];
const supplierStatuses = ['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{score}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add supplier form state
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    code: '',
    category: 'Electronics',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [addingSupplier, setAddingSupplier] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
        const res = await fetch(`/api/suppliers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data.data || data.suppliers || data || []);
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [statusFilter, categoryFilter]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSupplier(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers((prev) => [data.data || data, ...prev]);
        setShowAddForm(false);
        setNewSupplier({ name: '', code: '', category: 'Electronics', contactName: '', email: '', phone: '', address: '' });
      }
    } catch {
      // Silently handle
    } finally {
      setAddingSupplier(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-gray-500">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Supplier
        </button>
      </div>

      {/* Add Supplier Inline Form */}
      {showAddForm && (
        <div className="card animate-fade-in">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">New Supplier</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAddSupplier} className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" className="input-field" required value={newSupplier.name} onChange={(e) => setNewSupplier((p) => ({ ...p, name: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input type="text" className="input-field" required value={newSupplier.code} onChange={(e) => setNewSupplier((p) => ({ ...p, code: e.target.value }))} placeholder="SUP-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="select-field" value={newSupplier.category} onChange={(e) => setNewSupplier((p) => ({ ...p, category: e.target.value }))}>
                  {categories.filter((c) => c !== 'ALL').map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input type="text" className="input-field" value={newSupplier.contactName} onChange={(e) => setNewSupplier((p) => ({ ...p, contactName: e.target.value }))} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input-field" required value={newSupplier.email} onChange={(e) => setNewSupplier((p) => ({ ...p, email: e.target.value }))} placeholder="contact@acme.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="input-field" value={newSupplier.phone} onChange={(e) => setNewSupplier((p) => ({ ...p, phone: e.target.value }))} placeholder="+61 2 9999 0000" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" className="input-field" value={newSupplier.address} onChange={(e) => setNewSupplier((p) => ({ ...p, address: e.target.value }))} placeholder="123 Business St, Sydney NSW 2000" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={addingSupplier} className="btn-primary">
                {addingSupplier ? 'Adding...' : 'Add Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select className="select-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {supplierStatuses.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select className="select-field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 loading-shimmer rounded-lg" />)}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No suppliers found</h3>
            <p className="text-sm text-gray-500 mb-4">Add your first supplier to get started.</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">Add Supplier</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Compliance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <>
                    <tr key={supplier.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === supplier.id ? null : supplier.id)}>
                      <td className="font-medium">{supplier.name}</td>
                      <td><span className="badge badge-neutral">{supplier.code}</span></td>
                      <td>{supplier.category}</td>
                      <td>{supplier.contactName}</td>
                      <td className="text-primary-600">{supplier.email}</td>
                      <td><StarRating rating={supplier.rating || 0} /></td>
                      <td><StatusBadge status={supplier.status} /></td>
                      <td><StatusBadge status={supplier.complianceStatus || 'PENDING_REVIEW'} /></td>
                      <td>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                          <svg className={`w-4 h-4 transition-transform ${expandedId === supplier.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedId === supplier.id && (
                      <tr key={`${supplier.id}-detail`}>
                        <td colSpan={9} className="bg-gray-50 px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Details</h4>
                              <p className="text-sm text-gray-600">{supplier.contactName}</p>
                              <p className="text-sm text-gray-600">{supplier.email}</p>
                              <p className="text-sm text-gray-600">{supplier.phone}</p>
                              <p className="text-sm text-gray-500 mt-1">{supplier.address}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                              <div className="space-y-3">
                                <ScoreBar score={supplier.qualityScore || 85} label="Quality Score" />
                                <ScoreBar score={supplier.deliveryScore || 90} label="Delivery Score" />
                              </div>
                            </div>
                            <div className="flex items-end justify-end gap-2">
                              <button className="btn-secondary text-xs">Edit</button>
                              <button className="btn-secondary text-xs">View Orders</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
