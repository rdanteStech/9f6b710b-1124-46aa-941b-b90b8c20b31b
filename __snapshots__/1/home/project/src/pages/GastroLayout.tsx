import { useState, useRef, useCallback, useEffect } from 'react'
import {
  LayoutGrid, Plus, Save, Eye, Settings, RotateCw, Trash2,
  Square, Circle, RectangleHorizontal, Lock, Unlock, Pencil,
  MousePointer, ZoomIn, ZoomOut, RotateCcw, ChevronDown, X, Magnet, Ruler
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type TableShape = 'square' | 'round' | 'rectangle'
type ToolMode = 'select' | 'draw' | 'add-square' | 'add-round' | 'add-rectangle'

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
  groupId?: string
  unitSize: number // base unit in px (represents ~0.5m)
}

interface SpacePath {
  points: { x: number; y: number }[]
  closed: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const METER_PX = 60 // 1 meter = 60px
const MIN_DISTANCE_DEFAULT = 1.5 // meters
const SNAP_DISTANCE = 20 // px — magnetic snap threshold

const STATUS_COLORS = {
  available: '#10b981',
  occupied: '#9E7FFF',
  reserved: '#f59e0b',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function calcCapacity(table: TableItem, allTables: TableItem[]): { min: number; max: number } {
  const group = table.groupId
    ? allTables.filter(t => t.groupId === table.groupId)
    : [table]

  let min = 0, max = 0
  for (const t of group) {
    const wSeats = Math.floor(t.width / 30)
    const hSeats = Math.floor(t.height / 30)
    if (t.shape === 'round') {
      const circ = Math.PI * Math.max(t.width, t.height)
      min += Math.floor(circ / 40)
      max += Math.floor(circ / 30)
    } else {
      min += wSeats * 2 + hSeats * 2 - 4
      max += wSeats * 2 + hSeats * 2
    }
  }
  return { min: Math.max(1, min), max: Math.max(2, max) }
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

function snapToNeighbor(
  moving: TableItem,
  others: TableItem[],
  snapDist: number
): { x: number; y: number; snappedTo?: string } {
  let best = { x: moving.x, y: moving.y, snappedTo: undefined as string | undefined }
  let bestDist = snapDist

  for (const other of others) {
    if (other.id === moving.id || !other.magnetEnabled) continue

    // right edge of other → left edge of moving
    const dx1 = Math.abs((other.x + other.width) - moving.x)
    const dy1 = Math.abs(other.y - moving.y)
    if (dx1 < bestDist && dy1 < 40) {
      bestDist = dx1
      best = { x: other.x + other.width, y: other.y, snappedTo: other.id }
    }
    // left edge of other → right edge of moving
    const dx2 = Math.abs(other.x - (moving.x + moving.width))
    if (dx2 < bestDist && dy1 < 40) {
      bestDist = dx2
      best = { x: other.x - moving.width, y: other.y, snappedTo: other.id }
    }
    // bottom edge of other → top edge of moving
    const dy2 = Math.abs((other.y + other.height) - moving.y)
    const dx3 = Math.abs(other.x - moving.x)
    if (dy2 < bestDist && dx3 < 40) {
      bestDist = dy2
      best = { x: other.x, y: other.y + other.height, snappedTo: other.id }
    }
    // top edge of other → bottom edge of moving
    const dy3 = Math.abs(other.y - (moving.y + moving.height))
    if (dy3 < bestDist && dx3 < 40) {
      bestDist = dy3
      best = { x: other.x, y: other.y - moving.height, snappedTo: other.id }
    }
  }
  return best
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TableSVG({ table, selected, onSelect, onDragStart, minDist, allTables }: {
  table: TableItem
  selected: boolean
  onSelect: (id: string) => void
  onDragStart: (id: string, e: React.MouseEvent) => void
  minDist: number
  allTables: TableItem[]
}) {
  const color = STATUS_COLORS[table.status]
  const cap = calcCapacity(table, allTables)
  const cx = table.x + table.width / 2
  const cy = table.y + table.height / 2

  return (
    <g
      transform={`rotate(${table.rotation}, ${cx}, ${cy})`}
      style={{ cursor: table.locked ? 'not-allowed' : 'grab' }}
      onMouseDown={e => { e.stopPropagation(); if (!table.locked) onDragStart(table.id, e); onSelect(table.id) }}
    >
      {/* Min distance ring */}
      {selected && (
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

      {/* Table body */}
      {table.shape === 'round' ? (
        <ellipse
          cx={cx} cy={cy}
          rx={table.width / 2} ry={table.height / 2}
          fill={`${color}22`}
          stroke={selected ? color : `${color}88`}
          strokeWidth={selected ? 2.5 : 1.5}
          style={{ filter: selected ? `drop-shadow(0 0 8px ${color}66)` : 'none' }}
        />
      ) : (
        <rect
          x={table.x} y={table.y}
          width={table.width} height={table.height}
          rx={table.shape === 'square' ? 8 : 6}
          fill={`${color}22`}
          stroke={selected ? color : `${color}88`}
          strokeWidth={selected ? 2.5 : 1.5}
          style={{ filter: selected ? `drop-shadow(0 0 8px ${color}66)` : 'none' }}
        />
      )}

      {/* Label */}
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={11} fontWeight="bold" style={{ userSelect: 'none' }}>
        {table.label}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
        fill={`${color}bb`} fontSize={9} style={{ userSelect: 'none' }}>
        {cap.min}–{cap.max}p
      </text>

      {/* Lock icon */}
      {table.locked && (
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

  const presets: { label: string; shape: TableShape; w: number; h: number }[] = [
    { label: 'Mesa 2p', shape: 'square', w: 0.7, h: 0.7 },
    { label: 'Mesa 4p', shape: 'square', w: 0.9, h: 0.9 },
    { label: 'Mesa 6p rect.', shape: 'rectangle', w: 1.8, h: 0.9 },
    { label: 'Mesa 8p rect.', shape: 'rectangle', w: 2.4, h: 0.9 },
    { label: 'Mesa redonda 4p', shape: 'round', w: 0.9, h: 0.9 },
    { label: 'Mesa redonda 6p', shape: 'round', w: 1.2, h: 1.2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gastro-text">Nueva mesa</h3>
          <button onClick={onClose} className="text-gastro-muted hover:text-gastro-text"><X size={18} /></button>
        </div>

        {/* Presets */}
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

        {/* Shape */}
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
                <Icon size={18} />
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
              {shape === 'round' ? 'Diámetro (m)' : 'Ancho (m)'}
            </label>
            <input type="number" step={0.1} min={0.5} max={4}
              value={widthM} onChange={e => setWidthM(+e.target.value)}
              className="input-gastro text-sm" />
          </div>
          {shape !== 'round' && (
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Largo (m)</label>
              <input type="number" step={0.1} min={0.5} max={6}
                value={heightM} onChange={e => setHeightM(+e.target.value)}
                className="input-gastro text-sm" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Nombre / número</label>
          <input type="text" placeholder="Ej: Mesa 1, VIP, Barra..."
            value={label} onChange={e => setLabel(e.target.value)}
            className="input-gastro text-sm" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm py-2.5">Cancelar</button>
          <button
            onClick={() => onAdd(shape, widthM, shape === 'round' ? widthM : heightM, label)}
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
    { id: 't2', shape: 'square', x: 180, y: 80, width: 54, height: 54, rotation: 0, locked: false, magnetEnabled: true, label: 'M2', status: 'occupied', unitSize: 54 },
    { id: 't3', shape: 'round', x: 300, y: 80, width: 72, height: 72, rotation: 0, locked: false, magnetEnabled: true, label: 'M3', status: 'reserved', unitSize: 72 },
    { id: 't4', shape: 'rectangle', x: 80, y: 200, width: 108, height: 54, rotation: 0, locked: false, magnetEnabled: true, label: 'M4', status: 'available', unitSize: 54 },
    { id: 't5', shape: 'square', x: 260, y: 200, width: 54, height: 54, rotation: 0, locked: true, magnetEnabled: false, label: 'VIP', status: 'reserved', unitSize: 54 },
  ])
  const [spacePath, setSpacePath] = useState<SpacePath>({
    points: [
      { x: 40, y: 40 }, { x: 560, y: 40 }, { x: 560, y: 420 },
      { x: 380, y: 420 }, { x: 380, y: 340 }, { x: 40, y: 340 }
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
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null)
  const [snapHighlight, setSnapHighlight] = useState<string | null>(null)
  const [tableCounter, setTableCounter] = useState(6)

  const selectedTable = tables.find(t => t.id === selectedId) ?? null

  // ── SVG coordinate helper ──
  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    }
  }, [zoom])

  // ── Drag ──
  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    const pt = getSVGPoint(e)
    const table = tables.find(t => t.id === id)
    if (!table) return
    setDragging({ id, ox: pt.x - table.x, oy: pt.y - table.y })
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

      // Magnetic snap
      const snapped = moving.magnetEnabled
        ? snapToNeighbor({ ...moving, x: nx, y: ny }, others, SNAP_DISTANCE)
        : { x: nx, y: ny, snappedTo: undefined }

      setSnapHighlight(snapped.snappedTo ?? null)

      // Collision check
      const candidate = { ...moving, x: snapped.x, y: snapped.y }
      const collision = others.some(o => rectsOverlap(candidate, o, minDistance))
      setCollisionWarning(collision ? dragging.id : null)

      if (collision && !snapped.snappedTo) return prev // block if collision and not snapping

      return prev.map(t => t.id === dragging.id ? { ...t, x: snapped.x, y: snapped.y } : t)
    })
  }, [dragging, getSVGPoint, minDistance])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setSnapHighlight(null)
    setCollisionWarning(null)
  }, [])

  // ── Drawing space ──
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

  // ── Add table ──
  const handleAddTable = useCallback((shape: TableShape, widthM: number, heightM: number, label: string) => {
    const w = Math.round(widthM * METER_PX)
    const h = Math.round(heightM * METER_PX)
    const newTable: TableItem = {
      id: uid(),
      shape,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: w,
      height: h,
      rotation: 0,
      locked: false,
      magnetEnabled: true,
      label: label || `M${tableCounter}`,
      status: 'available',
      unitSize: Math.min(w, h),
    }
    setTables(prev => [...prev, newTable])
    setTableCounter(c => c + 1)
    setShowAddModal(false)
    setSelectedId(newTable.id)
  }, [tableCounter])

  // ── Rotate selected ──
  const rotateSelected = useCallback((deg: number) => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, rotation: (t.rotation + deg + 360) % 360 } : t))
  }, [selectedId])

  // ── Delete selected ──
  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.filter(t => t.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  // ── Toggle lock ──
  const toggleLock = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, locked: !t.locked } : t))
  }, [selectedId])

  // ── Toggle magnet ──
  const toggleMagnet = useCallback(() => {
    if (!selectedId) return
    setTables(prev => prev.map(t => t.id === selectedId ? { ...t, magnetEnabled: !t.magnetEnabled } : t))
  }, [selectedId])

  // ── Status cycle ──
  const cycleStatus = useCallback(() => {
    if (!selectedId) return
    const cycle: TableItem['status'][] = ['available', 'occupied', 'reserved']
    setTables(prev => prev.map(t => {
      if (t.id !== selectedId) return t
      const idx = cycle.indexOf(t.status)
      return { ...t, status: cycle[(idx + 1) % cycle.length] }
    }))
  }, [selectedId])

  // ── Space path as SVG polygon string ──
  const spacePolygon = spacePath.points.map(p => `${p.x},${p.y}`).join(' ')
  const drawingPolygon = drawingPoints.map(p => `${p.x},${p.y}`).join(' ')

  // ── Stats ──
  const totalTables = tables.length
  const available = tables.filter(t => t.status === 'available').length
  const occupied = tables.filter(t => t.status === 'occupied').length
  const reserved = tables.filter(t => t.status === 'reserved').length
  const totalCap = tables.reduce((acc, t) => {
    const c = calcCapacity(t, tables)
    return { min: acc.min + c.min, max: acc.max + c.max }
  }, { min: 0, max: 0 })

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="section-title">Diseño de espacios</h2>
          <p className="section-subtitle">Editor interactivo de planta — arrastra, rota y configura cada mesa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary text-sm px-4 py-2">
            <Settings size={15} /> Configurar
          </button>
          <button className="btn-secondary text-sm px-4 py-2"><Eye size={15} /> Vista cliente</button>
          <button className="btn-primary text-sm px-4 py-2"><Save size={15} /> Guardar</button>
        </div>
      </div>

      {/* Settings panel */}
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
                onChange={e => setMinDistance(+e.target.value)}
                className="input-gastro text-sm" />
              <p className="text-xs text-gastro-subtle mt-1">Actualmente: {minDistance}m ({Math.round(minDistance * METER_PX)}px)</p>
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

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          { label: 'Total mesas', value: totalTables, color: '#9E7FFF' },
          { label: 'Disponibles', value: available, color: '#10b981' },
          { label: 'Ocupadas', value: occupied, color: '#9E7FFF' },
          { label: 'Reservadas', value: reserved, color: '#f59e0b' },
          { label: 'Capacidad total', value: `${totalCap.min}–${totalCap.max}p`, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center py-3">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gastro-subtle">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Herramientas</p>
            {([
              ['select', MousePointer, 'Seleccionar'],
              ['draw', Pencil, 'Dibujar espacio'],
            ] as const).map(([t, Icon, lbl]) => (
              <button key={t} onClick={() => setTool(t as ToolMode)} title={lbl}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: tool === t ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tool === t ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                  color: tool === t ? '#9E7FFF' : '#8888aa',
                }}>
                <Icon size={14} /> {lbl}
              </button>
            ))}
          </div>

          <div className="card-gastro p-3 space-y-1">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Agregar mesa</p>
            <button onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #2a2a3d' }}>
              <Square size={13} /> Cuadrada
            </button>
            <button onClick={() => { setShowAddModal(true) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #2a2a3d' }}>
              <Circle size={13} /> Redonda
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-gastro-subtle hover:text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #2a2a3d' }}>
              <RectangleHorizontal size={13} /> Rectangular
            </button>
          </div>

          {/* Selected table actions */}
          {selectedTable && (
            <div className="card-gastro p-3 space-y-2 animate-slide-down">
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Mesa seleccionada</p>
              <div className="text-sm font-bold text-gastro-text">{selectedTable.label}</div>
              <div className="text-xs text-gastro-subtle">
                {(selectedTable.width / METER_PX).toFixed(1)}m × {(selectedTable.height / METER_PX).toFixed(1)}m
              </div>
              <div className="text-xs" style={{ color: STATUS_COLORS[selectedTable.status] }}>
                ● {selectedTable.status === 'available' ? 'Disponible' : selectedTable.status === 'occupied' ? 'Ocupada' : 'Reservada'}
              </div>
              <div className="text-xs text-gastro-subtle">
                Cap: {calcCapacity(selectedTable, tables).min}–{calcCapacity(selectedTable, tables).max} personas
              </div>

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
            </div>
          )}

          {/* Legend */}
          <div className="card-gastro p-3">
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Leyenda</p>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-xs text-gastro-subtle capitalize">
                  {s === 'available' ? 'Disponible' : s === 'occupied' ? 'Ocupada' : 'Reservada'}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full border border-dashed border-gastro-muted" />
              <span className="text-xs text-gastro-subtle">Distancia mínima</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden relative"
          style={{ background: '#0d0d18', border: '1px solid #2a2a3d' }}>

          {/* Tool hint */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            {tool === 'draw' && (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold animate-pulse"
                style={{ background: 'rgba(158,127,255,0.2)', border: '1px solid rgba(158,127,255,0.4)', color: '#9E7FFF' }}>
                {isDrawing
                  ? `${drawingPoints.length} puntos — Doble clic para cerrar el espacio`
                  : 'Clic para comenzar a dibujar el contorno del espacio'}
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
            {/* Grid */}
            <defs>
              <pattern id="grid" width={METER_PX} height={METER_PX} patternUnits="userSpaceOnUse">
                <path d={`M ${METER_PX} 0 L 0 0 0 ${METER_PX}`} fill="none" stroke="rgba(158,127,255,0.08)" strokeWidth="1" />
              </pattern>
              <pattern id="grid-sub" width={METER_PX / 2} height={METER_PX / 2} patternUnits="userSpaceOnUse">
                <path d={`M ${METER_PX / 2} 0 L 0 0 0 ${METER_PX / 2}`} fill="none" stroke="rgba(158,127,255,0.04)" strokeWidth="0.5" />
              </pattern>
              <clipPath id="space-clip">
                {spacePath.points.length > 2 && (
                  <polygon points={spacePolygon} />
                )}
              </clipPath>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-sub)" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Scale ruler */}
            <g transform="translate(20, 20)">
              <line x1={0} y1={0} x2={METER_PX} y2={0} stroke="#3a3a52" strokeWidth={2} />
              <line x1={0} y1={-4} x2={0} y2={4} stroke="#3a3a52" strokeWidth={1.5} />
              <line x1={METER_PX} y1={-4} x2={METER_PX} y2={4} stroke="#3a3a52" strokeWidth={1.5} />
              <text x={METER_PX / 2} y={-8} textAnchor="middle" fill="#8888aa" fontSize={9}>1 metro</text>
            </g>

            {/* Space boundary */}
            {spacePath.points.length > 2 && (
              <>
                <polygon
                  points={spacePolygon}
                  fill="rgba(158,127,255,0.04)"
                  stroke="rgba(158,127,255,0.5)"
                  strokeWidth={2}
                  strokeDasharray={spacePath.closed ? 'none' : '8 4'}
                />
                {/* Corner handles */}
                {spacePath.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={5}
                    fill="#9E7FFF" stroke="#0d0d18" strokeWidth={2}
                    style={{ cursor: 'pointer' }} />
                ))}
              </>
            )}

            {/* Drawing preview */}
            {isDrawing && drawingPoints.length > 0 && (
              <>
                <polyline
                  points={drawingPolygon}
                  fill="none"
                  stroke="rgba(158,127,255,0.6)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                />
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
                  allTables={tables}
                />
              ))}
            </g>

            {/* Snap highlight */}
            {snapHighlight && (() => {
              const t = tables.find(x => x.id === snapHighlight)
              if (!t) return null
              return (
                <rect x={t.x - 4} y={t.y - 4} width={t.width + 8} height={t.height + 8}
                  rx={10} fill="none" stroke="#9E7FFF" strokeWidth={2}
                  strokeDasharray="4 2" opacity={0.7} />
              )
            })()}
          </svg>
        </div>
      </div>

      {/* Add table modal */}
      {showAddModal && (
        <AddTableModal onAdd={handleAddTable} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
