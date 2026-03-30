'use client';

const statusStyles: Record<string, string> = {
  // PO Statuses
  DRAFT: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  APPROVED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ORDERED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  SHIPPED: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  DELIVERED: 'bg-green-50 text-green-700 ring-green-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
  // Supplier Statuses
  ACTIVE: 'bg-green-50 text-green-700 ring-green-600/20',
  INACTIVE: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-600/20',
  PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  // Shipment Statuses
  PICKED_UP: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  IN_TRANSIT: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  OUT_FOR_DELIVERY: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  DELAYED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  RETURNED: 'bg-red-50 text-red-700 ring-red-600/20',
  // Priority
  LOW: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  URGENT: 'bg-red-50 text-red-700 ring-red-600/20',
  // Blockchain
  CONFIRMED: 'bg-green-50 text-green-700 ring-green-600/20',
  FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
  // Compliance
  COMPLIANT: 'bg-green-50 text-green-700 ring-green-600/20',
  NON_COMPLIANT: 'bg-red-50 text-red-700 ring-red-600/20',
  PENDING_REVIEW: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
};

const statusLabels: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  PICKED_UP: 'Picked Up',
  NON_COMPLIANT: 'Non-Compliant',
  PENDING_REVIEW: 'Pending Review',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
  const label = statusLabels[status] || status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {label}
    </span>
  );
}
