import { useState } from 'react'
import {
  Calendar, Users, MapPin, Clock, DollarSign, Plus,
  ChevronRight, Star, CheckCircle, Edit, Trash2, Eye,
  Music, Utensils, Wine, Camera, Mic, Gift, Heart,
  TrendingUp, Package, Phone, Mail, FileText, Download,
  Filter, Search, Bell, ToggleLeft, ToggleRight, Sparkles,
  PartyPopper, ChefHat, Building2, Cake,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DEMO_LOCALE } from '../lib/locale'

// ─── Types ────────────────────────────────────────────────────────────────────

type EventStatus = 'confirmed' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
type EventType = 'cumpleanos' | 'corporativo' | 'casamiento' | 'catering' | 'show' | 'privado'

interface GastroEvent {
  id: string
  name: string
  type: EventType
  date: string
  time: string
  guests: number
  status: EventStatus
  client: string
  clientPhone: string
  clientEmail: string
  venue: string
  budget: number
  deposit: number
  menu: string
  notes: string
  services: string[]
}

interface EventPackage {
  id: string
  name: string
  description: string
  minGuests: number
  maxGuests: number
  pricePerPerson: number
  includes: string[]
  color: string
  icon: LucideIcon
  popular?: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EVENTS: GastroEvent[] = [
  {
    id: 'EV-001', name: 'Cumpleaños de 50 — Familia Rodríguez', type: 'cumpleanos',
    date: '2025-08-15', time: '20:00', guests: 80, status: 'confirmed',
    client: 'María Rodríguez', clientPhone: '+56 9 4444-5555', clientEmail: 'maria@email.com',
    venue: 'Salón principal', budget: 480000, deposit: 144000,
    menu: 'Menú degustación 5 pasos + barra libre', notes: 'Torta de cumpleaños incluida. Decoración temática años 70.',
    services: ['Catering', 'Barra libre', 'Decoración', 'Torta', 'Música'],
  },
  {
    id: 'EV-002', name: 'Cena corporativa — TechCorp SA', type: 'corporativo',
    date: '2025-07-28', time: '19:30', guests: 45, status: 'in_progress',
    client: 'Diego Fernández', clientPhone: '+56 9 5555-6666', clientEmail: 'diego@techcorp.com',
    venue: 'Salón privado', budget: 270000, deposit: 81000,
    menu: 'Menú ejecutivo 3 pasos + vinos seleccionados', notes: 'Presentación corporativa durante la cena. Proyector requerido.',
    services: ['Catering', 'Vinos', 'AV/Proyector'],
  },
  {
    id: 'EV-003', name: 'Casamiento — Valentina & Marcos', type: 'casamiento',
    date: '2025-09-20', time: '18:00', guests: 150, status: 'pending',
    client: 'Valentina Gómez', clientPhone: '+56 9 6666-7777', clientEmail: 'vale@email.com',
    venue: 'Salón principal + jardín', budget: 1200000, deposit: 360000,
    menu: 'Cóctel de bienvenida + cena 4 pasos + torta nupcial + barra libre', notes: 'Menú vegetariano para 20 personas. Flores blancas.',
    services: ['Catering', 'Barra libre', 'Torta nupcial', 'Decoración', 'Fotografía', 'Música en vivo'],
  },
  {
    id: 'EV-004', name: 'Catering externo — Lanzamiento Nike', type: 'catering',
    date: '2025-07-22', time: '12:00', guests: 200, status: 'confirmed',
    client: 'Laura Méndez', clientPhone: '+56 9 7777-8888', clientEmail: 'laura@nike.com',
    venue: 'Externo — Bellavista, Santiago', budget: 800000, deposit: 240000,
    menu: 'Finger food premium + estaciones de comida + barra de bebidas', notes: 'Evento al aire libre. Carpas incluidas.',
    services: ['Catering externo', 'Barra de bebidas', 'Personal de servicio', 'Equipamiento'],
  },
  {
    id: 'EV-005', name: 'Show de jazz + cena — Viernes especial', type: 'show',
    date: '2025-07-25', time: '21:00', guests: 60, status: 'confirmed',
    client: 'Interno', clientPhone: '', clientEmail: '',
    venue: 'Salón principal', budget: 180000, deposit: 0,
    menu: 'Menú especial jazz + cócteles de autor', notes: 'Trío de jazz en vivo. Reservas abiertas al público.',
    services: ['Música en vivo', 'Menú especial', 'Cócteles'],
  },
  {
    id: 'EV-006', name: 'Cumpleaños infantil — Familia Torres', type: 'cumpleanos',
    date: '2025-08-03', time: '16:00', guests: 35, status: 'completed',
    client: 'Ana Torres', clientPhone: '+56 9 8888-9999', clientEmail: 'ana@email.com',
    venue: 'Salón privado', budget: 140000, deposit: 140000,
    menu: 'Menú infantil + torta temática + merienda', notes: 'Temática dinosaurios. Animación incluida.',
    services: ['Catering', 'Torta', 'Animación', 'Decoración'],
  },
]

const PACKAGES: EventPackage[] = [
  {
    id: 'pkg1', name: 'Esencial', description: 'Para eventos íntimos y reuniones privadas',
    minGuests: 10, maxGuests: 30, pricePerPerson: 4500,
    includes: ['Menú 3 pasos', 'Bebidas sin alcohol', 'Personal de servicio', 'Mantelería'],
    color: '#3B82F6', icon: Utensils,
  },
  {
    id: 'pkg2', name: 'Premium', description: 'La opción más elegida para celebraciones',
    minGuests: 30, maxGuests: 100, pricePerPerson: 7500,
    includes: ['Menú 4 pasos', 'Barra de vinos', 'Personal de servicio', 'Decoración básica', 'Torta incluida', 'Coordinador de evento'],
    color: '#2563EB', icon: Star, popular: true,
  },
  {
    id: 'pkg3', name: 'Luxury', description: 'Experiencia gastronómica de alto nivel',
    minGuests: 50, maxGuests: 200, pricePerPerson: 12000,
    includes: ['Menú degustación 6 pasos', 'Barra libre premium', 'Sommelier', 'Decoración personalizada', 'Fotografía', 'Música en vivo', 'Coordinador exclusivo'],
    color: '#f59e0b', icon: Sparkles,
  },
  {
    id: 'pkg4', name: 'Catering Externo', description: 'Llevamos la experiencia a tu locación',
    minGuests: 50, maxGuests: 500, pricePerPerson: 9000,
    includes: ['Menú personalizado', 'Equipamiento completo', 'Personal de servicio', 'Transporte', 'Montaje y desmontaje'],
    color: '#60A5FA', icon: Building2,
  },
]

const STATUS_CFG: Record<EventStatus, { label: string; color: string; bg: string; emoji: string }> = {
  confirmed:   { label: 'Confirmado',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  emoji: '✅' },
  pending:     { label: 'Pendiente',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  emoji: '⏳' },
  in_progress: { label: 'En curso',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  emoji: '🎉' },
  completed:   { label: 'Completado',    color: '#8899BB', bg: 'rgba(136,136,170,0.1)',  emoji: '🏆' },
  cancelled:   { label: 'Cancelado',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    emoji: '❌' },
}

const TYPE_CFG: Record<EventType, { label: string; color: string; emoji: string }> = {
  cumpleanos:  { label: 'Cumpleaños',    color: '#60A5FA', emoji: '🎂' },
  corporativo: { label: 'Corporativo',   color: '#3B82F6', emoji: '💼' },
  casamiento:  { label: 'Casamiento',    color: '#f59e0b', emoji: '💍' },
  catering:    { label: 'Catering ext.', color: '#10b981', emoji: '🍽️' },
  show:        { label: 'Show / Evento', color: '#2563EB', emoji: '🎵' },
  privado:     { label: 'Privado',       color: '#8899BB', emoji: '🔒' },
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onSelect }: { event: GastroEvent; onSelect: (e: GastroEvent) => void }) {
  const st = STATUS_CFG[event.status]
  const tp = TYPE_CFG[event.type]
  const depositPct = event.deposit > 0 ? Math.round((event.deposit / event.budget) * 100) : 0

  return (
    <div className="card-gastro cursor-pointer transition-all duration-200 group"
      style={{ border: `1px solid ${event.status === 'in_progress' ? 'rgba(59,130,246,0.3)' : event.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : '#1A2540'}` }}
      onClick={() => onSelect(event)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: `${tp.color}15` }}>
          {tp.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gastro-text text-sm leading-tight mb-1 group-hover:text-primary-400 transition-colors">
            {event.name}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
              style={{ background: `${tp.color}12`, color: tp.color }}>
              {tp.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
              style={{ background: st.bg, color: st.color }}>
              {st.emoji} {st.label}
            </span>
          </div>
        </div>
        <ChevronRight size={14} className="text-gastro-muted flex-shrink-0 group-hover:text-primary-400 transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gastro-subtle">
          <Calendar size={11} style={{ color: '#2563EB' }} />
          {new Date(event.date).toLocaleDateString(DEMO_LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gastro-subtle">
          <Clock size={11} style={{ color: '#3B82F6' }} />
          {event.time}hs
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gastro-subtle">
          <Users size={11} style={{ color: '#60A5FA' }} />
          {event.guests} personas
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gastro-subtle">
          <MapPin size={11} style={{ color: '#10b981' }} />
          {event.venue}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gastro-subtle">Presupuesto</span>
        <span className="font-bold text-gastro-text">${(event.budget / 1000).toFixed(0)}K</span>
      </div>

      {event.deposit > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gastro-subtle">Seña cobrada</span>
            <span className="text-xs font-semibold" style={{ color: '#10b981' }}>{depositPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${depositPct}%`, background: 'linear-gradient(90deg, #10b981, #3B82F6)' }} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {event.services.slice(0, 3).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#8899BB', border: '1px solid #1A2540' }}>
            {s}
          </span>
        ))}
        {event.services.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#6666aa' }}>
            +{event.services.length - 3} más
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────

function EventDetail({ event, onClose }: { event: GastroEvent; onClose: () => void }) {
  const st = STATUS_CFG[event.status]
  const tp = TYPE_CFG[event.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#1A2540' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${tp.color}15` }}>
              {tp.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-gastro-text text-lg leading-tight mb-2">{event.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-lg font-bold"
                  style={{ background: `${tp.color}12`, color: tp.color }}>
                  {tp.label}
                </span>
                <span className="text-xs px-2 py-1 rounded-lg font-bold"
                  style={{ background: st.bg, color: st.color }}>
                  {st.emoji} {st.label}
                </span>
                <span className="text-xs text-gastro-muted">{event.id}</span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gastro-subtle hover:text-gastro-text transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Date/time/guests */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: 'Fecha', value: new Date(event.date).toLocaleDateString(DEMO_LOCALE, { weekday: 'long', day: '2-digit', month: 'long' }), color: '#2563EB' },
              { icon: Clock, label: 'Hora', value: `${event.time}hs`, color: '#3B82F6' },
              { icon: Users, label: 'Personas', value: event.guests.toString(), color: '#60A5FA' },
              { icon: MapPin, label: 'Espacio', value: event.venue, color: '#10b981' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="p-3 rounded-xl text-center"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}22` }}>
                  <Icon size={16} className="mx-auto mb-1" style={{ color: item.color }} />
                  <div className="text-xs text-gastro-subtle mb-0.5">{item.label}</div>
                  <div className="text-xs font-bold text-gastro-text">{item.value}</div>
                </div>
              )
            })}
          </div>

          {/* Client */}
          {event.client !== 'Interno' && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
              <div className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-3">Cliente</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
                  {event.client.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gastro-text">{event.client}</div>
                  <div className="flex items-center gap-4 mt-1">
                    {event.clientPhone && (
                      <span className="text-xs text-gastro-subtle flex items-center gap-1">
                        <Phone size={10} /> {event.clientPhone}
                      </span>
                    )}
                    {event.clientEmail && (
                      <span className="text-xs text-gastro-subtle flex items-center gap-1">
                        <Mail size={10} /> {event.clientEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
            <div className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-3">Financiero</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-black text-gastro-text">${(event.budget / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gastro-subtle">Presupuesto total</div>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: '#10b981' }}>${(event.deposit / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gastro-subtle">Seña cobrada</div>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: '#f59e0b' }}>${((event.budget - event.deposit) / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gastro-subtle">Saldo pendiente</div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
            <div className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-2">Menú</div>
            <p className="text-sm text-gastro-text">{event.menu}</p>
          </div>

          {/* Services */}
          <div>
            <div className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-2">Servicios incluidos</div>
            <div className="flex flex-wrap gap-2">
              {event.services.map(s => (
                <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold"
                  style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <CheckCircle size={10} /> {s}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="text-xs font-bold mb-2" style={{ color: '#f59e0b' }}>📝 Notas</div>
              <p className="text-sm text-gastro-subtle">{event.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(96,165,250,0.15))', border: '1px solid rgba(37,99,235,0.4)', color: '#2563EB' }}>
              <Edit size={14} /> Editar evento
            </button>
            <button className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
              <Download size={14} /> Descargar contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main GastroEvents ────────────────────────────────────────────────────────

export default function GastroEvents() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'packages' | 'analytics'>('events')
  const [selectedEvent, setSelectedEvent] = useState<GastroEvent | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | EventStatus>('all')
  const [filterType, setFilterType] = useState<'all' | EventType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = EVENTS.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterType !== 'all' && e.type !== filterType) return false
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.client.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalRevenue = EVENTS.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.budget, 0)
  const confirmedEvents = EVENTS.filter(e => e.status === 'confirmed' || e.status === 'in_progress').length
  const totalGuests = EVENTS.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.guests, 0)
  const pendingDeposits = EVENTS.filter(e => e.status === 'pending').reduce((s, e) => s + (e.budget * 0.3), 0)

  // Calendar data
  const upcomingEvents = EVENTS
    .filter(e => e.status !== 'cancelled' && e.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(245,158,11,0.06) 50%, rgba(37,99,235,0.04) 100%)',
          border: '1px solid rgba(96,165,250,0.25)',
        }}>
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #f59e0b)', boxShadow: '0 0 30px rgba(96,165,250,0.4)' }}>
            <Calendar size={26} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroEvents</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)' }}>
                🎉 Eventos & Catering
              </span>
            </div>
            <p className="text-sm text-gastro-subtle">
              Gestión integral de eventos privados, casamientos, corporativos y catering externo
            </p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-6 text-center flex-shrink-0">
            {[
              { value: confirmedEvents, label: 'Eventos activos' },
              { value: `$${(totalRevenue / 1000000).toFixed(1)}M`, label: 'Facturación eventos' },
              { value: totalGuests, label: 'Personas totales' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black" style={{ color: '#60A5FA' }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Eventos confirmados', value: confirmedEvents, color: '#10b981', icon: CheckCircle },
          { label: 'Facturación total', value: `$${(totalRevenue / 1000000).toFixed(1)}M`, color: '#60A5FA', icon: DollarSign },
          { label: 'Personas totales', value: totalGuests, color: '#3B82F6', icon: Users },
          { label: 'Señas pendientes', value: `$${(pendingDeposits / 1000).toFixed(0)}K`, color: '#f59e0b', icon: TrendingUp },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle leading-tight">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'events',    label: `Todos los eventos (${EVENTS.length})` },
          { id: 'calendar',  label: 'Próximos eventos' },
          { id: 'packages',  label: 'Paquetes y precios' },
          { id: 'analytics', label: 'Analítica' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)', color: '#60A5FA' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── EVENTS LIST ── */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o cliente..."
                className="input-gastro pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'confirmed', 'pending', 'in_progress', 'completed'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={filterStatus === s
                    ? { background: s === 'all' ? 'rgba(255,255,255,0.1)' : STATUS_CFG[s as EventStatus].bg, color: s === 'all' ? '#fff' : STATUS_CFG[s as EventStatus].color, border: '1px solid rgba(255,255,255,0.2)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                  {s === 'all' ? 'Todos' : STATUS_CFG[s as EventStatus].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'cumpleanos', 'corporativo', 'casamiento', 'catering', 'show'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={filterType === t
                  ? { background: t === 'all' ? 'rgba(255,255,255,0.1)' : `${TYPE_CFG[t as EventType].color}15`, color: t === 'all' ? '#fff' : TYPE_CFG[t as EventType].color, border: '1px solid rgba(255,255,255,0.2)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                {t === 'all' ? 'Todos los tipos' : TYPE_CFG[t as EventType].emoji + ' ' + TYPE_CFG[t as EventType].label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gastro-subtle">{filteredEvents.length} eventos encontrados</span>
            <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Nuevo evento</button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="card-gastro text-center py-16">
              <Calendar size={40} className="mx-auto mb-4" style={{ color: '#4A5A7A' }} />
              <p className="text-gastro-subtle">No se encontraron eventos con esos filtros</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {activeTab === 'calendar' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-gastro-text">Próximos eventos</h3>
            {upcomingEvents.map(event => {
              const st = STATUS_CFG[event.status]
              const tp = TYPE_CFG[event.type]
              const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={event.id}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                  style={{ background: '#0F1628', border: `1px solid ${daysUntil <= 7 ? 'rgba(96,165,250,0.3)' : '#1A2540'}` }}
                  onClick={() => setSelectedEvent(event)}>
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: `${tp.color}12`, border: `1px solid ${tp.color}22` }}>
                    <div className="text-xs font-bold" style={{ color: tp.color }}>
                      {new Date(event.date).toLocaleDateString(DEMO_LOCALE, { month: 'short' }).toUpperCase()}
                    </div>
                    <div className="text-2xl font-black text-gastro-text leading-none">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gastro-text text-sm mb-1">{event.name}</div>
                    <div className="flex items-center gap-3 text-xs text-gastro-subtle">
                      <span className="flex items-center gap-1"><Clock size={10} /> {event.time}hs</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {event.guests} personas</span>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {event.venue}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    {daysUntil <= 7 && daysUntil > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>
                        En {daysUntil} días
                      </span>
                    )}
                    {daysUntil === 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg animate-pulse"
                        style={{ background: 'rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                        ¡Hoy!
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mini stats */}
          <div className="space-y-4">
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-4">Resumen del mes</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                  const count = EVENTS.filter(e => e.status === key).length
                  if (count === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                        <span className="text-sm text-gastro-subtle">{cfg.label}</span>
                      </div>
                      <span className="font-bold text-gastro-text">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-4">Por tipo de evento</h3>
              <div className="space-y-2">
                {Object.entries(TYPE_CFG).map(([key, cfg]) => {
                  const count = EVENTS.filter(e => e.type === key).length
                  if (count === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cfg.emoji}</span>
                        <span className="text-sm text-gastro-subtle">{cfg.label}</span>
                      </div>
                      <span className="font-bold text-gastro-text">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PACKAGES ── */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">Paquetes predefinidos para cotización rápida de eventos</p>
            <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Nuevo paquete</button>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {PACKAGES.map(pkg => {
              const Icon = pkg.icon
              return (
                <div key={pkg.id} className="rounded-2xl p-5 relative transition-all duration-200"
                  style={{
                    background: pkg.popular ? `${pkg.color}08` : '#0F1628',
                    border: `1px solid ${pkg.popular ? pkg.color + '44' : pkg.color + '22'}`,
                  }}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${pkg.color}, #60A5FA)` }}>
                      ⭐ Más elegido
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${pkg.color}15`, border: `1px solid ${pkg.color}33` }}>
                    <Icon size={22} style={{ color: pkg.color }} />
                  </div>

                  <h4 className="font-black text-gastro-text text-lg mb-1">{pkg.name}</h4>
                  <p className="text-xs text-gastro-subtle mb-4">{pkg.description}</p>

                  <div className="mb-4">
                    <div className="text-3xl font-black" style={{ color: pkg.color }}>
                      ${pkg.pricePerPerson.toLocaleString()}
                    </div>
                    <div className="text-xs text-gastro-subtle">por persona</div>
                    <div className="text-xs text-gastro-subtle mt-1">
                      {pkg.minGuests}–{pkg.maxGuests} personas
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {pkg.includes.map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gastro-subtle">
                        <CheckCircle size={11} style={{ color: pkg.color, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: `${pkg.color}12`, border: `1px solid ${pkg.color}33`, color: pkg.color }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${pkg.color}22` }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${pkg.color}12` }}>
                    Usar este paquete
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Facturación por tipo de evento</h3>
            <div className="space-y-3">
              {[
                { type: 'Casamientos', value: 1200000, color: '#f59e0b', emoji: '💍' },
                { type: 'Catering externo', value: 800000, color: '#10b981', emoji: '🍽️' },
                { type: 'Corporativos', value: 270000, color: '#3B82F6', emoji: '💼' },
                { type: 'Cumpleaños', value: 620000, color: '#60A5FA', emoji: '🎂' },
                { type: 'Shows', value: 180000, color: '#2563EB', emoji: '🎵' },
              ].map(item => {
                const total = 3070000
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span>{item.emoji}</span>
                        <span className="text-sm text-gastro-text">{item.type}</span>
                      </div>
                      <span className="text-sm font-bold text-gastro-text">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${(item.value / total) * 100}%`, background: item.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">KPIs de eventos</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ticket promedio', value: '$512K', color: '#60A5FA' },
                { label: 'Tasa de confirmación', value: '84%', color: '#10b981' },
                { label: 'Tiempo de cierre', value: '4.2 días', color: '#3B82F6' },
                { label: 'Satisfacción cliente', value: '4.9★', color: '#f59e0b' },
                { label: 'Eventos/mes promedio', value: '8.4', color: '#2563EB' },
                { label: 'Seña promedio', value: '30%', color: '#60A5FA' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl text-center"
                  style={{ background: `${m.color}08`, border: `1px solid ${m.color}22` }}>
                  <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs text-gastro-subtle mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Eventos por mes — 2025</h3>
            <div className="flex items-end gap-2 h-32">
              {[3, 5, 4, 7, 6, 8, 9, 11, 8, 6, 7, 10].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg"
                    style={{ height: `${(val / 11) * 100}%`, background: i === 6 ? 'linear-gradient(to top, #60A5FA, #f59e0b)' : `rgba(96,165,250,${0.2 + (i / 11) * 0.4})` }} />
                  <span className="text-xs text-gastro-subtle" style={{ fontSize: '9px' }}>
                    {['E','F','M','A','M','J','J','A','S','O','N','D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}
