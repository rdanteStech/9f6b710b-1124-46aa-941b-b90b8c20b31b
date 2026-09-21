import { useState, useEffect, useRef } from 'react'
import {
  ScanEye, Camera, Wifi, WifiOff, Bell, BellOff,
  AlertTriangle, CheckCircle, Clock, X, ChevronRight,
  GlassWater, UtensilsCrossed, Hand, Zap, Brain,
  Users, MapPin, TrendingUp, Eye, EyeOff, Settings,
  Filter, RotateCcw, BadgeCheck, Sparkles, Activity,
  Circle, Play, Pause, Volume2, VolumeX, Shield,
  ToggleLeft, ToggleRight, Save, Sliders, Radio,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AlertType = 'empty_glass' | 'empty_plate' | 'raised_hand' | 'long_wait' | 'spill' | 'table_ready'
type AlertPriority = 'critical' | 'high' | 'medium' | 'low'
type AlertStatus = 'new' | 'assigned' | 'resolved'

interface CameraFeed {
  id: string
  name: string
  zone: string
  tables: string[]
  status: 'online' | 'offline' | 'processing'
  resolution: string
  fps: number
  alertsToday: number
  thumbnail: string
}

interface EyeAlert {
  id: string
  cameraId: string
  cameraName: string
  zone: string
  table: string
  type: AlertType
  priority: AlertPriority
  status: AlertStatus
  detectedAt: string
  resolvedAt?: string
  assignedTo?: string
  assignedWaiter?: { name: string; emoji: string; color: string }
  confidence: number
  description: string
  actionSuggested: string
  thumbnail: string
}

interface WaiterPerf {
  id: string; name: string; emoji: string; color: string
  avgResponseTime: number; alertsResolved: number; rating: number
}

interface EyeConfig {
  detectionTypes: Record<AlertType, boolean>
  minConfidence: number
  handRaiseSeconds: number
  longWaitMinutes: number
  autoAssign: boolean
  maxAssignDistance: number
  reassignIfFar: boolean
  notifyPush: boolean
  notifySound: boolean
  notifyKds: boolean
  notifyWhatsapp: boolean
  privacyBlur: boolean
  recordClips: boolean
  activeHoursStart: string
  activeHoursEnd: string
  cooldownSeconds: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CAMERAS: CameraFeed[] = [
  { id: 'cam1', name: 'Cámara Salón A', zone: 'Salón', tables: ['M1','M2','M3','M4'], status: 'online', resolution: '4K', fps: 30, alertsToday: 14, thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=600' },
  { id: 'cam2', name: 'Cámara Salón B', zone: 'Salón', tables: ['M5','M6','M7','M8'], status: 'online', resolution: '4K', fps: 30, alertsToday: 9, thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=600' },
  { id: 'cam3', name: 'Cámara Terraza', zone: 'Terraza', tables: ['T1','T2','T3','T4','T5'], status: 'online', resolution: '1080p', fps: 25, alertsToday: 7, thumbnail: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?w=600' },
  { id: 'cam4', name: 'Cámara VIP', zone: 'VIP', tables: ['VIP1','VIP2'], status: 'processing', resolution: '4K', fps: 30, alertsToday: 3, thumbnail: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?w=600' },
  { id: 'cam5', name: 'Cámara Barra', zone: 'Barra', tables: ['B1','B2','B3'], status: 'offline', resolution: '1080p', fps: 0, alertsToday: 0, thumbnail: 'https://images.pexels.com/photos/1267244/pexels-photo-1267244.jpeg?w=600' },
  { id: 'cam6', name: 'Cámara Entrada', zone: 'Entrada', tables: [], status: 'online', resolution: '1080p', fps: 25, alertsToday: 2, thumbnail: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?w=600' },
]

const WAITERS_PERF: WaiterPerf[] = [
  { id: 'w1', name: 'Carlos', emoji: '👨‍🍳', color: '#f59e0b', avgResponseTime: 1.8, alertsResolved: 34, rating: 4.9 },
  { id: 'w2', name: 'Valentina', emoji: '👩‍🍳', color: '#60A5FA', avgResponseTime: 2.1, alertsResolved: 28, rating: 4.7 },
  { id: 'w3', name: 'Rodrigo', emoji: '🧑‍🍳', color: '#3B82F6', avgResponseTime: 2.6, alertsResolved: 21, rating: 4.5 },
]

const ALERT_CONFIG: Record<AlertType, { label: string; icon: React.ComponentType<{size?:number;style?:React.CSSProperties}>; color: string; bg: string; emoji: string }> = {
  empty_glass:  { label: 'Vaso vacío',        icon: GlassWater,      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',   emoji: '🥤' },
  empty_plate:  { label: 'Plato vacío',        icon: UtensilsCrossed, color: '#2563EB', bg: 'rgba(37,99,235,0.12)', emoji: '🍽️' },
  raised_hand:  { label: 'Mano levantada',     icon: Hand,            color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   emoji: '✋' },
  long_wait:    { label: 'Espera prolongada',  icon: Clock,           color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  emoji: '⏱️' },
  spill:        { label: 'Derrame detectado',  icon: AlertTriangle,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   emoji: '💧' },
  table_ready:  { label: 'Mesa lista',         icon: CheckCircle,     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  emoji: '✅' },
}

const PRIORITY_CONFIG: Record<AlertPriority, { label: string; color: string; bg: string; pulse: boolean }> = {
  critical: { label: 'Crítica',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   pulse: true  },
  high:     { label: 'Alta',     color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  pulse: true  },
  medium:   { label: 'Media',    color: '#2563EB', bg: 'rgba(37,99,235,0.15)', pulse: false },
  low:      { label: 'Baja',     color: '#8899BB', bg: 'rgba(136,136,170,0.12)', pulse: false },
}

const DEFAULT_CONFIG: EyeConfig = {
  detectionTypes: {
    empty_glass: true,
    empty_plate: true,
    raised_hand: true,
    long_wait: true,
    spill: true,
    table_ready: false,
  },
  minConfidence: 85,
  handRaiseSeconds: 6,
  longWaitMinutes: 10,
  autoAssign: true,
  maxAssignDistance: 15,
  reassignIfFar: true,
  notifyPush: true,
  notifySound: true,
  notifyKds: true,
  notifyWhatsapp: false,
  privacyBlur: true,
  recordClips: true,
  activeHoursStart: '11:00',
  activeHoursEnd: '01:00',
  cooldownSeconds: 30,
}

function uid() { return Math.random().toString(36).slice(2, 9) }
function nowTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!enabled)} className="flex-shrink-0">
      {enabled
        ? <ToggleRight size={24} style={{ color: '#10b981' }} />
        : <ToggleLeft size={24} style={{ color: '#4A5A7A' }} />}
    </button>
  )
}

function ConfigSlider({ label, value, min, max, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; unit: string
  onChange: (v: number) => void; hint?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gastro-text">{label}</span>
        <span className="text-xs font-black" style={{ color: '#2563EB' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(90deg, #2563EB ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 0%)` }} />
      {hint && <p className="text-xs text-gastro-subtle mt-1.5">{hint}</p>}
    </div>
  )
}

const INITIAL_ALERTS: EyeAlert[] = [
  {
    id: 'a1', cameraId: 'cam1', cameraName: 'Cámara Salón A', zone: 'Salón', table: 'M3',
    type: 'raised_hand', priority: 'critical', status: 'new',
    detectedAt: '21:14:32', confidence: 97, description: 'Cliente levantando la mano por más de 8 segundos',
    actionSuggested: 'Acercarse a Mesa 3 de inmediato',
    thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=300',
  },
  {
    id: 'a2', cameraId: 'cam1', cameraName: 'Cámara Salón A', zone: 'Salón', table: 'M1',
    type: 'empty_glass', priority: 'high', status: 'new',
    detectedAt: '21:13:55', confidence: 94, description: '2 vasos vacíos detectados en la mesa',
    actionSuggested: 'Ofrecer recarga de bebidas en Mesa 1',
    thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=300',
  },
  {
    id: 'a3', cameraId: 'cam2', cameraName: 'Cámara Salón B', zone: 'Salón', table: 'M6',
    type: 'empty_plate', priority: 'medium', status: 'assigned',
    detectedAt: '21:12:10', confidence: 89, description: 'Platos principales vacíos, posible momento para ofrecer postre',
    actionSuggested: 'Retirar platos y ofrecer carta de postres',
    assignedTo: 'w2', assignedWaiter: { name: 'Valentina', emoji: '👩‍🍳', color: '#60A5FA' },
    thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=300',
  },
  {
    id: 'a4', cameraId: 'cam3', cameraName: 'Cámara Terraza', zone: 'Terraza', table: 'T2',
    type: 'long_wait', priority: 'high', status: 'new',
    detectedAt: '21:11:40', confidence: 91, description: 'Mesa sin atención por más de 12 minutos desde que se sentaron',
    actionSuggested: 'Tomar pedido en Terraza Mesa T2',
    thumbnail: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?w=300',
  },
  {
    id: 'a5', cameraId: 'cam4', cameraName: 'Cámara VIP', zone: 'VIP', table: 'VIP1',
    type: 'empty_glass', priority: 'critical', status: 'assigned',
    detectedAt: '21:10:22', confidence: 96, description: 'Copa de vino vacía en mesa VIP — cliente frecuente',
    actionSuggested: 'Ofrecer recarga de vino en VIP1 con prioridad',
    assignedTo: 'w1', assignedWaiter: { name: 'Carlos', emoji: '👨‍🍳', color: '#f59e0b' },
    thumbnail: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?w=300',
  },
  {
    id: 'a6', cameraId: 'cam2', cameraName: 'Cámara Salón B', zone: 'Salón', table: 'M8',
    type: 'spill', priority: 'critical', status: 'resolved',
    detectedAt: '21:08:15', resolvedAt: '21:09:02', confidence: 99, description: 'Derrame de líquido detectado en la mesa',
    actionSuggested: 'Limpiar mesa M8 de inmediato',
    assignedTo: 'w3', assignedWaiter: { name: 'Rodrigo', emoji: '🧑‍🍳', color: '#3B82F6' },
    thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=300',
  },
  {
    id: 'a7', cameraId: 'cam1', cameraName: 'Cámara Salón A', zone: 'Salón', table: 'M2',
    type: 'table_ready', priority: 'low', status: 'resolved',
    detectedAt: '21:05:30', resolvedAt: '21:06:10', confidence: 88, description: 'Mesa desocupada y limpia, lista para nuevos comensales',
    actionSuggested: 'Registrar mesa M2 como disponible',
    thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=300',
  },
]

// ─── Animated scan line ───────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #60A5FA, #2563EB, transparent)',
        animation: 'scanline 3s linear infinite',
        boxShadow: '0 0 8px rgba(96,165,250,0.6)',
      }} />
    </div>
  )
}

// ─── Confidence Ring ──────────────────────────────────────────────────────────

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx={20} cy={20} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x={20} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>{value}%</text>
    </svg>
  )
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert, onAssign, onResolve, onDismiss }: {
  alert: EyeAlert
  onAssign: (alertId: string, waiterId: string) => void
  onResolve: (alertId: string) => void
  onDismiss: (alertId: string) => void
}) {
  const [showAssign, setShowAssign] = useState(false)
  const typeCfg = ALERT_CONFIG[alert.type]
  const priCfg = PRIORITY_CONFIG[alert.priority]
  const TypeIcon = typeCfg.icon

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: alert.status === 'resolved' ? 'rgba(255,255,255,0.02)' : '#0F1628',
        border: `1px solid ${alert.status === 'new' && (alert.priority === 'critical' || alert.priority === 'high') ? priCfg.color + '44' : '#1A2540'}`,
        opacity: alert.status === 'resolved' ? 0.6 : 1,
      }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: typeCfg.bg }}>
            <TypeIcon size={18} style={{ color: typeCfg.color }} />
            {priCfg.pulse && alert.status === 'new' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: priCfg.color }}>
                <span className="absolute w-3 h-3 rounded-full animate-ping" style={{ background: priCfg.color, opacity: 0.5 }} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ background: priCfg.bg, color: priCfg.color }}>
                {priCfg.label}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: typeCfg.bg, color: typeCfg.color }}>
                {typeCfg.emoji} {typeCfg.label}
              </span>
              {alert.status === 'resolved' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                  ✓ Resuelto
                </span>
              )}
              {alert.status === 'assigned' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{ background: `${alert.assignedWaiter?.color}18`, color: alert.assignedWaiter?.color }}>
                  {alert.assignedWaiter?.emoji} {alert.assignedWaiter?.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <MapPin size={11} style={{ color: '#8899BB', flexShrink: 0 }} />
              <span className="text-xs font-bold text-gastro-text">{alert.zone} · {alert.table}</span>
              <span className="text-xs" style={{ color: '#6666aa' }}>·</span>
              <Camera size={11} style={{ color: '#6666aa', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: '#6666aa' }}>{alert.cameraName}</span>
            </div>

            <p className="text-xs text-gastro-subtle leading-relaxed mb-2">{alert.description}</p>

            <div className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Zap size={11} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: '#2563EB' }}>{alert.actionSuggested}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <ConfidenceRing value={alert.confidence} color={typeCfg.color} />
            <div className="text-xs" style={{ color: '#6666aa' }}>{alert.detectedAt}</div>
            {alert.resolvedAt && (
              <div className="text-xs text-success">→ {alert.resolvedAt}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        {alert.status !== 'resolved' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#1A2540' }}>
            {alert.status === 'new' && (
              <button onClick={() => setShowAssign(!showAssign)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#2563EB' }}>
                <BadgeCheck size={12} /> Asignar mozo
              </button>
            )}
            <button onClick={() => onResolve(alert.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
              <CheckCircle size={12} /> Resolver
            </button>
            <button onClick={() => onDismiss(alert.id)}
              className="ml-auto flex items-center gap-1 px-2 py-2 rounded-xl text-xs transition-all"
              style={{ color: '#6666aa' }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Assign panel */}
        {showAssign && alert.status === 'new' && (
          <div className="mt-3 p-3 rounded-xl space-y-2"
            style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#2563EB' }}>
              Asignar a mozo
            </p>
            {WAITERS_PERF.map(w => (
              <button key={w.id}
                onClick={() => { onAssign(alert.id, w.id); setShowAssign(false) }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{ background: `${w.color}0d`, border: `1px solid ${w.color}33` }}>
                <span className="text-base">{w.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-gastro-text">{w.name}</div>
                  <div className="text-xs" style={{ color: '#8899BB' }}>
                    Resp. prom. {w.avgResponseTime}min · {w.alertsResolved} resueltas hoy
                  </div>
                </div>
                <div className="text-xs font-bold" style={{ color: w.color }}>★ {w.rating}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Camera Card ──────────────────────────────────────────────────────────────

function CameraCard({ cam, isSelected, onClick }: {
  cam: CameraFeed; isSelected: boolean; onClick: () => void
}) {
  const statusCfg = {
    online:     { color: '#10b981', label: 'En línea',    dot: true  },
    offline:    { color: '#ef4444', label: 'Sin señal',   dot: false },
    processing: { color: '#f59e0b', label: 'Procesando',  dot: true  },
  }[cam.status]

  return (
    <button onClick={onClick}
      className="relative rounded-2xl overflow-hidden transition-all duration-200 text-left w-full"
      style={{
        border: `2px solid ${isSelected ? '#60A5FA' : cam.status === 'offline' ? '#1A2540' : '#1A2540'}`,
        boxShadow: isSelected ? '0 0 20px rgba(96,165,250,0.2)' : 'none',
      }}>
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <img src={cam.thumbnail} alt={cam.name}
          className="w-full h-full object-cover"
          style={{ filter: cam.status === 'offline' ? 'grayscale(1) brightness(0.3)' : 'brightness(0.7)' }} />

        {/* Overlay grid */}
        {cam.status !== 'offline' && (
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px)',
            backgroundSize: '20% 25%',
          }} />
        )}

        {/* Scan line animation */}
        {cam.status === 'online' && <ScanLine />}

        {/* Corner brackets */}
        {cam.status !== 'offline' && (
          <>
            {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
              ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, border], i) => (
              <div key={i} className={`absolute ${pos} w-4 h-4 ${border}`}
                style={{ borderColor: '#60A5FA', opacity: 0.7 }} />
            ))}
          </>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          {statusCfg.dot && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color, boxShadow: `0 0 4px ${statusCfg.color}` }}>
              {cam.status === 'online' && <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: statusCfg.color, opacity: 0.5 }} />}
            </div>
          )}
          <span className="text-xs font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </div>

        {/* Alerts badge */}
        {cam.alertsToday > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.85)' }}>
            <Bell size={9} className="text-white" />
            <span className="text-white font-black" style={{ fontSize: '9px' }}>{cam.alertsToday}</span>
          </div>
        )}

        {/* FPS */}
        {cam.status !== 'offline' && (
          <div className="absolute bottom-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#10b981', fontSize: '9px' }}>
            {cam.fps}fps · {cam.resolution}
          </div>
        )}

        {/* Offline overlay */}
        {cam.status === 'offline' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <WifiOff size={20} style={{ color: '#ef4444' }} />
            <span className="text-xs font-bold" style={{ color: '#ef4444' }}>Sin señal</span>
          </div>
        )}
      </div>

      <div className="p-3" style={{ background: '#141420' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gastro-text truncate">{cam.name}</span>
          {isSelected && <Eye size={12} style={{ color: '#60A5FA' }} />}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={10} style={{ color: '#6666aa' }} />
          <span className="text-xs" style={{ color: '#8899BB' }}>{cam.zone}</span>
          {cam.tables.length > 0 && (
            <span className="text-xs" style={{ color: '#6666aa' }}>· {cam.tables.length} mesas</span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Main GastroEye ───────────────────────────────────────────────────────────

export default function GastroEye() {
  const [alerts, setAlerts] = useState<EyeAlert[]>(INITIAL_ALERTS)
  const [selectedCamera, setSelectedCamera] = useState<string | null>('cam1')
  const [activeTab, setActiveTab] = useState<'live' | 'cameras' | 'analytics' | 'config'>('live')
  const [config, setConfig] = useState<EyeConfig>(DEFAULT_CONFIG)
  const [configSaved, setConfigSaved] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'assigned' | 'resolved'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | AlertPriority>('all')
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newAlertFlash, setNewAlertFlash] = useState(false)
  const alertCountRef = useRef(alerts.filter(a => a.status === 'new').length)

  // Simulate incoming alerts
  useEffect(() => {
    if (!isMonitoring) return
    const SIMULATED: Omit<EyeAlert, 'id' | 'detectedAt'>[] = [
      { cameraId: 'cam2', cameraName: 'Cámara Salón B', zone: 'Salón', table: 'M5', type: 'empty_glass', priority: 'high', status: 'new', confidence: 93, description: 'Vaso de agua vacío detectado', actionSuggested: 'Ofrecer agua en Mesa 5', thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=300' },
      { cameraId: 'cam3', cameraName: 'Cámara Terraza', zone: 'Terraza', table: 'T4', type: 'raised_hand', priority: 'critical', status: 'new', confidence: 98, description: 'Cliente solicitando atención urgente', actionSuggested: 'Atender Terraza T4 de inmediato', thumbnail: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?w=300' },
      { cameraId: 'cam1', cameraName: 'Cámara Salón A', zone: 'Salón', table: 'M4', type: 'empty_plate', priority: 'medium', status: 'new', confidence: 87, description: 'Platos de entrada vacíos, listos para retirar', actionSuggested: 'Retirar platos en Mesa 4', thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=300' },
      { cameraId: 'cam4', cameraName: 'Cámara VIP', zone: 'VIP', table: 'VIP2', type: 'long_wait', priority: 'high', status: 'new', confidence: 90, description: 'Mesa VIP sin atención por 9 minutos', actionSuggested: 'Priorizar atención en VIP2', thumbnail: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?w=300' },
    ]
    let idx = 0
    const interval = setInterval(() => {
      if (idx >= SIMULATED.length) { idx = 0 }
      const template = SIMULATED[idx++]
      const newAlert: EyeAlert = { ...template, id: uid(), detectedAt: nowTime() }
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)])
      setNewAlertFlash(true)
      setTimeout(() => setNewAlertFlash(false), 800)
    }, 8000)
    return () => clearInterval(interval)
  }, [isMonitoring])

  const handleAssign = (alertId: string, waiterId: string) => {
    const waiter = WAITERS_PERF.find(w => w.id === waiterId)
    if (!waiter) return
    setAlerts(prev => prev.map(a => a.id === alertId
      ? { ...a, status: 'assigned', assignedTo: waiterId, assignedWaiter: { name: waiter.name, emoji: waiter.emoji, color: waiter.color } }
      : a
    ))
  }

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId
      ? { ...a, status: 'resolved', resolvedAt: nowTime() }
      : a
    ))
  }

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const updateConfig = <K extends keyof EyeConfig>(key: K, value: EyeConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setConfigSaved(false)
  }

  const toggleDetectionType = (type: AlertType) => {
    setConfig(prev => ({
      ...prev,
      detectionTypes: { ...prev.detectionTypes, [type]: !prev.detectionTypes[type] },
    }))
    setConfigSaved(false)
  }

  const handleSaveConfig = () => {
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 2500)
  }

  const filteredAlerts = alerts.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false
    return true
  })

  const newCount = alerts.filter(a => a.status === 'new').length
  const assignedCount = alerts.filter(a => a.status === 'assigned').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length
  const criticalCount = alerts.filter(a => a.priority === 'critical' && a.status !== 'resolved').length
  const avgConfidence = Math.round(alerts.reduce((s, a) => s + a.confidence, 0) / alerts.length)
  const avgResponseTime = WAITERS_PERF.reduce((s, w) => s + w.avgResponseTime, 0) / WAITERS_PERF.length

  // Analytics data
  const alertsByType = Object.entries(ALERT_CONFIG).map(([type, cfg]) => ({
    type: type as AlertType,
    label: cfg.label,
    color: cfg.color,
    count: alerts.filter(a => a.type === type as AlertType).length,
    emoji: cfg.emoji,
  })).sort((a, b) => b.count - a.count)

  const hourlyData = [
    { hour: '18:00', alerts: 3 }, { hour: '19:00', alerts: 7 }, { hour: '20:00', alerts: 12 },
    { hour: '21:00', alerts: 18 }, { hour: '22:00', alerts: 9 }, { hour: '23:00', alerts: 4 },
  ]
  const maxHourly = Math.max(...hourlyData.map(d => d.alerts))

  return (
    <div className="space-y-6">
      {/* CSS for scan animation */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes flash-border {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 0 2px rgba(96,165,250,0.6), 0 0 20px rgba(96,165,250,0.2); }
        }
      `}</style>

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(37,99,235,0.06) 50%, rgba(59,130,246,0.04) 100%)',
          border: `1px solid ${newAlertFlash ? 'rgba(96,165,250,0.5)' : 'rgba(96,165,250,0.2)'}`,
          transition: 'border-color 0.3s ease',
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)', boxShadow: '0 0 30px rgba(96,165,250,0.4)' }}>
            <ScanEye size={26} className="text-white" />
            {isMonitoring && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: '#10b981' }}>
                <div className="w-4 h-4 rounded-full animate-ping absolute" style={{ background: '#10b981', opacity: 0.4 }} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroEye</h2>
              <span className="badge badge-primary text-xs">AI</span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                Visión por computadora
              </span>
            </div>
            <p className="text-sm text-gastro-subtle">
              {CAMERAS.filter(c => c.status === 'online').length} cámaras activas · Reconocimiento de patrones en tiempo real · Modelo v2.4
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #1A2540', color: soundEnabled ? '#2563EB' : '#6666aa' }}>
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button onClick={() => setIsMonitoring(!isMonitoring)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isMonitoring ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${isMonitoring ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: isMonitoring ? '#10b981' : '#ef4444',
              }}>
              {isMonitoring ? <><Activity size={14} /> Monitoreando</> : <><Pause size={14} /> Pausado</>}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Alertas nuevas', value: newCount, color: '#ef4444', icon: Bell, urgent: newCount > 0 },
          { label: 'Asignadas', value: assignedCount, color: '#f59e0b', icon: BadgeCheck, urgent: false },
          { label: 'Resueltas hoy', value: resolvedCount, color: '#10b981', icon: CheckCircle, urgent: false },
          { label: 'Críticas activas', value: criticalCount, color: '#ef4444', icon: AlertTriangle, urgent: criticalCount > 0 },
          { label: 'Confianza IA', value: `${avgConfidence}%`, color: '#2563EB', icon: Brain, urgent: false },
          { label: 'T. respuesta', value: `${avgResponseTime.toFixed(1)}m`, color: '#3B82F6', icon: Clock, urgent: false },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card relative overflow-hidden"
              style={{ border: stat.urgent ? `1px solid ${stat.color}44` : undefined }}>
              {stat.urgent && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}08, transparent 70%)` }} />
              )}
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18` }}>
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle leading-tight">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'live', label: 'Alertas en vivo', count: newCount },
          { id: 'cameras', label: 'Cámaras', count: CAMERAS.filter(c => c.status === 'online').length },
          { id: 'analytics', label: 'Analítica', count: null },
          { id: 'config', label: 'Configuración', count: null },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)', color: '#60A5FA' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
                style={{ background: activeTab === tab.id ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.08)', color: activeTab === tab.id ? '#60A5FA' : '#8899BB' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LIVE ALERTS TAB ── */}
      {activeTab === 'live' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alert feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#8899BB' }}>
                <Filter size={12} /> Filtrar:
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'new', 'assigned', 'resolved'] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={filterStatus === s
                      ? { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)', color: '#60A5FA' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                    {s === 'all' ? 'Todas' : s === 'new' ? 'Nuevas' : s === 'assigned' ? 'Asignadas' : 'Resueltas'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap ml-auto">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={filterPriority === p
                      ? { background: p === 'all' ? 'rgba(255,255,255,0.1)' : `${PRIORITY_CONFIG[p as AlertPriority]?.bg ?? 'rgba(255,255,255,0.1)'}`, color: p === 'all' ? '#fff' : PRIORITY_CONFIG[p as AlertPriority]?.color ?? '#fff', border: '1px solid rgba(255,255,255,0.2)' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                    {p === 'all' ? 'Todas' : PRIORITY_CONFIG[p as AlertPriority]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert list */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="card-gastro text-center py-16">
                  <Eye size={32} className="mx-auto mb-3" style={{ color: '#4A5A7A' }} />
                  <p className="text-gastro-subtle">No hay alertas con los filtros seleccionados</p>
                </div>
              ) : filteredAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert}
                  onAssign={handleAssign} onResolve={handleResolve} onDismiss={handleDismiss} />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Live feed preview */}
            <div className="card-gastro">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gastro-text text-sm flex items-center gap-2">
                  <Camera size={14} style={{ color: '#60A5FA' }} /> Feed en vivo
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-semibold text-success">Live</span>
                </div>
              </div>
              {selectedCamera ? (() => {
                const cam = CAMERAS.find(c => c.id === selectedCamera)
                if (!cam) return null
                return (
                  <div>
                    <div className="relative rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '16/9' }}>
                      <img src={cam.thumbnail} alt={cam.name} className="w-full h-full object-cover"
                        style={{ filter: cam.status === 'offline' ? 'grayscale(1) brightness(0.3)' : 'brightness(0.75)' }} />
                      {cam.status !== 'offline' && (
                        <>
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)',
                            backgroundSize: '25% 25%',
                          }} />
                          <ScanLine />
                          {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
                            ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, border], i) => (
                            <div key={i} className={`absolute ${pos} w-5 h-5 ${border}`}
                              style={{ borderColor: '#60A5FA', opacity: 0.8 }} />
                          ))}
                          {/* Detection boxes simulation */}
                          <div className="absolute" style={{ top: '30%', left: '20%', width: '25%', height: '35%', border: '1.5px solid #3B82F6', borderRadius: 4 }}>
                            <div className="absolute -top-4 left-0 text-xs font-bold px-1 rounded"
                              style={{ background: 'rgba(59,130,246,0.8)', color: '#fff', fontSize: '8px', whiteSpace: 'nowrap' }}>
                              🥤 Vaso vacío 94%
                            </div>
                          </div>
                          <div className="absolute" style={{ top: '20%', right: '15%', width: '20%', height: '45%', border: '1.5px solid #ef4444', borderRadius: 4 }}>
                            <div className="absolute -top-4 left-0 text-xs font-bold px-1 rounded"
                              style={{ background: 'rgba(239,68,68,0.8)', color: '#fff', fontSize: '8px', whiteSpace: 'nowrap' }}>
                              ✋ Mano 97%
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-2 left-2 text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '10px' }}>
                        {cam.name}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                        <div className="text-gastro-subtle mb-0.5">Zona</div>
                        <div className="font-bold text-gastro-text">{cam.zone}</div>
                      </div>
                      <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                        <div className="text-gastro-subtle mb-0.5">Alertas hoy</div>
                        <div className="font-bold" style={{ color: '#60A5FA' }}>{cam.alertsToday}</div>
                      </div>
                    </div>
                  </div>
                )
              })() : (
                <div className="text-center py-8 text-gastro-subtle text-xs">
                  Seleccioná una cámara para ver el feed
                </div>
              )}
            </div>

            {/* Waiter performance */}
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text text-sm mb-3 flex items-center gap-2">
                <Users size={14} style={{ color: '#2563EB' }} /> Mozos en turno
              </h3>
              <div className="space-y-3">
                {WAITERS_PERF.map(w => (
                  <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: `${w.color}0a`, border: `1px solid ${w.color}22` }}>
                    <span className="text-xl">{w.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gastro-text">{w.name}</span>
                        <span className="text-xs font-bold" style={{ color: w.color }}>★ {w.rating}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: '#8899BB' }}>
                        <span><Clock size={9} className="inline mr-0.5" />{w.avgResponseTime}m</span>
                        <span><CheckCircle size={9} className="inline mr-0.5" />{w.alertsResolved}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="w-2 h-2 rounded-full bg-success" style={{ boxShadow: '0 0 4px #10b981' }} />
                      <span className="text-xs text-success">Activo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection types legend */}
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text text-sm mb-3 flex items-center gap-2">
                <Brain size={14} style={{ color: '#60A5FA' }} /> Patrones detectados
              </h3>
              <div className="space-y-2">
                {Object.entries(ALERT_CONFIG).map(([type, cfg]) => {
                  const Icon = cfg.icon
                  const count = alerts.filter(a => a.type === type as AlertType).length
                  return (
                    <div key={type} className="flex items-center gap-2.5 p-2 rounded-xl"
                      style={{ background: cfg.bg }}>
                      <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                      <span className="text-xs font-semibold text-gastro-text flex-1">{cfg.label}</span>
                      <span className="text-xs font-black" style={{ color: cfg.color }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CAMERAS TAB ── */}
      {activeTab === 'cameras' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'En línea', count: CAMERAS.filter(c => c.status === 'online').length, color: '#10b981' },
              { label: 'Procesando', count: CAMERAS.filter(c => c.status === 'processing').length, color: '#f59e0b' },
              { label: 'Sin señal', count: CAMERAS.filter(c => c.status === 'offline').length, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color }}>
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.count} {s.label}
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMERAS.map(cam => (
              <CameraCard key={cam.id} cam={cam}
                isSelected={selectedCamera === cam.id}
                onClick={() => { setSelectedCamera(cam.id); setActiveTab('live') }} />
            ))}
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Tiempo promedio de respuesta', value: `${avgResponseTime.toFixed(1)} min`, sub: '↓ 0.4 min vs ayer', color: '#10b981', icon: Clock },
              { label: 'Alertas resueltas hoy', value: `${resolvedCount}/${alerts.length}`, sub: `${Math.round(resolvedCount / alerts.length * 100)}% tasa de resolución`, color: '#2563EB', icon: CheckCircle },
              { label: 'Confianza promedio IA', value: `${avgConfidence}%`, sub: 'Modelo v2.4 · 6 cámaras', color: '#60A5FA', icon: Brain },
            ].map(kpi => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className="card-gastro">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${kpi.color}18` }}>
                      <Icon size={18} style={{ color: kpi.color }} />
                    </div>
                    <div className="text-xs text-gastro-subtle">{kpi.label}</div>
                  </div>
                  <div className="text-2xl font-black text-gastro-text mb-1">{kpi.value}</div>
                  <div className="text-xs font-semibold" style={{ color: kpi.color }}>{kpi.sub}</div>
                </div>
              )
            })}
          </div>

          {/* Hourly chart + type breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hourly bar chart */}
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-1">Alertas por hora</h3>
              <p className="text-xs text-gastro-subtle mb-4">Distribución de eventos detectados durante el servicio</p>
              <div className="flex items-end gap-2 h-32">
                {hourlyData.map(d => (
                  <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold" style={{ color: '#60A5FA' }}>{d.alerts}</div>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(d.alerts / maxHourly) * 100}px`,
                        background: `linear-gradient(180deg, #60A5FA, rgba(96,165,250,0.3))`,
                        minHeight: 4,
                      }} />
                    <div className="text-xs" style={{ color: '#6666aa', fontSize: '10px' }}>{d.hour}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert type breakdown */}
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-1">Tipos de alerta</h3>
              <p className="text-xs text-gastro-subtle mb-4">Distribución por categoría de evento detectado</p>
              <div className="space-y-3">
                {alertsByType.filter(a => a.count > 0).map(a => (
                  <div key={a.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gastro-text">{a.emoji} {a.label}</span>
                      <span className="text-xs font-black" style={{ color: a.color }}>{a.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(a.count / alerts.length) * 100}%`, background: a.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Waiter performance table */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
              <TrendingUp size={15} style={{ color: '#2563EB' }} /> Performance de mozos — Respuesta a alertas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1A2540' }}>
                    {['Mozo', 'Alertas resueltas', 'T. respuesta prom.', 'Rating', 'Eficiencia'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold" style={{ color: '#8899BB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WAITERS_PERF.map(w => {
                    const efficiency = Math.round((w.alertsResolved / (w.avgResponseTime * 10)) * 100)
                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid #152035' }}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{w.emoji}</span>
                            <span className="font-bold text-gastro-text">{w.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-bold" style={{ color: '#10b981' }}>{w.alertsResolved}</td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold" style={{ color: w.avgResponseTime < 2 ? '#10b981' : w.avgResponseTime < 2.5 ? '#f59e0b' : '#ef4444' }}>
                            {w.avgResponseTime} min
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold" style={{ color: '#f59e0b' }}>★ {w.rating}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', minWidth: 60 }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(efficiency, 100)}%`, background: w.color }} />
                            </div>
                            <span className="font-bold" style={{ color: w.color }}>{Math.min(efficiency, 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI model info */}
          <div className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.06), rgba(37,99,235,0.04))', border: '1px solid rgba(96,165,250,0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)' }}>
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-gastro-text">Modelo GastroBrain Vision v2.4</div>
                <div className="text-xs text-gastro-subtle">Entrenado con 2.4M imágenes de entornos gastronómicos</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Detección de vasos/platos', accuracy: 96, color: '#3B82F6' },
                { label: 'Reconocimiento de gestos', accuracy: 94, color: '#ef4444' },
                { label: 'Análisis de tiempo de espera', accuracy: 91, color: '#f59e0b' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gastro-subtle">{m.label}</span>
                    <span className="text-xs font-black" style={{ color: m.color }}>{m.accuracy}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${m.accuracy}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-gastro-text flex items-center gap-2">
                <Settings size={16} style={{ color: '#2563EB' }} />
                Parametrización del sistema
              </h3>
              <p className="text-xs text-gastro-subtle mt-1">
                Configurá detecciones, umbrales, asignación de mozos y canales de notificación
              </p>
            </div>
            <button onClick={handleSaveConfig}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: configSaved ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                border: `1px solid ${configSaved ? 'rgba(16,185,129,0.35)' : 'rgba(37,99,235,0.35)'}`,
                color: configSaved ? '#10b981' : '#2563EB',
              }}>
              {configSaved ? <><CheckCircle size={14} /> Guardado</> : <><Save size={14} /> Guardar cambios</>}
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Detection types */}
            <div className="card-gastro">
              <h4 className="font-bold text-gastro-text text-sm mb-1 flex items-center gap-2">
                <Brain size={14} style={{ color: '#60A5FA' }} /> Tipos de detección
              </h4>
              <p className="text-xs text-gastro-subtle mb-4">Activá o desactivá cada patrón que GastroEye analiza en las cámaras</p>
              <div className="space-y-2">
                {Object.entries(ALERT_CONFIG).map(([type, cfg]) => {
                  const Icon = cfg.icon
                  const enabled = config.detectionTypes[type as AlertType]
                  return (
                    <div key={type} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{ background: enabled ? cfg.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${enabled ? cfg.color + '33' : '#1A2540'}` }}>
                      <Icon size={16} style={{ color: enabled ? cfg.color : '#4A5A7A', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gastro-text">{cfg.emoji} {cfg.label}</div>
                        <div className="text-xs text-gastro-subtle">
                          {type === 'raised_hand' && 'Detecta clientes buscando atención'}
                          {type === 'empty_glass' && 'Identifica vasos y copas vacías'}
                          {type === 'empty_plate' && 'Detecta platos listos para retirar'}
                          {type === 'long_wait' && 'Alerta mesas sin atención prolongada'}
                          {type === 'spill' && 'Identifica derrames en mesas'}
                          {type === 'table_ready' && 'Detecta mesas libres y limpias'}
                        </div>
                      </div>
                      <ToggleSwitch enabled={enabled} onChange={() => toggleDetectionType(type as AlertType)} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Thresholds */}
            <div className="card-gastro space-y-5">
              <div>
                <h4 className="font-bold text-gastro-text text-sm mb-1 flex items-center gap-2">
                  <Sliders size={14} style={{ color: '#2563EB' }} /> Umbrales de detección
                </h4>
                <p className="text-xs text-gastro-subtle mb-4">Ajustá la sensibilidad del modelo de visión por computadora</p>
              </div>
              <ConfigSlider label="Confianza mínima IA" value={config.minConfidence} min={70} max={99} unit="%"
                onChange={v => updateConfig('minConfidence', v)}
                hint="Solo se generan alertas por encima de este umbral de confianza" />
              <ConfigSlider label="Mano levantada — tiempo" value={config.handRaiseSeconds} min={3} max={15} unit="s"
                onChange={v => updateConfig('handRaiseSeconds', v)}
                hint="Segundos que el cliente debe mantener la mano levantada antes de alertar" />
              <ConfigSlider label="Espera prolongada" value={config.longWaitMinutes} min={5} max={20} unit=" min"
                onChange={v => updateConfig('longWaitMinutes', v)}
                hint="Minutos sin atención antes de generar alerta de espera" />
              <ConfigSlider label="Cooldown entre alertas" value={config.cooldownSeconds} min={10} max={120} unit="s"
                onChange={v => updateConfig('cooldownSeconds', v)}
                hint="Evita alertas duplicadas para la misma mesa en poco tiempo" />
            </div>

            {/* Waiter assignment */}
            <div className="card-gastro space-y-4">
              <div>
                <h4 className="font-bold text-gastro-text text-sm mb-1 flex items-center gap-2">
                  <Users size={14} style={{ color: '#3B82F6' }} /> Asignación inteligente de mozos
                </h4>
                <p className="text-xs text-gastro-subtle mb-2">
                  GastroEye asigna automáticamente al mozo más cercano o reasigna si está lejos
                </p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <div>
                  <div className="text-xs font-bold text-gastro-text">Asignación automática</div>
                  <div className="text-xs text-gastro-subtle">Enviar alerta al mozo más cercano a la mesa</div>
                </div>
                <ToggleSwitch enabled={config.autoAssign} onChange={v => updateConfig('autoAssign', v)} />
              </div>
              <ConfigSlider label="Distancia máxima de asignación" value={config.maxAssignDistance} min={5} max={30} unit=" m"
                onChange={v => updateConfig('maxAssignDistance', v)}
                hint="Radio máximo para asignar un mozo a una alerta" />
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                <div>
                  <div className="text-xs font-bold text-gastro-text">Reasignar si mozo lejos</div>
                  <div className="text-xs text-gastro-subtle">Si el mozo asignado supera la distancia, buscar otro disponible</div>
                </div>
                <ToggleSwitch enabled={config.reassignIfFar} onChange={v => updateConfig('reassignIfFar', v)} />
              </div>
            </div>

            {/* Notifications */}
            <div className="card-gastro space-y-3">
              <div className="mb-2">
                <h4 className="font-bold text-gastro-text text-sm mb-1 flex items-center gap-2">
                  <Bell size={14} style={{ color: '#f59e0b' }} /> Canales de notificación
                </h4>
                <p className="text-xs text-gastro-subtle">Definí cómo se avisa al equipo cuando GastroEye detecta un evento</p>
              </div>
              {[
                { key: 'notifyPush' as const, label: 'Push a dispositivos', desc: 'Notificación instantánea al celular del mozo', icon: Bell },
                { key: 'notifySound' as const, label: 'Alerta sonora', desc: 'Sonido en el local para alertas críticas', icon: Volume2 },
                { key: 'notifyKds' as const, label: 'Integración KDS', desc: 'Mostrar alertas en pantalla de cocina/salón', icon: Activity },
                { key: 'notifyWhatsapp' as const, label: 'WhatsApp al encargado', desc: 'Mensaje al supervisor para alertas críticas', icon: Radio },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="flex items-center gap-3">
                      <Icon size={14} style={{ color: config[item.key] ? '#2563EB' : '#4A5A7A' }} />
                      <div>
                        <div className="text-xs font-bold text-gastro-text">{item.label}</div>
                        <div className="text-xs text-gastro-subtle">{item.desc}</div>
                      </div>
                    </div>
                    <ToggleSwitch enabled={config[item.key]} onChange={v => updateConfig(item.key, v)} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Camera zone mapping + schedule + privacy */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card-gastro lg:col-span-2">
              <h4 className="font-bold text-gastro-text text-sm mb-1 flex items-center gap-2">
                <Camera size={14} style={{ color: '#60A5FA' }} /> Mapeo cámaras — mesas
              </h4>
              <p className="text-xs text-gastro-subtle mb-4">Asociá cada cámara con las mesas que monitorea</p>
              <div className="space-y-2">
                {CAMERAS.map(cam => (
                  <div key={cam.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={cam.thumbnail} alt={cam.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gastro-text">{cam.name}</div>
                      <div className="text-xs text-gastro-subtle">{cam.zone}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                      {cam.tables.length > 0
                        ? cam.tables.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>{t}</span>
                        ))
                        : <span className="text-xs text-gastro-subtle">Sin mesas</span>}
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: cam.status === 'online' ? '#10b981' : cam.status === 'processing' ? '#f59e0b' : '#ef4444' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card-gastro space-y-4">
                <h4 className="font-bold text-gastro-text text-sm flex items-center gap-2">
                  <Clock size={14} style={{ color: '#2563EB' }} /> Horario activo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gastro-subtle block mb-1">Desde</label>
                    <input type="time" value={config.activeHoursStart}
                      onChange={e => updateConfig('activeHoursStart', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2540', color: '#E8F0FF' }} />
                  </div>
                  <div>
                    <label className="text-xs text-gastro-subtle block mb-1">Hasta</label>
                    <input type="time" value={config.activeHoursEnd}
                      onChange={e => updateConfig('activeHoursEnd', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2540', color: '#E8F0FF' }} />
                  </div>
                </div>
              </div>

              <div className="card-gastro space-y-3">
                <h4 className="font-bold text-gastro-text text-sm flex items-center gap-2">
                  <Shield size={14} style={{ color: '#60A5FA' }} /> Privacidad
                </h4>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div>
                    <div className="text-xs font-bold text-gastro-text">Desenfoque de rostros</div>
                    <div className="text-xs text-gastro-subtle">Oculta rostros en feeds y grabaciones</div>
                  </div>
                  <ToggleSwitch enabled={config.privacyBlur} onChange={v => updateConfig('privacyBlur', v)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div>
                    <div className="text-xs font-bold text-gastro-text">Grabar clips de alerta</div>
                    <div className="text-xs text-gastro-subtle">Guarda 10s de video por cada detección</div>
                  </div>
                  <ToggleSwitch enabled={config.recordClips} onChange={v => updateConfig('recordClips', v)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
