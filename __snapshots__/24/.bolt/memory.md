- Arrow-key movement: useEffect with window keydown, uses refs (selectedIdRef, activeZoneIdRef, minTableDistRef, minWallDistRef). Step=1px, Shift=10px. Zone boundary IS enforced via clampInsidePolygon(approxPoly, wallDistPx=0) — just the polygon edge, no extra margin. Table-to-table minimum distance also enforced. clipPath always active (no arrowMoving state needed).
- Arrow-key movement: useEffect with window keydown, uses refs (selectedIdRef, activeZoneIdRef, minTableDistRef, zonesRef) to avoid stale closures. Step=1px, Shift=10px. NO wall distance enforcement — only raw canvas bounds (x≥0, y≥0). Table-to-table minimum distance still enforced. arrowMoving state disables clipPath on tables group so mesa can visually cross zone boundary during fine-tuning.
## User Preferences
- Language: Spanish UI labels
- Dark premium design system: primary #9E7FFF, bg #0a0a0f, card #1a1a26, border #2a2a3d

## Architecture Decisions
- GastroLayout: zones-based SVG floor plan editor at /home/project/src/pages/GastroLayout.tsx
- TableItem.status: 'available' | 'occupied' | 'reserved' | 'cleaning'
- STATUS_COLORS: available #10b981, occupied #9E7FFF, reserved #f59e0b, cleaning #94a3b8
- SNAP_TABLE = 20px, SNAP_WALL = 40px, COUPLING_DIST = 5px
- Text counter-rotation: transform={`rotate(${-table.rotation}, ${cx}, ${cy})`} on <text> elements
- Proximity coupling: after boundary clamp, checks 4 edges vs all others (5px threshold, all tables)
- Wall proximity coupling: snapToWall with COUPLING_DIST threshold, applies to ALL tables
- Zone interface: { id, name, color, spacePath, tables }
- approximateSpacePath(sp, steps=12): converts bezier SpacePath to dense polyline for physics
- CURVED BOUNDARY PHYSICS: approxPoly computed ONCE per drag frame, used for ALL physics
- closestPointOnQuadBezier(px,py,ax,ay,cpx,cpy,bx,by,steps=60): finds closest point on visual bezier curve
- splitQuadBezier(ax,ay,cpx,cpy,bx,by,t): de Casteljau split → {p, cp1, cp2}
- addPoint on curved edge: uses closestPointOnQuadBezier for position + splitQuadBezier to divide into two sub-curves
- addPoint hover preview: also uses closestPointOnQuadBezier so preview dot tracks the visual curve
- handleCanvasClick reads activeSpacePath.segments (added to deps) to check seg.controlPoint

## Known Issues
- CRITICAL: NEVER use `update` action type for GastroLayout.tsx — always use `file` action with complete content
- User uploads files with corrupted paths (/home/project/home/project/...) — canonical path is /home/project/src/pages/GastroLayout.tsx
