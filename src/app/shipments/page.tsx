'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

interface ShipmentEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  purchaseOrder: { orderNumber: string; id: string };
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  events: ShipmentEvent[];
}

const statusTabs = ['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'];

const statusSteps = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function ProgressDots({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus);
  const isDelayed = currentStatus === 'DELAYED';

  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, i) => {
        const isCompleted = !isDelayed && i <= currentIndex;
        const isCurrent = !isDelayed && i === currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isDelayed
                  ? 'bg-orange-400'
                  : isCompleted
                  ? isCurrent
                    ? 'bg-primary-600 ring-2 ring-primary-200'
                    : 'bg-green-500'
                  : 'bg-gray-200'
              }`}
              title={step.replace(/_/g, ' ')}
            />
            {i < statusSteps.length - 1 && (
              <div className={`w-4 h-0.5 ${!isDelayed && i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineView({ events }: { events: ShipmentEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No tracking events yet</p>;
  }

  return (
    <div className="relative pl-6 space-y-4 py-2">
      <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gray-200" />
      {events.map((event, i) => (
        <div key={event.id || i} className="relative flex gap-3">
          <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${
            i === 0 ? 'bg-primary-600' : 'bg-gray-300'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleString('en-AU', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{event.description}</p>
            {event.location && (
              <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeTab !== 'ALL') params.set('status', activeTab);
        const res = await fetch(`/api/shipments?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setShipments(data.data || data.shipments || data || []);
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [activeTab]);

  const activeCount = shipments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'RETURNED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Shipments Card */}
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Shipments</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-400 mt-1">Currently in transit or pending</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Shipments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-20 loading-shimmer rounded-lg" />
            </div>
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No shipments found</h3>
            <p className="text-sm text-gray-500">No shipments match the current filter.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="card overflow-hidden">
              <div
                className="card-body cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === shipment.id ? null : shipment.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Tracking & PO */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Tracking #</p>
                      <p className="text-sm font-semibold text-gray-900">{shipment.trackingNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PO: {shipment.purchaseOrder?.orderNumber || 'N/A'}</p>
                    </div>
                    {/* Carrier */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Carrier</p>
                      <p className="text-sm font-medium text-gray-900">{shipment.carrier}</p>
                    </div>
                    {/* Route */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Route</p>
                      <p className="text-sm text-gray-700">
                        {shipment.origin} <span className="text-gray-400 mx-1">&rarr;</span> {shipment.destination}
                      </p>
                    </div>
                    {/* Status */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Status</p>
                      <StatusBadge status={shipment.status} />
                    </div>
                    {/* ETA */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">ETA</p>
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.actualDelivery
                          ? new Date(shipment.actualDelivery).toLocaleDateString('en-AU')
                          : shipment.estimatedDelivery
                          ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-AU')
                          : 'TBD'}
                      </p>
                    </div>
                  </div>
                  {/* Progress & Expand */}
                  <div className="flex items-center gap-4">
                    <ProgressDots currentStatus={shipment.status} />
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === shipment.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Timeline */}
              {expandedId === shipment.id && (
                <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50/50 animate-fade-in">
                  <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Tracking Timeline</h4>
                  <TimelineView events={shipment.events || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
