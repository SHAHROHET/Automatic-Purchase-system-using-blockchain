# Feature Components

This folder contains **domain-specific components** — UI pieces that belong to a specific feature of the app.

## What goes here?
Components that know about your app's data (purchase orders, inventory, suppliers, etc.)

## What does NOT go here?
Generic UI like buttons, badges, modals → those go in `../ui/`

## Current Structure

```
features/
└── dashboard/           # Components used on the dashboard page
    ├── StatsCard.tsx        → Reusable KPI card
    ├── SpendChart.tsx       → Monthly spend bar chart
    ├── StatusPieChart.tsx   → Order status pie chart
    └── RecentOrdersTable.tsx → Recent orders table
```

## As you add more pages, add more folders here:
- `features/inventory/` — e.g. InventoryTable, StockAlert
- `features/purchase-orders/` — e.g. POCard, POStatusBadge
- `features/suppliers/` — e.g. SupplierCard
