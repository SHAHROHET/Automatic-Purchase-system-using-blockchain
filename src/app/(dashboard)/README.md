# (dashboard) Route Group

This folder will contain all **protected** pages that require the user to be logged in.

These pages share the main sidebar + header layout.

Current pages (to be moved here in the future):
- `../inventory/` → Inventory management
- `../purchase-orders/` → Purchase orders
- `../shipments/` → Shipments tracking
- `../suppliers/` → Suppliers directory
- `../analytics/` → Analytics & reports
- `../settings/` → App settings
- `../blockchain/` → Blockchain transactions

> To activate this group, create a `layout.tsx` here that wraps pages with the sidebar layout, then move the page folders inside.
