## User Preferences
- Language: Spanish UI labels
- Dark premium design system: primary #9E7FFF, bg #0a0a0f, card #1a1a26, border #2a2a3d

## Architecture Decisions
- GastroLayout: zones-based SVG floor plan editor
- TableItem.status: 'available' | 'occupied' | 'reserved' | 'cleaning'
- STATUS_COLORS: available #10b981, occupied #9E7FFF, reserved #f59e0b, cleaning #94a3b8
- SNAP_TABLE = 20px, SNAP_WALL = 40px, COUPLING_DIST = 5px
- Text counter-rotation: transform={`rotate(${-table.rotation}, ${cx}, ${cy})`} on <text> elements
- Proximity coupling: after boundary clamp, checks 4 edges vs all others (5px threshold, all tables)
- Wall proximity coupling: snapToWall with COUPLING_DIST threshold, applies to ALL tables
- Zone interface: { id, name, color, spacePath, tables }
- approximateSpacePath() converts bezier SpacePath to polyline for physics

## Known Issues
- User uploads files with corrupted paths (/home/project/home/project/...) — canonical path is /home/project/src/pages/GastroLayout.tsx
