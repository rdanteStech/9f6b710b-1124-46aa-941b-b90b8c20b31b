import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

const transactions = [
  { id: 1, desc: 'Venta del día', category: 'Ingresos', amount: 8429, type: 'in', date: 'Hoy' },
  { id: 2, desc: 'Pago proveedores', category: 'Gastos', amount: -3240, type: 'out', date: 'Hoy' },
  { id: 3, desc: 'Nómina semanal', category: 'Gastos', amount: -12500, type: 'out', date: 'Ayer' },
  { id: 4, desc: 'Venta del día', category: 'Ingresos', amount: 7890, type: 'in', date: 'Ayer' },
  { id: 5, desc: 'Renta local', category: 'Gastos', amount: -8500, type: 'out', date: '01/01' },
  { id: 6, desc: 'Servicios (luz, agua)', category: 'Gastos', amount: -2100, type: 'out', date: '02/01' },
];

export default function Finance() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Finanzas</h1>
        <p className="text-slate-600 mt-1">Resumen financiero del mes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-sm text-emerald-50">Ingresos</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">$142,890</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-6 h-6" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div className="text-sm text-rose-50">Gastos</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">$78,340</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">+18%</span>
          </div>
          <div className="text-sm text-indigo-50">Utilidad neta</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">$64,550</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Transacciones recientes</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 lg:px-6 flex items-center gap-4 hover:bg-slate-50">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{t.desc}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.category} · {t.date}</div>
              </div>
              <div className={`text-lg font-semibold tabular-nums ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'in' ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
