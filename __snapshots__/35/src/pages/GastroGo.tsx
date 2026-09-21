import { useState } from 'react'
import {
  Smartphone, Globe, ShoppingBag, Truck, MapPin, Clock, Star,
  Plus, Edit, Eye, ToggleLeft, ToggleRight, ChevronRight,
  QrCode, Share2, Download, TrendingUp, Users, Package,
  CreditCard, Bell, Settings, Zap, CheckCircle, ArrowRight,
  Bike, Timer, DollarSign, BarChart3, Heart, Repeat,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryZone = { id: string; name: string; radius: string; fee: number; minOrder: number; active: boolean }
type OrderOnline = { id: string; customer: string; items: string; total: number; status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'; time: string; channel: 'app' | 'web' | 'whatsapp' }
type AppSection = { id: string; label: string; active: boolean; icon: string }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'z1', name: 'Zona Centro', radius: '2 km', fee: 350, minOrder: 2500, active: true },
  { id: 'z2', name: 'Zona Norte', radius: '4 km', fee: 550, minOrder: 3500, active: true },
  { id: 'z3', name: 'Zona Sur', radius: '5 km', fee: 650, minOrder: 4000, active: false },
  { id: 'z4', name: 'Zona Oeste', radius: '6 km', fee: 750, minOrder: 4500, active: true },
]

const ONLINE_ORDERS: OrderOnline[] = [
  { id: 'OL-001', customer: 'Martín García', items: 'Pasta carbonara x2, Tiramisú x1', total: 4800, status: 'delivering', time: '18 min', channel: 'app' },
  { id: 'OL-002', customer: 'Sofía López', items: 'Pizza margherita x1, Ensalada x1', total: 3200, status: 'preparing', time: '12 min', channel: 'web' },
  { id: 'OL-003', customer: 'Carlos Ruiz', items: 'Risotto x1, Vino tinto x1', total: 5600, status: 'pending', time: '2 min', channel: 'whatsapp' },
  { id: 'OL-004', customer: 'Ana Martínez', items: 'Milanesa x2, Papas fritas x2', total: 4200, status: 'ready', time: '5 min', channel: 'app' },
  { id: 'OL-005', customer: 'Diego Torres', items: 'Salmón x1, Postre x1', total: 6800, status: 'delivered', time: 'Hace 1h', channel: 'web' },
]

const APP_SECTIONS: AppSection[] = [
  { id: 'menu', label: 'Carta digital', active: true, icon: '🍽️' },
  { id: 'delivery', label: 'Delivery propio', active: true, icon: '🛵' },
  { id: 'takeaway', label: 'Take away', active: true, icon: '🛍️' },
  { id: 'reservations', label: 'Reservas', active: true, icon: '📅' },
  { id: 'loyalty', label: 'Puntos y fidelización', active: true, icon: '⭐' },
  { id: 'promotions', label: 'Promociones', active: false, icon: '🎁' },
  { id: 'events', label: 'Eventos', active: false, icon: '🎉' },
  { id: 'tracking', label: 'Seguimiento en vivo', active: true, icon: '📍' },
]

const STATUS_CFG = {
  pending:    { label: 'Nuevo',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  preparing:  { label: 'Preparando',   color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  ready:      { label: 'Listo',        color: '#9E7FFF', bg: 'rgba(158,127,255,0.12)' },
  delivering: { label: 'En camino',    color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  delivered:  { label: 'Entregado',    color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
}

const CHANNEL_CFG = {
  app:       { label: 'App',       color: '#9E7FFF', emoji: '📱' },
  web:       { label: 'Web',       color: '#38bdf8', emoji: '🌐' },
  whatsapp:  { label: 'WhatsApp',  color: '#10b981', emoji: '💬' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GastroGo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'delivery' | 'app' | 'analytics'>('overview')
  const [zones, setZones] = useState<DeliveryZone[]>(DELIVERY_ZONES)
  const [sections, setSections] = useState<AppSection[]>(APP_SECTIONS)
  const [orders] = useState<OrderOnline[]>(ONLINE_ORDERS)

  const toggleZone = (id: string) => setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z))
  const toggleSection = (id: string) => setSections(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))

  const activeOrders = orders.filter(o => o.status !== 'delivered')
  const todayRevenue = orders.reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(158,127,255,0.08) 0%, rgba(56,189,248,0.06) 50%, rgba(16,185,129,0.04) 100%)',
          border: '1px solid rgba(158,127,255,0.25)',
        }}>
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #9E7FFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)', boxShadow: '0 0 30px rgba(158,127,255,0.4)' }}>
            <Smartphone size={26} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroGo</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF', border: '1px solid rgba(158,127,255,0.3)' }}>
                📱 App + Delivery propio
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> En línea
              </span>
            </div>
            <p className="text-sm text-gastro-subtle">
              Tu app de cliente, delivery propio y presencia digital — sin comisiones de terceros
            </p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-6 text-center flex-shrink-0">
            {[
              { value: '4.284', label: 'Usuarios activos' },
              { value: '0%', label: 'Comisión delivery' },
              { value: '4.8★', label: 'Rating app' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black" style={{ color: '#9E7FFF' }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos hoy', value: orders.length, color: '#9E7FFF', icon: ShoppingBag, sub: `${activeOrders.length} activos` },
          { label: 'Facturación online', value: `$${(todayRevenue / 1000).toFixed(1)}K`, color: '#10b981', icon: DollarSign, sub: 'hoy' },
          { label: 'Tiempo promedio', value: '28 min', color: '#38bdf8', icon: Timer, sub: 'entrega' },
          { label: 'Clientes recurrentes', value: '68%', color: '#f472b6', icon: Repeat, sub: 'este mes' },
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
                  <div className="text-xs text-gastro-subtle">{stat.label}</div>
                  <div className="text-xs" style={{ color: stat.color }}>{stat.sub}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview',   label: 'Resumen' },
          { id: 'orders',     label: `Pedidos online (${activeOrders.length})` },
          { id: 'delivery',   label: 'Zonas de delivery' },
          { id: 'app',        label: 'Configurar app' },
          { id: 'analytics',  label: 'Analítica' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.35)', color: '#9E7FFF' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* App preview */}
          <div className="card-gastro flex flex-col items-center">
            <h3 className="font-bold text-gastro-text mb-4 self-start">Vista previa de la app</h3>
            {/* Phone mockup */}
            <div className="w-48 rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: '#0a0a0f', border: '3px solid #2a2a3d', boxShadow: '0 0 40px rgba(158,127,255,0.2)' }}>
              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-2" style={{ background: '#111118' }}>
                <span className="text-xs text-gastro-subtle">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-1.5 rounded-sm" style={{ background: '#10b981' }} />
                  <div className="w-1 h-1.5 rounded-sm" style={{ background: '#8888aa' }} />
                </div>
              </div>
              {/* App header */}
              <div className="px-3 py-3" style={{ background: 'linear-gradient(135deg, #9E7FFF22, #38bdf822)' }}>
                <div className="text-xs font-black text-white">Osteria Moderna</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={8} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  <span className="text-xs" style={{ color: '#f59e0b' }}>4.8</span>
                  <span className="text-xs text-gastro-subtle">· Abierto</span>
                </div>
              </div>
              {/* Hero image */}
              <img src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=300"
                alt="Restaurant" className="w-full h-20 object-cover opacity-70" />
              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {[
                  { emoji: '🛵', label: 'Delivery' },
                  { emoji: '🛍️', label: 'Take away' },
                  { emoji: '📅', label: 'Reservar' },
                ].map(a => (
                  <div key={a.label} className="flex flex-col items-center gap-1 p-1.5 rounded-xl"
                    style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.2)' }}>
                    <span className="text-sm">{a.emoji}</span>
                    <span className="text-xs text-gastro-subtle" style={{ fontSize: '9px' }}>{a.label}</span>
                  </div>
                ))}
              </div>
              {/* Featured item */}
              <div className="mx-2 mb-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}>
                <div className="text-xs font-bold text-gastro-text" style={{ fontSize: '10px' }}>🔥 Más pedido</div>
                <div className="text-xs text-gastro-subtle" style={{ fontSize: '9px' }}>Pasta carbonara · $1.800</div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <button className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(158,127,255,0.12)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                <QrCode size={12} /> QR de descarga
              </button>
              <button className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}>
                <Share2 size={12} /> Compartir
              </button>
            </div>
          </div>

          {/* Active orders */}
          <div className="lg:col-span-2 card-gastro">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gastro-text">Pedidos activos</h3>
              <button onClick={() => setActiveTab('orders')}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: '#9E7FFF' }}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {activeOrders.map(order => {
                const st = STATUS_CFG[order.status]
                const ch = CHANNEL_CFG[order.channel]
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: st.bg }}>
                      {order.status === 'delivering' ? '🛵' : order.status === 'preparing' ? '👨‍🍳' : order.status === 'ready' ? '✅' : '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gastro-text text-sm">{order.customer}</span>
                        <span className="text-xs">{ch.emoji}</span>
                      </div>
                      <div className="text-xs text-gastro-subtle truncate">{order.items}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-gastro-text text-sm">${order.total.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: st.color }}>{st.label}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gastro-subtle flex-shrink-0">
                      <Clock size={10} />
                      {order.time}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Channels */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Canales de venta</h3>
            <div className="space-y-3">
              {[
                { name: 'App GastroGo', emoji: '📱', orders: 48, revenue: 124000, active: true, color: '#9E7FFF' },
                { name: 'Web propia', emoji: '🌐', orders: 31, revenue: 87000, active: true, color: '#38bdf8' },
                { name: 'WhatsApp', emoji: '💬', orders: 18, revenue: 52000, active: true, color: '#10b981' },
                { name: 'PedidosYa', emoji: '🟡', orders: 24, revenue: 68000, active: false, color: '#f59e0b' },
                { name: 'Rappi', emoji: '����', orders: 19, revenue: 54000, active: false, color: '#f472b6' },
              ].map(ch => (
                <div key={ch.name} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gastro-text">{ch.name}</div>
                    <div className="text-xs text-gastro-subtle">{ch.orders} pedidos · ${(ch.revenue / 1000).toFixed(0)}K</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0`}
                    style={{ background: ch.active ? '#10b981' : '#4a4a6a' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Promo banner */}
          <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.1), rgba(56,189,248,0.06))', border: '1px solid rgba(158,127,255,0.25)' }}>
            <div className="absolute right-0 top-0 w-48 h-48 opacity-10"
              style={{ background: 'radial-gradient(circle, #9E7FFF, transparent)', transform: 'translate(20%, -20%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} style={{ color: '#9E7FFF' }} />
                <span className="font-bold text-gastro-text">Sin comisiones de terceros</span>
              </div>
              <p className="text-sm text-gastro-subtle mb-4">
                Con GastroGo tenés tu propio canal de delivery. Ahorrás hasta un <strong className="text-gastro-text">30% en comisiones</strong> comparado con PedidosYa o Rappi.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Ahorro estimado', value: '$48.000/mes', color: '#10b981' },
                  { label: 'Comisión GastroGo', value: '0%', color: '#9E7FFF' },
                  { label: 'Comisión promedio 3ros', value: '25-30%', color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gastro-subtle">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            {Object.entries(STATUS_CFG).map(([key, cfg]) => {
              const count = orders.filter(o => o.status === key).length
              return (
                <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs font-black" style={{ color: cfg.color }}>{count}</span>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            {orders.map(order => {
              const st = STATUS_CFG[order.status]
              const ch = CHANNEL_CFG[order.channel]
              return (
                <div key={order.id} className="card-gastro flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: st.bg }}>
                    {order.status === 'delivering' ? '🛵' : order.status === 'preparing' ? '👨‍🍳' : order.status === 'ready' ? '✅' : order.status === 'delivered' ? '🎉' : '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gastro-text">{order.customer}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                        style={{ background: ch.color + '15', color: ch.color }}>
                        {ch.emoji} {ch.label}
                      </span>
                      <span className="text-xs text-gastro-muted">{order.id}</span>
                    </div>
                    <div className="text-sm text-gastro-subtle">{order.items}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-gastro-text">${order.total.toLocaleString()}</div>
                    <div className="text-xs px-2 py-0.5 rounded-lg font-semibold inline-block"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gastro-subtle flex-shrink-0">
                    <Clock size={11} /> {order.time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DELIVERY ZONES ── */}
      {activeTab === 'delivery' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gastro-text">Zonas de cobertura</h3>
              <button className="btn-primary text-xs px-3 py-2"><Plus size={13} /> Nueva zona</button>
            </div>
            {zones.map(zone => (
              <div key={zone.id} className="card-gastro flex items-center gap-4"
                style={{ border: `1px solid ${zone.active ? 'rgba(158,127,255,0.25)' : '#2a2a3d'}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: zone.active ? 'rgba(158,127,255,0.12)' : 'rgba(255,255,255,0.04)' }}>
                  <MapPin size={18} style={{ color: zone.active ? '#9E7FFF' : '#4a4a6a' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gastro-text text-sm">{zone.name}</div>
                  <div className="text-xs text-gastro-subtle">Radio: {zone.radius} · Mínimo: ${zone.minOrder.toLocaleString()}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gastro-text">${zone.fee}</div>
                  <div className="text-xs text-gastro-subtle">costo envío</div>
                </div>
                <button onClick={() => toggleZone(zone.id)} className="flex-shrink-0">
                  {zone.active
                    ? <ToggleRight size={24} style={{ color: '#10b981' }} />
                    : <ToggleLeft size={24} style={{ color: '#4a4a6a' }} />
                  }
                </button>
              </div>
            ))}
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Configuración de delivery</h3>
            <div className="space-y-4">
              {[
                { label: 'Tiempo estimado de entrega', value: '25-35 min', icon: Timer },
                { label: 'Pedido mínimo general', value: '$2.500', icon: DollarSign },
                { label: 'Repartidores activos', value: '3 de 5', icon: Bike },
                { label: 'Horario de delivery', value: '12:00 - 23:30', icon: Clock },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                    <div className="flex items-center gap-3">
                      <Icon size={16} style={{ color: '#9E7FFF' }} />
                      <span className="text-sm text-gastro-subtle">{item.label}</span>
                    </div>
                    <span className="font-bold text-gastro-text text-sm">{item.value}</span>
                  </div>
                )
              })}

              <div className="pt-2">
                <button className="w-full py-3 rounded-xl text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.15), rgba(56,189,248,0.1))', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                  <Settings size={14} className="inline mr-2" /> Configuración avanzada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── APP CONFIG ── */}
      {activeTab === 'app' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Secciones de la app</h3>
            <div className="space-y-2">
              {sections.map(section => (
                <div key={section.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: section.active ? 'rgba(158,127,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${section.active ? 'rgba(158,127,255,0.2)' : '#2a2a3d'}` }}>
                  <span className="text-xl">{section.icon}</span>
                  <span className="flex-1 text-sm font-semibold text-gastro-text">{section.label}</span>
                  <button onClick={() => toggleSection(section.id)}>
                    {section.active
                      ? <ToggleRight size={22} style={{ color: '#10b981' }} />
                      : <ToggleLeft size={22} style={{ color: '#4a4a6a' }} />
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-4">Personalización visual</h3>
              <div className="space-y-3">
                {[
                  { label: 'Logo del restaurante', status: 'Configurado', color: '#10b981' },
                  { label: 'Colores de marca', status: 'Configurado', color: '#10b981' },
                  { label: 'Foto de portada', status: 'Configurado', color: '#10b981' },
                  { label: 'Descripción y horarios', status: 'Configurado', color: '#10b981' },
                  { label: 'Fotos de platos', status: '12 pendientes', color: '#f59e0b' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gastro-subtle">{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-gastro">
              <h3 className="font-bold text-gastro-text mb-4">Notificaciones push</h3>
              <div className="space-y-3">
                {[
                  { label: 'Confirmación de pedido', active: true },
                  { label: 'Pedido en preparación', active: true },
                  { label: 'Pedido en camino', active: true },
                  { label: 'Promociones y ofertas', active: false },
                  { label: 'Recordatorio de reserva', active: true },
                ].map(notif => (
                  <div key={notif.label} className="flex items-center justify-between">
                    <span className="text-sm text-gastro-subtle">{notif.label}</span>
                    <div className="w-8 h-4 rounded-full relative cursor-pointer"
                      style={{ background: notif.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)' }}>
                      <div className="w-3 h-3 rounded-full absolute top-0.5 transition-all"
                        style={{ background: notif.active ? '#10b981' : '#4a4a6a', left: notif.active ? '18px' : '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Pedidos por canal (este mes)</h3>
            <div className="space-y-3">
              {[
                { label: 'App GastroGo', value: 312, total: 580, color: '#9E7FFF', emoji: '📱' },
                { label: 'Web propia', value: 168, total: 580, color: '#38bdf8', emoji: '🌐' },
                { label: 'WhatsApp', value: 100, total: 580, color: '#10b981', emoji: '💬' },
              ].map(ch => (
                <div key={ch.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{ch.emoji}</span>
                      <span className="text-sm text-gastro-text">{ch.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gastro-text">{ch.value} pedidos</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(ch.value / ch.total) * 100}%`, background: ch.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Métricas de la app</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Descargas totales', value: '4.284', color: '#9E7FFF' },
                { label: 'Usuarios activos/mes', value: '1.842', color: '#38bdf8' },
                { label: 'Tasa de conversión', value: '7.3%', color: '#10b981' },
                { label: 'Ticket promedio', value: '$3.840', color: '#f59e0b' },
                { label: 'Reseñas positivas', value: '94%', color: '#f472b6' },
                { label: 'Tiempo en app', value: '4.2 min', color: '#9E7FFF' },
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
            <h3 className="font-bold text-gastro-text mb-4">Facturación online — últimos 7 días</h3>
            <div className="flex items-end gap-2 h-32">
              {[42, 68, 55, 89, 74, 96, 81].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(val / 96) * 100}%`, background: `linear-gradient(to top, #9E7FFF, #38bdf8)`, opacity: i === 5 ? 1 : 0.5 }} />
                  <span className="text-xs text-gastro-subtle">
                    {['L','M','X','J','V','S','D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
