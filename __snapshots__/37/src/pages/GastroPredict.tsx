import { useState } from 'react'
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Zap,
  Package, Users, DollarSign, Clock, ChevronRight,
  BarChart3, Target, Sparkles, ArrowUpRight, ArrowDownRight,
  Thermometer, CloudRain, Sun, Wind, Calendar, RefreshCw,
  ShoppingCart, Truck, Star, Activity, Eye, Bell,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type ForecastDay = {
  day: string
  date: string
  predicted: number
  lower: number
  upper: number
  actual?: number
  weather: 'sun' | 'cloud' | 'rain'
  events: string[]
  confidence: number
}

type StockAlert = {
  id: string
  product: string
  category: string
  currentStock: number
  predictedNeed: number
  daysUntilOut: number
  urgency: 'critical' | 'warning' | 'info'
  suggestedOrder: number
  unit: string
}

type DemandProduct = {
  name: string
  category: string
  trend: 'up' | 'down' | 'stable'
  trendPct: number
  predictedSales: number
  color: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const FORECAST_DAYS: ForecastDay[] = [
  { day: 'Lun', date: '21 Jul', predicted: 580000, lower: 520000, upper: 640000, actual: 612000, weather: 'sun', events: [], confidence: 91 },
  { day: 'Mar', date: '22 Jul', predicted: 540000, lower: 480000, upper: 600000, actual: 528000, weather: 'cloud', events: [], confidence: 88 },
  { day: 'Mié', date: '23 Jul', predicted: 620000, lower: 560000, upper: 680000, actual: undefined, weather: 'sun', events: ['Fútbol 21hs'], confidence: 85 },
  { day: 'Jue', date: '24 Jul', predicted: 590000, lower: 530000, upper: 650000, actual: undefined, weather: 'rain', events: [], confidence: 82 },
  { day: 'Vie', date: '25 Jul', predicted: 890000, lower: 820000, upper: 960000, actual: undefined, weather: 'sun', events: ['Show de jazz'], confidence: 87 },
  { day: 'Sáb', date: '26 Jul', predicted: 1050000, lower: 970000, upper: 1130000, actual: undefined, weather: 'sun', events: ['Evento privado 80 pax'], confidence: 90 },
  { day: 'Dom', date: '27 Jul', predicted: 780000, lower: 710000, upper: 850000, actual: undefined, weather: 'cloud', events: [], confidence: 84 },
]

const STOCK_ALERTS: StockAlert[] = [
  { id: 's1', product: 'Lomo vacuno', category: 'Carnes', currentStock: 4.2, predictedNeed: 12, daysUntilOut: 1, urgency: 'critical', suggestedOrder: 15, unit: 'kg' },
  { id: 's2', product: 'Salmón fresco', category: 'Pescados', currentStock: 2.8, predictedNeed: 6, daysUntilOut: 1, urgency: 'critical', suggestedOrder: 8, unit: 'kg' },
  { id: 's3', product: 'Harina 000', category: 'Secos', currentStock: 8, predictedNeed: 15, daysUntilOut: 2, urgency: 'warning', suggestedOrder: 20, unit: 'kg' },
  { id: 's4', product: 'Vino Malbec', category: 'Bebidas', currentStock: 18, predictedNeed: 30, daysUntilOut: 2, urgency: 'warning', suggestedOrder: 24, unit: 'btl' },
  { id: 's5', product: 'Queso parmesano', category: 'Lácteos', currentStock: 3.5, predictedNeed: 5, daysUntilOut: 3, urgency: 'warning', suggestedOrder: 6, unit: 'kg' },
  { id: 's6', product: 'Aceite de oliva', category: 'Secos', currentStock: 6, predictedNeed: 8, daysUntilOut: 4, urgency: 'info', suggestedOrder: 12, unit: 'lt' },
]

const DEMAND_PRODUCTS: DemandProduct[] = [
  { name: 'Pasta carbonara', category: 'Pastas', trend: 'up', trendPct: 24, predictedSales: 48, color: '#9E7FFF' },
  { name: 'Risotto de hongos', category: 'Arroces', trend: 'up', trendPct: 18, predictedSales: 32, color: '#38bdf8' },
  { name: 'Tiramisú', category: 'Postres', trend: 'up', trendPct: 12, predictedSales: 41, color: '#10b981' },
  { name: 'Ceviche clásico', category: 'Entradas', trend: 'down', trendPct: -15, predictedSales: 12, color: '#ef4444' },
  { name: 'Lomo a la pimienta', category: 'Carnes', trend: 'stable', trendPct: 2, predictedSales: 28, color: '#f59e0b' },
  { name: 'Pizza margherita', category: 'Pizzas', trend: 'down', trendPct: -8, predictedSales: 22, color: '#f472b6' },
]

const HOURLY_DEMAND = [
  { hour: '12h', predicted: 18, actual: 22 },
  { hour: '13h', predicted: 42, actual: 38 },
  { hour: '14h', predicted: 56, actual: 61 },
  { hour: '15h', predicted: 28, actual: 25 },
  { hour: '16h', predicted: 12, actual: undefined },
  { hour: '17h', predicted: 8, actual: undefined },
  { hour: '18h', predicted: 22, actual: undefined },
  { hour: '19h', predicted: 48, actual: undefined },
  { hour: '20h', predicted: 72, actual: undefined },
  { hour: '21h', predicted: 84, actual: undefined },
  { hour: '22h', predicted: 68, actual: undefined },
  { hour: '23h', predicted: 34, actual: undefined },
]

const STAFF_PREDICTION = [
  { shift: 'Mediodía (12-16h)', predicted: 4, recommended: 5, reason: 'Evento corporativo 45 pax' },
  { shift: 'Tarde (16-20h)', predicted: 2, recommended: 2, reason: 'Flujo normal' },
  { shift: 'Noche (20-24h)', predicted: 6, recommended: 7, reason: 'Show de jazz + alta demanda viernes' },
]

const WEATHER_ICON = {
  sun: { icon: Sun, color: '#f59e0b', label: 'Soleado' },
  cloud: { icon: Wind, color: '#8888aa', label: 'Nublado' },
  rain: { icon: CloudRain, color: '#38bdf8', label: 'Lluvia' },
}

const URGENCY_CFG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Crítico', emoji: '🔴' },
  warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Alerta',  emoji: '🟡' },
  info:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', label: 'Info',    emoji: '🔵' },
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ForecastTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <p className="font-bold text-gastro-text mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gastro-subtle">{p.name}:</span>
            <span className="font-semibold text-gastro-text">${(p.value / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GastroPredict() {
  const [activeTab, setActiveTab] = useState<'demand' | 'stock' | 'staff' | 'revenue'>('demand')
  const [selectedDay, setSelectedDay] = useState<ForecastDay>(FORECAST_DAYS[2])

  const totalPredictedWeek = FORECAST_DAYS.reduce((s, d) => s + d.predicted, 0)
  const criticalAlerts = STOCK_ALERTS.filter(a => a.urgency === 'critical').length
  const avgConfidence = Math.round(FORECAST_DAYS.reduce((s, d) => s + d.confidence, 0) / FORECAST_DAYS.length)

  return (
    <div className="space-y-6">

      {/* AI Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(158,127,255,0.06) 50%, rgba(16,185,129,0.04) 100%)',
          border: '1px solid rgba(56,189,248,0.25)',
        }}>
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #9E7FFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #9E7FFF)', boxShadow: '0 0 30px rgba(56,189,248,0.4)' }}>
            <Brain size={26} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroPredict</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                🧠 IA Predictiva
              </span>
              {criticalAlerts > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-lg font-bold animate-pulse"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  ⚠️ {criticalAlerts} alertas críticas
                </span>
              )}
            </div>
            <p className="text-sm text-gastro-subtle">
              Predicción de demanda, stock y personal basada en historial, clima, eventos y patrones de comportamiento
            </p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-6 text-center flex-shrink-0">
            {[
              { value: `${avgConfidence}%`, label: 'Precisión IA' },
              { value: `$${(totalPredictedWeek / 1000000).toFixed(1)}M`, label: 'Predicción semana' },
              { value: `${criticalAlerts}`, label: 'Alertas críticas' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black" style={{ color: '#38bdf8' }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-day forecast strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gastro-text flex items-center gap-2">
            <Calendar size={16} style={{ color: '#38bdf8' }} />
            Pronóstico de demanda — próximos 7 días
          </h3>
          <div className="flex items-center gap-2 text-xs text-gastro-subtle">
            <RefreshCw size={11} />
            Actualizado hace 8 min
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {FORECAST_DAYS.map(day => {
            const wCfg = WEATHER_ICON[day.weather]
            const WIcon = wCfg.icon
            const isSelected = selectedDay.day === day.day
            const isPast = day.actual !== undefined
            return (
              <button key={day.day}
                onClick={() => setSelectedDay(day)}
                className="rounded-2xl p-3 flex flex-col items-center gap-2 transition-all duration-200"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(158,127,255,0.1))'
                    : 'rgba(255,255,255,0.02)',
                  border: isSelected
                    ? '1px solid rgba(56,189,248,0.4)'
                    : '1px solid #2a2a3d',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}>
                <span className="text-xs font-bold text-gastro-subtle">{day.day}</span>
                <WIcon size={16} style={{ color: wCfg.color }} />
                <div className="text-center">
                  <div className="text-sm font-black" style={{ color: isSelected ? '#38bdf8' : '#e0e0e0' }}>
                    ${(day.predicted / 1000).toFixed(0)}K
                  </div>
                  {isPast && day.actual && (
                    <div className="text-xs" style={{ color: day.actual >= day.predicted ? '#10b981' : '#ef4444' }}>
                      {day.actual >= day.predicted ? '▲' : '▼'} real
                    </div>
                  )}
                  {!isPast && (
                    <div className="text-xs text-gastro-muted">{day.confidence}%</div>
                  )}
                </div>
                {day.events.length > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f472b6' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.2)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-gastro-text">{selectedDay.day} {selectedDay.date} — Detalle predictivo</h4>
            <p className="text-xs text-gastro-subtle mt-0.5">
              Confianza del modelo: <span style={{ color: '#38bdf8' }}>{selectedDay.confidence}%</span>
              {selectedDay.events.length > 0 && (
                <> · Eventos: <span style={{ color: '#f472b6' }}>{selectedDay.events.join(', ')}</span></>
              )}
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Mínimo', value: `$${(selectedDay.lower / 1000).toFixed(0)}K`, color: '#ef4444' },
              { label: 'Predicción', value: `$${(selectedDay.predicted / 1000).toFixed(0)}K`, color: '#38bdf8' },
              { label: 'Máximo', value: `$${(selectedDay.upper / 1000).toFixed(0)}K`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'demand', label: '📈 Demanda de platos' },
          { id: 'stock',  label: `📦 Stock predictivo (${criticalAlerts} críticos)` },
          { id: 'staff',  label: '👥 Personal sugerido' },
          { id: 'revenue', label: '💰 Ingresos proyectados' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DEMAND TAB ── */}
      {activeTab === 'demand' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Hourly demand chart */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-1">Demanda por hora — hoy</h3>
            <p className="text-xs text-gastro-subtle mb-4">Pedidos predichos vs. reales (hasta ahora)</p>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={HOURLY_DEMAND} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#e0e0e0', fontWeight: 'bold' }}
                />
                <ReferenceLine x="16h" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Ahora', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="actual" name="Real" fill="#9E7FFF" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="predicted" name="Predicción" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Product demand */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Predicción por producto — mañana</h3>
            <div className="space-y-3">
              {DEMAND_PRODUCTS.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gastro-text truncate">{p.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {p.trend === 'up' && <ArrowUpRight size={13} style={{ color: '#10b981' }} />}
                        {p.trend === 'down' && <ArrowDownRight size={13} style={{ color: '#ef4444' }} />}
                        {p.trend === 'stable' && <Activity size={13} style={{ color: '#8888aa' }} />}
                        <span className="text-xs font-bold"
                          style={{ color: p.trend === 'up' ? '#10b981' : p.trend === 'down' ? '#ef4444' : '#8888aa' }}>
                          {p.trend === 'up' ? '+' : ''}{p.trendPct}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${(p.predictedSales / 84) * 100}%`, background: p.color }} />
                      </div>
                      <span className="text-xs text-gastro-subtle flex-shrink-0">{p.predictedSales} uds</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI factors */}
          <div className="lg:col-span-2 card-gastro">
            <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
              <Sparkles size={15} style={{ color: '#38bdf8' }} />
              Factores que influyen en la predicción
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Clima del viernes', value: 'Soleado 18°C', impact: '+12% demanda', color: '#f59e0b', icon: Sun },
                { label: 'Evento programado', value: 'Show de jazz 21hs', impact: '+28% noche', color: '#f472b6', icon: Star },
                { label: 'Historial viernes', value: 'Pico 20-22hs', impact: 'Patrón confirmado', color: '#9E7FFF', icon: BarChart3 },
                { label: 'Reservas activas', value: '34 confirmadas', impact: '+$180K garantizado', color: '#10b981', icon: Calendar },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="p-4 rounded-xl"
                    style={{ background: `${f.color}08`, border: `1px solid ${f.color}22` }}>
                    <Icon size={18} className="mb-2" style={{ color: f.color }} />
                    <div className="text-xs text-gastro-subtle mb-1">{f.label}</div>
                    <div className="text-sm font-bold text-gastro-text mb-1">{f.value}</div>
                    <div className="text-xs font-semibold" style={{ color: f.color }}>{f.impact}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STOCK TAB ── */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">
              El modelo predice el consumo de los próximos 3 días basado en la demanda proyectada
            </p>
            <button className="btn-primary text-sm px-4 py-2">
              <Truck size={13} /> Generar orden de compra
            </button>
          </div>

          {/* Critical alerts banner */}
          {criticalAlerts > 0 && (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} className="flex-shrink-0" />
              <div>
                <div className="font-bold text-gastro-text text-sm">
                  {criticalAlerts} ingredientes se agotarán mañana
                </div>
                <div className="text-xs text-gastro-subtle">
                  Basado en la demanda predicha para el viernes (show de jazz + alta ocupación)
                </div>
              </div>
              <button className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Ordenar ahora
              </button>
            </div>
          )}

          <div className="space-y-3">
            {STOCK_ALERTS.map(alert => {
              const cfg = URGENCY_CFG[alert.urgency]
              const stockPct = Math.min(100, (alert.currentStock / alert.predictedNeed) * 100)
              return (
                <div key={alert.id} className="card-gastro"
                  style={{ border: `1px solid ${cfg.color}22` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: cfg.bg }}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-gastro-text">{alert.product}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa' }}>
                          {alert.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gastro-subtle mb-2">
                        <span>Stock actual: <strong className="text-gastro-text">{alert.currentStock} {alert.unit}</strong></span>
                        <span>Necesidad predicha: <strong className="text-gastro-text">{alert.predictedNeed} {alert.unit}</strong></span>
                        <span style={{ color: cfg.color }}>Se agota en {alert.daysUntilOut} día{alert.daysUntilOut > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${stockPct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-gastro-text">Pedir {alert.suggestedOrder} {alert.unit}</div>
                      <button className="mt-1 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                        Ordenar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STAFF TAB ── */}
      {activeTab === 'staff' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gastro-text">Personal recomendado — viernes 25 Jul</h3>
            {STAFF_PREDICTION.map(shift => (
              <div key={shift.shift} className="card-gastro">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-gastro-text text-sm">{shift.shift}</div>
                    <div className="text-xs text-gastro-subtle mt-0.5">{shift.reason}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-black text-gastro-subtle">{shift.predicted}</div>
                      <div className="text-xs text-gastro-muted">actual</div>
                    </div>
                    <div className="text-gastro-muted">→</div>
                    <div className="text-center">
                      <div className="text-lg font-black" style={{ color: shift.recommended > shift.predicted ? '#f59e0b' : '#10b981' }}>
                        {shift.recommended}
                      </div>
                      <div className="text-xs text-gastro-muted">sugerido</div>
                    </div>
                  </div>
                </div>
                {shift.recommended > shift.predicted && (
                  <div className="flex items-center gap-2 p-2 rounded-xl text-xs"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle size={11} style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b' }}>
                      Se recomienda agregar {shift.recommended - shift.predicted} persona{shift.recommended - shift.predicted > 1 ? 's' : ''} más
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Carga de trabajo predicha por hora</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={HOURLY_DEMAND} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#e0e0e0', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="predicted" name="Pedidos predichos" stroke="#38bdf8" strokeWidth={2.5} fill="url(#staffGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(158,127,255,0.06)', border: '1px solid rgba(158,127,255,0.2)' }}>
              <span style={{ color: '#9E7FFF' }}>💡 IA sugiere:</span>
              <span className="text-gastro-subtle ml-1">
                Pico máximo entre 20-22hs. Asegurar 7 personas en sala + 2 en cocina para el show de jazz.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly forecast chart */}
          <div className="lg:col-span-2 card-gastro">
            <h3 className="font-bold text-gastro-text mb-1">Proyección de ingresos — 7 días</h3>
            <p className="text-xs text-gastro-subtle mb-4">Banda de confianza: mínimo / predicción / máximo</p>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={FORECAST_DAYS} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip content={<ForecastTooltip />} />
                <Area type="monotone" dataKey="upper" name="Máximo" stroke="transparent" fill="#38bdf822" />
                <Area type="monotone" dataKey="lower" name="Mínimo" stroke="transparent" fill="#0a0a0f" />
                <Line type="monotone" dataKey="predicted" name="Predicción" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} />
                <Line type="monotone" dataKey="actual" name="Real" stroke="#9E7FFF" strokeWidth={2.5} dot={{ fill: '#9E7FFF', r: 4 }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue breakdown */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Desglose predicho — esta semana</h3>
            <div className="space-y-3">
              {[
                { label: 'Salón (mesas)', value: 2100000, pct: 42, color: '#9E7FFF' },
                { label: 'Delivery propio', value: 980000, pct: 20, color: '#38bdf8' },
                { label: 'Take away', value: 450000, pct: 9, color: '#10b981' },
                { label: 'Eventos privados', value: 1180000, pct: 24, color: '#f472b6' },
                { label: 'Catering externo', value: 250000, pct: 5, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gastro-text">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gastro-subtle">{item.pct}%</span>
                      <span className="text-sm font-bold text-gastro-text">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#2a2a3d' }}>
              <span className="font-bold text-gastro-text">Total predicho</span>
              <span className="text-xl font-black" style={{ color: '#38bdf8' }}>$4.96M</span>
            </div>
          </div>

          {/* Accuracy history */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Precisión histórica del modelo</h3>
            <div className="space-y-3">
              {[
                { period: 'Última semana', accuracy: 91, deviation: '±4.2%' },
                { period: 'Últimas 2 semanas', accuracy: 88, deviation: '±5.8%' },
                { period: 'Último mes', accuracy: 86, deviation: '±6.1%' },
                { period: 'Últimos 3 meses', accuracy: 84, deviation: '±7.3%' },
              ].map(item => (
                <div key={item.period}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gastro-subtle">{item.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gastro-subtle">{item.deviation}</span>
                      <span className="text-sm font-bold" style={{ color: item.accuracy >= 88 ? '#10b981' : '#f59e0b' }}>
                        {item.accuracy}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${item.accuracy}%`, background: item.accuracy >= 88 ? '#10b981' : '#f59e0b' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ color: '#10b981' }}>✅ El modelo mejora continuamente</span>
              <span className="text-gastro-subtle ml-1">
                con cada semana de datos. Precisión +3% en los últimos 30 días.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
