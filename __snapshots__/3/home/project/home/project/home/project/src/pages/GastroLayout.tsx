import { useState, useRef, useCallback } from 'react'
import {
  Plus, Save, Eye, Settings, RotateCw, Trash2,
  Square, Circle, RectangleHorizontal, Lock, Unlock, Pencil,
  MousePointer, ZoomIn, ZoomOut, RotateCcw, ChevronDown, X, Magnet, Ruler, Unlink
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type TableShape = 'square' | 'round' | 'rectangle'
type ToolMode = 'select' | 'draw'

interface TableItem {
  id: string
  shape: TableShape
  x: number
  y: number
  width: number
  height: number
  rotation: number
  locked: boolean
  magnetEnabled: boolean
  wallMagnet: boolean
  label: string
  status: 'available' | 'occupied' | 'reserved'
  unitSize: number
  fused?: boolean
  fusedFrom?: { id: string; x: number; y: number; width: number; height: number; label: string; shape: TableShape }[]
}

interface SpacePath {
  points: { x: number; y: number }[]
  closed: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const METER_PX = 60
const MIN_WALL_DIST_DEFAULT = 0.5   // meters — person can sit between table and wall
const MIN_TABLE_DIST_DEFAULT = 0.5  // meters — person can pass between tables
const SNAP_TABLE = 18               // px — table-to-table snap threshold
const SNAP_WALL = 22                // px — wall snap threshold (slightly more forgiving)

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#9E7FFF',
  reserved: '#f59e0b',
}

// ─── Geometry Helpers ────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9) }

function extractNumber(label: string): number {
  const m = label.match(/\d+/)
  return m ? parseInt(m[0]) : 0
}

function fusedLabel(a: string, b: string): string {
  const nA = extractNumber(a), nB = extractNumber(b)
  if (!nA && !nB) return `${a}-${b}`
  if (!nA) return `${a}-${b}`
  if (!nB) return `${a}-${b}`
  return nA < nB ? `${a}-${b}` : `${b}-${a}`
}

function calcCapacity(table: TableItem): { min: number; max: number } {
  if (table.shape === 'round') {
    const circ = Math.PI * Math.max(table.width, table.height)
    return { min: Math.max(1, Math.floor(circ / 40)), max: Math.max(2, Math.floor(circ / 30)) }
  }
  const w = Math.floor(table.width / 30), h = Math.floor(table.height / 30)
  return { min: Math.max(1, w * 2 + h * 2 - 4), max: Math.max(2, w * 2 + h * 2) }
}

// Point-in-polygon (ray casting)
function pointInPolygon(px: number, py: number, poly: { x: number; y: number }[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

// Distance from point to line segment
function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): { dist: number; nx: number; ny: number; t: number } {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx, cy = ay + t * dy
  const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
  // Normal pointing inward (we'll handle sign outside)
  const nx = px - cx, ny = py - cy
  return { dist, nx, ny, t }
}

// Get the minimum distance from a rect (table) to all polygon edges
// Returns the closest wall segment info
interface WallSnap {
  dist: number
  side: 'left' | 'right' | 'top' | 'bottom' // which side of the table is near the wall
  snapX: number
  snapY: number
  wallNx: number // wall normal x (pointing inward)
  wallNy: number // wall normal y (pointing inward)
}

function getWallSnap(
  table: { x: number; y: number; width: number; height: number },
  poly: { x: number; y: number }[],
  wallDistPx: number,
  snapThreshold: number
): WallSnap | null {
  if (poly.length < 3) return null

  // Test all 4 sides of the table rect against all polygon edges
  const corners = [
    { x: table.x, y: table.y },
    { x: table.x + table.width, y: table.y },
    { x: table.x + table.width, y: table.y + table.height },
    { x: table.x, y: table.y + table.height },
  ]

  // Midpoints of each table side
  const sides = [
    { x: table.x + table.width / 2, y: table.y, side: 'top' as const },
    { x: table.x + table.width / 2, y: table.y + table.height, side: 'bottom' as const },
    { x: table.x, y: table.y + table.height / 2, side: 'left' as const },
    { x: table.x + table.width, y: table.y + table.height / 2, side: 'right' as const },
  ]

  let best: WallSnap | null = null
  let bestDist = snapThreshold

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]

    for (const side of sides) {
      const { dist, nx, ny } = pointToSegmentDist(side.x, side.y, a.x, a.y, b.x, b.y)
      const totalDist = dist - wallDistPx // how far from the "ideal" wall position

      if (Math.abs(totalDist) < bestDist) {
        bestDist = Math.abs(totalDist)

        // Compute snap position: push table so this side is exactly wallDistPx from wall
        let snapX = table.x, snapY = table.y
        const len = Math.sqrt(nx * nx + ny * ny) || 1
        const inwardNx = nx / len, inwardNy = ny / len

        if (side.side === 'top') {
          snapY = side.y - dist * inwardNy - wallDistPx * (-inwardNy) - 0
          // Simpler: snap top edge to wall + wallDistPx
          const wallY = side.y - (dist * inwardNy)
          snapY = wallY + wallDistPx
          snapX = table.x
        } else if (side.side === 'bottom') {
          const wallY = side.y - (dist * inwardNy)
          snapY = wallY - wallDistPx - table.height
          snapX = table.x
        } else if (side.side === 'left') {
          const wallX = side.x - (dist * inwardNx)
          snapX = wallX + wallDistPx
          snapY = table.y
        } else {
          const wallX = side.x - (dist * inwardNx)
          snapX = wallX - wallDistPx - table.width
          snapY = table.y
        }

        best = { dist: Math.abs(totalDist), side: side.side, snapX, snapY, wallNx: inwardNx, wallNy: inwardNy }
      }
    }
  }

  return best
}

// Clamp table position so it stays inside polygon with wallDistPx margin
function clampInsidePolygon(
  x: number, y: number, w: number, h: number,
  poly: { x: number; y: number }[],
  wallDistPx: number
): { x: number; y: number } {
  if (poly.length < 3) return { x, y }

  // Get bounding box of polygon
  const minX = Math.min(...poly.map(p => p.x))
  const maxX = Math.max(...poly.map(p => p.x))
  const minY = Math.min(...poly.map(p => p.y))
  const maxY = Math.max(...poly.map(p => p.y))

  // Clamp to bounding box with wall margin
  let cx = Math.max(minX + wallDistPx, Math.min(maxX - w - wallDistPx, x))
  let cy = Math.max(minY + wallDistPx, Math.min(maxY - h - wallDistPx, y))

  // Additional: push away from each polygon edge
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]

    // Check all 4 corners of the table
    const testCorners = [
      { x: cx, y: cy },
      { x: cx + w, y: cy },
      { x: cx + w, y: cy + h },
      { x: cx, y: cy + h },
    ]

    for (const corner of testCorners) {
      const { dist, nx, ny } = pointToSegmentDist(corner.x, corner.y, a.x, a.y, b.x, b.y)
      if (dist < wallDistPx) {
        // Push corner away from wall
        const len = Math.sqrt(nx * nx + ny * ny) || 1
        const push = (wallDistPx - dist) / len
        cx += nx * push
        cy += ny * push
      }
    }
  }

  return { x: cx, y: cy }
}

function rectsOverlap(a: TableItem, b: TableItem, minDist: number): boolean {
  const pad = minDist * METER_PX
  return !(
    a.x + a.width + pad < b.x ||
    b.x + b.width + pad < a.x ||
    a.y + a.height + pad < b.y ||
    b.y + b.height + pad < a.y
  )
}

type SnapResult = { x: number; y: number; snappedTo?: string; side?: 'right' | 'left' | 'bottom' | 'top' }

function snapToNeighbor(moving: TableItem, others: TableItem[], snapDist: number): SnapResult {
  let best: SnapResult = { x: moving.x, y: moving.y }
  let bestDist = snapDist

  for (const other of others) {
    if (other.id === moving.id || !other.magnetEnabled) continue
    const dy1 = Math.abs(other.y - moving.y)
    const dx3 = Math.abs(other.x - moving.x)

    const dx1 = Math.abs((other.x + other.width) - moving.x)
    if (dx1 < bestDist && dy1 < 36) { bestDist = dx1; best = { x: other.x + other.width, y: other.y, snappedTo: other.id, side: 'right' } }

    const dx2 = Math.abs(other.x - (moving.x + moving.width))
    if (dx2 < bestDist && dy1 < 36) { bestDist = dx2; best = { x: other.x - moving.width, y: other.y, snappedTo: other.id, side: 'left' } }

    const dy2 = Math.abs((other.y + other.height) - moving.y)
    if (dy2 < bestDist && dx3 < 36) { bestDist = dy2; best = { x: other.x, y: other.y + other.height, snappedTo: other.id, side: 'bottom' } }

    const dy3 = Math.abs(other.y - (moving.y + moving.height))
    if (dy3 < bestDist && dx3 < 36) { bestDist = dy3; best = { x: other.x, y: other.y - moving.height, snappedTo: other.id, side: 'top' } }
  }
  return best
}

// Wall snap: snap table flush to wall (0 gap) or at minWallDist
function snapToWall(
  table: TableItem,
  poly: { x: number; y: number }[],
  wallDistPx: number,
  snapThreshold: number
): { x: number; y: number; snappedToWall: boolean; wallSide?: string } {
  if (poly.length < 3) return { x: table.x, y: table.y, snappedToWall: false }

  const sides = [
    { mx: table.x + table.width / 2, my: table.y, side: 'top', getSnap: (wallY: number) => ({ x: table.x, y: wallY + wallDistPx }) },
    { mx: table.x + table.width / 2, my: table.y + table.height, side: 'bottom', getSnap: (wallY: number) => ({ x: table.x, y: wallY - wallDistPx - table.height }) },
    { mx: table.x, my: table.y + table.height / 2, side: 'left', getSnap: (_: number, wallX: number) => ({ x: wallX + wallDistPx, y: table.y }) },
    { mx: table.x + table.width, my: table.y + table.height / 2, side: 'right', getSnap: (_: number, wallX: number) => ({ x: wallX - wallDistPx - table.width, y: table.y }) },
  ]

  let bestDist = snapThreshold
  let result = { x: table.x, y: table.y, snappedToWall: false, wallSide: undefined as string | undefined }

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const edgeDx = b.x - a.x, edgeDy = b.y - a.y
    const isHorizontal = Math.abs(edgeDy) < Math.abs(edgeDx)

    for (const side of sides) {
      const { dist } = pointToSegmentDist(side.mx, side.my, a.x, a.y, b.x, b.y)
      const gap = dist - wallDistPx

      if (Math.abs(gap) < bestDist) {
        bestDist = Math.abs(gap)

        // Project midpoint onto edge to get wall contact point
        const lenSq = edgeDx * edgeDx + edgeDy * edgeDy
        const t = lenSq > 0 ? ((side.mx - a.x) * edgeDx + (side.my - a.y) * edgeDy) / lenSq : 0
        const tc = Math.max(0, Math.min(1, t))
        const wallX = a.x + tc * edgeDx
        const wallY = a.y + tc * edgeDy

        const snapped = side.getSnap(wallY, wallX)
        result = { x: snapped.x, y: snapped.y, snappedToWall: true, wallSide: side.side }
      }
    }
  }

  return result
}

function fuseTables(a: TableItem, b: TableItem, side: 'right' | 'left' | 'bottom' | 'top'): TableItem {
  let x: number, y: number, width: number, height: number
  if (side === 'right' || side === 'left') {
    x = Math.min(a.x, b.x); y = Math.min(a.y, b.y)
    width = a.width + b.width; height = Math.max(a.height, b.height)
  } else {
    x = Math.min(a.x, b.x); y = Math.min(a.y, b.y)
    width = Math.max(a.width, b.width); height = a.height + b.height
  }
  return {
    id: uid(), shape: 'rectangle', x, y, width, height,
    rotation: 0, locked: false, magnetEnabled: true, wallMagnet: true,
    label: fusedLabel(a.label, b.label),
    status: a.status, unitSize: Math.min(a.unitSize, b.unitSize),
    fused: true,
    fusedFrom: [
      { id: a.id, x: a.x, y: a.y, width: a.width, height: a.height, label: a.label, shape: a.shape },
      { id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, label: b.label, shape: b.shape },
    ],
  }
}

// ─── TableSVG ────────────────────────────────────────────────────────────────

function TableSVG({ table, selected, onSelect, onDragStart, minDist, onUnfuse, wallDistPx }: {
  table: TableItem; selected: boolean
  onSelect: (id: string) => void
  onDragStart: (id: string, e: React.MouseEvent) => void
  minDist: number; onUnfuse: (id: string) => void
  wallDistPx: number
}) {
  const color = STATUS_COLORS[table.status]
  const cap = calcCapacity(table)
  const cx = table.x + table.width / 2
  const cy = table.y + table.height / 2

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (table.fused) { onUnfuse(table.id); return }
    if (!table.locked) onDragStart(table.id, e)
    onSelect(table.id)
  }

  return (
    <g
      transform={`rotate(${table.rotation}, ${cx}, ${cy})`}
      style={{ cursor: table.fused ? 'pointer' : table.locked ? 'not-allowed' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {/* Min distance ring */}
      {selected && !table.fused && (
        <rect
          x={table.x - minDist * METER_PX} y={table.y - minDist * METER_PX}
          width={table.width + minDist * METER_PX * 2} height={table.height + minDist * METER_PX * 2}
          rx={table.shape === 'round' ? 999 : 12}
          fill="none" stroke={color} strokeWidth={1} strokeDasharray="6 4" opacity={0.3}
        />
      )}

      {/* Wall distance ring — shown when wallMagnet is on and selected */}
      {selected && table.wallMagnet && !table.fused && (
        <rect
          x={table.x - wallDistPx} y={table.y - wallDistPx}
          width={table.width + wallDistPx * 2} height={table.height + wallDistPx * 2}
          rx={8} fill="none" stroke="#f472b6" strokeWidth={1}
          strokeDasharray="3 3" opacity={0.4}
        />
      )}

      {/* Fused glow */}
      {table.fused && (
        <rect x={table.x - 3} y={table.y - 3} width={table.width + 6} height={table.height + 6}
          rx={10} fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth={3} strokeDasharray="8 3" />
      )}

      {/* Table body */}
      {table.shape === 'round' ? (
        <ellipse cx={cx} cy={cy} rx={table.width / 2} ry={table.height / 2}
          fill={table.fused ? 'rgba(56,189,248,0.12)' : `${color}22`}
          stroke={selected ? color : table.fused ? '#38bdf8' : `${color}88`}
          strokeWidth={selected ? 2.5 : table.fused ? 2 : 1.5}
          style={{ filter: selected || table.fused ? `drop-shadow(0 0 10px ${table.fused ? '#38bdf888' : color + '66'})` : 'none' }}
        />
      ) : (
        <rect x={table.x} y={table.y} width={table.width} height={table.height}
          rx={table.fused ? 10 : table.shape === 'square' ? 8 : 6}
          fill={table.fused ? 'rgba(56,189,248,0.10)' : `${color}22`}
          stroke={selected ? color : table.fused ? '#38bdf8' : `${color}88`}
          strokeWidth={selected ? 2.5 : table.fused ? 2 : 1.5}
          style={{ filter: selected || table.fused ? `drop-shadow(0 0 10px ${table.fused ? '#38bdf888' : color + '66'})` : 'none' }}
        />
      )}

      {/* Fusion divider */}
      {table.fused && table.fusedFrom?.length === 2 && (() => {
        const [fa] = table.fusedFrom!
        const isH = Math.abs(fa.y - table.fusedFrom![1].y) < 10
        return isH
          ? <line x1={table.x + fa.width} y1={table.y + 6} x2={table.x + fa.width} y2={table.y + table.height - 6}
              stroke="rgba(56,189,248,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />
          : <line x1={table.x + 6} y1={table.y + fa.height} x2={table.x + table.width - 6} y2={table.y + fa.height}
              stroke="rgba(56,189,248,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />
      })()}

      {/* Label */}
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8' : color} fontSize={table.fused ? 10 : 11} fontWeight="bold"
        style={{ userSelect: 'none' }}>{table.label}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8bb' : `${color}bb`} fontSize={9}
        style={{ userSelect: 'none' }}>{cap.min}–{cap.max}p</text>

      {/* Fused icon */}
      {table.fused && (
        <g transform={`translate(${table.x + table.width - 16}, ${table.y + 4})`}>
          <rect x={-2} y={-2} width={16} height={16} rx={4}
            fill="rgba(56,189,248,0.2)" stroke="rgba(56,189,248,0.5)" strokeWidth={1} />
          <g transform="translate(1,1)" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M5 7 L3 9 A2.5 2.5 0 0 0 6.5 12.5 L8.5 10.5" />
            <path d="M7 5 L9 3 A2.5 2.5 0 0 1 12.5 6.5 L10.5 8.5" />
            <line x1="5" y1="7" x2="7" y2="5" />
          </g>
        </g>
      )}

      {/* Wall magnet icon — pink dot bottom-left */}
      {table.wallMagnet && !table.fused && (
        <g transform={`translate(${table.x + 4}, ${table.y + table.height - 4})`}>
          <circle r={4} fill="rgba(244,114,182,0.3)" stroke="#f472b6" strokeWidth={1} />
          <circle r={1.5} fill="#f472b6" />
        </g>
      )}

      {/* Lock icon */}
      {table.locked && !table.fused && (
        <text x={table.x + table.width - 10} y={table.y + 12}
          textAnchor="middle" fill={color} fontSize={10} style={{ userSelect: 'none' }}>🔒</text>
      )}

      {/* Unfuse hint */}
      {table.fused && selected && (
        <text x={cx} y={table.y + table.height + 14} textAnchor="middle"
          fill="#38bdf8" fontSize={8} style={{ userSelect: 'none' }}>Clic para desacoplar</text>
      )}
    </g>
  )
}

// ─── Add Table Modal ──────────────────────────────────────────────────────────

function AddTableModal({ onAdd, onClose }: {
  onAdd: (shape: TableShape, widthM: number, heightM: number, label: string) => void
  onClose: () => void
}) {
  const [shape, setShape] = useState<TableShape>('square')
  const [widthM, setWidthM] = useState(0.9)
  const [heightM, setHeightM] = useState(0.9)
  const [label, setLabel] = useState('')

  const presets = [
    { label: 'Mesa 2p', shape: 'square' as TableShape, w: 0.7, h: 0.7 },
    { label: 'Mesa 4p', shape: 'square' as TableShape, w: 0.9, h: 0.9 },
    { label: 'Mesa 6p rect.', shape: 'rectangle' as TableShape, w: 1.8, h: 0.9 },
    { label: 'Mesa 8p rect.', shape: 'rectangle' as TableShape, w: 2.4, h: 0.9 },
    { label: 'Redonda 4p', shape: 'round' as TableShape, w: 0.9, h: 0.9 },
    { label: 'Redonda 6p', shape: 'round' as TableShape, w: 1.2, h: 1.2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gastro-text">Nueva mesa</h3>
          <button onClick={onClose} className="text-gastro-muted hover:text-gastro-text"><X size={18} /></button>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Presets rápidos</label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map(p => (
              <button key={p.label} onClick={() => { setShape(p.shape); setWidthM(p.w); setHeightM(p.h) }}
                className="px-2 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Forma</label>
          <div className="flex gap-2">
            {([['square', 'Cuadrada', Square], ['round', 'Redonda', Circle], ['rectangle', 'Rectangular', RectangleHorizontal]] as const).map(([s, lbl, Icon]) => (
              <button key={s} onClick={() => setShape(s)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: shape === s ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${shape === s ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                  color: shape === s ? '#9E7FFF' : '#8888aa',
                }}>
                <Icon size={18} />{lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
              {shape === 'round' ? 'Diámetro (m)' : 'Ancho (m)'}
            </label>
            <input type="number" step={0.1} min={0.5} max={4} value={widthM}
              onChange={e => setWidthM(+e.target.value)} className="input-gastro text-sm" />
          </div>
          {shape !== 'round' && (
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Largo (m)</label>
              <input type="number" step={0.1} min={0.5} max={6} value={heightM}
                onChange={e => setHeightM(+e.target.value)} className="input-gastro text-sm" />
            </div>
          )}
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Nombre / número</label>
          <input type="text" placeholder="Ej: Mesa 1, VIP, Barra..."
            value={label} onChange={e => setLabel(e.target.value)} className="input-gastro text-sm" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm py-2.5">Cancelar</button>
          <button onClick={() => onAdd(shape, widthM, shape === 'round' ? widthM : heightM, label)}
            className="btn-primary flex-1 justify-center text-sm py-2.5">
            <Plus size={15} /> Agregar mesa
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GastroLayout() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tool, setTool] = useState<ToolMode>('select')
  const [tables, setTables] = useState<TableItem[]>([
    { id: 't1', shape: 'square', x: 70, y: 70, width: 54, height: 54, rotation: 0, locked: false, magnetEnabled: true, wallMagnet: false, label: 'M1', status: 'available', unitSize: 54 },
    { id: 't2', shape: 'square', x: 200, y: 70, width: 54, height: 54, rotation: 0, locked: false, magnetEnabled: true, wallMagnet: false, label: 'M2', status: 'occupied', unitSize: 54 },
    { id: 't3', shape: 'round', x: 340, y: 70, width: 72, height: 72, rotation: 0, locked: false, magnetEnabled: true, wallMagnet: false, label: 'M3', status: 'reserved', unitSize: 72 },
    { id: 't4', shape: 'rectangle', x: 70, y: 200, width: 108, height: 54, rotation: 0, locked: false, magnetEnabled: true, wallMagnet: true, label: 'M4', status: 'available', unitSize: 54 },
    { id: 't5', shape: 'square', x: 260, y: 200, width: 54, height: 54, rotation: 0, locked: true, magnetEnabled: false, wallMagnet: false, label: 'VIP', status: 'reserved', unitSize: 54 },
  ])
  const [spacePath, setSpacePath] = useState<SpacePath>({
    points: [
      { x: 40, y: 40 }, { x: 580, y: 40 }, { x: 580, y: 440 },
      { x: 400, y: 440 }, { x: 400, y: 360 }, { x: 40, y: 360 }
    ],
    closed: true,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [minTableDist, setMinTableDist] = useState(MIN_TABLE_DIST_DEFAULT)
  const [minWallDist, setMinWallDist] = useState(MIN_WALL_DIST_DEFAULT)
  const [zoom, setZoom] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [collisionWarning, setCollisionWarning] = useState(false)
  const [wallWarning, setWallWarning] = useState(false)
  const [snapHighlight, setSnapHighlight] = useState<string | null>(null)
  const [wallSnapActive, setWallSnapActive] = useState(false)
  const [tableCounter, setTableCounter] = useState(6)
  const [pendingFuse, setPendingFuse] = useState<{ movingId: string; targetId: string; side: 'right' | 'left' | 'bottom' | 'top' } | null>(null)

  const selectedTable = tables.find(t => t.id === selectedId) ?? null
  const wallDistPx = minWallDist * METER_PX
  const tableDistPx = minTableDist * METER_PX

  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom }
  }, [zoom])

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    const pt = getSVGPoint(e)
    const table = tables.find(t => t.id === id)
    if (!table || table.fused) return
    setDragging({ id, ox: pt.x - table.x, oy: pt.y - table.y })
    setPendingFuse(null)
  }, [tables, getSVGPoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const pt = getSVGPoint(e)
    let nx = pt.x - dragging.ox
    let ny = pt.y - dragging.oy

    setTables(prev => {
      const moving = prev.find(t => t.id === dragging.id)
      if (!moving) return prev
      const others = prev.filter(t => t.id !== dragging.id)

      // 1. Table-to-table magnetic snap
      const tableSnap = moving.magnetEnabled
        ? snapToNeighbor({ ...moving, x: nx, y: ny }, others, SNAP_TABLE)
        : { x: nx, y: ny, snappedTo: undefined, side: undefined }

      setSnapHighlight(tableSnap.snappedTo ?? null)

      let finalX = tableSnap.x
      let finalY = tableSnap.y
      let snappedToWall = false

      // 2. Wall magnetic snap (only if not already snapped to table)
      if (!tableSnap.snappedTo && moving.wallMagnet && spacePath.points.length > 2) {
        const wallSnap = snapToWall(
          { ...moving, x: finalX, y: finalY },
          spacePath.points,
          wallDistPx,
          SNAP_WALL
        )
        if (wallSnap.snappedToWall) {
          finalX = wallSnap.x
          finalY = wallSnap.y
          snappedToWall = true
        }
      }
      setWallSnapActive(snappedToWall)

      // 3. Clamp inside polygon boundary (hard constraint)
      if (spacePath.points.length > 2) {
        const clamped = clampInsidePolygon(finalX, finalY, moving.width, moving.height, spacePath.points, wallDistPx)
        finalX = clamped.x
        finalY = clamped.y
      }

      // 4. Pending fuse detection
      if (tableSnap.snappedTo && tableSnap.side) {
        const target = others.find(o => o.id === tableSnap.snappedTo)
        if (target && !target.fused && !moving.fused && moving.magnetEnabled && target.magnetEnabled) {
          setPendingFuse({ movingId: dragging.id, targetId: tableSnap.snappedTo, side: tableSnap.side })
        } else {
          setPendingFuse(null)
        }
      } else {
        setPendingFuse(null)
      }

      // 5. Collision check (table-to-table)
      const candidate = { ...moving, x: finalX, y: finalY }
      const collision = others.some(o => rectsOverlap(candidate, o, minTableDist))
      setCollisionWarning(collision && !tableSnap.snappedTo)

      // 6. Wall distance check
      if (spacePath.points.length > 2) {
        const corners = [
          { x: finalX, y: finalY },
          { x: finalX + moving.width, y: finalY },
          { x: finalX + moving.width, y: finalY + moving.height },
          { x: finalX, y: finalY + moving.height },
        ]
        const tooCloseToWall = corners.some(corner => {
          for (let i = 0; i < spacePath.points.length; i++) {
            const a = spacePath.points[i], b = spacePath.points[(i + 1) % spacePath.points.length]
            const { dist } = pointToSegmentDist(corner.x, corner.y, a.x, a.y, b.x, b.y)
            if (dist < wallDistPx - 2) return true
          }
          return false
        })
        setWallWarning(tooCloseToWall && !snappedToWall)
      }

      if (collision && !tableSnap.snappedTo) return prev

      return prev.map(t => t.id === dragging.id ? { ...t, x: finalX, y: finalY } : t)
    })
  }, [dragging, getSVGPoint, minTableDist, wallDistPx, spacePath.points])

  const handleMouseUp = useCallback(() => {
    if (pendingFuse) {
      setTables(prev => {
        const moving = prev.find(t => t.id === pendingFuse.movingId)
        const target = prev.find(t => t.id === pendingFuse.targetId)
        if (!moving || !target) return prev
        if (!moving.magnetEnabled || !target.magnetEnabled || moving.fused || target.fused) return prev
        const fused = fuseTables(moving, target, pendingFuse.side)
        return [...prev.filter(t => t.id !== moving.id && t.id !== target.id), fused]
      })
      setSelectedId(null)
    }
    setDragging(null)
    setSnapHighlight(null)
    setCollisionWarning(false)
    setWallWarning(false)
    setWallSnapActive(false)
    setPendingFuse(null)
  }, [pendingFuse])

  const handleUnfuse = useCallback((id: string) => {
    setTables(prev => {
      const fused = prev.find(t => t.id === id)
      if (!fused?.fused || !fused.fusedFrom) return prev
      const restored: TableItem[] = fused.fusedFrom.map(f => ({
        id: uid(), shape: f.shape, x: f.x, y: f.y, width: f.width, height: f.height,
        rotation: 0, locked: false, magnetEnabled: true, wallMagnet: false,
        label: f.label, status: fused.status, unitSize: Math.min(f.width, f.height),
      }))
      return [...prev.filter(t => t.id !== id), ...restored]
    })
    setSelectedId(null)
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'draw') return
    const pt = getSVGPoint(e)
    if (!isDrawing) { setIsDrawing(true); setDrawingPoints([pt]) }
    else setDrawingPoints(prev => [...prev, pt])
  }, [tool, isDrawing, getSVGPoint])

  const handleCanvasDblClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'draw' || drawingPoints.length < 3) return
    e.preventDefault()
    setSpacePath({ points: drawingPoints, closed: true })
    setDrawingPoints([]); setIsDrawing(false); setTool('select')
  }, [tool, drawingPoints])

  const handleAddTable = useCallback((shape: TableShape, widthM: number, heightM: number, label: string) => {
    const w = Math.round(widthM * METER_PX), h = Math.round(heightM * METER_PX)
    const newTable: TableItem = {
      id: uid(), shape,
      x: 100 + Math.random() * 120, y: 100 + Math.random() * 100,
      width: w, height: h, rotation: 0, locked: false, magnetEnabled: true, wallMagnet: false,
      label: label || `M${tableCounter}`, status: 'available', unitSize: Math.min(w, h),
    }
    setTables(prev => [...prev, newTable])
    setTableCounter(c => c + 1)
    setShowAddModal(false)
    setSelectedId(newTable.id)
  }, [tableCounter])

  const rotateSelected = useCallback((deg: number) => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, rotation: (t.rotation + deg + 360) % 360 } : t))
  }, [selectedId])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.filter(t => t.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const toggleLock = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, locked: !t.locked } : t))
  }, [selectedId])

  const toggleMagnet = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, magnetEnabled: !t.magnetEnabled } : t))
  }, [selectedId])

  const toggleWallMagnet = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, wallMagnet: !t.wallMagnet } : t))
  }, [selectedId])

  const cycleStatus = useCallback(() => {
    if (!selectedId) return
    const cycle: TableItem['status'][] = ['available', 'occupied', 'reserved']
    setTables(prev => prev.map(t => {
      if (t.id !== selectedId) return t
      return { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % cycle.length] }
    }))
  }, [selectedId])

  const spacePolygon = spacePath.points.map(p => `${p.x},${p.y}`).join(' ')
  const drawingPolygon = drawingPoints.map(p => `${p.x},${p.y}`).join(' ')

  const totalTables = tables.length
  const fusedCount = tables.filter(t => t.fused).length
  const available = tables.filter(t => t.status === 'available').length
  const occupied = tables.filter(t => t.status === 'occupied').length
  const reserved = tables.filter(t => t.status === 'reserved').length
  const totalCap = tables.reduce((acc, t) => {
    const c = calcCapacity(t)
    return { min: acc.min + c.min, max: acc.max + c.max }
  }, { min: 0, max: 0 })

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="section-title">Diseño de espacios</h2>
          <p className="section-subtitle">Editor interactivo — arrastra, fusiona y configura cada mesa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary text-sm px-4 py-2">
            <Settings size={15} /> Configurar
          </button>
          <button className="btn-secondary text-sm px-4 py-2"><Eye size={15} /> Vista cliente</button>
          <button className="btn-primary text-sm px-4 py-2"><Save size={15} /> Guardar</button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="card-gastro animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gastro-text text-sm">Configuración del módulo</h3>
            <button onClick={() => setShowSettings(false)} className="text-gastro-muted hover:text-gastro-text"><X size={16} /></button>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                <Ruler size={11} className="inline mr-1" />Dist. entre mesas (m)
              </label>
              <input type="number" step={0.1} min={0.3} max={3} value={minTableDist}
                onChange={e => setMinTableDist(+e.target.value)} className="input-gastro text-sm" />
              <p className="text-xs text-gastro-subtle mt-1">{minTableDist}m = {Math.round(minTableDist * METER_PX)}px</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                <Ruler size={11} className="inline mr-1" />Dist. mesa–pared (m)
              </label>
              <input type="number" step={0.1} min={0} max={2} value={minWallDist}
                onChange={e => setMinWallDist(+e.target.value)} className="input-gastro text-sm" />
              <p className="text-xs text-gastro-subtle mt-1">{minWallDist}m = {Math.round(minWallDist * METER_PX)}px</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Zoom del canvas</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="btn-secondary px-3 py-2 text-sm"><ZoomOut size={14} /></button>
                <span className="text-sm text-gastro-text font-bold flex-1 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="btn-secondary px-3 py-2 text-sm"><ZoomIn size={14} /></button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Acciones rápidas</label>
              <button onClick={() => { setSpacePath({ points: [], closed: false }); setTool('draw') }}
                className="btn-secondary text-xs px-3 py-2 w-full justify-center">
                <Pencil size={13} /> Redibujar espacio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 flex-shrink-0">
        {[
          { label: 'Total mesas', value: totalTables, color: '#9E7FFF' },
          { label: 'Fusionadas', value: fusedCount, color: '#38bdf8' },
          { label: 'Disponibles', value: available, color: '#10b981' },
          { label: 'Ocupadas', value: occupied, color: '#9E7FFF' },
          { label: 'Reservadas', value: reserved, color: '#f59e0b' },
          { label: 'Capacidad', value: `${totalCap.min}–${totalCap.max}p`, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center py-3">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gastro-subtle">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="flex flex-col gap-2 flex-shrink-0 w-44 overflow-y-auto">
          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Herramientas</p>
            {([['select', MousePointer, 'Seleccionar'], ['draw', Pencil, 'Dibujar espacio']] as const).map(([t, Icon, lbl]) => (
              <button key={t} onClick={() => setTool(t as ToolMode)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: tool === t ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tool === t ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                  color: tool === t ? '#9E7FFF' : '#8888aa',
                }}>
                <Icon size={14} />{lbl}
              </button>
            ))}
          </div>

          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Agregar mesa</p>
            {([
              [Square, 'Cuadrada'], [Circle, 'Redonda'], [RectangleHorizontal, 'Rectangular'],
            ] as const).map(([Icon, lbl]) => (
              <button key={lbl} onClick={() => setShowAddModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #2a2a3d' }}>
                <Icon size={13} />{lbl}
              </button>
            ))}
          </div>

          {selectedTable && (
            <div className="card-gastro p-3 space-y-2 animate-slide-down">
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">
                {selectedTable.fused ? 'Mesa fusionada' : 'Mesa seleccionada'}
              </p>
              <div className="text-sm font-bold" style={{ color: selectedTable.fused ? '#38bdf8' : '#e8e8f0' }}>
                {selectedTable.label}
              </div>
              <div className="text-xs text-gastro-subtle">
                {(selectedTable.width / METER_PX).toFixed(1)}m × {(selectedTable.height / METER_PX).toFixed(1)}m
              </div>
              <div className="text-xs" style={{ color: STATUS_COLORS[selectedTable.status] }}>
                ● {selectedTable.status === 'available' ? 'Disponible' : selectedTable.status === 'occupied' ? 'Ocupada' : 'Reservada'}
              </div>
              <div className="text-xs text-gastro-subtle">
                Cap: {calcCapacity(selectedTable).min}–{calcCapacity(selectedTable).max}p
              </div>

              {selectedTable.fused ? (
                <button onClick={() => handleUnfuse(selectedTable.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                  <Unlink size={12} /> Desacoplar mesas
                </button>
              ) : (
                <div className="space-y-1 pt-1">
                  <button onClick={() => rotateSelected(15)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    <RotateCw size={12} /> Rotar +15°
                  </button>
                  <button onClick={() => rotateSelected(-15)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    <RotateCcw size={12} /> Rotar -15°
                  </button>
                  <button onClick={toggleLock} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    {selectedTable.locked ? <Unlock size={12} /> : <Lock size={12} />}
                    {selectedTable.locked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button onClick={toggleMagnet} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                    style={{ color: selectedTable.magnetEnabled ? '#9E7FFF' : '#8888aa' }}>
                    <Magnet size={12} /> Imán mesas {selectedTable.magnetEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={toggleWallMagnet} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                    style={{ color: selectedTable.wallMagnet ? '#f472b6' : '#8888aa' }}>
                    <Magnet size={12} /> Imán pared {selectedTable.wallMagnet ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={cycleStatus} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    <ChevronDown size={12} /> Cambiar estado
                  </button>
                  <button onClick={deleteSelected} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-error hover:bg-error/10 transition-all">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card-gastro p-3">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Leyenda</p>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-xs text-gastro-subtle">
                  {s === 'available' ? 'Disponible' : s === 'occupied' ? 'Ocupada' : 'Reservada'}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-sm border border-dashed" style={{ borderColor: '#38bdf8' }} />
              <span className="text-xs text-gastro-subtle">Fusionada</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(244,114,182,0.4)', border: '1px solid #f472b6' }} />
              <span className="text-xs text-gastro-subtle">Imán pared</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full border border-dashed border-gastro-muted" />
              <span className="text-xs text-gastro-subtle">Dist. mínima</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: '#0d0d18', border: '1px solid #2a2a3d' }}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
            {tool === 'draw' && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold animate-pulse"
                style={{ background: 'rgba(158,127,255,0.2)', border: '1px solid rgba(158,127,255,0.4)', color: '#9E7FFF' }}>
                {isDrawing ? `${drawingPoints.length} puntos — Doble clic para cerrar` : 'Clic para comenzar a dibujar el espacio'}
              </div>
            )}
            {pendingFuse && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.5)', color: '#38bdf8' }}>
                🔗 Suelta para fusionar mesas
              </div>
            )}
            {wallSnapActive && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(244,114,182,0.2)', border: '1px solid rgba(244,114,182,0.5)', color: '#f472b6' }}>
                🧲 Pegada a la pared
              </div>
            )}
            {collisionWarning && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                ⚠ Distancia mínima entre mesas no respetada
              </div>
            )}
            {wallWarning && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
                ⚠ Demasiado cerca de la pared ({minWallDist}m mín.)
              </div>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex gap-1">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gastro-subtle hover:text-gastro-text transition-colors"
              style={{ background: 'rgba(26,26,38,0.9)', border: '1px solid #2a2a3d' }}>
              <ZoomOut size={14} />
            </button>
            <div className="px-2 h-8 rounded-lg flex items-center text-xs font-bold text-gastro-text"
              style={{ background: 'rgba(26,26,38,0.9)', border: '1px solid #2a2a3d' }}>
              {Math.round(zoom * 100)}%
            </div>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gastro-subtle hover:text-gastro-text transition-colors"
              style={{ background: 'rgba(26,26,38,0.9)', border: '1px solid #2a2a3d' }}>
              <ZoomIn size={14} />
            </button>
          </div>

          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{
              cursor: tool === 'draw' ? 'crosshair' : 'default',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              minHeight: '500px',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDblClick}
          >
            <defs>
              <pattern id="grid" width={METER_PX} height={METER_PX} patternUnits="userSpaceOnUse">
                <path d={`M ${METER_PX} 0 L 0 0 0 ${METER_PX}`} fill="none" stroke="rgba(158,127,255,0.08)" strokeWidth="1" />
              </pattern>
              <pattern id="grid-sub" width={METER_PX / 2} height={METER_PX / 2} patternUnits="userSpaceOnUse">
                <path d={`M ${METER_PX / 2} 0 L 0 0 0 ${METER_PX / 2}`} fill="none" stroke="rgba(158,127,255,0.04)" strokeWidth="0.5" />
              </pattern>
              <clipPath id="space-clip">
                {spacePath.points.length > 2 && <polygon points={spacePolygon} />}
              </clipPath>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-sub)" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Ruler */}
            <g transform="translate(20, 20)">
              <line x1={0} y1={0} x2={METER_PX} y2={0} stroke="#3a3a52" strokeWidth={2} />
              <line x1={0} y1={-4} x2={0} y2={4} stroke="#3a3a52" strokeWidth={1.5} />
              <line x1={METER_PX} y1={-4} x2={METER_PX} y2={4} stroke="#3a3a52" strokeWidth={1.5} />
              <text x={METER_PX / 2} y={-8} textAnchor="middle" fill="#8888aa" fontSize={9}>1 metro</text>
            </g>

            {/* Wall distance inset guide — shown when dragging a table */}
            {dragging && spacePath.points.length > 2 && (
              <polygon
                points={spacePolygon}
                fill="none"
                stroke="rgba(244,114,182,0.15)"
                strokeWidth={wallDistPx * 2}
                strokeLinejoin="round"
              />
            )}

            {/* Space boundary */}
            {spacePath.points.length > 2 && (
              <>
                <polygon points={spacePolygon}
                  fill="rgba(158,127,255,0.04)"
                  stroke="rgba(158,127,255,0.5)"
                  strokeWidth={2}
                  strokeDasharray={spacePath.closed ? 'none' : '8 4'}
                />
                {spacePath.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={5}
                    fill="#9E7FFF" stroke="#0d0d18" strokeWidth={2} style={{ cursor: 'pointer' }} />
                ))}
              </>
            )}

            {/* Drawing preview */}
            {isDrawing && drawingPoints.length > 0 && (
              <>
                <polyline points={drawingPolygon} fill="none"
                  stroke="rgba(158,127,255,0.6)" strokeWidth={2} strokeDasharray="6 3" />
                {drawingPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4}
                    fill="#9E7FFF" stroke="#0d0d18" strokeWidth={1.5} />
                ))}
              </>
            )}

            {/* Tables */}
            <g clipPath={spacePath.points.length > 2 ? 'url(#space-clip)' : undefined}>
              {tables.map(table => (
                <TableSVG
                  key={table.id}
                  table={table}
                  selected={selectedId === table.id}
                  onSelect={setSelectedId}
                  onDragStart={handleDragStart}
                  minDist={minTableDist}
                  onUnfuse={handleUnfuse}
                  wallDistPx={wallDistPx}
                />
              ))}
            </g>

            {/* Snap highlight */}
            {snapHighlight && (() => {
              const t = tables.find(x => x.id === snapHighlight)
              if (!t) return null
              return (
                <rect x={t.x - 5} y={t.y - 5} width={t.width + 10} height={t.height + 10}
                  rx={12} fill="none"
                  stroke={pendingFuse ? '#38bdf8' : '#9E7FFF'}
                  strokeWidth={2} strokeDasharray="5 3" opacity={0.8}
                />
              )
            })()}
          </svg>
        </div>
      </div>

      {showAddModal && (
        <AddTableModal onAdd={handleAddTable} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
