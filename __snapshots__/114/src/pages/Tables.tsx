import { Users, Clock } from 'lucide-react';

type Table = {
  id: number;
  number: string;
  seats: number;
  status: 'libre' | 'ocupada' | 'reservada' | 'limpieza';
  guests?: number;
  time?: string;
  waiter?: string;
};

const tables: Table[] = [
  { id: 1, number: 'M01', seats: 2, status: 'libre' },
  { id: 2, number: 'M02', seats: 4, status: 'ocupada', guests: 3, time: '45 min', waiter: 'Ana' },
  { id: 3, number: 'M03', seats: 4, status: 'ocupada', guests: 4, time: '20 min', waiter: 'Luis' },
  { id: 4, number: 'M04', seats: 2, status: 'reservada', time: '19:30' },
  { id: 5, number: 'M05', seats: 6, status: 'ocupada', guests: 5, time: '1h 10 min', waiter: 'María' },
  { id: 6, number: 'M06', seats: 4, status: 'libre' },
  { id: 7, number: 'M07', seats: 4, status: 'limpieza' },
  { id: 8, number: 'M08', seats: 2, status: 'ocupada', guests: 2, time: '15 min', waiter: 'Ana' },
  { id: 9, number: 'M09', seats: 8, status: 'reservada', time: '20:00' },
  { id: 10, number: 'M10', seats: 4, status: 'libre' },
  { id: 11, number: 'M11', seats: 4, status: 'ocupada', guests: 4, time: '30 min', waiter: 'Luis' },
  { id: 12, number: 'M12', seats: 6, status: 'ocupada', guests: 6, time: '55 min', waiter: 'María' },
];

const statusStyles = {
  libre: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Libre' },
  ocupada: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Ocupada' },
  reservada: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Reservada' },
  limpieza: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Limpieza' },
};

export default function Tables() {
  const stats = {
    libre: tables.filter((t) => t.status === 'libre').length,
    ocupada: tables.filter((t) => t.status === 'ocupada').length,
    reservada: tables.filter((t) => t.status === 'reservada').length,
    limpieza: tables.filter((t) => t.status === 'limpieza').length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de Mesas</h1>
        <p className="text-slate-600 mt-1">Vista en tiempo real del salón principal</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['libre', 'ocupada', 'reservada', 'limpieza'] as const).map((s) => {
          const style = statusStyles[s];
          return (
            <div key={s} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 ${style.dot} rounded-full`}></span>
                <span className={`text-sm font-medium ${style.text}`}>{style.label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">{stats[s]}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
          {tables.map((table) => {
            const style = statusStyles[table.status];
            return (
              <button
                key={table.id}
                className={`${style.bg} border ${style.border} rounded-xl p-4 text-left hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{table.number}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Users className="w-3 h-3" />
                      {table.seats} lugares
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 ${style.dot} rounded-full mt-1.5`}></span>
                </div>
                <div className={`text-xs font-medium ${style.text} mb-2`}>{style.label}</div>
                {table.guests && (
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {table.guests} personas
                  </div>
                )}
                {table.time && (
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {table.time}
                  </div>
                )}
                {table.waiter && (
                  <div className="text-xs text-slate-500 mt-1">Mesero: {table.waiter}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
