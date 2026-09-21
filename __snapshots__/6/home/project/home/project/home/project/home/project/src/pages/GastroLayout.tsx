import { useState, useRef, useCallback } from 'react'
import {
  Plus, Save, Eye, Settings, RotateCw, Trash2,
  Square, Circle, RectangleHorizontal, Lock, Unlock, Pencil,
  MousePointer, ZoomIn, ZoomOut, RotateCcw, ChevronDown, X, Magnet, Ruler, Unlink,
  MapPin, Pen
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type TableShape = 'square' | 'round' | 'rectangle'
type ToolMode = 'select' | 'draw' | 'addPoint' | 'curveEdge'

interface SpaceSegment {
  controlPoint?: { x: number; y: number }
}

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
  segments: SpaceSegment[]   // segments[i] = segment from points[i] → points[(i+1)%n]
  closed: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const METER_PX = 60
const MIN_WALL_DIST_DEFAULT = 0.5
const MIN_TABLE_DIST_DEFAULT = 0.5
const SNAP_TABLE = 20
const SNAP_WALL = 24

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#9E7FFF',
  reserved: '#f59e0b',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Returns closest point on segment + t parameter
function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): { dist: number; cx: number; cy: number; t: number } {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx, cy = ay + t * dy
  const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
  return { dist, cx, cy, t }
}

// Build SVG path string supporting quadratic bezier segments
function buildSpacePath(sp: SpacePath): string {
  if (sp.points.length < 2) return ''
  const pts = sp.points
  const segs = sp.segments
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length; i++) {
    const next = (i + 1) % pts.length
    const seg = segs[i] || {}
    if (seg.controlPoint) {
      d += ` Q ${seg.controlPoint.x},${seg.controlPoint.y} ${pts[next].x},${pts[next].y}`
    } else {
      d += ` L ${pts[next].x},${pts[next].y}`
    }
  }
  if (sp.closed) d += ' Z'
  return d
}

function clampInsidePolygon(
  x: number, y: number, w: number, h: number,
  poly: { x: number; y: number }[],
  wallDistPx: number
): { x: number; y: number } {
  if (poly.length < 3) return { x, y }
  const minX = Math.min(...poly.map(p => p.x))
  const maxX = Math.max(...poly.map(p => p.x))
  const minY = Math.min(...poly.map(p => p.y))
  const maxY = Math.max(...poly.map(p => p.y))
  let rx = Math.max(minX + wallDistPx, Math.min(maxX - w - wallDistPx, x))
  let ry = Math.max(minY + wallDistPx, Math.min(maxY - h - wallDistPx, y))
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length]
      const corners = [
        { x: rx, y: ry }, { x: rx + w, y: ry },
        { x: rx + w, y: ry + h }, { x: rx, y: ry + h },
      ]
      for (const corner of corners) {
        const { dist, cx: nearX, cy: nearY } = pointToSegmentDist(corner.x, corner.y, a.x, a.y, b.x, b.y)
        if (dist < wallDistPx && dist > 0) {
          const push = (wallDistPx - dist) / dist
          rx += (corner.x - nearX) * push
          ry += (corner.y - nearY) * push
        }
      }
    }
  }
  return { x: rx, y: ry }
}

function rectsOverlapWithPad(a: { x: number; y: number; width: number; height: number }, b: TableItem, pad: number): boolean {
  return !(
    a.x + a.width + pad <= b.x || b.x + b.width + pad <= a.x ||
    a.y + a.height + pad <= b.y || b.y + b.height + pad <= a.y
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
    if (dx1 < bestDist && dy1 < 40) { bestDist = dx1; best = { x: other.x + other.width, y: other.y, snappedTo: other.id, side: 'right' } }
    const dx2 = Math.abs(other.x - (moving.x + moving.width))
    if (dx2 < bestDist && dy1 < 40) { bestDist = dx2; best = { x: other.x - moving.width, y: other.y, snappedTo: other.id, side: 'left' } }
    const dy2 = Math.abs((other.y + other.height) - moving.y)
    if (dy2 < bestDist && dx3 < 40) { bestDist = dy2; best = { x: other.x, y: other.y + other.height, snappedTo: other.id, side: 'bottom' } }
    const dy3 = Math.abs(other.y - (moving.y + moving.height))
    if (dy3 < bestDist && dx3 < 40) { bestDist = dy3; best = { x: other.x, y: other.y - moving.height, snappedTo: other.id, side: 'top' } }
  }
  return best
}

function snapToWall(
  table: { x: number; y: number; width: number; height: number },
  poly: { x: number; y: number }[],
  wallDistPx: number,
  snapThreshold: number
): { x: number; y: number; snappedToWall: boolean } {
  if (poly.length < 3) return { x: table.x, y: table.y, snappedToWall: false }
  const probes = [
    { px: table.x + table.width / 2, py: table.y, getSnap: (wX: number, wY: number, nx: number, ny: number) => { const l = Math.sqrt(nx*nx+ny*ny)||1; return { x: table.x, y: wY + ny/l*wallDistPx } } },
    { px: table.x + table.width / 2, py: table.y + table.height, getSnap: (wX: number, wY: number, nx: number, ny: number) => { const l = Math.sqrt(nx*nx+ny*ny)||1; return { x: table.x, y: wY + ny/l*wallDistPx - table.height } } },
    { px: table.x, py: table.y + table.height / 2, getSnap: (wX: number, wY: number, nx: number, ny: number) => { const l = Math.sqrt(nx*nx+ny*ny)||1; return { x: wX + nx/l*wallDistPx, y: table.y } } },
    { px: table.x + table.width, py: table.y + table.height / 2, getSnap: (wX: number, wY: number, nx: number, ny: number) => { const l = Math.sqrt(nx*nx+ny*ny)||1; return { x: wX + nx/l*wallDistPx - table.width, y: table.y } } },
  ]
  let bestGap = snapThreshold
  let result = { x: table.x, y: table.y, snappedToWall: false }
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    for (const probe of probes) {
      const { dist, cx: nearX, cy: nearY } = pointToSegmentDist(probe.px, probe.py, a.x, a.y, b.x, b.y)
      const gap = Math.abs(dist - wallDistPx)
      if (gap < bestGap) {
        bestGap = gap
        const nx = probe.px - nearX, ny = probe.py - nearY
        const snapped = probe.getSnap(nearX, nearY, nx, ny)
        result = { x: snapped.x, y: snapped.y, snappedToWall: true }
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
    if (!table.locked) onDragStart(table.id, e)
    onSelect(table.id)
  }

  return (
    <g
      transform={`rotate(${table.rotation}, ${cx}, ${cy})`}
      style={{ cursor: table.locked ? 'not-allowed' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {selected && !table.fused && (
        <rect
          x={table.x - minDist * METER_PX} y={table.y - minDist * METER_PX}
          width={table.width + minDist * METER_PX * 2} height={table.height + minDist * METER_PX * 2}
          rx={table.shape === 'round' ? 999 : 12}
          fill="none" stroke={color} strokeWidth={1} strokeDasharray="6 4" opacity={0.3}
        />
      )}
      {selected && table.wallMagnet && !table.fused && (
        <rect
          x={table.x - wallDistPx} y={table.y - wallDistPx}
          width={table.width + wallDistPx * 2} height={table.height + wallDistPx * 2}
          rx={8} fill="none" stroke="#f472b6" strokeWidth={1} strokeDasharray="3 3" opacity={0.4}
        />
      )}
      {table.fused && (
        <rect x={table.x - 3} y={table.y - 3} width={table.width + 6} height={table.height + 6}
          rx={10} fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth={3} strokeDasharray="8 3" />
      )}
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
      {table.fused && table.fusedFrom?.length === 2 && (() => {
        const [fa, fb] = table.fusedFrom!
        const isH = Math.abs(fa.y - fb.y) < 10
        return isH
          ? <line x1={table.x + fa.width} y1={table.y + 6} x2={table.x + fa.width} y2={table.y + table.height - 6}
              stroke="rgba(56,189,248,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />
          : <line x1={table.x + 6} y1={table.y + fa.height} x2={table.x + table.width - 6} y2={table.y + fa.height}
              stroke="rgba(56,189,248,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />
      })()}
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8' : color} fontSize={table.fused ? 10 : 11} fontWeight="bold"
        style={{ userSelect: 'none' }}>{table.label}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8bb' : `${color}bb`} fontSize={9}
        style={{ userSelect: 'none' }}>{cap.min}–{cap.max}p</text>
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
      {table.wallMagnet && !table.fused && (
        <g transform={`translate(${table.x + 4}, ${table.y + table.height - 4})`}>
          <circle r={4} fill="rgba(244,114,182,0.3)" stroke="#f472b6" strokeWidth={1} />
          <circle r={1.5} fill="#f472b6" />
        </g>
      )}
      {table.locked && (
        <text x={table.x + table.width - 10} y={table.y + 12}
          textAnchor="middle" fill={color} fontSize={10} style={{ userSelect: 'none' }}>🔒</text>
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
    segments: Array(6).fill({}),
    closed: true,
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number; wasLocked: boolean } | null>(null)
  // Boundary editing drag states
  const [draggingVertex, setDraggingVertex] = useState<{ index: number; ox: number; oy: number } | null>(null)
  const [draggingControlPoint, setDraggingControlPoint] = useState<{ segIndex: number } | null>(null)
  const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState<number | null>(null)
  const [hoverPreviewPt, setHoverPreviewPt] = useState<{ x: number; y: number } | null>(null)

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

  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom }
  }, [zoom])

  // ── Boundary vertex drag ──────────────────────────────────────────────────

  const handleVertexMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    if (tool !== 'select') return
    e.stopPropagation()
    const pt = getSVGPoint(e)
    setDraggingVertex({
      index,
      ox: pt.x - spacePath.points[index].x,
      oy: pt.y - spacePath.points[index].y,
    })
  }, [tool, spacePath.points, getSVGPoint])

  const handleDeleteVertex = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (spacePath.points.length <= 3) return
    setSpacePath(prev => {
      const newPoints = prev.points.filter((_, i) => i !== index)
      return { ...prev, points: newPoints, segments: newPoints.map(() => ({})) }
    })
  }, [spacePath.points.length])

  // ── Control point drag (curveEdge tool) ──────────────────────────────────

  const handleControlPointMouseDown = useCallback((segIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggingControlPoint({ segIndex })
  }, [])

  const handleRemoveControlPoint = useCallback((segIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSpacePath(prev => {
      const newSegments = [...prev.segments]
      newSegments[segIndex] = {}
      return { ...prev, segments: newSegments }
    })
  }, [])

  // ── SVG mouseDown — starts control point drag on edge click ──────────────

  const handleSVGMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool !== 'curveEdge' || spacePath.points.length < 2) return
    const pt = getSVGPoint(e)

    // Don't start near existing vertices
    const nearVertex = spacePath.points.some(p =>
      Math.sqrt((pt.x - p.x) ** 2 + (pt.y - p.y) ** 2) < 14
    )
    if (nearVertex) return

    // Don't start near existing control points
    const nearCP = spacePath.segments.some(seg =>
      seg.controlPoint && Math.sqrt((pt.x - seg.controlPoint.x) ** 2 + (pt.y - seg.controlPoint.y) ** 2) < 14
    )
    if (nearCP) return

    // Find closest edge
    let bestDist = Infinity, bestIndex = -1
    for (let i = 0; i < spacePath.points.length; i++) {
      const a = spacePath.points[i], b = spacePath.points[(i + 1) % spacePath.points.length]
      const { dist } = pointToSegmentDist(pt.x, pt.y, a.x, a.y, b.x, b.y)
      if (dist < bestDist) { bestDist = dist; bestIndex = i }
    }
    if (bestDist > 22 || bestIndex === -1) return
    setDraggingControlPoint({ segIndex: bestIndex })
  }, [tool, spacePath, getSVGPoint])

  // ── Table drag ────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    if (tool !== 'select') return
    const pt = getSVGPoint(e)
    const table = tables.find(t => t.id === id)
    if (!table) return
    const wasLocked = table.locked
    if (wasLocked) setTables(prev => prev.map(t => t.id === id ? { ...t, locked: false } : t))
    setDragging({ id, ox: pt.x - table.x, oy: pt.y - table.y, wasLocked })
    setPendingFuse(null)
  }, [tool, tables, getSVGPoint])

  // ── Unified mouse move ────────────────────────────────────────────────────

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pt = getSVGPoint(e)

    // Vertex drag
    if (draggingVertex !== null) {
      setSpacePath(prev => {
        const newPoints = [...prev.points]
        newPoints[draggingVertex.index] = {
          x: pt.x - draggingVertex.ox,
          y: pt.y - draggingVertex.oy,
        }
        return { ...prev, points: newPoints }
      })
      return
    }

    // Control point drag
    if (draggingControlPoint !== null) {
      setSpacePath(prev => {
        const newSegments = [...prev.segments]
        newSegments[draggingControlPoint.segIndex] = { controlPoint: { x: pt.x, y: pt.y } }
        return { ...prev, segments: newSegments }
      })
      return
    }

    // Hover detection for addPoint / curveEdge
    if ((tool === 'addPoint' || tool === 'curveEdge') && spacePath.points.length > 1) {
      let bestDist = Infinity, bestIndex = -1, bestCx = 0, bestCy = 0
      for (let i = 0; i < spacePath.points.length; i++) {
        const a = spacePath.points[i], b = spacePath.points[(i + 1) % spacePath.points.length]
        const { dist, cx, cy } = pointToSegmentDist(pt.x, pt.y, a.x, a.y, b.x, b.y)
        if (dist < bestDist) { bestDist = dist; bestIndex = i; bestCx = cx; bestCy = cy }
      }
      setHoveredEdgeIndex(bestDist < 22 ? bestIndex : null)
      setHoverPreviewPt(bestDist < 22 ? { x: bestCx, y: bestCy } : null)
    } else {
      setHoveredEdgeIndex(null)
      setHoverPreviewPt(null)
    }

    // Table drag
    if (!dragging) return
    const nx = pt.x - dragging.ox
    const ny = pt.y - dragging.oy

    setTables(prev => {
      const moving = prev.find(t => t.id === dragging.id)
      if (!moving) return prev
      const others = prev.filter(t => t.id !== dragging.id)

      const tableSnap = moving.magnetEnabled
        ? snapToNeighbor({ ...moving, x: nx, y: ny }, others, SNAP_TABLE)
        : { x: nx, y: ny, snappedTo: undefined, side: undefined }

      setSnapHighlight(tableSnap.snappedTo ?? null)

      let finalX = tableSnap.x, finalY = tableSnap.y, snappedToWall = false

      if (!tableSnap.snappedTo && moving.wallMagnet && spacePath.points.length > 2) {
        const wallSnap = snapToWall({ ...moving, x: finalX, y: finalY }, spacePath.points, wallDistPx, SNAP_WALL)
        if (wallSnap.snappedToWall) { finalX = wallSnap.x; finalY = wallSnap.y; snappedToWall = true }
      }
      setWallSnapActive(snappedToWall)

      if (spacePath.points.length > 2) {
        const clamped = clampInsidePolygon(finalX, finalY, moving.width, moving.height, spacePath.points, wallDistPx)
        finalX = clamped.x; finalY = clamped.y
      }

      if (!moving.fused && tableSnap.snappedTo && tableSnap.side) {
        const target = others.find(o => o.id === tableSnap.snappedTo)
        if (target && !target.fused && moving.magnetEnabled && target.magnetEnabled) {
          setPendingFuse({ movingId: dragging.id, targetId: tableSnap.snappedTo, side: tableSnap.side })
        } else setPendingFuse(null)
      } else setPendingFuse(null)

      const candidate = { x: finalX, y: finalY, width: moving.width, height: moving.height }
      const minPad = tableSnap.snappedTo ? 0 : minTableDist
      const collision = others.some(o => rectsOverlapWithPad(candidate, o, minPad * METER_PX))
      setCollisionWarning(collision && !tableSnap.snappedTo)

      if (spacePath.points.length > 2 && !snappedToWall) {
        const corners = [
          { x: finalX, y: finalY }, { x: finalX + moving.width, y: finalY },
          { x: finalX + moving.width, y: finalY + moving.height }, { x: finalX, y: finalY + moving.height },
        ]
        const tooClose = corners.some(corner => {
          for (let i = 0; i < spacePath.points.length; i++) {
            const a = spacePath.points[i], b = spacePath.points[(i + 1) % spacePath.points.length]
            const { dist } = pointToSegmentDist(corner.x, corner.y, a.x, a.y, b.x, b.y)
            if (dist < wallDistPx - 2) return true
          }
          return false
        })
        setWallWarning(tooClose)
      } else setWallWarning(false)

      if (collision && !tableSnap.snappedTo) return prev
      return prev.map(t => t.id === dragging.id ? { ...t, x: finalX, y: finalY } : t)
    })
  }, [dragging, draggingVertex, draggingControlPoint, tool, getSVGPoint, minTableDist, wallDistPx, spacePath.points])

  const handleMouseUp = useCallback(() => {
    setDraggingVertex(null)
    setDraggingControlPoint(null)

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

    if (dragging?.wasLocked) {
      setTables(prev => prev.map(t => t.id === dragging.id ? { ...t, locked: true } : t))
    }

    setDragging(null)
    setSnapHighlight(null)
    setCollisionWarning(false)
    setWallWarning(false)
    setWallSnapActive(false)
    setPendingFuse(null)
  }, [pendingFuse, dragging])

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
    if (tool === 'draw') {
      const pt = getSVGPoint(e)
      if (!isDrawing) { setIsDrawing(true); setDrawingPoints([pt]) }
      else setDrawingPoints(prev => [...prev, pt])
    } else if (tool === 'addPoint') {
      if (spacePath.points.length < 2) return
      const pt = getSVGPoint(e)

      // Don't add near existing vertices
      const nearVertex = spacePath.points.some(p =>
        Math.sqrt((pt.x - p.x) ** 2 + (pt.y - p.y) ** 2) < 14
      )
      if (nearVertex) return

      let bestDist = Infinity, bestIndex = -1, bestT = 0
      for (let i = 0; i < spacePath.points.length; i++) {
        const a = spacePath.points[i], b = spacePath.points[(i + 1) % spacePath.points.length]
        const { dist, t } = pointToSegmentDist(pt.x, pt.y, a.x, a.y, b.x, b.y)
        if (dist < bestDist) { bestDist = dist; bestIndex = i; bestT = t }
      }
      if (bestDist > 30 || bestIndex === -1) return

      const a = spacePath.points[bestIndex]
      const b = spacePath.points[(bestIndex + 1) % spacePath.points.length]
      const newPoint = { x: a.x + bestT * (b.x - a.x), y: a.y + bestT * (b.y - a.y) }

      setSpacePath(prev => {
        const newPoints = [...prev.points]
        const newSegments = [...prev.segments]
        newPoints.splice(bestIndex + 1, 0, newPoint)
        newSegments.splice(bestIndex, 1, {}, {})
        return { ...prev, points: newPoints, segments: newSegments }
      })
    }
  }, [tool, isDrawing, getSVGPoint, spacePath.points])

  const handleCanvasDblClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'draw' || drawingPoints.length < 3) return
    e.preventDefault()
    setSpacePath({
      points: drawingPoints,
      segments: drawingPoints.map(() => ({})),
      closed: true,
    })
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

  const spacePathD = buildSpacePath(spacePath)
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

  const svgCursor = tool === 'draw' ? 'crosshair'
    : tool === 'addPoint' ? (hoveredEdgeIndex !== null ? 'cell' : 'default')
    : tool === 'curveEdge' ? (hoveredEdgeIndex !== null ? 'row-resize' : 'default')
    : 'default'

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
              <button onClick={() => { setSpacePath({ points: [], segments: [], closed: false }); setTool('draw') }}
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
          {/* Tools */}
          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Herramientas</p>
            {([
              ['select', MousePointer, 'Seleccionar'],
              ['draw', Pencil, 'Dibujar espacio'],
              ['addPoint', MapPin, 'Agregar punto'],
              ['curveEdge', Pen, 'Curvar borde'],
            ] as const).map(([t, Icon, lbl]) => (
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
            {/* Tool hints */}
            {tool === 'select' && spacePath.points.length > 0 && (
              <p className="text-xs text-gastro-subtle mt-2 leading-relaxed px-1">
                Arrastra los <span style={{ color: '#9E7FFF' }}>puntos morados</span> para remodelar el espacio. Doble clic en un punto para eliminarlo.
              </p>
            )}
            {tool === 'addPoint' && (
              <p className="text-xs mt-2 leading-relaxed px-1" style={{ color: '#10b981' }}>
                Clic en cualquier borde del espacio para insertar un nuevo punto.
              </p>
            )}
            {tool === 'curveEdge' && (
              <p className="text-xs mt-2 leading-relaxed px-1" style={{ color: '#f472b6' }}>
                Arrastra un borde para curvarlo. Doble clic en el punto de control para eliminar la curva.
              </p>
            )}
          </div>

          {/* Add table */}
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

          {/* Selected table panel */}
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
                <>
                  <button onClick={() => handleUnfuse(selectedTable.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                    <Unlink size={12} /> Desacoplar mesas
                  </button>
                  <div className="space-y-1 pt-1">
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
                </>
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

          {/* Legend */}
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
            <div className="mt-3 pt-2 border-t border-gastro-border space-y-1">
              <p className="text-xs text-gastro-subtle leading-relaxed">
                🔒 <strong className="text-gastro-text">VIP:</strong> Presiona el candado para mover.
              </p>
              <p className="text-xs text-gastro-subtle leading-relaxed">
                🔗 <strong className="text-gastro-text">Fusión:</strong> Arrastra una mesa sobre otra.
              </p>
              <p className="text-xs text-gastro-subtle leading-relaxed">
                <span style={{ color: '#9E7FFF' }}>●</span> <strong className="text-gastro-text">Vértices:</strong> Arrastra para remodelar. Doble clic para borrar.
              </p>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: '#0d0d18', border: '1px solid #2a2a3d' }}>
          {/* Hints overlay */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
            {tool === 'draw' && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold animate-pulse"
                style={{ background: 'rgba(158,127,255,0.2)', border: '1px solid rgba(158,127,255,0.4)', color: '#9E7FFF' }}>
                {isDrawing ? `${drawingPoints.length} puntos — Doble clic para cerrar` : 'Clic para comenzar a dibujar el espacio'}
              </div>
            )}
            {tool === 'addPoint' && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}>
                ➕ Clic en un borde para agregar un punto
              </div>
            )}
            {tool === 'curveEdge' && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.4)', color: '#f472b6' }}>
                〜 Arrastra un borde para curvarlo · Doble clic en el control para eliminar curva
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
            {dragging?.wasLocked && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
                🔓 Modo reposicionamiento — se bloqueará al soltar
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

          {/* Zoom controls */}
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
              cursor: svgCursor,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              minHeight: '500px',
            }}
            onMouseDown={handleSVGMouseDown}
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
              {/* ClipPath now uses <path> to support curved boundaries */}
              <clipPath id="space-clip">
                {spacePath.points.length > 2 && <path d={spacePathD} />}
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

            {/* Wall distance inset guide during table drag */}
            {dragging && spacePath.points.length > 2 && (
              <path d={spacePathD} fill="none"
                stroke="rgba(244,114,182,0.12)" strokeWidth={wallDistPx * 2} strokeLinejoin="round" />
            )}

            {/* ── Space boundary ── */}
            {spacePath.points.length > 2 && (
              <>
                {/* Hovered edge highlight */}
                {hoveredEdgeIndex !== null && (() => {
                  const a = spacePath.points[hoveredEdgeIndex]
                  const b = spacePath.points[(hoveredEdgeIndex + 1) % spacePath.points.length]
                  const seg = spacePath.segments[hoveredEdgeIndex]
                  return seg?.controlPoint ? (
                    <path
                      d={`M ${a.x},${a.y} Q ${seg.controlPoint.x},${seg.controlPoint.y} ${b.x},${b.y}`}
                      fill="none"
                      stroke={tool === 'addPoint' ? '#10b981' : '#f472b6'}
                      strokeWidth={7} opacity={0.35} strokeLinecap="round"
                    />
                  ) : (
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={tool === 'addPoint' ? '#10b981' : '#f472b6'}
                      strokeWidth={7} opacity={0.35} strokeLinecap="round" />
                  )
                })()}

                {/* Main boundary path */}
                <path
                  d={spacePathD}
                  fill="rgba(158,127,255,0.04)"
                  stroke="rgba(158,127,255,0.5)"
                  strokeWidth={2}
                  strokeDasharray={spacePath.closed ? 'none' : '8 4'}
                />

                {/* Control point handles — always visible when they exist */}
                {spacePath.segments.map((seg, i) => {
                  if (!seg.controlPoint) return null
                  const a = spacePath.points[i]
                  const b = spacePath.points[(i + 1) % spacePath.points.length]
                  const isActive = tool === 'curveEdge'
                  return (
                    <g key={`cp-${i}`}>
                      {/* Guide lines from endpoints to control point */}
                      <line x1={a.x} y1={a.y} x2={seg.controlPoint.x} y2={seg.controlPoint.y}
                        stroke="rgba(244,114,182,0.35)" strokeWidth={1} strokeDasharray="4 3" />
                      <line x1={b.x} y1={b.y} x2={seg.controlPoint.x} y2={seg.controlPoint.y}
                        stroke="rgba(244,114,182,0.35)" strokeWidth={1} strokeDasharray="4 3" />
                      {/* Control point handle */}
                      <circle
                        cx={seg.controlPoint.x} cy={seg.controlPoint.y}
                        r={isActive ? 7 : 5}
                        fill={isActive ? 'rgba(244,114,182,0.25)' : 'rgba(244,114,182,0.12)'}
                        stroke="#f472b6"
                        strokeWidth={isActive ? 1.5 : 1}
                        style={{ cursor: isActive ? 'grab' : 'default' }}
                        onMouseDown={isActive ? e => handleControlPointMouseDown(i, e) : undefined}
                        onDoubleClick={e => handleRemoveControlPoint(i, e)}
                      />
                      {/* Diamond shape inside */}
                      <path
                        d={`M ${seg.controlPoint.x} ${seg.controlPoint.y - 3} L ${seg.controlPoint.x + 3} ${seg.controlPoint.y} L ${seg.controlPoint.x} ${seg.controlPoint.y + 3} L ${seg.controlPoint.x - 3} ${seg.controlPoint.y} Z`}
                        fill="#f472b6" opacity={0.7}
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>
                  )
                })}

                {/* Vertex circles */}
                {spacePath.points.map((p, i) => (
                  <g key={`v-${i}`}>
                    {/* Larger hit area */}
                    <circle cx={p.x} cy={p.y} r={10} fill="transparent"
                      style={{ cursor: tool === 'select' ? 'move' : 'default' }}
                      onMouseDown={e => handleVertexMouseDown(i, e)}
                      onDoubleClick={e => handleDeleteVertex(i, e)}
                    />
                    {/* Visual circle */}
                    <circle cx={p.x} cy={p.y}
                      r={draggingVertex?.index === i ? 7 : tool === 'select' ? 6 : 5}
                      fill={draggingVertex?.index === i ? '#c4b0ff' : '#9E7FFF'}
                      stroke="#0d0d18" strokeWidth={2}
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Vertex index label (only in addPoint/curveEdge mode) */}
                    {(tool === 'addPoint' || tool === 'curveEdge') && (
                      <text x={p.x} y={p.y - 10} textAnchor="middle"
                        fill="#9E7FFF" fontSize={8} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {i + 1}
                      </text>
                    )}
                  </g>
                ))}

                {/* Preview dot for addPoint tool */}
                {tool === 'addPoint' && hoverPreviewPt && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={hoverPreviewPt.x} cy={hoverPreviewPt.y} r={9}
                      fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.5)" strokeWidth={1} />
                    <circle cx={hoverPreviewPt.x} cy={hoverPreviewPt.y} r={5}
                      fill="#10b981" stroke="#0d0d18" strokeWidth={1.5} />
                    <line x1={hoverPreviewPt.x - 8} y1={hoverPreviewPt.y}
                      x2={hoverPreviewPt.x + 8} y2={hoverPreviewPt.y}
                      stroke="#10b981" strokeWidth={1.5} />
                    <line x1={hoverPreviewPt.x} y1={hoverPreviewPt.y - 8}
                      x2={hoverPreviewPt.x} y2={hoverPreviewPt.y + 8}
                      stroke="#10b981" strokeWidth={1.5} />
                  </g>
                )}

                {/* Drag indicator for curveEdge — show midpoint of hovered edge */}
                {tool === 'curveEdge' && hoveredEdgeIndex !== null && !draggingControlPoint && (() => {
                  const a = spacePath.points[hoveredEdgeIndex]
                  const b = spacePath.points[(hoveredEdgeIndex + 1) % spacePath.points.length]
                  const seg = spacePath.segments[hoveredEdgeIndex]
                  if (seg?.controlPoint) return null // already has control point
                  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
                  return (
                    <g style={{ pointerEvents: 'none' }}>
                      <circle cx={mx} cy={my} r={8}
                        fill="rgba(244,114,182,0.2)" stroke="rgba(244,114,182,0.6)" strokeWidth={1.5} strokeDasharray="3 2" />
                      <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle"
                        fill="#f472b6" fontSize={10} fontWeight="bold">↕</text>
                    </g>
                  )
                })()}
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
