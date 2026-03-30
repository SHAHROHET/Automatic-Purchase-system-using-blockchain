export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELAYED' | 'RETURNED';

export type InventoryStatus = 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalInventoryValue: number;
  lowStockItems: number;
  monthlySpend: number;
  onTimeDeliveryRate: number;
  blockchainTransactions: number;
  activeShipments: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}
