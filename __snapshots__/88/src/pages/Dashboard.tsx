import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOCK_METRICS, REVENUE_DATA, CHANNEL_DATA, TOP_PRODUCTS, LIVE_ORDERS, AI_INSIGHTS } from '../data/mockData'
import { formatDate } from '../lib/locale'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Zap, Brain, AlertTriangle, CheckCircle, Clock, ChevronRight,
  DollarSign, ShoppingBag, Users, Star, Package, Sparkles, Contact
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  cooking: { label: 'Cocinando', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  ready: { label: 'Listo', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  delivered: { label: 'Entregado', color: '#8899BB', bg: 'rgba(136,136,170,0.15)' },
}

const INSIGHT_COLORS = {
  high: '#ef4444',
  urgent: '#ef4444',
  medium: '#f59e0b',
  low: '#8899BB',
}

const INSIGHT_ROUTES: Record<string, string> = {
  revenue: '/serve',
  stock: '/stock',
  demand: '/predict',
  menu: '/recipe',
}

function MetricCard({ metric, icon: Icon, color }: { metric: typeof MOCK_METRICS.revenue; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }) {
  const isPositive = metric.change > 0
  const formatted = metric.prefix === '$'
    ? `$${(metric.value / 1000).toFixed(0)}K`
    : `${metric.value}${metric.suffix}`

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'text-success' : 'text-error'}`}
          style={{ background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(metric.change)}%
        </div>
      </div>
      <div className="text-2xl font-black text-gastro-text mb-0.5">{formatted}</div>
      <div className="text-xs text-gastro-subtle">{metric.label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#0F1628', border: '1px solid #1A2540', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <p className="font-semibold text-gastro-text mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gastro-subtle">{p.name}:</span>
            <span className="text-gastro-text font-semibold">
              {p.name === 'revenue' || p.name === 'target' ? `$${(p.value / 1000).toFixed(0)}K` : p.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week')

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gastro-text">
            Buenas noches, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gastro-subtle mt-0.5">
            {user?.restaurant.name} · {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Operación activa
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard metric={MOCK_METRICS.revenue} icon={DollarSign} color="#10b981" />
        <MetricCard metric={MOCK_METRICS.orders} icon={ShoppingBag} color="#2563EB" />
        <MetricCard metric={MOCK_METRICS.avgTicket} icon={TrendingUp} color="#3B82F6" />
        <MetricCard metric={MOCK_METRICS.occupancy} icon={Users} color="#60A5FA" />
        <MetricCard metric={MOCK_METRICS.satisfaction} icon={Star} color="#f59e0b" />
        <MetricCard metric={MOCK_METRICS.foodCost} icon={Package} color="#f59e0b" />
      </div>

      <Link
        to="/clients"
        className="flex items-center justify-between gap-4 p-4 rounded-2xl transition-all hover:border-primary-500/30 group"
        style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(96,165,250,0.15)' }}>
            <Contact size={18} className="text-primary-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gastro-text group-hover:text-primary-300 transition-colors">GastroClients</h3>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '9px' }}>
                NEW
              </span>
            </div>
            <p className="text-xs text-gastro-subtle truncate">CRM con historial, consumo, preferencias y segmentación de clientes</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gastro-muted group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card-gastro">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gastro-text">Ingresos vs Objetivo</h3>
              <p className="text-xs text-gastro-subtle">Últimos 7 días</p>
            </div>
            <div className="flex gap-1">
              {(['week', 'month'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={activeTab === tab ? { background: 'rgba(37,99,235,0.15)' } : {}}>
                  {tab === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="target" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#targetGrad)" name="target" />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel distribution */}
        <div className="card-gastro">
          <h3 className="font-bold text-gastro-text mb-1">Canales de venta</h3>
          <p className="text-xs text-gastro-subtle mb-4">Distribución del mes</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {CHANNEL_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ background: '#0F1628', border: '1px solid #1A2540', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {CHANNEL_DATA.map(ch => (
              <div key={ch.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
                  <span className="text-xs text-gastro-subtle">{ch.name}</span>
                </div>
                <span className="text-xs font-bold text-gastro-text">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live orders */}
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gastro-text">Pedidos en vivo</h3>
              <p className="text-xs text-gastro-subtle">Actualizando en tiempo real</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="space-y-2">
            {LIVE_ORDERS.map(order => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs font-bold text-gastro-subtle w-12 flex-shrink-0">{order.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gastro-text truncate">{order.table}</div>
                    <div className="text-xs text-gastro-subtle">{order.items} items · {order.waiter}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {order.time !== '—' && (
                      <span className="text-xs text-gastro-subtle">{order.time}</span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gastro-text">Top productos</h3>
            <span className="text-xs text-gastro-subtle">Este mes</span>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-gastro-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gastro-text truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="progress-bar flex-1">
                      <div className="progress-fill" style={{ width: `${(p.orders / 284) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gastro-subtle flex-shrink-0">{p.orders}</span>
                  </div>
                </div>
                <div className="text-xs font-bold flex-shrink-0" style={{ color: p.margin > 70 ? '#10b981' : '#f59e0b' }}>
                  {p.margin}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-primary-400" />
              <h3 className="font-bold text-gastro-text">GastroBrain</h3>
            </div>
            <span className="badge badge-primary text-xs">AI</span>
          </div>
          <div className="space-y-3">
            {AI_INSIGHTS.map(insight => (
              <Link
                key={insight.id}
                to={INSIGHT_ROUTES[insight.type] ?? '/insight'}
                className="block p-3 rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary-500/20 transition-all group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                aria-label={`${insight.title} — ${insight.action}`}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: INSIGHT_COLORS[insight.priority as keyof typeof INSIGHT_COLORS] }} />
                  <p className="text-xs font-semibold text-gastro-text leading-tight group-hover:text-primary-300 transition-colors">
                    {insight.title}
                  </p>
                </div>
                <p className="text-xs text-gastro-subtle leading-relaxed pl-3.5 line-clamp-2">{insight.description}</p>
                <div className="flex items-center justify-between mt-2 pl-3.5">
                  <span className="text-xs font-semibold" style={{ color: '#10b981' }}>{insight.impact}</span>
                  <div className="flex items-center gap-1 text-gastro-muted group-hover:text-primary-400 transition-colors">
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      {insight.action}
                    </span>
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
