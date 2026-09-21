import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';

export default function Reports() {
  const salesByDay = [
    { day: 'L', value: 65 },
    { day: 'M', value: 78 },
    { day: 'M', value: 82 },
    { day: 'J', value: 71 },
    { day: 'V', value: 95 },
    { day: 'S', value: 100 },
    { day: 'D', value: 88 },
  ];

  const categories = [
    { name: 'Principales', value: 45, color: 'bg-indigo-500' },
    { name: 'Entradas', value: 20, color: 'bg-emerald-500' },
    { name: 'Bebidas', value: 20, color: 'bg-amber-500' },
    { name: 'Postres', value: 15, color: 'bg-violet-500' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Reportes</h1>
          <p className="text-slate-600 mt-1">Análisis y métricas del negocio</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 cursor-pointer">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Ventas semanales</h2>
              <p className="text-xs text-slate-500">Últimos 7 días</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {salesByDay.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden" style={{ height: `${d.value}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg"></div>
                </div>
                <div className="text-xs font-medium text-slate-600">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Ventas por categoría</h2>
              <p className="text-xs text-slate-500">Este mes</p>
            </div>
          </div>
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">{c.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Indicadores clave</h2>
              <p className="text-xs text-slate-500">Métricas del mes actual</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Ticket promedio', value: '$285' },
              { label: 'Rotación mesas', value: '3.2x' },
              { label: 'Satisfacción', value: '4.8/5' },
              { label: 'Retención', value: '68%' },
            ].map((k) => (
              <div key={k.label} className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</div>
                <div className="text-xs text-slate-500 mt-1">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
