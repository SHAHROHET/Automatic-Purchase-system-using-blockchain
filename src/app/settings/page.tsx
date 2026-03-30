'use client';

import { useState } from 'react';

const tabs = ['General', 'Blockchain', 'Notifications', 'Security'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Success message */}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">
          Settings saved successfully.
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'General' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input className="input-field" defaultValue="WADEIN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ABN</label>
              <input className="input-field" defaultValue="65 229 626 266" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input className="input-field" defaultValue="45 St Georges Terrace, Perth WA 6000, Australia" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
              <select className="select-field" defaultValue="AUD">
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (GST %)</label>
              <input className="input-field" type="number" defaultValue="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <select className="select-field" defaultValue="Australia/Perth">
                <option value="Australia/Perth">Australia/Perth (AWST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                <option value="Australia/Melbourne">Australia/Melbourne (AEST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
              <select className="select-field" defaultValue="DD/MM/YYYY">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Procurement Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Auto-Approval Threshold (AUD)</label>
                <input className="input-field" type="number" defaultValue="5000" />
                <p className="text-xs text-gray-500 mt-1">Orders below this amount are auto-approved</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PO Number Prefix</label>
                <input className="input-field" defaultValue="PO" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="autoReorder" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                <label htmlFor="autoReorder" className="text-sm text-gray-700">Enable automatic reorder when stock falls below reorder point</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {/* Blockchain Settings */}
      {activeTab === 'Blockchain' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Configuration</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
              <select className="select-field" defaultValue="local">
                <option value="local">Local Hardhat Network</option>
                <option value="sepolia">Ethereum Sepolia Testnet</option>
                <option value="goerli">Ethereum Goerli Testnet</option>
                <option value="mainnet">Ethereum Mainnet</option>
                <option value="polygon">Polygon (Matic)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RPC URL</label>
              <input className="input-field font-mono text-sm" defaultValue="http://127.0.0.1:8545" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Smart Contract Address</label>
              <input className="input-field font-mono text-sm" placeholder="0x..." />
              <p className="text-xs text-gray-500 mt-1">Deploy your contract with: npm run deploy:contracts</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chain ID</label>
              <input className="input-field" type="number" defaultValue="1337" />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Smart Contract Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- Immutable purchase order records</li>
                <li>- Automated approval via smart contracts</li>
                <li>- Transparent delivery confirmation</li>
                <li>- Supplier contract management</li>
                <li>- Complete audit trail on-chain</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="autoRecord" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              <label htmlFor="autoRecord" className="text-sm text-gray-700">Automatically record all approved POs on blockchain</label>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'Notifications' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { id: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when inventory falls below reorder point', checked: true },
              { id: 'poApproval', label: 'PO Approval Requests', desc: 'Receive alerts for purchase orders pending approval', checked: true },
              { id: 'delivery', label: 'Delivery Notifications', desc: 'Get notified when shipments are delivered', checked: true },
              { id: 'poCreated', label: 'New Purchase Order', desc: 'Alert when a new PO is created (automated or manual)', checked: false },
              { id: 'supplierIssue', label: 'Supplier Compliance Issues', desc: 'Get notified about supplier compliance status changes', checked: true },
              { id: 'blockchain', label: 'Blockchain Confirmations', desc: 'Alert when blockchain transactions are confirmed', checked: false },
              { id: 'shipmentDelay', label: 'Shipment Delays', desc: 'Get notified when shipments are delayed', checked: true },
              { id: 'weeklyReport', label: 'Weekly Procurement Report', desc: 'Receive weekly summary of procurement activities', checked: true },
            ].map(item => (
              <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Email</label>
            <input className="input-field max-w-md" defaultValue="admin@wadein.com.au" type="email" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'Security' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

          <div className="space-y-5">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Change Password</h4>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input className="input-field" type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input className="input-field" type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input className="input-field" type="password" />
                </div>
                <button className="btn-secondary">Update Password</button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-3">Access Control</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn-secondary text-sm">Enable 2FA</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Timeout (minutes)</label>
                  <select className="select-field max-w-xs" defaultValue="480">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                    <option value="1440">24 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-3">Data Encryption</h4>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Encryption Active</span>
                </div>
                <p className="text-sm text-green-700">All sensitive data is encrypted at rest using AES-256. Blockchain transactions provide additional tamper-proof verification.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
