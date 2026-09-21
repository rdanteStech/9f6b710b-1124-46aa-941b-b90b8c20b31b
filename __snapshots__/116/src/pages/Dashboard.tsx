import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Utensils,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

const kpis = [
  { label: 'Ventas del día', value: '$8,429', change: '+12.5%', up: true, icon: DollarSign, color: 'indigo' },
  { label: 'Órdenes', value: '142', change: '+8.2%', up: true, icon: ShoppingBag, color: 'emerald' },
  { label: 'Clientes', value: '89', change: '+15.3%', up: true, icon: Users, color: 'violet' },
  { label: 'Mesas ocupadas', value: '18/24', change: '-2.1%', up: false, icon: Utensils, color: 'amber' },
];

const recentOrders = [
  { id: '#4521', table: 'Mesa 12', items: 4, total: '$142.50', status: 'Preparando', time: '5 min' },
  { id: '#4520', table: 'Mesa 08', items: 2, total: '$68.00', status: 'Servido', time: '12 min' },
  { id: '#4519', table: 'Barra 03', items: 6, total: '$215.75', status: 'Listo', time: '15 min' },
  { id: '#4518', table: 'Mesa 15', items: 3, total: '$95.20', status: 'Pagado', time: '22 min' },
  { id: '#4517', table: 'Mesa 04', items: 5, total: '$178.90', status: 'Preparando', time: '28 min' },
];

const topDishes = [
  { name: 'Risotto de Trufa', sales: 42, revenue: '$1,260', img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Salmón Teriyaki', sales: 38, revenue: '$1,140', img: 'https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Pasta Carbonara', sales: 35, revenue: '$875', img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Ribeye Steak', sales: 28, revenue: '$1,680', img: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const statusColors: Record<string, string> = {
  Preparando: 'bg-amber-50 text-amber-700 border-amber-200',
  Servido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Listo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Pagado: 'bg-slate-100 text-slate-700 border-slate-200',
};

const colorMap: Record<string, string> = {
  indigo: 'from-indigo-500 to-indigo-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
  amber: 'from-amber-500 to-amber-600',
};

export default function Dashboard() {
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Buenos días, Carlos</h1>
          <p className="text-slate-600 mt-1">Aquí está el resumen de hoy — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
          Ver reporte completo
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[kpi.color]} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    kpi.up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">{kpi.value}</div>
              <div className="text-sm text-slate-500 mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Órdenes recientes</h2>
              <p className="text-sm text-slate-500 mt-0.5">Últimas 5 órdenes procesadas</p>
            </div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">
              Ver todas
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 lg:px-6 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{order.id}</span>
                    <span className="text-sm text-slate-500">·</span>
                    <span className="text-sm text-slate-600">{order.table}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    hace {order.time} · {order.items} items
                  </div>
                </div>
                <span
                  className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 tabular-nums">{order.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Platos más vendidos</h2>
            <p className="text-sm text-slate-500 mt-0.5">Hoy</p>
          </div>
          <div className="p-4 space-y-3">
            {topDishes.map((dish, idx) => (
              <div
                key={dish.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <img src={dish.img} alt={dish.name} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{dish.name}</div>
                  <div className="text-xs text-slate-500">{dish.sales} vendidos</div>
                </div>
                <div className="text-sm font-semibold text-slate-900 tabular-nums">{dish.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-medium mb-4">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Meta semanal en curso
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-2">Vas 78% hacia tu meta</h3>
            <p className="text-white/70 max-w-md">
              Con $8,429 hoy, has superado el promedio semanal. Sigue así para alcanzar $60K esta semana.
            </p>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-5xl font-bold tabular-nums">78%</div>
            <div className="text-sm text-white/70 mt-1">$46,832 / $60,000</div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
