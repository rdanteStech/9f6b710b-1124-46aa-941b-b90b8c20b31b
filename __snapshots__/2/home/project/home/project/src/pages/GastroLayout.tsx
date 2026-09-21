import { useState, useRef, useCallback } from 'react'
import {
  Plus, Save, Eye, Settings, RotateCw, Trash2,
  Square, Circle, RectangleHorizontal, Lock, Unlock, Pencil,
  MousePointer, ZoomIn, ZoomOut, RotateCcw, ChevronDown, X, Magnet, Ruler, Link2, Unlink
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
  label: string
  status: 'available' | 'occupied' | 'reserved'
  unitSize: number
  // Fusion fields
  fused?: boolean
  fusedFrom?: { id: string; x: number; y: number; width: number; height: number; label: string; shape: TableShape }[]
}

interface SpacePath {
  points: { x: number; y: number }[]
  closed: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const METER_PX = 60
const MIN_DISTANCE_DEFAULT = 1.5
const SNAP_DISTANCE = 18

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#9E7FFF',
  reserved: '#f59e0b',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function extractNumber(label: string): number {
  const m = label.match(/\d+/)
  return m ? parseInt(m[0]) : 0
}

function fusedLabel(labelA: string, labelB: string): string {
  const nA = extractNumber(labelA)
  const nB = extractNumber(labelB)
  if (nA === 0 && nB === 0) return `${labelA}-${labelB}`
  if (nA === 0) return `${labelA}-${labelB}`
  if (nB === 0) return `${labelA}-${labelB}`
  const [lo, hi] = nA < nB ? [labelA, labelB] : [labelB, labelA]
  return `${lo}-${hi}`
}

function calcCapacity(table: TableItem): { min: number; max: number } {
  if (table.shape === 'round') {
    const circ = Math.PI * Math.max(table.width, table.height)
    return { min: Math.max(1, Math.floor(circ / 40)), max: Math.max(2, Math.floor(circ / 30)) }
  }
  const wSeats = Math.floor(table.width / 30)
  const hSeats = Math.floor(table.height / 30)
  const min = Math.max(1, wSeats * 2 + hSeats * 2 - 4)
  const max = Math.max(2, wSeats * 2 + hSeats * 2)
  return { min, max }
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

    // right edge of other → left edge of moving
    const dx1 = Math.abs((other.x + other.width) - moving.x)
    if (dx1 < bestDist && dy1 < 36) {
      bestDist = dx1
      best = { x: other.x + other.width, y: other.y, snappedTo: other.id, side: 'right' }
    }
    // left edge of other → right edge of moving
    const dx2 = Math.abs(other.x - (moving.x + moving.width))
    if (dx2 < bestDist && dy1 < 36) {
      bestDist = dx2
      best = { x: other.x - moving.width, y: other.y, snappedTo: other.id, side: 'left' }
    }
    // bottom edge of other → top edge of moving
    const dy2 = Math.abs((other.y + other.height) - moving.y)
    if (dy2 < bestDist && dx3 < 36) {
      bestDist = dy2
      best = { x: other.x, y: other.y + other.height, snappedTo: other.id, side: 'bottom' }
    }
    // top edge of other → bottom edge of moving
    const dy3 = Math.abs(other.y - (moving.y + moving.height))
    if (dy3 < bestDist && dx3 < 36) {
      bestDist = dy3
      best = { x: other.x, y: other.y - moving.height, snappedTo: other.id, side: 'top' }
    }
  }
  return best
}

function fuseTables(a: TableItem, b: TableItem, side: 'right' | 'left' | 'bottom' | 'top'): TableItem {
  // Determine bounding rect
  let x: number, y: number, width: number, height: number

  if (side === 'right') {
    // b is to the right of a
    x = Math.min(a.x, b.x)
    y = Math.min(a.y, b.y)
    width = a.width + b.width
    height = Math.max(a.height, b.height)
  } else if (side === 'left') {
    // b is to the left of a
    x = Math.min(a.x, b.x)
    y = Math.min(a.y, b.y)
    width = a.width + b.width
    height = Math.max(a.height, b.height)
  } else if (side === 'bottom') {
    // b is below a
    x = Math.min(a.x, b.x)
    y = Math.min(a.y, b.y)
    width = Math.max(a.width, b.width)
    height = a.height + b.height
  } else {
    // b is above a
    x = Math.min(a.x, b.x)
    y = Math.min(a.y, b.y)
    width = Math.max(a.width, b.width)
    height = a.height + b.height
  }

  const label = fusedLabel(a.label, b.label)

  return {
    id: uid(),
    shape: 'rectangle',
    x, y, width, height,
    rotation: 0,
    locked: false,
    magnetEnabled: true,
    label,
    status: a.status,
    unitSize: Math.min(a.unitSize, b.unitSize),
    fused: true,
    fusedFrom: [
      { id: a.id, x: a.x, y: a.y, width: a.width, height: a.height, label: a.label, shape: a.shape },
      { id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, label: b.label, shape: b.shape },
    ],
  }
}

// ─── TableSVG ────────────────────────────────────────────────────────────────

function TableSVG({
  table, selected, onSelect, onDragStart, minDist, onUnfuse,
}: {
  table: TableItem
  selected: boolean
  onSelect: (id: string) => void
  onDragStart: (id: string, e: React.MouseEvent) => void
  minDist: number
  onUnfuse: (id: string) => void
}) {
  const color = STATUS_COLORS[table.status]
  const cap = calcCapacity(table)
  const cx = table.x + table.width / 2
  const cy = table.y + table.height / 2

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (table.fused) {
      onUnfuse(table.id)
      return
    }
    if (!table.locked) onDragStart(table.id, e)
    onSelect(table.id)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (table.fused) return // fused tables: click to unfuse, no drag
    if (!table.locked) onDragStart(table.id, e)
    onSelect(table.id)
  }

  return (
    <g
      transform={`rotate(${table.rotation}, ${cx}, ${cy})`}
      style={{ cursor: table.fused ? 'pointer' : table.locked ? 'not-allowed' : 'grab' }}
      onMouseDown={handleMouseDown}
      onClick={table.fused ? handleClick : undefined}
    >
      {/* Min distance ring */}
      {selected && !table.fused && (
        <rect
          x={table.x - minDist * METER_PX}
          y={table.y - minDist * METER_PX}
          width={table.width + minDist * METER_PX * 2}
          height={table.height + minDist * METER_PX * 2}
          rx={table.shape === 'round' ? 999 : 12}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.3}
        />
      )}

      {/* Fused glow background */}
      {table.fused && (
        <rect
          x={table.x - 3} y={table.y - 3}
          width={table.width + 6} height={table.height + 6}
          rx={10}
          fill="none"
          stroke="rgba(56,189,248,0.35)"
          strokeWidth={3}
          strokeDasharray="8 3"
        />
      )}

      {/* Table body */}
      {table.shape === 'round' ? (
        <ellipse
          cx={cx} cy={cy}
          rx={table.width / 2} ry={table.height / 2}
          fill={table.fused ? 'rgba(56,189,248,0.12)' : `${color}22`}
          stroke={selected ? color : table.fused ? '#38bdf8' : `${color}88`}
          strokeWidth={selected ? 2.5 : table.fused ? 2 : 1.5}
          style={{ filter: selected || table.fused ? `drop-shadow(0 0 10px ${table.fused ? '#38bdf888' : color + '66'})` : 'none' }}
        />
      ) : (
        <rect
          x={table.x} y={table.y}
          width={table.width} height={table.height}
          rx={table.fused ? 10 : table.shape === 'square' ? 8 : 6}
          fill={table.fused ? 'rgba(56,189,248,0.10)' : `${color}22`}
          stroke={selected ? color : table.fused ? '#38bdf8' : `${color}88`}
          strokeWidth={selected ? 2.5 : table.fused ? 2 : 1.5}
          style={{ filter: selected || table.fused ? `drop-shadow(0 0 10px ${table.fused ? '#38bdf888' : color + '66'})` : 'none' }}
        />
      )}

      {/* Fusion divider line */}
      {table.fused && table.fusedFrom && table.fusedFrom.length === 2 && (() => {
        const [fa, fb] = table.fusedFrom
        // Determine if horizontal or vertical split
        const isHorizontal = Math.abs(fa.y - fb.y) < 10
        if (isHorizontal) {
          // vertical divider
          const divX = table.x + fa.width
          return (
            <line
              x1={divX} y1={table.y + 6}
              x2={divX} y2={table.y + table.height - 6}
              stroke="rgba(56,189,248,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )
        } else {
          // horizontal divider
          const divY = table.y + fa.height
          return (
            <line
              x1={table.x + 6} y1={divY}
              x2={table.x + table.width - 6} y2={divY}
              stroke="rgba(56,189,248,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )
        }
      })()}

      {/* Label */}
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8' : color} fontSize={table.fused ? 10 : 11} fontWeight="bold"
        style={{ userSelect: 'none' }}>
        {table.label}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
        fill={table.fused ? '#38bdf8bb' : `${color}bb`} fontSize={9}
        style={{ userSelect: 'none' }}>
        {cap.min}–{cap.max}p
      </text>

      {/* Fused icon — top-right corner (like lock on VIP) */}
      {table.fused && (
        <g transform={`translate(${table.x + table.width - 16}, ${table.y + 4})`}>
          <rect x={-2} y={-2} width={16} height={16} rx={4}
            fill="rgba(56,189,248,0.2)" stroke="rgba(56,189,248,0.5)" strokeWidth={1} />
          {/* Link icon drawn manually as SVG paths */}
          <g transform="translate(1,1)" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M5 7 L3 9 A2.5 2.5 0 0 0 6.5 12.5 L8.5 10.5" />
            <path d="M7 5 L9 3 A2.5 2.5 0 0 1 12.5 6.5 L10.5 8.5" />
            <line x1="5" y1="7" x2="7" y2="5" />
          </g>
        </g>
      )}

      {/* Unfuse hint on hover — shown as tooltip text */}
      {table.fused && selected && (
        <text x={cx} y={table.y + table.height + 14} textAnchor="middle"
          fill="#38bdf8" fontSize={8} style={{ userSelect: 'none' }}>
          Clic para desacoplar
        </text>
      )}

      {/* Lock icon */}
      {table.locked && !table.fused && (
        <text x={table.x + table.width - 10} y={table.y + 12}
          textAnchor="middle" fill={color} fontSize={10} style={{ userSelect: 'none' }}>
          🔒
        </text>
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
              <button key={p.label}
                onClick={() => { setShape(p.shape); setWidthM(p.w); setHeightM(p.h) }}
                className="px-2 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}>
                {p.label}
              </button>
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
    { id: 't1', shape: 'square', x: 80, y: 80, width: 54, height: 54, rotation: 0, locked: false, magnetEnabled: true, label: 'M1', status: 'available', unitSize: 54 },
    { id: 't2', shape: 'square', x: 200, y: 80, width: 54, height: 54, rotation: 0, locked: false, magnetEnabled: true, label: 'M2', status: 'occupied', unitSize: 54 },
    { id: 't3', shape: 'round', x: 340, y: 80, width: 72, height: 72, rotation: 0, locked: false, magnetEnabled: true, label: 'M3', status: 'reserved', unitSize: 72 },
    { id: 't4', shape: 'rectangle', x: 80, y: 210, width: 108, height: 54, rotation: 0, locked: false, magnetEnabled: true, label: 'M4', status: 'available', unitSize: 54 },
    { id: 't5', shape: 'square', x: 280, y: 210, width: 54, height: 54, rotation: 0, locked: true, magnetEnabled: false, label: 'VIP', status: 'reserved', unitSize: 54 },
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
  const [minDistance, setMinDistance] = useState(MIN_DISTANCE_DEFAULT)
  const [zoom, setZoom] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [collisionWarning, setCollisionWarning] = useState(false)
  const [snapHighlight, setSnapHighlight] = useState<string | null>(null)
  const [tableCounter, setTableCounter] = useState(6)
  const [pendingFuse, setPendingFuse] = useState<{ movingId: string; targetId: string; side: 'right' | 'left' | 'bottom' | 'top' } | null>(null)

  const selectedTable = tables.find(t => t.id === selectedId) ?? null

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
    const nx = pt.x - dragging.ox
    const ny = pt.y - dragging.oy

    setTables(prev => {
      const moving = prev.find(t => t.id === dragging.id)
      if (!moving) return prev
      const others = prev.filter(t => t.id !== dragging.id)

      const snapped = moving.magnetEnabled
        ? snapToNeighbor({ ...moving, x: nx, y: ny }, others, SNAP_DISTANCE)
        : { x: nx, y: ny, snappedTo: undefined, side: undefined }

      setSnapHighlight(snapped.snappedTo ?? null)

      // Track pending fuse
      if (snapped.snappedTo && snapped.side) {
        const target = others.find(o => o.id === snapped.snappedTo)
        if (target && !target.fused && !moving.fused && moving.magnetEnabled && target.magnetEnabled) {
          setPendingFuse({ movingId: dragging.id, targetId: snapped.snappedTo, side: snapped.side })
        } else {
          setPendingFuse(null)
        }
      } else {
        setPendingFuse(null)
      }

      const candidate = { ...moving, x: snapped.x, y: snapped.y }
      const collision = others.some(o => rectsOverlap(candidate, o, minDistance))
      setCollisionWarning(collision && !snapped.snappedTo)

      if (collision && !snapped.snappedTo) return prev

      return prev.map(t => t.id === dragging.id ? { ...t, x: snapped.x, y: snapped.y } : t)
    })
  }, [dragging, getSVGPoint, minDistance])

  const handleMouseUp = useCallback(() => {
    // On release: if there's a pending fuse, perform fusion
    if (pendingFuse) {
      setTables(prev => {
        const moving = prev.find(t => t.id === pendingFuse.movingId)
        const target = prev.find(t => t.id === pendingFuse.targetId)
        if (!moving || !target) return prev

        // Only fuse if both have magnet enabled and neither is already fused
        if (!moving.magnetEnabled || !target.magnetEnabled || moving.fused || target.fused) return prev

        const fused = fuseTables(moving, target, pendingFuse.side)
        return [
          ...prev.filter(t => t.id !== moving.id && t.id !== target.id),
          fused,
        ]
      })
      setSelectedId(null)
    }

    setDragging(null)
    setSnapHighlight(null)
    setCollisionWarning(false)
    setPendingFuse(null)
  }, [pendingFuse])

  const handleUnfuse = useCallback((id: string) => {
    setTables(prev => {
      const fused = prev.find(t => t.id === id)
      if (!fused || !fused.fused || !fused.fusedFrom) return prev

      // Restore original tables
      const restored: TableItem[] = fused.fusedFrom.map(f => ({
        id: uid(),
        shape: f.shape,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        rotation: 0,
        locked: false,
        magnetEnabled: true,
        label: f.label,
        status: fused.status,
        unitSize: Math.min(f.width, f.height),
      }))

      return [...prev.filter(t => t.id !== id), ...restored]
    })
    setSelectedId(null)
  }, [])

  // Drawing
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'draw') return
    const pt = getSVGPoint(e)
    if (!isDrawing) {
      setIsDrawing(true)
      setDrawingPoints([pt])
    } else {
      setDrawingPoints(prev => [...prev, pt])
    }
  }, [tool, isDrawing, getSVGPoint])

  const handleCanvasDblClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'draw' || drawingPoints.length < 3) return
    e.preventDefault()
    setSpacePath({ points: drawingPoints, closed: true })
    setDrawingPoints([])
    setIsDrawing(false)
    setTool('select')
  }, [tool, drawingPoints])

  const handleAddTable = useCallback((shape: TableShape, widthM: number, heightM: number, label: string) => {
    const w = Math.round(widthM * METER_PX)
    const h = Math.round(heightM * METER_PX)
    const newTable: TableItem = {
      id: uid(), shape,
      x: 100 + Math.random() * 120,
      y: 100 + Math.random() * 100,
      width: w, height: h,
      rotation: 0, locked: false, magnetEnabled: true,
      label: label || `M${tableCounter}`,
      status: 'available',
      unitSize: Math.min(w, h),
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
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                <Ruler size={11} className="inline mr-1" />Distancia mínima entre mesas (m)
              </label>
              <input type="number" step={0.1} min={0.5} max={3} value={minDistance}
                onChange={e => setMinDistance(+e.target.value)} className="input-gastro text-sm" />
              <p className="text-xs text-gastro-subtle mt-1">{minDistance}m = {Math.round(minDistance * METER_PX)}px</p>
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
          {/* Tools */}
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

          {/* Add table */}
          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Agregar mesa</p>
            {([
              [Square, 'Cuadrada'],
              [Circle, 'Redonda'],
              [RectangleHorizontal, 'Rectangular'],
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
                    <Magnet size={12} /> Imán {selectedTable.magnetEnabled ? 'ON' : 'OFF'}
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
              <div className="w-2.5 h-2.5 rounded-full border border-dashed border-gastro-muted" />
              <span className="text-xs text-gastro-subtle">Dist. mínima</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: '#0d0d18', border: '1px solid #2a2a3d' }}>

          {/* Hints */}
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
            {collisionWarning && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                ⚠ Distancia mínima no respetada ({minDistance}m)
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
                  minDist={minDistance}
                  onUnfuse={handleUnfuse}
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
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  opacity={0.8}
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
