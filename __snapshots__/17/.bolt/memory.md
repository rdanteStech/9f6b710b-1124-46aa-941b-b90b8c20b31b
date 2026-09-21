## User Preferences
- Language: Spanish UI labels
- Dark premium design system: primary #9E7FFF, bg #0a0a0f, card #1a1a26, border #2a2a3d

## Architecture Decisions
- GastroLayout: zones-based SVG floor plan editor at /home/project/src/pages/GastroLayout.tsx
- TableItem.status: 'available' | 'occupied' | 'reserved' | 'cleaning'
- STATUS_COLORS: available #10b981, occupied #9E7FFF, reserved #f59e0b, cleaning #94a3b8
- SNAP_TABLE = 20px, SNAP_WALL = 40px, COUPLING_DIST = 5px
- Text counter-rotation: transform={`rotate(${-table.rotation}, ${cx}, ${cy})`} on <text> elements

### GastroOrder Module (NEW)
- Route: /order, icon: QrCode (added to ICON_MAP in Layout.tsx)
- TableSession: { id, tableNumber, tableLabel, zone, status, diners, totalDiners, openedAt, sentAt }
- Diner: { id, name, emoji, cart: CartItem[], paid, paymentMethod }
- CartItem: { menuItemId, name, price, qty, notes }
- Session flow: waiting → ordering → sent → paying → closed (auto-reset on close)
- Multi-diner: first diner opens session, others join by scanning same QR
- KioskView: mobile-first overlay with join → menu → cart → payment flow
- Payment: WebpayPlus mock + split modes (individual, equal, custom)
- QR: SVG-generated deterministic pattern per table

### GastroServe KDS Barra (NEW)
- Added 'kds-bar' tab to GastroServe with KDS_BAR_TICKETS data
- Bar ticket status: pending → making → ready (vs kitchen: pending → cooking → ready)
- Accent color for bar: #38bdf8 (vs kitchen: #9E7FFF)

### ROTATED BOUNDS — KEY PRINCIPLE
All physics operate on the visual AABB of the rotated table.
Helper functions: rotatedCorners, rotatedAABB, originFromAABB, clampRotatedTableInsidePolygon,
rotatedRectsOverlapWithPad, snapToNeighborRotated, snapToWallRotated

## Known Issues
- CRITICAL: NEVER use `update` action type for GastroLayout.tsx — always use `file` action with complete content
- User uploads files with corrupted paths (/home/project/home/project/...) — canonical path is /home/project/src/pages/GastroLayout.tsx
