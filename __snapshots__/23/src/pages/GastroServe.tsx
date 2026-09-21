import { useState } from 'react'
import { TABLES_DATA, LIVE_ORDERS } from '../data/mockData'
import {
  UtensilsCrossed, Clock, Users, Plus, Search, Filter,
  CheckCircle, Bell, ChevronRight, Coffee, Wine
} from 'lucide-react'

const ZONES = ['Todos', 'Salón', 'Terraza', 'VIP', 'Barra']

const TABLE_STATUS_CONFIG = {
  available: { label: 'Disponible', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  occupied: { label: 'Ocupada', color: '#9E7FFF', bg: 'rgba(158,127,255,0.12)', border: 'rgba(158,127,255,0.3)' },
  reserved: { label: 'Reservada', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  cleaning: { label: 'Limpieza', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
}

const KDS_KITCHEN_TICKETS = [
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

const KDS_BAR_TICKETS = [
  {
    id: '#4821', table: 'Mesa 12', time: '3 min', status: 'making', priority: 'normal',
    items: [
      { name: 'Vino Tinto Copa', qty: 2, mods: ['Malbec Reserva'] },
      { name: 'Agua Mineral', qty: 2, mods: ['Con gas'] },
    ]
  },
  {
    id: '#4823', table: 'Mesa 5', time: '0 min', status: 'ready', priority: 'normal',
    items: [
      { name: 'Limonada Artesanal', qty: 3, mods: [] },
      { name: 'Café Espresso', qty: 1, mods: ['Doble'] },
    ]
  },
  {
    id: '#4825', table: 'Mesa 9', time: '5 min', status: 'making', priority: 'urgent',
    items: [
      { name: 'Cóctel Aperol Spritz', qty: 4, mods: [] },
      { name: 'Agua Mineral', qty: 4, mods: ['Sin gas'] },
    ]
  },
  {
    id: '#4827', table: 'Barra 2', time: '1 min', status: 'pending', priority: 'normal',
    items: [
      { name: 'Cerveza Artesanal IPA', qty: 2, mods: [] },
    ]
  },
]

export default function GastroServe() {
  const [activeZone, setActiveZone] = useState('Todos')
  const [activeView, setActiveView] = useState<'tables' | 'kds' | 'kds-bar' | 'orders'>('tables')

  const filteredTables = TABLES_DATA.filter(t => activeZone === 'Todos' || t.zone === activeZone)

  const stats = {
    available: TABLES_DATA.filter(t => t.status === 'available').length,
    occupied: TABLES_DATA.filter(t => t.status === 'occupied').length,
    reserved: TABLES_DATA.filter(t => t.status === 'reserved').length,
    total: TABLES_DATA.length,
  }

  const KDSTicketCard = ({ ticket, isBar = false }: { ticket: typeof KDS_KITCHEN_TICKETS[0]; isBar?: boolean }) => {
    const statusLabel = isBar
      ? (ticket.status === 'ready' ? 'Listo' : ticket.status === 'pending' ? 'Pendiente' : 'Preparando')
      : (ticket.status === 'ready' ? 'Listo' : ticket.status === 'pending' ? 'Pendiente' : 'Cocinando')

    const accentColor = isBar ? '#38bdf8' : '#9E7FFF'
    const readyColor = '#10b981'

    return (
      <div className={`kds-ticket ${ticket.status === 'ready' ? 'ready' : ticket.priority === 'urgent' ? 'urgent' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-gastro-text text-sm">{ticket.table}</div>
            <div className="text-xs text-gastro-subtle">{ticket.id}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-black ${parseInt(ticket.time) > 10 ? 'text-error' : parseInt(ticket.time) > 5 ? 'text-warning' : 'text-success'}`}>
              {ticket.time === '0 min' ? '✓ Listo' : ticket.time}
            </div>
            <div className="text-xs text-gastro-subtle">{statusLabel}</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {ticket.items.map((item, i) => (
            <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black w-5" style={{ color: accentColor }}>{item.qty}x</span>
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

        <button
          className="w-full py-2 rounded-xl text-xs font-bold transition-all"
          style={ticket.status === 'ready'
            ? { background: `rgba(16,185,129,0.15)`, border: `1px solid rgba(16,185,129,0.3)`, color: readyColor }
            : { background: `${accentColor}18`, border: `1px solid ${accentColor}44`, color: accentColor }}>
          {ticket.status === 'ready' ? '✓ Marcar entregado' : ticket.status === 'pending' ? 'Iniciar preparación' : 'Marcar como listo'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mesas disponibles', value: stats.available, color: '#10b981', icon: CheckCircle },
          { label: 'Mesas ocupadas', value: stats.occupied, color: '#9E7FFF', icon: Users },
          { label: 'Reservadas', value: stats.reserved, color: '#f59e0b', icon: Clock },
          { label: 'Pedidos activos', value: LIVE_ORDERS.filter(o => o.status !== 'delivered').length, color: '#38bdf8', icon: UtensilsCrossed },
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
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'tables', label: 'Mapa de mesas' },
          { id: 'kds', label: '🍳 KDS Cocina' },
          { id: 'kds-bar', label: '🍹 KDS Barra' },
          { id: 'orders', label: 'Pedidos' },
        ].map(view => (
          <button key={view.id}
            onClick={() => setActiveView(view.id as typeof activeView)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
            style={activeView === view.id
              ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
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
                  style={activeZone === zone ? { background: 'rgba(158,127,255,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
                  {zone}
                </button>
              ))}
            </div>
            <button className="btn-primary text-xs px-3 py-2">
              <Plus size={14} /> Nueva mesa
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredTables.map(table => {
              const cfg = TABLE_STATUS_CONFIG[table.status as keyof typeof TABLE_STATUS_CONFIG]
              return (
                <div key={table.id}
                  className="rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-105 text-center"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div className="text-lg font-black mb-1" style={{ color: cfg.color }}>{table.number}</div>
                  <div className="text-xs font-semibold mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
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

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t" style={{ borderColor: '#2a2a3d' }}>
            {Object.entries(TABLE_STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
                <span className="text-xs text-gastro-subtle">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KDS Cocina */}
      {activeView === 'kds' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-semibold text-gastro-text">🍳 Cocina en vivo</span>
              <span className="badge badge-primary text-xs">{KDS_KITCHEN_TICKETS.length} tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gastro-subtle" />
              <span className="text-xs text-gastro-subtle">Sonido activo</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KDS_KITCHEN_TICKETS.map(ticket => (
              <KDSTicketCard key={ticket.id} ticket={ticket} isBar={false} />
            ))}
          </div>
        </div>
      )}

      {/* KDS Barra */}
      {activeView === 'kds-bar' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38bdf8' }} />
              <span className="text-sm font-semibold text-gastro-text">🍹 Barra en vivo</span>
              <span className="badge text-xs" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                {KDS_BAR_TICKETS.length} tickets
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                <Wine size={13} />
                KDS Barra
              </div>
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gastro-subtle" />
                <span className="text-xs text-gastro-subtle">Sonido activo</span>
              </div>
            </div>
          </div>

          {/* Bar stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Pendientes', value: KDS_BAR_TICKETS.filter(t => t.status === 'pending').length, color: '#f59e0b' },
              { label: 'Preparando', value: KDS_BAR_TICKETS.filter(t => t.status === 'making').length, color: '#38bdf8' },
              { label: 'Listos', value: KDS_BAR_TICKETS.filter(t => t.status === 'ready').length, color: '#10b981' },
              { label: 'Urgentes', value: KDS_BAR_TICKETS.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card text-center py-3">
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KDS_BAR_TICKETS.map(ticket => (
              <KDSTicketCard key={ticket.id} ticket={ticket} isBar={true} />
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
              {LIVE_ORDERS.map(order => {
                const STATUS_CONFIG_LOCAL = {
                  pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                  cooking: { label: 'Cocinando', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
                  ready: { label: 'Listo', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                  delivered: { label: 'Entregado', color: '#8888aa', bg: 'rgba(136,136,170,0.15)' },
                }
                const cfg = STATUS_CONFIG_LOCAL[order.status as keyof typeof STATUS_CONFIG_LOCAL]
                return (
                  <tr key={order.id}>
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
                      <button className="text-gastro-subtle hover:text-gastro-text transition-colors">
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
    </div>
  )
}
