'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

interface BlockchainStats {
  chainId: number;
  blockNumber: number;
  connected: boolean;
  totalTransactions: number;
  smartContractOrders: number;
  verifiedDeliveries: number;
}

interface Transaction {
  id: string;
  txHash: string;
  blockNumber: number;
  method: string;
  reference: string;
  status: string;
  timestamp: string;
  from: string;
  to: string;
  gasUsed: string;
}

const blockchainFlowSteps = [
  { label: 'PO Created', icon: 'create', description: 'Purchase order recorded on chain' },
  { label: 'Approved', icon: 'approve', description: 'Approval signature verified' },
  { label: 'Shipped', icon: 'ship', description: 'Shipment event recorded' },
  { label: 'Delivered', icon: 'deliver', description: 'Delivery confirmed & verified' },
];

function truncateHash(hash: string, chars = 8) {
  if (!hash || hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export default function BlockchainPage() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txRes] = await Promise.all([
          fetch('/api/blockchain/status'),
          fetch('/api/blockchain/transactions'),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.data || data.transactions || data || []);
        }
      } catch {
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card"><div className="h-20 loading-shimmer rounded-lg" /></div>
          ))}
        </div>
        <div className="card"><div className="h-64 loading-shimmer rounded-lg m-6" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Network Status Card */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stats?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-semibold text-gray-900">
                {stats?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-400">Chain ID:</span>{' '}
                <span className="font-mono font-medium text-gray-700">{stats?.chainId ?? 31337}</span>
              </div>
              <div>
                <span className="text-gray-400">Block Number:</span>{' '}
                <span className="font-mono font-medium text-gray-700">{stats?.blockNumber ?? 1248}</span>
              </div>
              <div>
                <span className="text-gray-400">Network:</span>{' '}
                <span className="font-medium text-gray-700">Hardhat Local</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalTransactions ?? 156}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Smart Contract Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.smartContractOrders ?? 84}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verified Deliveries</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.verifiedDeliveries ?? 62}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Flow Visual */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Purchase Order Blockchain Flow</h3>
          <p className="text-sm text-gray-500 mt-0.5">Immutable audit trail for every purchase order</p>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            {blockchainFlowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-center flex-1">
                <div className="flex items-center sm:flex-col sm:items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 ring-4 ring-primary-50">
                    {step.icon === 'create' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    )}
                    {step.icon === 'approve' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                    {step.icon === 'ship' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    )}
                    {step.icon === 'deliver' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="sm:text-center sm:mt-3">
                  <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                </div>
                {i < blockchainFlowSteps.length - 1 && (
                  <div className="hidden sm:block absolute" style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
          {/* Connecting lines for desktop */}
          <div className="hidden sm:flex items-center justify-between px-16 -mt-[76px] mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-0.5 bg-primary-200 mx-4" />
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500 mt-0.5">Latest blockchain transaction records</p>
        </div>
        <div className="table-container">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions yet</h3>
              <p className="text-sm text-gray-500">Blockchain transactions will appear here once purchase orders are recorded on-chain.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Block #</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}
                  >
                    <td>
                      <span className="font-mono text-xs text-primary-600">{truncateHash(tx.txHash)}</span>
                    </td>
                    <td className="font-mono text-xs">{tx.blockNumber}</td>
                    <td>
                      <span className="badge badge-info">{tx.method}</span>
                    </td>
                    <td className="font-medium">{tx.reference}</td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td className="text-gray-500 text-xs">
                      {new Date(tx.timestamp).toLocaleString('en-AU', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Transaction Hash</p>
                <p className="font-mono text-sm text-gray-900 break-all mt-0.5">{selectedTx.txHash}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Block Number</p>
                  <p className="font-mono text-sm text-gray-900 mt-0.5">{selectedTx.blockNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Status</p>
                  <div className="mt-0.5"><StatusBadge status={selectedTx.status} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Method</p>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedTx.method}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Reference</p>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedTx.reference}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">From</p>
                <p className="font-mono text-xs text-gray-700 break-all mt-0.5">{selectedTx.from || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">To</p>
                <p className="font-mono text-xs text-gray-700 break-all mt-0.5">{selectedTx.to || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Gas Used</p>
                  <p className="font-mono text-sm text-gray-900 mt-0.5">{selectedTx.gasUsed || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Timestamp</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {new Date(selectedTx.timestamp).toLocaleString('en-AU')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
