import { FINANCE_DATA } from '../data/mockData'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, PieChart, FileText, Download
} from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <p className="font-semibold text-gastro-text mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gastro-subtle">{p.name === 'income' ? 'Ingresos' : 'Gastos'}:</span>
            <span className="text-gastro-text font-semibold">${(p.value / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function GastroFinance() {
  const lastMonth = FINANCE_DATA.cashFlow[FINANCE_DATA.cashFlow.length - 1]
  const profit = lastMonth.income - lastMonth.expenses
  const margin = ((profit / lastMonth.income) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos del mes', value: `$${(lastMonth.income / 1000).toFixed(0)}K`, change: '+12.4%', positive: true, color: '#10b981', icon: TrendingUp },
          { label: 'Gastos totales', value: `$${(lastMonth.expenses / 1000).toFixed(0)}K`, change: '+5.2%', positive: false, color: '#ef4444', icon: TrendingDown },
          { label: 'Utilidad neta', value: `$${(profit / 1000).toFixed(0)}K`, change: '+18.7%', positive: true, color: '#9E7FFF', icon: DollarSign },
          { label: 'Margen neto', value: `${margin}%`, change: '+2.1pp', positive: true, color: '#38bdf8', icon: PieChart },
        ].map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}18` }}>
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${kpi.positive ? 'text-success' : 'text-error'}`}
                  style={{ background: kpi.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {kpi.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-2xl font-black text-gastro-text">{kpi.value}</div>
              <div className="text-xs text-gastro-subtle">{kpi.label}</div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cash flow */}
        <div className="lg:col-span-2 card-gastro">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gastro-text">Flujo de caja</h3>
              <p className="text-xs text-gastro-subtle">Últimos 6 meses</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-2">
              <Download size={13} /> Exportar
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={FINANCE_DATA.cashFlow} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#9E7FFF" radius={[4, 4, 0, 0]} name="income" />
              <Bar dataKey="expenses" fill="#2a2a3d" radius={[4, 4, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="card-gastro">
          <h3 className="font-bold text-gastro-text mb-1">Estructura de costos</h3>
          <p className="text-xs text-gastro-subtle mb-4">Distribución del mes</p>
          <div className="space-y-3">
            {FINANCE_DATA.expenses.map((exp, i) => {
              const colors = ['#9E7FFF', '#38bdf8', '#f472b6', '#f59e0b', '#10b981', '#8888aa']
              return (
                <div key={exp.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gastro-subtle">{exp.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gastro-text">${(exp.amount / 1000).toFixed(0)}K</span>
                      <span className="text-xs text-gastro-subtle">{exp.percentage}%</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${exp.percentage * 2.5}%`, background: colors[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card-gastro">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gastro-text">Movimientos recientes</h3>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs px-3 py-2"><FileText size={13} /> Ver cierre</button>
            <button className="btn-primary text-xs px-3 py-2"><CreditCard size={13} /> Nuevo movimiento</button>
          </div>
        </div>
        <table className="table-gastro">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Canal</th>
              <th>Fecha</th>
              <th className="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {[
              { desc: 'Ventas salón — Turno noche', cat: 'Ingreso', channel: 'Salón', date: 'Hoy 23:45', amount: 284500, positive: true },
              { desc: 'Ventas delivery Uber Eats', cat: 'Ingreso', channel: 'Uber Eats', date: 'Hoy 22:00', amount: 68200, positive: true },
              { desc: 'Compra Carnes Premium SA', cat: 'Materia Prima', channel: '—', date: 'Hoy 10:00', amount: -280000, positive: false },
              { desc: 'Nómina semanal cocina', cat: 'Personal', channel: '—', date: 'Ayer', amount: -178000, positive: false },
              { desc: 'Ventas take away', cat: 'Ingreso', channel: 'Take Away', date: 'Ayer 20:30', amount: 42800, positive: true },
              { desc: 'Servicio de gas', cat: 'Servicios', channel: '—', date: 'Hace 2 días', amount: -18500, positive: false },
            ].map((tx, i) => (
              <tr key={i}>
                <td className="font-semibold text-gastro-text">{tx.desc}</td>
                <td><span className="badge badge-primary text-xs">{tx.cat}</span></td>
                <td className="text-gastro-subtle text-xs">{tx.channel}</td>
                <td className="text-gastro-subtle text-xs">{tx.date}</td>
                <td className={`text-right font-bold ${tx.positive ? 'text-success' : 'text-error'}`}>
                  {tx.positive ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
