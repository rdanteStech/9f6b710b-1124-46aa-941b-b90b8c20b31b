import { AI_INSIGHTS, REVENUE_DATA, TOP_PRODUCTS } from '../data/mockData'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import {
  Brain, Zap, TrendingUp, AlertTriangle, CheckCircle,
  ArrowUpRight, Sparkles, BarChart3, Target, ChevronRight
} from 'lucide-react'

const RADAR_DATA = [
  { subject: 'Rentabilidad', A: 82, fullMark: 100 },
  { subject: 'Eficiencia', A: 74, fullMark: 100 },
  { subject: 'Satisfacción', A: 94, fullMark: 100 },
  { subject: 'Ocupación', A: 78, fullMark: 100 },
  { subject: 'Rotación', A: 68, fullMark: 100 },
  { subject: 'Crecimiento', A: 86, fullMark: 100 },
]

const PRIORITY_CONFIG = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Urgente' },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Alta' },
  medium: { color: '#3399FF', bg: 'rgba(51,153,255,0.1)', label: 'Media' },
  low: { color: '#8899BB', bg: 'rgba(136,136,170,0.1)', label: 'Baja' },
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        <p className="font-semibold text-gastro-text mb-1">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="text-gastro-subtle">
            ${(p.value / 1000).toFixed(0)}K
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function GastroInsight() {
  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(51,153,255,0.06) 100%)', border: '1px solid rgba(0,102,255,0.25)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20"
          style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0066FF, #0052cc)', boxShadow: '0 0 30px rgba(0,102,255,0.4)' }}>
            <Brain size={26} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-gastro-text">GastroBrain Analytics</h2>
              <span className="badge badge-primary text-xs">AI</span>
            </div>
            <p className="text-sm text-gastro-subtle">
              Analizando 3.842 pedidos, 84 productos y 6 canales de venta. Última actualización: hace 2 minutos.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-success">Procesando en tiempo real</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-primary-400" />
          Insights y recomendaciones
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {AI_INSIGHTS.map(insight => {
            const cfg = PRIORITY_CONFIG[insight.priority as keyof typeof PRIORITY_CONFIG]
            return (
              <div key={insight.id} className="card-gastro cursor-pointer group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    {insight.priority === 'urgent' || insight.priority === 'high'
                      ? <AlertTriangle size={15} style={{ color: cfg.color }} />
                      : <Zap size={15} style={{ color: cfg.color }} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-gastro-text text-sm">{insight.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-gastro-subtle leading-relaxed mb-4">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-success">{insight.impact}</span>
                  <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                    {insight.action} <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 card-gastro">
          <h3 className="font-bold text-gastro-text mb-1">Tendencia de ingresos</h3>
          <p className="text-xs text-gastro-subtle mb-4">Con proyección IA para los próximos 3 días</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[...REVENUE_DATA, { day: 'Lun+', revenue: 720000, orders: 280, target: 650000 }, { day: 'Mar+', revenue: 680000, orders: 265, target: 620000 }]}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2.5} fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance radar */}
        <div className="card-gastro">
          <h3 className="font-bold text-gastro-text mb-1">Performance 360°</h3>
          <p className="text-xs text-gastro-subtle mb-4">Índice de salud del negocio</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#1A2540" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8899BB', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#0066FF" fill="#0066FF" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product performance */}
      <div className="card-gastro">
        <h3 className="font-bold text-gastro-text mb-4">Análisis de productos — Matriz BCG</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '⭐ Estrellas', desc: 'Alta rotación + alto margen', products: ['Risotto de Hongos', 'Tiramisú Artesanal'], color: '#10b981' },
            { label: '🐄 Vacas', desc: 'Alta rotación + margen medio', products: ['Pizza Margherita', 'Lomo a la Pimienta'], color: '#3399FF' },
            { label: '❓ Interrogantes', desc: 'Baja rotación + alto margen', products: ['Burrata con Tomates'], color: '#f59e0b' },
            { label: '🐕 Perros', desc: 'Baja rotación + bajo margen', products: ['Ceviche Clásico'], color: '#ef4444' },
          ].map(quadrant => (
            <div key={quadrant.label} className="p-4 rounded-xl"
              style={{ background: `${quadrant.color}08`, border: `1px solid ${quadrant.color}25` }}>
              <div className="font-bold text-sm mb-1" style={{ color: quadrant.color }}>{quadrant.label}</div>
              <div className="text-xs text-gastro-subtle mb-3">{quadrant.desc}</div>
              <div className="space-y-1">
                {quadrant.products.map(p => (
                  <div key={p} className="text-xs text-gastro-text px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
