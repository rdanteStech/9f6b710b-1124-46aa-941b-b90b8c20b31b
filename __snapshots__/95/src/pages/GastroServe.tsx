import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TABLES_DATA, type LiveOrder, type OrderStatus } from '../data/mockData'
import { useServe } from '../context/ServeContext'
import PosPanel from '../components/PosPanel'
import {
  UtensilsCrossed, Clock, Users, Search, Filter,
  CheckCircle, Coffee, ChevronRight, Bell, ScanEye, CalendarCheck,
  XCircle, MapPin, CreditCard, Truck, ShoppingBag, Utensils, ChefHat,
  MessageSquare, Receipt, Eye, Monitor,
} from 'lucide-react'

const ZONES = ['Todos', 'Salón', 'Terraza', 'VIP', 'Barra']

const TABLE_STATUS_CONFIG = {
  available: { label: 'Disponible', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  occupied: { label: 'Ocupada', color: '#2563EB', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.3)' },
  reserved: { label: 'Reservada', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  cleaning: { label: 'Limpieza', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  cooking: { label: 'Cocinando', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  ready: { label: 'Listo', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  delivered: { label: 'Entregado', color: '#8899BB', bg: 'rgba(136,136,170,0.15)' },
}

const CHANNEL_CONFIG = {
  salon: { label: 'Salón', color: '#2563EB', icon: Utensils },
  delivery: { label: 'Delivery', color: '#3B82F6', icon: Truck },
  takeaway: { label: 'Take Away', color: '#10b981', icon: ShoppingBag },
  uber: { label: 'Uber Eats', color: '#60A5FA', icon: Truck },
  rappi: { label: 'Rappi', color: '#f59e0b', icon: Truck },
}

const ITEM_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  cooking: { label: 'Cocinando', color: '#3B82F6' },
  ready: { label: 'Listo', color: '#10b981' },
  delivered: { label: 'Servido', color: '#8899BB' },
}

const EYE_ALERT_CONFIG = {
  empty_glass: { label: 'Vaso vacío', color: '#3B82F6', icon: Coffee },
  hand_raise: { label: 'Mano levantada', color: '#f59e0b', icon: Bell },
  long_wait: { label: 'Espera prolongada', color: '#ef4444', icon: Clock },
  ready_dish: { label: 'Plato sin retirar', color: '#10b981', icon: ChefHat },
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  paid: { label: 'Pagado', color: '#10b981' },
  partial: { label: 'Seña abonada', color: '#3B82F6' },
}

const KDS_TICKETS = [
  {
    id: '#4821', table: 'Mesa 12', time: '8 min', status: 'cooking', priority: 'normal',
    items: [
      { name: 'Risotto de Hongos', qty: 2, mods: ['Sin sal', 'Extra parmesano'] },
      { name: 'Lomo a la Pimienta', qty: 1, mods: [] },
      { name: 'Burrata', qty: 1, mods: ['Sin rúcula'] },
    ]
  },
  {
    id: '#4822', table: 'Mesa 7', time: '0 min', status: 'ready', priority: 'normal',
    items: [
      { name: 'Ceviche Clásico', qty: 1, mods: [] },
      { name: 'Tiramisú', qty: 1, mods: [] },
    ]
  },
  {
    id: '#4824', table: 'Mesa 3', time: '12 min', status: 'cooking', priority: 'urgent',
    items: [
      { name: 'Pizza Margherita', qty: 2, mods: ['Masa fina'] },
      { name: 'Pasta Carbonara', qty: 2, mods: [] },
      { name: 'Ensalada César', qty: 1, mods: ['Sin crutones'] },
      { name: 'Agua mineral', qty: 4, mods: [] },
    ]
  },
  {
    id: '#4826', table: 'Take Away', time: '1 min', status: 'pending', priority: 'normal',
    items: [
      { name: 'Risotto de Hongos', qty: 1, mods: [] },
      { name: 'Tiramisú', qty: 1, mods: [] },
    ]
  },
]

function OrderDetailModal({ order, onClose }: { order: LiveOrder; onClose: () => void }) {
  const statusCfg = ORDER_STATUS_CONFIG[order.status]
  const channelCfg = CHANNEL_CONFIG[order.channel]
  const ChannelIcon = channelCfg.icon
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: '#0D1526', border: '1px solid #152035' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between gap-4" style={{ borderColor: '#152035' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-black text-primary-400">{order.id}</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: statusCfg.bg, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              {order.time !== '—' && (
                <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: 'rgba(239,68,68,0.1)', color: parseInt(order.time) > 10 ? '#ef4444' : '#f59e0b' }}>
                  <Clock size={11} /> {order.time}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gastro-subtle flex-wrap">
              <span className="flex items-center gap-1">
                <ChannelIcon size={12} style={{ color: channelCfg.color }} />
                {channelCfg.label}
              </span>
              <span>·</span>
              <span>{order.table}</span>
              <span>·</span>
              <span>Iniciado {order.createdAt}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gastro-muted hover:text-gastro-text p-1 flex-shrink-0">
            <XCircle size={22} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Mesa / Canal', value: order.table, icon: MapPin },
              { label: 'Mozo', value: order.waiter, icon: Users },
              { label: 'Comensales', value: `${order.guests} pax`, icon: UtensilsCrossed },
              { label: 'Zona', value: order.zone, icon: MapPin },
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

          {/* GastroEye alerts */}
          {order.eyeAlerts && order.eyeAlerts.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)' }}>
              <div className="flex items-center gap-2 mb-3">
                <ScanEye size={16} style={{ color: '#60A5FA' }} />
                <span className="text-sm font-bold text-gastro-text">Alertas GastroEye</span>
                <span className="badge badge-primary text-xs">{order.eyeAlerts.length}</span>
              </div>
              <div className="space-y-2">
                {order.eyeAlerts.map((alert, i) => {
                  const alertCfg = EYE_ALERT_CONFIG[alert.type]
                  const AlertIcon = alertCfg.icon
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <AlertIcon size={14} style={{ color: alertCfg.color, flexShrink: 0 }} />
                      <span className="text-xs text-gastro-text flex-1">{alert.message}</span>
                      <span className="text-xs text-gastro-muted">{alert.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gastro-text flex items-center gap-2">
                <Receipt size={14} style={{ color: '#60A5FA' }} />
                Detalle del pedido
              </h4>
              <span className="text-xs text-gastro-subtle">{order.lineItems.length} productos · {order.items} unidades</span>
            </div>
            <div className="space-y-2">
              {order.lineItems.map((item, i) => {
                const itemStatus = ITEM_STATUS_CONFIG[item.status]
                return (
                  <div key={i} className="rounded-xl p-3 flex gap-3"
                    style={{ background: '#0A0F1A', border: '1px solid #152035' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                      style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}>
                      {item.qty}x
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-gastro-text">{item.name}</div>
                          <div className="text-xs text-gastro-muted mt-0.5">{item.category} · {item.station}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gastro-text">${(item.price * item.qty).toLocaleString()}</div>
                          <span className="text-xs font-semibold" style={{ color: itemStatus.color }}>{itemStatus.label}</span>
                        </div>
                      </div>
                      {item.mods.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.mods.map(mod => (
                            <span key={mod} className="text-xs px-2 py-0.5 rounded-md"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                              ⚠ {mod}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl p-3 flex gap-3" style={{ background: '#0A0F1A' }}>
              <MessageSquare size={14} style={{ color: '#8899BB', flexShrink: 0, marginTop: 2 }} />
              <div>
                <span className="text-xs text-gastro-muted block mb-1">Notas del pedido</span>
                <p className="text-sm text-gastro-text">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Timeline + Payment side by side on larger screens */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Timeline */}
            <div className="rounded-xl p-4" style={{ background: '#0A0F1A' }}>
              <h4 className="text-xs font-bold text-gastro-muted uppercase tracking-wider mb-3">Historial</h4>
              <div className="space-y-3">
                {order.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === order.timeline.length - 1 ? '#2563EB' : '#1A2540' }} />
                      {i < order.timeline.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: '#1A2540', minHeight: 16 }} />
                      )}
                    </div>
                    <div className="pb-1">
                      <div className="text-xs font-semibold text-gastro-text">{event.event}</div>
                      <div className="text-xs text-gastro-muted">{event.time}{event.actor ? ` · ${event.actor}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment summary */}
            <div className="rounded-xl p-4" style={{ background: '#0A0F1A' }}>
              <h4 className="text-xs font-bold text-gastro-muted uppercase tracking-wider mb-3">Resumen de cuenta</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gastro-subtle">Subtotal</span>
                  <span className="text-gastro-text">${order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gastro-subtle">IVA (19%)</span>
                  <span className="text-gastro-text">${order.tax.toLocaleString()}</span>
                </div>
                {order.tip > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gastro-subtle">Propina</span>
                    <span className="text-gastro-text">${order.tip.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#1A2540' }}>
                  <span className="text-sm font-bold text-gastro-text">Total</span>
                  <span className="text-lg font-black text-primary-400">${order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} style={{ color: '#8899BB' }} />
                  <span className="text-xs text-gastro-subtle">{order.paymentMethod}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: paymentCfg.color }}>{paymentCfg.label}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {order.status === 'pending' && (
              <button type="button" className="btn-primary flex-1 text-sm py-2.5">
                <ChefHat size={14} /> Enviar a cocina
              </button>
            )}
            {order.status === 'cooking' && (
              <button type="button" className="btn-primary flex-1 text-sm py-2.5">
                <CheckCircle size={14} /> Marcar como listo
              </button>
            )}
            {order.status === 'ready' && (
              <button type="button" className="flex-1 text-sm py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle size={14} /> Marcar entregado
              </button>
            )}
            {order.paymentStatus !== 'paid' && order.status !== 'delivered' && (
              <button type="button" className="flex-1 text-sm py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.25)' }}>
                <CreditCard size={14} /> Cobrar cuenta
              </button>
            )}
            {order.eyeAlerts && order.eyeAlerts.length > 0 && (
              <button type="button" onClick={onClose}
                className="text-sm py-2.5 px-4 rounded-xl font-semibold transition-colors flex items-center gap-2"
                style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' }}>
                <Eye size={14} /> Ver en GastroEye
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GastroServe() {
  const navigate = useNavigate()
  const { orders } = useServe()
  const [activeZone, setActiveZone] = useState('Todos')
  const [activeView, setActiveView] = useState<'tables' | 'pos' | 'kds' | 'orders'>('tables')
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null)
  const [posInitialTable, setPosInitialTable] = useState<string | undefined>()

  const filteredTables = TABLES_DATA.filter(t => activeZone === 'Todos' || t.zone === activeZone)

  const stats = {
    available: TABLES_DATA.filter(t => t.status === 'available').length,
    occupied: TABLES_DATA.filter(t => t.status === 'occupied').length,
    reserved: TABLES_DATA.filter(t => t.status === 'reserved').length,
    total: TABLES_DATA.length,
  }

  return (
    <div className="space-y-6">
      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button type="button" onClick={() => navigate('/reserve')}
          className="rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.04))',
            border: '1px solid rgba(37,99,235,0.25)',
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
            <CalendarCheck size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-gastro-text">GastroReserve</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>7 reservas hoy</span>
            </div>
            <p className="text-xs text-gastro-subtle">
              Reservas, lista de espera y configuración de disponibilidad
            </p>
          </div>
          <ChevronRight size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
        </button>

        <button type="button" onClick={() => navigate('/eye')}
          className="rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(37,99,235,0.06))',
            border: '1px solid rgba(96,165,250,0.25)',
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)' }}>
            <ScanEye size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-gastro-text">GastroEye</span>
              <span className="badge badge-primary text-xs">AI</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>3 alertas activas</span>
            </div>
            <p className="text-xs text-gastro-subtle">
              Visión IA detectando vasos vacíos, manos levantadas y mesas sin atención
            </p>
          </div>
          <ChevronRight size={18} style={{ color: '#60A5FA', flexShrink: 0 }} />
        </button>
      </div>

      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mesas disponibles', value: stats.available, color: '#10b981', icon: CheckCircle },
          { label: 'Mesas ocupadas', value: stats.occupied, color: '#2563EB', icon: Users },
          { label: 'Reservadas', value: stats.reserved, color: '#f59e0b', icon: Clock },
          { label: 'Pedidos activos', value: orders.filter(o => o.status !== 'delivered').length, color: '#3B82F6', icon: UtensilsCrossed },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'tables', label: 'Mapa de mesas' },
          { id: 'pos', label: 'POS Web' },
          { id: 'kds', label: 'KDS — Cocina' },
          { id: 'orders', label: 'Pedidos' },
        ].map(view => (
          <button key={view.id}
            onClick={() => setActiveView(view.id as typeof activeView)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
            style={activeView === view.id ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
            {view.label}
          </button>
        ))}
      </div>

      {/* Tables view */}
      {activeView === 'tables' && (
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              {ZONES.map(zone => (
                <button key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeZone === zone ? 'text-primary-400' : 'text-gastro-subtle'}`}
                  style={activeZone === zone ? { background: 'rgba(37,99,235,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
                  {zone}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setPosInitialTable(undefined); setActiveView('pos') }}
              className="btn-primary text-xs px-3 py-2">
              <Monitor size={14} /> Abrir POS
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredTables.map(table => {
              const cfg = TABLE_STATUS_CONFIG[table.status as keyof typeof TABLE_STATUS_CONFIG]
              return (
                <div key={table.id}
                  onClick={() => {
                    setPosInitialTable(`Mesa ${table.number}`)
                    setActiveView('pos')
                  }}
                  className="rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-105 text-center"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  title="Clic para cargar pedido en POS">
                  <div className="text-lg font-black mb-1" style={{ color: cfg.color }}>
                    {table.number}
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: cfg.color }}>
                    {cfg.label}
                  </div>
                  <div className="text-xs text-gastro-subtle">{table.capacity} 👤</div>
                  {table.status === 'occupied' && (
                    <div className="text-xs text-gastro-subtle mt-1">{(table as { time?: string }).time}</div>
                  )}
                  {table.status === 'reserved' && (
                    <div className="text-xs text-gastro-subtle mt-1">{(table as { reservation?: string }).reservation}</div>
                  )}
                  <div className="text-xs text-gastro-subtle mt-0.5">{table.zone}</div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t" style={{ borderColor: '#1A2540' }}>
            {Object.entries(TABLE_STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
                <span className="text-xs text-gastro-subtle">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POS view */}
      {activeView === 'pos' && (
        <PosPanel
          key={posInitialTable ?? 'default'}
          initialTable={posInitialTable}
          onOrderCreated={order => {
            setSelectedOrder(order)
            setActiveView('orders')
          }}
        />
      )}

      {/* KDS view */}
      {activeView === 'kds' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-semibold text-gastro-text">Cocina en vivo</span>
              <span className="badge badge-primary text-xs">{KDS_TICKETS.length} tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gastro-subtle" />
              <span className="text-xs text-gastro-subtle">Sonido activo</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KDS_TICKETS.map(ticket => (
              <div key={ticket.id}
                className={`kds-ticket ${ticket.status === 'ready' ? 'ready' : ticket.priority === 'urgent' ? 'urgent' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-gastro-text text-sm">{ticket.table}</div>
                    <div className="text-xs text-gastro-subtle">{ticket.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${parseInt(ticket.time) > 10 ? 'text-error' : parseInt(ticket.time) > 5 ? 'text-warning' : 'text-success'}`}>
                      {ticket.time === '0 min' ? '✓ Listo' : ticket.time}
                    </div>
                    <div className="text-xs text-gastro-subtle">
                      {ticket.status === 'ready' ? 'Para servir' : ticket.status === 'pending' ? 'Pendiente' : 'Cocinando'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {ticket.items.map((item, i) => (
                    <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary-400 w-5">{item.qty}x</span>
                        <span className="text-xs font-semibold text-gastro-text">{item.name}</span>
                      </div>
                      {item.mods.length > 0 && (
                        <div className="ml-7 mt-1 space-y-0.5">
                          {item.mods.map((mod, j) => (
                            <div key={j} className="text-xs text-warning">⚠ {mod}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${ticket.status === 'ready' ? 'text-success' : 'text-primary-400'}`}
                  style={ticket.status === 'ready'
                    ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                  {ticket.status === 'ready' ? '✓ Marcar entregado' : ticket.status === 'pending' ? 'Iniciar preparación' : 'Marcar como listo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders view */}
      {activeView === 'orders' && (
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gastro-text">Todos los pedidos</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
                <input placeholder="Buscar pedido..." className="input-gastro pl-9 py-2 text-xs w-48" />
              </div>
              <button className="btn-secondary text-xs px-3 py-2"><Filter size={13} /> Filtrar</button>
            </div>
          </div>
          <table className="table-gastro">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Mesa / Canal</th>
                <th>Items</th>
                <th>Mozo</th>
                <th>Tiempo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const cfg = ORDER_STATUS_CONFIG[order.status]
                return (
                  <tr key={order.id}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    onClick={() => setSelectedOrder(order)}>
                    <td className="font-bold text-primary-400">{order.id}</td>
                    <td>{order.table}</td>
                    <td>{order.items} items</td>
                    <td className="text-gastro-subtle">{order.waiter}</td>
                    <td className="text-gastro-subtle">{order.time}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <button type="button"
                        className="text-gastro-subtle hover:text-primary-400 transition-colors p-1"
                        onClick={e => { e.stopPropagation(); setSelectedOrder(order) }}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
