import { useState, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays, Clock, Users, Plus, Search, Phone, Mail,
  MapPin, CheckCircle, XCircle, ChevronRight, Star,
  UserCheck, UserX, Bell, Settings, BarChart3,
  List, Hourglass, Globe, Smartphone, Building2, Sparkles, Save, ToggleLeft, ToggleRight,
  Utensils,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReservationStatus = 'confirmed' | 'pending' | 'seated' | 'completed' | 'no_show' | 'cancelled'
type ReservationSource = 'web' | 'phone' | 'app' | 'walk_in' | 'google' | 'instagram'
type ReservationOccasion = 'regular' | 'birthday' | 'anniversary' | 'business' | 'date'

interface Reservation {
  id: string
  guestName: string
  guestPhone: string
  guestEmail: string
  date: string
  time: string
  guests: number
  status: ReservationStatus
  table?: string
  zone: string
  source: ReservationSource
  occasion: ReservationOccasion
  notes: string
  specialRequests: string[]
  vip: boolean
  deposit?: number
  createdAt: string
  confirmedAt?: string
  seatedAt?: string
}

interface WaitlistEntry {
  id: string
  guestName: string
  guestPhone: string
  guests: number
  requestedTime: string
  waitMinutes: number
  priority: 'normal' | 'vip'
  notes: string
}

interface ReserveConfig {
  slotDuration: number
  maxAdvanceDays: number
  minAdvanceHours: number
  maxPartySize: number
  autoConfirm: boolean
  requireDeposit: boolean
  depositAmount: number
  noShowGraceMinutes: number
  sendReminder: boolean
  reminderHours: number
  allowWaitlist: boolean
  maxWaitlistSize: number
  openingTime: string
  closingTime: string
  lunchStart: string
  lunchEnd: string
  dinnerStart: string
  dinnerEnd: string
  closedDays: number[]
  channels: Record<ReservationSource, boolean>
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TODAY = '2025-07-17'

const RESERVATIONS: Reservation[] = [
  {
    id: 'RSV-001', guestName: 'Carlos García', guestPhone: '+54 11 4444-1111', guestEmail: 'carlos@email.com',
    date: TODAY, time: '12:30', guests: 4, status: 'completed', table: 'Mesa 4', zone: 'Salón',
    source: 'web', occasion: 'business', notes: 'Reunión de negocios', specialRequests: ['Mesa tranquila'], vip: false,
    createdAt: '2025-07-15T10:00:00', confirmedAt: '2025-07-15T10:05:00', seatedAt: '2025-07-17T12:28:00',
  },
  {
    id: 'RSV-002', guestName: 'María López', guestPhone: '+54 11 5555-2222', guestEmail: 'maria@email.com',
    date: TODAY, time: '13:00', guests: 2, status: 'seated', table: 'Mesa 7', zone: 'Terraza',
    source: 'app', occasion: 'date', notes: '', specialRequests: ['Mesa con vista'], vip: false,
    createdAt: '2025-07-16T14:00:00', confirmedAt: '2025-07-16T14:01:00', seatedAt: '2025-07-17T12:58:00',
  },
  {
    id: 'RSV-003', guestName: 'Roberto Martínez', guestPhone: '+54 11 6666-3333', guestEmail: 'roberto@email.com',
    date: TODAY, time: '20:30', guests: 6, status: 'confirmed', table: 'Mesa 4', zone: 'Salón',
    source: 'phone', occasion: 'birthday', notes: 'Cumpleaños — traerán torta', specialRequests: ['Silla alta bebé', 'Decoración sencilla'], vip: true,
    deposit: 15000, createdAt: '2025-07-14T09:00:00', confirmedAt: '2025-07-14T09:30:00',
  },
  {
    id: 'RSV-004', guestName: 'Ana Fernández', guestPhone: '+54 11 7777-4444', guestEmail: 'ana@email.com',
    date: TODAY, time: '21:00', guests: 8, status: 'confirmed', table: 'Mesa 8', zone: 'VIP',
    source: 'google', occasion: 'anniversary', notes: 'Aniversario de bodas — 10 años', specialRequests: ['Champagne de bienvenida', 'Mesa VIP'], vip: true,
    deposit: 25000, createdAt: '2025-07-10T16:00:00', confirmedAt: '2025-07-10T16:05:00',
  },
  {
    id: 'RSV-005', guestName: 'Diego Torres', guestPhone: '+54 11 8888-5555', guestEmail: 'diego@email.com',
    date: TODAY, time: '20:00', guests: 3, status: 'pending', zone: 'Salón',
    source: 'web', occasion: 'regular', notes: 'Primera visita', specialRequests: [], vip: false,
    createdAt: '2025-07-17T08:00:00',
  },
  {
    id: 'RSV-006', guestName: 'Laura Méndez', guestPhone: '+54 11 9999-6666', guestEmail: 'laura@email.com',
    date: TODAY, time: '19:30', guests: 2, status: 'confirmed', table: 'Mesa 5', zone: 'Salón',
    source: 'instagram', occasion: 'regular', notes: '', specialRequests: ['Menú sin gluten'], vip: false,
    createdAt: '2025-07-16T20:00:00', confirmedAt: '2025-07-16T20:02:00',
  },
  {
    id: 'RSV-007', guestName: 'Pablo Ruiz', guestPhone: '+54 11 1111-7777', guestEmail: 'pablo@email.com',
    date: TODAY, time: '21:30', guests: 4, status: 'confirmed', table: 'Mesa 12', zone: 'Salón',
    source: 'app', occasion: 'regular', notes: '', specialRequests: [], vip: false,
    createdAt: '2025-07-15T11:00:00', confirmedAt: '2025-07-15T11:01:00',
  },
  {
    id: 'RSV-008', guestName: 'Valentina Gómez', guestPhone: '+54 11 2222-8888', guestEmail: 'vale@email.com',
    date: '2025-07-18', time: '20:30', guests: 5, status: 'confirmed', table: 'Mesa 3', zone: 'Salón',
    source: 'web', occasion: 'regular', notes: '', specialRequests: ['Accesibilidad silla de ruedas'], vip: false,
    createdAt: '2025-07-16T12:00:00', confirmedAt: '2025-07-16T12:05:00',
  },
  {
    id: 'RSV-009', guestName: 'Jorge Silva', guestPhone: '+54 11 3333-9999', guestEmail: 'jorge@email.com',
    date: '2025-07-16', time: '20:00', guests: 2, status: 'no_show', table: 'Mesa 9', zone: 'Barra',
    source: 'phone', occasion: 'regular', notes: 'No se presentó', specialRequests: [], vip: false,
    createdAt: '2025-07-14T18:00:00', confirmedAt: '2025-07-14T18:05:00',
  },
  {
    id: 'RSV-010', guestName: 'Camila Díaz', guestPhone: '+54 11 4444-0000', guestEmail: 'camila@email.com',
    date: TODAY, time: '22:00', guests: 2, status: 'cancelled', zone: 'Terraza',
    source: 'web', occasion: 'date', notes: 'Canceló por enfermedad', specialRequests: [], vip: false,
    createdAt: '2025-07-15T19:00:00', confirmedAt: '2025-07-15T19:02:00',
  },
]

const WAITLIST: WaitlistEntry[] = [
  { id: 'WL-001', guestName: 'Martín Acosta', guestPhone: '+54 11 5555-0000', guests: 2, requestedTime: '20:30', waitMinutes: 25, priority: 'normal', notes: 'Prefiere terraza' },
  { id: 'WL-002', guestName: 'Sofía Herrera', guestPhone: '+54 11 6666-0000', guests: 4, requestedTime: '21:00', waitMinutes: 12, priority: 'vip', notes: 'Cliente frecuente — 12 visitas' },
  { id: 'WL-003', guestName: 'Lucas Vega', guestPhone: '+54 11 7777-0000', guests: 3, requestedTime: '20:00', waitMinutes: 40, priority: 'normal', notes: '' },
]

const HOURLY_DATA = [
  { hour: '12:00', reservas: 8, capacidad: 45 },
  { hour: '13:00', reservas: 12, capacidad: 45 },
  { hour: '14:00', reservas: 6, capacidad: 45 },
  { hour: '19:00', reservas: 4, capacidad: 50 },
  { hour: '20:00', reservas: 18, capacidad: 50 },
  { hour: '21:00', reservas: 22, capacidad: 50 },
  { hour: '22:00', reservas: 14, capacidad: 50 },
  { hour: '23:00', reservas: 6, capacidad: 50 },
]

const WEEKLY_DATA = [
  { day: 'Lun', reservas: 42, noShow: 3 },
  { day: 'Mar', reservas: 38, noShow: 2 },
  { day: 'Mié', reservas: 45, noShow: 4 },
  { day: 'Jue', reservas: 52, noShow: 2 },
  { day: 'Vie', reservas: 78, noShow: 5 },
  { day: 'Sáb', reservas: 92, noShow: 6 },
  { day: 'Dom', reservas: 68, noShow: 4 },
]

const SOURCE_DATA = [
  { name: 'Web propia', value: 35, color: '#2563EB' },
  { name: 'App GastroGo', value: 22, color: '#3B82F6' },
  { name: 'Teléfono', value: 18, color: '#60A5FA' },
  { name: 'Google', value: 15, color: '#10b981' },
  { name: 'Instagram', value: 10, color: '#f59e0b' },
]

const STATUS_CFG: Record<ReservationStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  confirmed:  { label: 'Confirmada',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle },
  pending:    { label: 'Pendiente',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  seated:     { label: 'Sentados',    color: '#2563EB', bg: 'rgba(37,99,235,0.12)',   icon: UserCheck },
  completed:  { label: 'Completada',  color: '#8899BB', bg: 'rgba(136,136,170,0.1)',  icon: CheckCircle },
  no_show:    { label: 'No show',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    icon: UserX },
  cancelled:  { label: 'Cancelada',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    icon: XCircle },
}

const SOURCE_CFG: Record<ReservationSource, { label: string; icon: LucideIcon; color: string }> = {
  web:       { label: 'Web',       icon: Globe,      color: '#2563EB' },
  phone:     { label: 'Teléfono',  icon: Phone,      color: '#3B82F6' },
  app:       { label: 'App',       icon: Smartphone, color: '#60A5FA' },
  walk_in:   { label: 'Walk-in',   icon: Building2,  color: '#8899BB' },
  google:    { label: 'Google',    icon: Search,     color: '#10b981' },
  instagram: { label: 'Instagram', icon: Sparkles,   color: '#f59e0b' },
}

const OCCASION_CFG: Record<ReservationOccasion, { label: string; emoji: string }> = {
  regular:     { label: 'Regular',      emoji: '🍽️' },
  birthday:    { label: 'Cumpleaños',   emoji: '🎂' },
  anniversary: { label: 'Aniversario',  emoji: '💍' },
  business:    { label: 'Negocios',     emoji: '💼' },
  date:        { label: 'Cita romántica', emoji: '❤️' },
}

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00']

const DEFAULT_CONFIG: ReserveConfig = {
  slotDuration: 90,
  maxAdvanceDays: 60,
  minAdvanceHours: 2,
  maxPartySize: 12,
  autoConfirm: true,
  requireDeposit: false,
  depositAmount: 10000,
  noShowGraceMinutes: 15,
  sendReminder: true,
  reminderHours: 24,
  allowWaitlist: true,
  maxWaitlistSize: 20,
  openingTime: '12:00',
  closingTime: '00:00',
  lunchStart: '12:00',
  lunchEnd: '15:00',
  dinnerStart: '19:00',
  dinnerEnd: '00:00',
  closedDays: [1],
  channels: { web: true, phone: true, app: true, walk_in: true, google: true, instagram: true },
}

const ZONES = ['Salón', 'Terraza', 'VIP', 'Barra']

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex-shrink-0">
      {checked
        ? <ToggleRight size={28} style={{ color: '#2563EB' }} />
        : <ToggleLeft size={28} style={{ color: '#8899BB' }} />}
    </button>
  )
}

function ConfigSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gastro-text">{label}</span>
        <span className="text-sm font-bold" style={{ color: '#2563EB' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #2563EB ${((value - min) / (max - min)) * 100}%, #152035 ${((value - min) / (max - min)) * 100}%)` }}
      />
    </div>
  )
}

function ReservationCard({ reservation, onSelect, compact }: {
  reservation: Reservation; onSelect: (r: Reservation) => void; compact?: boolean
}) {
  const st = STATUS_CFG[reservation.status]
  const src = SOURCE_CFG[reservation.source]
  const occ = OCCASION_CFG[reservation.occasion]
  const StatusIcon = st.icon
  const SourceIcon = src.icon

  return (
    <button type="button" onClick={() => onSelect(reservation)}
      className="w-full text-left rounded-xl p-4 transition-all hover:scale-[1.005]"
      style={{ background: '#0D1526', border: `1px solid ${st.color}22` }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: st.bg }}>
          {occ.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-gastro-text">{reservation.guestName}</span>
            {reservation.vip && (
              <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>VIP</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
              style={{ background: st.bg, color: st.color }}>
              <StatusIcon size={10} /> {st.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gastro-subtle flex-wrap">
            <span className="flex items-center gap-1"><Clock size={11} /> {reservation.time}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {reservation.guests} pax</span>
            {reservation.table && <span className="flex items-center gap-1"><MapPin size={11} /> {reservation.table}</span>}
            <span className="flex items-center gap-1"><SourceIcon size={11} style={{ color: src.color }} /> {src.label}</span>
          </div>
          {!compact && reservation.notes && (
            <p className="text-xs text-gastro-muted mt-1.5 truncate">{reservation.notes}</p>
          )}
          {!compact && reservation.specialRequests.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {reservation.specialRequests.map(req => (
                <span key={req} className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(37,99,235,0.1)', color: '#60A5FA' }}>{req}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-gastro-muted flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}

function TimelineView({ reservations, onSelect }: { reservations: Reservation[]; onSelect: (r: Reservation) => void }) {
  const slots = TIME_SLOTS.map(slot => ({
    time: slot,
    reservations: reservations.filter(r => r.time === slot && r.status !== 'cancelled'),
  }))

  return (
    <div className="space-y-1">
      {slots.map(({ time, reservations: slotRes }) => {
        const totalGuests = slotRes.reduce((s, r) => s + r.guests, 0)
        const occupancy = Math.min(100, Math.round((totalGuests / 50) * 100))
        return (
          <div key={time} className="flex gap-4 items-start py-2 border-b" style={{ borderColor: '#152035' }}>
            <div className="w-14 flex-shrink-0 text-right">
              <span className="text-sm font-mono font-bold text-gastro-text">{time}</span>
            </div>
            <div className="w-1 flex-shrink-0 relative">
              <div className="w-3 h-3 rounded-full mx-auto -ml-1"
                style={{ background: slotRes.length > 0 ? '#2563EB' : '#152035', border: '2px solid #0D1526' }} />
            </div>
            <div className="flex-1 min-w-0">
              {slotRes.length === 0 ? (
                <span className="text-xs text-gastro-muted">Sin reservas</span>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gastro-subtle">{slotRes.length} reservas · {totalGuests} pax</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#152035', maxWidth: 120 }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${occupancy}%`, background: occupancy > 80 ? '#ef4444' : occupancy > 60 ? '#f59e0b' : '#2563EB' }} />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {slotRes.map(r => (
                      <ReservationCard key={r.id} reservation={r} onSelect={onSelect} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DetailModal({ reservation, onClose, onStatusChange }: {
  reservation: Reservation; onClose: () => void
  onStatusChange: (id: string, status: ReservationStatus) => void
}) {
  const st = STATUS_CFG[reservation.status]
  const src = SOURCE_CFG[reservation.source]
  const occ = OCCASION_CFG[reservation.occasion]
  const SourceIcon = src.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#0D1526', border: '1px solid #152035' }}>
        <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: '#152035' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{occ.emoji}</span>
              <h3 className="text-lg font-bold text-gastro-text">{reservation.guestName}</h3>
              {reservation.vip && <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
            </div>
            <p className="text-xs text-gastro-subtle">{reservation.id} · {occ.label}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gastro-muted hover:text-gastro-text p-1">
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fecha', value: reservation.date, icon: CalendarDays },
              { label: 'Hora', value: reservation.time, icon: Clock },
              { label: 'Comensales', value: `${reservation.guests} pax`, icon: Users },
              { label: 'Zona', value: reservation.zone, icon: MapPin },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: '#0A0F1A' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon size={12} style={{ color: '#60A5FA' }} />
                  <span className="text-xs text-gastro-muted">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gastro-text">{item.value}</span>
              </div>
            ))}
          </div>

          {reservation.table && (
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <Utensils size={16} style={{ color: '#2563EB' }} />
              <span className="text-sm font-semibold text-gastro-text">{reservation.table} — {reservation.zone}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} style={{ color: '#8899BB' }} />
              <span className="text-gastro-text">{reservation.guestPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} style={{ color: '#8899BB' }} />
              <span className="text-gastro-text">{reservation.guestEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SourceIcon size={14} style={{ color: src.color }} />
              <span className="text-gastro-text">Canal: {src.label}</span>
            </div>
          </div>

          {reservation.notes && (
            <div className="rounded-xl p-3" style={{ background: '#0A0F1A' }}>
              <span className="text-xs text-gastro-muted block mb-1">Notas</span>
              <p className="text-sm text-gastro-text">{reservation.notes}</p>
            </div>
          )}

          {reservation.specialRequests.length > 0 && (
            <div>
              <span className="text-xs text-gastro-muted block mb-2">Solicitudes especiales</span>
              <div className="flex flex-wrap gap-1.5">
                {reservation.specialRequests.map(req => (
                  <span key={req} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}>{req}</span>
                ))}
              </div>
            </div>
          )}

          {reservation.deposit && (
            <div className="rounded-xl p-3 flex justify-between items-center" style={{ background: '#0A0F1A' }}>
              <span className="text-sm text-gastro-subtle">Seña abonada</span>
              <span className="text-sm font-bold" style={{ color: '#10b981' }}>${reservation.deposit.toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {reservation.status === 'pending' && (
              <button type="button" onClick={() => onStatusChange(reservation.id, 'confirmed')}
                className="btn-primary flex-1 text-sm py-2.5">Confirmar</button>
            )}
            {reservation.status === 'confirmed' && (
              <button type="button" onClick={() => onStatusChange(reservation.id, 'seated')}
                className="btn-primary flex-1 text-sm py-2.5">Marcar sentados</button>
            )}
            {reservation.status === 'seated' && (
              <button type="button" onClick={() => onStatusChange(reservation.id, 'completed')}
                className="btn-primary flex-1 text-sm py-2.5">Completar</button>
            )}
            {!['cancelled', 'completed', 'no_show'].includes(reservation.status) && (
              <button type="button" onClick={() => onStatusChange(reservation.id, 'cancelled')}
                className="flex-1 text-sm py-2.5 rounded-xl font-semibold transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewReservationModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (data: Partial<Reservation>) => void
}) {
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', guestEmail: '', date: TODAY,
    time: '20:30', guests: 2, zone: 'Salón', source: 'phone' as ReservationSource,
    occasion: 'regular' as ReservationOccasion, notes: '', vip: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.guestName.trim()) return
    onCreate(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: '#0D1526', border: '1px solid #152035' }}>
        <div className="p-5 border-b flex items-center justify-between sticky top-0" style={{ borderColor: '#152035', background: '#0D1526' }}>
          <h3 className="text-lg font-bold text-gastro-text">Nueva reserva</h3>
          <button type="button" onClick={onClose} className="text-gastro-muted hover:text-gastro-text"><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gastro-muted block mb-1">Nombre del cliente *</label>
            <input type="text" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
              className="input w-full" placeholder="Nombre completo" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Teléfono</label>
              <input type="tel" value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                className="input w-full" placeholder="+54 11 ..." />
            </div>
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Email</label>
              <input type="email" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                className="input w-full" placeholder="email@..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input w-full" />
            </div>
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Hora</label>
              <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="input w-full">
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Comensales</label>
              <input type="number" min={1} max={20} value={form.guests}
                onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))}
                className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Zona preferida</label>
              <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                className="input w-full">
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gastro-muted block mb-1">Canal</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as ReservationSource }))}
                className="input w-full">
                {Object.entries(SOURCE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gastro-muted block mb-1">Ocasión</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(OCCASION_CFG).map(([k, v]) => (
                <button key={k} type="button"
                  onClick={() => setForm(f => ({ ...f, occasion: k as ReservationOccasion }))}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background: form.occasion === k ? 'rgba(37,99,235,0.15)' : '#0A0F1A',
                    color: form.occasion === k ? '#2563EB' : '#8899BB',
                    border: `1px solid ${form.occasion === k ? 'rgba(37,99,235,0.3)' : '#152035'}`,
                  }}>
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gastro-muted block mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input w-full resize-none" rows={2} placeholder="Alergias, preferencias, etc." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.vip} onChange={e => setForm(f => ({ ...f, vip: e.target.checked }))}
              className="rounded" />
            <span className="text-sm text-gastro-text">Cliente VIP</span>
          </label>
          <button type="submit" className="btn-primary w-full py-3">Crear reserva</button>
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GastroReserve() {
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS)
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(WAITLIST)
  const [activeTab, setActiveTab] = useState<'today' | 'list' | 'waitlist' | 'analytics' | 'config'>('today')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [config, setConfig] = useState<ReserveConfig>(DEFAULT_CONFIG)
  const [selectedDate, setSelectedDate] = useState(TODAY)

  const todayReservations = useMemo(() =>
    reservations.filter(r => r.date === TODAY && r.status !== 'cancelled'),
    [reservations]
  )

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = !searchQuery ||
        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guestPhone.includes(searchQuery) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const matchDate = r.date === selectedDate
      return matchSearch && matchStatus && matchDate
    })
  }, [reservations, searchQuery, statusFilter, selectedDate])

  const stats = useMemo(() => ({
    today: todayReservations.length,
    confirmed: todayReservations.filter(r => r.status === 'confirmed').length,
    pending: todayReservations.filter(r => r.status === 'pending').length,
    seated: todayReservations.filter(r => r.status === 'seated').length,
    guests: todayReservations.reduce((s, r) => s + r.guests, 0),
    waitlist: waitlist.length,
    noShowRate: Math.round((reservations.filter(r => r.status === 'no_show').length / reservations.length) * 100),
  }), [todayReservations, waitlist, reservations])

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setSelectedReservation(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  const handleCreate = (data: Partial<Reservation>) => {
    const newRes: Reservation = {
      id: `RSV-${String(reservations.length + 1).padStart(3, '0')}`,
      guestName: data.guestName || '',
      guestPhone: data.guestPhone || '',
      guestEmail: data.guestEmail || '',
      date: data.date || TODAY,
      time: data.time || '20:00',
      guests: data.guests || 2,
      status: config.autoConfirm ? 'confirmed' : 'pending',
      zone: data.zone || 'Salón',
      source: data.source || 'phone',
      occasion: data.occasion || 'regular',
      notes: data.notes || '',
      specialRequests: [],
      vip: data.vip || false,
      createdAt: new Date().toISOString(),
      ...(config.autoConfirm ? { confirmedAt: new Date().toISOString() } : {}),
    }
    setReservations(prev => [newRes, ...prev])
  }

  const handleSeatFromWaitlist = (id: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== id))
  }

  const tabs = [
    { id: 'today' as const, label: 'Hoy', icon: CalendarDays },
    { id: 'list' as const, label: 'Listado', icon: List },
    { id: 'waitlist' as const, label: 'Lista de espera', icon: Hourglass, badge: waitlist.length },
    { id: 'analytics' as const, label: 'Analítica', icon: BarChart3 },
    { id: 'config' as const, label: 'Configuración', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gastro-text">GastroReserve</h2>
            <span className="badge badge-primary text-xs">Reservas</span>
          </div>
          <p className="text-sm text-gastro-subtle">
            Gestión de reservas, lista de espera y configuración de disponibilidad
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-sm flex items-center gap-2">
            <Bell size={16} /> Recordatorios
          </button>
          <button type="button" onClick={() => setShowNewModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Nueva reserva
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Reservas hoy', value: stats.today, color: '#2563EB', icon: CalendarDays },
          { label: 'Confirmadas', value: stats.confirmed, color: '#10b981', icon: CheckCircle },
          { label: 'Pendientes', value: stats.pending, color: '#f59e0b', icon: Clock },
          { label: 'Sentados', value: stats.seated, color: '#3B82F6', icon: UserCheck },
          { label: 'Comensales', value: stats.guests, color: '#60A5FA', icon: Users },
          { label: 'En espera', value: stats.waitlist, color: '#f59e0b', icon: Hourglass },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-xs text-gastro-muted">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-gastro-text">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(37,99,235,0.12)' : 'transparent',
              color: activeTab === tab.id ? '#2563EB' : '#8899BB',
              border: `1px solid ${activeTab === tab.id ? 'rgba(37,99,235,0.25)' : 'transparent'}`,
            }}>
            <tab.icon size={15} />
            {tab.label}
            {'badge' in tab && tab.badge! > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TODAY TAB ── */}
      {activeTab === 'today' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gastro-text">Timeline — {TODAY}</h3>
              <span className="text-xs text-gastro-subtle">{stats.guests} comensales esperados</span>
            </div>
            <TimelineView
              reservations={todayReservations}
              onSelect={setSelectedReservation}
            />
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gastro-text mb-4">Próximas llegadas</h3>
              <div className="space-y-2">
                {todayReservations
                  .filter(r => ['confirmed', 'pending'].includes(r.status))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .slice(0, 5)
                  .map(r => (
                    <button key={r.id} type="button" onClick={() => setSelectedReservation(r)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                      style={{ background: '#0A0F1A' }}>
                      <div className="text-center w-12 flex-shrink-0">
                        <div className="text-sm font-bold text-gastro-text">{r.time}</div>
                        <div className="text-xs text-gastro-muted">{r.guests} pax</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gastro-text truncate">{r.guestName}</div>
                        <div className="text-xs text-gastro-subtle">{r.table || r.zone}</div>
                      </div>
                      <ChevronRight size={14} className="text-gastro-muted" />
                    </button>
                  ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gastro-text mb-3">Ocupación por turno</h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={HOURLY_DATA}>
                  <defs>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fill: '#8899BB', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#0D1526', border: '1px solid #152035', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="reservas" stroke="#2563EB" fill="url(#resGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── LIST TAB ── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, teléfono o ID..." className="input w-full pl-10" />
            </div>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="input w-auto" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ReservationStatus | 'all')}
              className="input w-auto">
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReservations.map(r => (
              <ReservationCard key={r.id} reservation={r} onSelect={setSelectedReservation} />
            ))}
          </div>
          {filteredReservations.length === 0 && (
            <div className="text-center py-12 text-gastro-muted">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay reservas para esta fecha</p>
            </div>
          )}
        </div>
      )}

      {/* ── WAITLIST TAB ── */}
      {activeTab === 'waitlist' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {waitlist.map(entry => (
              <div key={entry.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: entry.priority === 'vip' ? 'rgba(245,158,11,0.12)' : 'rgba(37,99,235,0.12)' }}>
                  <Hourglass size={20} style={{ color: entry.priority === 'vip' ? '#f59e0b' : '#2563EB' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-gastro-text">{entry.guestName}</span>
                    {entry.priority === 'vip' && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>VIP</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gastro-subtle">
                    <span>{entry.guests} pax</span>
                    <span>Solicitó: {entry.requestedTime}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {entry.waitMinutes} min esperando
                    </span>
                  </div>
                  {entry.notes && <p className="text-xs text-gastro-muted mt-1">{entry.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button type="button" onClick={() => handleSeatFromWaitlist(entry.id)}
                    className="btn-primary text-xs px-3 py-2">Sentar</button>
                  <button type="button" onClick={() => setWaitlist(prev => prev.filter(w => w.id !== entry.id))}
                    className="text-xs px-3 py-2 rounded-xl font-semibold"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Quitar</button>
                </div>
              </div>
            ))}
            {waitlist.length === 0 && (
              <div className="text-center py-12 text-gastro-muted card">
                <Hourglass size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Lista de espera vacía</p>
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gastro-text mb-4">Configuración de espera</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gastro-text">Lista de espera activa</span>
                <ToggleSwitch checked={config.allowWaitlist} onChange={v => setConfig(c => ({ ...c, allowWaitlist: v }))} />
              </div>
              <ConfigSlider label="Capacidad máxima" value={config.maxWaitlistSize} min={5} max={50} unit=" personas"
                onChange={v => setConfig(c => ({ ...c, maxWaitlistSize: v }))} />
              <div className="rounded-xl p-3" style={{ background: '#0A0F1A' }}>
                <p className="text-xs text-gastro-subtle">
                  Cuando una mesa se libera, el sistema notifica automáticamente al primer cliente en la lista de espera compatible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Reservas / semana', value: '415', change: '+8%', color: '#2563EB' },
              { label: 'Tasa de no-show', value: `${stats.noShowRate}%`, change: '-2%', color: '#ef4444' },
              { label: 'Ticket promedio reserva', value: '$18.450', change: '+5%', color: '#10b981' },
              { label: 'Tiempo medio espera', value: '22 min', change: '-4 min', color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="card p-4">
                <span className="text-xs text-gastro-muted">{kpi.label}</span>
                <div className="text-2xl font-bold text-gastro-text mt-1">{kpi.value}</div>
                <span className="text-xs font-semibold" style={{ color: kpi.color }}>{kpi.change}</span>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gastro-text mb-4">Reservas por día</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WEEKLY_DATA}>
                  <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0D1526', border: '1px solid #152035', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="reservas" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noShow" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gastro-text mb-4">Canales de reserva</h3>
              <div className="space-y-3">
                {SOURCE_DATA.map(src => (
                  <div key={src.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gastro-text">{src.name}</span>
                      <span className="font-bold" style={{ color: src.color }}>{src.value}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#152035' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${src.value}%`, background: src.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5 space-y-5">
            <h3 className="text-sm font-bold text-gastro-text flex items-center gap-2">
              <Clock size={16} style={{ color: '#2563EB' }} /> Disponibilidad y turnos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Apertura', key: 'openingTime' as const },
                { label: 'Cierre', key: 'closingTime' as const },
                { label: 'Almuerzo desde', key: 'lunchStart' as const },
                { label: 'Almuerzo hasta', key: 'lunchEnd' as const },
                { label: 'Cena desde', key: 'dinnerStart' as const },
                { label: 'Cena hasta', key: 'dinnerEnd' as const },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gastro-muted block mb-1">{field.label}</label>
                  <input type="time" value={config[field.key]}
                    onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                    className="input w-full" />
                </div>
              ))}
            </div>
            <ConfigSlider label="Duración de turno" value={config.slotDuration} min={60} max={180} step={15} unit=" min"
              onChange={v => setConfig(c => ({ ...c, slotDuration: v }))} />
            <ConfigSlider label="Anticipación máxima" value={config.maxAdvanceDays} min={7} max={90} unit=" días"
              onChange={v => setConfig(c => ({ ...c, maxAdvanceDays: v }))} />
            <ConfigSlider label="Anticipación mínima" value={config.minAdvanceHours} min={0} max={48} unit=" hs"
              onChange={v => setConfig(c => ({ ...c, minAdvanceHours: v }))} />
            <ConfigSlider label="Máximo comensales por reserva" value={config.maxPartySize} min={2} max={30} unit=" pax"
              onChange={v => setConfig(c => ({ ...c, maxPartySize: v }))} />
          </div>

          <div className="space-y-6">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold text-gastro-text flex items-center gap-2">
                <Bell size={16} style={{ color: '#2563EB' }} /> Confirmaciones y recordatorios
              </h3>
              {[
                { label: 'Confirmación automática', key: 'autoConfirm' as const, desc: 'Confirmar reservas al crearlas' },
                { label: 'Enviar recordatorio', key: 'sendReminder' as const, desc: 'SMS/email antes de la reserva' },
                { label: 'Requerir seña', key: 'requireDeposit' as const, desc: 'Depósito para grupos grandes o VIP' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#152035' }}>
                  <div>
                    <span className="text-sm text-gastro-text block">{item.label}</span>
                    <span className="text-xs text-gastro-muted">{item.desc}</span>
                  </div>
                  <ToggleSwitch checked={config[item.key]} onChange={v => setConfig(c => ({ ...c, [item.key]: v }))} />
                </div>
              ))}
              {config.sendReminder && (
                <ConfigSlider label="Recordar con anticipación" value={config.reminderHours} min={1} max={72} unit=" hs"
                  onChange={v => setConfig(c => ({ ...c, reminderHours: v }))} />
              )}
              {config.requireDeposit && (
                <ConfigSlider label="Monto de seña" value={config.depositAmount} min={5000} max={50000} step={1000} unit=""
                  onChange={v => setConfig(c => ({ ...c, depositAmount: v }))} />
              )}
              <ConfigSlider label="Gracia no-show" value={config.noShowGraceMinutes} min={5} max={30} unit=" min"
                onChange={v => setConfig(c => ({ ...c, noShowGraceMinutes: v }))} />
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold text-gastro-text flex items-center gap-2">
                <Globe size={16} style={{ color: '#2563EB' }} /> Canales habilitados
              </h3>
              {Object.entries(SOURCE_CFG).map(([key, src]) => {
                const SourceIcon = src.icon
                return (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <SourceIcon size={16} style={{ color: src.color }} />
                      <span className="text-sm text-gastro-text">{src.label}</span>
                    </div>
                    <ToggleSwitch
                      checked={config.channels[key as ReservationSource]}
                      onChange={v => setConfig(c => ({ ...c, channels: { ...c.channels, [key]: v } }))}
                    />
                  </div>
                )
              })}
            </div>

            <button type="button" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Save size={16} /> Guardar configuración
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedReservation && (
        <DetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {showNewModal && (
        <NewReservationModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
