import { useMemo, useState } from 'react'
import {
  CLIENTS, CLIENT_AI_INSIGHTS, TIER_CONFIG, DIETARY_LABELS,
  type Client, type ClientTier,
} from '../data/clients'
import { formatCurrency } from '../lib/locale'
import {
  Users, Search, Plus, Filter, Crown, Star, TrendingUp,
  Mail, Phone, MapPin, Calendar, Heart, ShoppingBag,
  ChevronRight, X, Sparkles, AlertTriangle, Gift, MessageSquare,
  Clock, Utensils, Wine, Tag, BarChart3, Send, UserPlus, Contact,
} from 'lucide-react'

const CHANNEL_LABELS: Record<string, string> = {
  salon: 'Salón',
  delivery: 'Delivery',
  takeaway: 'Take Away',
  reserva: 'Reserva',
}

const STATUS_LABELS = {
  active: { label: 'Activo', color: '#10b981' },
  inactive: { label: 'Inactivo', color: '#8899BB' },
  blocked: { label: 'Bloqueado', color: '#ef4444' },
}

function ClientDetailModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'visits' | 'orders' | 'notes'>('overview')
  const tier = TIER_CONFIG[client.tier]
  const status = STATUS_LABELS[client.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col animate-scale-in"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-start gap-4" style={{ borderColor: '#1A2540' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
            {client.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gastro-text">{client.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold" style={{ background: tier.bg, color: tier.color }}>
                {client.tier}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ color: status.color, background: `${status.color}18` }}>
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gastro-subtle">
              <span className="flex items-center gap-1"><Mail size={11} />{client.email}</span>
              <span className="flex items-center gap-1"><Phone size={11} />{client.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{client.location}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-gastro-muted">
            <X size={16} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 border-b" style={{ borderColor: '#1A2540' }}>
          {[
            { label: 'Total gastado', value: formatCurrency(client.totalSpent) },
            { label: 'Visitas', value: client.totalVisits.toString() },
            { label: 'Ticket promedio', value: formatCurrency(client.avgTicket) },
            { label: 'Puntos', value: client.loyaltyPoints.toLocaleString('es-CL') },
          ].map(kpi => (
            <div key={kpi.label} className="text-center">
              <div className="text-sm font-bold text-gastro-text">{kpi.value}</div>
              <div className="text-xs text-gastro-subtle">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b" style={{ borderColor: '#1A2540' }}>
          {(['overview', 'visits', 'orders', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}>
              {t === 'overview' ? 'Perfil' : t === 'visits' ? 'Visitas' : t === 'orders' ? 'Consumo' : 'Notas'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'overview' && (
            <>
              {client.churnRisk === 'high' && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle size={16} className="text-error flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-error">Riesgo de abandono alto</div>
                    <div className="text-xs text-gastro-subtle mt-0.5">Sin visitas desde {client.lastVisit}. Considera enviar campaña de reactivación.</div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <h4 className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Heart size={12} /> Preferencias
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div><span className="text-gastro-subtle">Canal preferido:</span> <span className="text-gastro-text font-medium">{CHANNEL_LABELS[client.preferredChannel]}</span></div>
                    {client.drinkPreference && (
                      <div className="flex items-start gap-1.5"><Wine size={11} className="text-gastro-muted mt-0.5" /><span className="text-gastro-text">{client.drinkPreference}</span></div>
                    )}
                    {client.seatingPreference && (
                      <div className="text-gastro-text">{client.seatingPreference}</div>
                    )}
                    {client.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {client.dietaryTags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                            {DIETARY_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    )}
                    {client.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {client.allergies.map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                            ⚠ {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <h4 className="text-xs font-bold text-gastro-subtle uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Utensils size={12} /> Platos favoritos
                  </h4>
                  <div className="space-y-1.5">
                    {client.favoriteDishes.map(dish => (
                      <div key={dish} className="flex items-center gap-2 text-xs text-gastro-text">
                        <Star size={10} className="text-warning flex-shrink-0" />
                        {dish}
                      </div>
                    ))}
                  </div>
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t" style={{ borderColor: '#1A2540' }}>
                      {client.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
                          style={{ background: 'rgba(37,99,235,0.1)', color: '#60A5FA' }}>
                          <Tag size={9} />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="text-gastro-subtle">Primera visita</div>
                  <div className="font-semibold text-gastro-text mt-0.5">{client.firstVisit}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="text-gastro-subtle">Última visita</div>
                  <div className="font-semibold text-gastro-text mt-0.5">{client.lastVisit}</div>
                </div>
                {client.npsScore !== undefined && (
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="text-gastro-subtle">NPS</div>
                    <div className="font-semibold text-gastro-text mt-0.5">{client.npsScore}/10</div>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'visits' && (
            <div className="space-y-3">
              {client.visits.length === 0 ? (
                <p className="text-xs text-gastro-subtle text-center py-8">Sin visitas registradas</p>
              ) : client.visits.map(visit => (
                <div key={visit.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,235,0.1)' }}>
                    <Calendar size={16} className="text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gastro-text">{visit.date}</div>
                    <div className="text-xs text-gastro-subtle">
                      {CHANNEL_LABELS[visit.channel]} · {visit.guests} comensales
                      {visit.table && ` · ${visit.table}`}
                      {visit.waiter && ` · ${visit.waiter}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gastro-text">{formatCurrency(visit.total)}</div>
                    {visit.rating && (
                      <div className="flex items-center gap-0.5 justify-end mt-0.5">
                        {Array.from({ length: visit.rating }).map((_, i) => (
                          <Star key={i} size={9} className="text-warning fill-warning" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              {client.orders.length === 0 ? (
                <p className="text-xs text-gastro-subtle text-center py-8">Sin pedidos detallados</p>
              ) : client.orders.map(order => (
                <div key={order.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gastro-text">{order.date}</div>
                      <div className="text-xs text-gastro-subtle">{order.channel}</div>
                    </div>
                    <div className="text-sm font-bold text-gastro-text">{formatCurrency(order.total)}</div>
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gastro-text">{item.qty}× {item.name}</span>
                        <span className="text-gastro-subtle">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-3">
              {client.notes.length === 0 ? (
                <p className="text-xs text-gastro-subtle text-center py-8">Sin notas registradas</p>
              ) : client.notes.map(note => (
                <div key={note.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gastro-text">{note.author}</span>
                    <span className="text-xs text-gastro-subtle">{note.date}</span>
                  </div>
                  <p className="text-xs text-gastro-subtle leading-relaxed">{note.text}</p>
                </div>
              ))}
              <button className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-2">
                <MessageSquare size={13} /> Agregar nota
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: '#1A2540' }}>
          <button className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-2">
            <Send size={13} /> Enviar campaña
          </button>
          <button className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-2">
            <Gift size={13} /> Canjear puntos
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GastroClients() {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<ClientTier | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return CLIENTS.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      const matchTier = tierFilter === 'all' || c.tier === tierFilter
      return matchSearch && matchTier
    })
  }, [search, tierFilter])

  const stats = useMemo(() => ({
    total: CLIENTS.length,
    active: CLIENTS.filter(c => c.status === 'active').length,
    vip: CLIENTS.filter(c => c.tier === 'VIP').length,
    avgVisits: Math.round(CLIENTS.reduce((s, c) => s + c.totalVisits, 0) / CLIENTS.length),
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Contact size={20} className="text-primary-400" />
            <h2 className="text-xl font-black text-gastro-text">GastroClients</h2>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '9px' }}>
              NEW
            </span>
          </div>
          <p className="text-sm text-gastro-subtle max-w-2xl">
            CRM con historial de visitas, consumo, preferencias alimentarias, segmentación y campañas de marketing.
          </p>
        </div>
        <button className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5">
          <UserPlus size={14} /> Nuevo cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total clientes', value: stats.total.toString(), color: '#60A5FA', icon: Users },
          { label: 'Activos', value: stats.active.toString(), color: '#10b981', icon: TrendingUp },
          { label: 'VIP', value: stats.vip.toString(), color: '#2563EB', icon: Crown },
          { label: 'Visitas promedio', value: stats.avgVisits.toString(), color: '#f59e0b', icon: BarChart3 },
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

      {/* AI Insights */}
      <div className="card-gastro">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary-400" />
          <h3 className="font-bold text-gastro-text">Insights IA — Clientes</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {CLIENT_AI_INSIGHTS.map(insight => (
            <div key={insight.id} className="p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
              <div className="text-sm font-semibold text-gastro-text mb-1">{insight.title}</div>
              <p className="text-xs text-gastro-subtle leading-relaxed mb-3">{insight.description}</p>
              <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                {insight.action} →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client list */}
        <div className="lg:col-span-2 card-gastro">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h3 className="font-bold text-gastro-text">Directorio de clientes</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-8 pr-3 py-2 rounded-lg text-xs outline-none w-56"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2540', color: '#E8F0FF' }}
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-500/20 text-primary-400' : 'text-gastro-subtle hover:bg-white/5'}`}
                style={{ border: '1px solid #1A2540' }}>
                <Filter size={14} />
              </button>
              <button className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
                <UserPlus size={13} /> Nuevo cliente
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b" style={{ borderColor: '#1A2540' }}>
              {(['all', 'VIP', 'Frecuente', 'Regular', 'Nuevo', 'Inactivo'] as const).map(tier => (
                <button key={tier} onClick={() => setTierFilter(tier)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${tierFilter === tier ? 'bg-primary-500/20 text-primary-400' : 'text-gastro-subtle hover:bg-white/5'}`}
                  style={{ border: '1px solid #1A2540' }}>
                  {tier === 'all' ? 'Todos' : tier}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {filtered.map((client, i) => {
              const tier = TIER_CONFIG[client.tier]
              return (
                <button key={client.id} onClick={() => setSelectedClient(client)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-black text-gastro-muted w-4">{i + 1}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
                    {client.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gastro-text text-sm">{client.name}</div>
                    <div className="text-xs text-gastro-subtle flex items-center gap-2 flex-wrap">
                      <span>{client.totalVisits} visitas</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{client.lastVisit}</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-bold text-gastro-text text-sm">{formatCurrency(client.totalSpent)}</div>
                    <div className="text-xs text-gastro-subtle">total gastado</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: tier.bg }}>
                    <span className="text-xs font-bold" style={{ color: tier.color }}>{client.tier}</span>
                  </div>
                  {client.churnRisk === 'high' && (
                    <AlertTriangle size={14} className="text-error flex-shrink-0" />
                  )}
                  <ChevronRight size={14} className="text-gastro-muted flex-shrink-0" />
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gastro-subtle text-center py-8">No se encontraron clientes</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Segmentos</h3>
            <div className="space-y-2">
              {(Object.keys(TIER_CONFIG) as ClientTier[]).map(tier => {
                const count = CLIENTS.filter(c => c.tier === tier).length
                const cfg = TIER_CONFIG[tier]
                return (
                  <button key={tier} onClick={() => setTierFilter(tier)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-xs font-semibold text-gastro-text">{tier}</span>
                    </div>
                    <span className="text-xs text-gastro-subtle">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
              <ShoppingBag size={14} /> Top consumo
            </h3>
            <div className="space-y-3">
              {[...CLIENTS].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map((c, i) => (
                <button key={c.id} onClick={() => setSelectedClient(c)}
                  className="w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors text-left">
                  <span className="text-xs font-black text-gastro-muted w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gastro-text truncate">{c.name}</div>
                    <div className="text-xs text-gastro-subtle">{c.totalVisits} visitas</div>
                  </div>
                  <div className="text-xs font-bold text-gastro-text">{formatCurrency(c.totalSpent)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-primary-400" />
              <span className="text-xs font-bold text-primary-400">Campañas activas</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Reactivación inactivos', sent: 12, opened: 8 },
                { name: 'Cumpleaños VIP', sent: 3, opened: 3 },
              ].map(c => (
                <div key={c.name} className="text-xs">
                  <div className="text-gastro-text font-medium">{c.name}</div>
                  <div className="text-gastro-subtle">{c.sent} enviados · {c.opened} abiertos</div>
                </div>
              ))}
            </div>
            <button className="btn-primary w-full text-xs py-2 mt-3 flex items-center justify-center gap-1.5">
              <Plus size={12} /> Nueva campaña
            </button>
          </div>
        </div>
      </div>

      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  )
}
