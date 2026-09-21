import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';

const tickets = [
  {
    id: '#4521',
    table: 'Mesa 12',
    time: '5 min',
    urgent: false,
    items: [
      { name: 'Risotto de Trufa', qty: 2, notes: 'Sin cebolla' },
      { name: 'Ensalada César', qty: 1 },
      { name: 'Vino Tinto', qty: 1 },
    ],
  },
  {
    id: '#4520',
    table: 'Mesa 08',
    time: '12 min',
    urgent: true,
    items: [
      { name: 'Salmón Teriyaki', qty: 2 },
      { name: 'Bruschetta', qty: 1 },
    ],
  },
  {
    id: '#4519',
    table: 'Barra 03',
    time: '8 min',
    urgent: false,
    items: [
      { name: 'Pasta Carbonara', qty: 3 },
      { name: 'Ribeye Steak', qty: 1, notes: 'Término medio' },
      { name: 'Cerveza Artesanal', qty: 4 },
    ],
  },
  {
    id: '#4522',
    table: 'Mesa 05',
    time: '2 min',
    urgent: false,
    items: [
      { name: 'Ribeye Steak', qty: 1, notes: 'Bien cocido' },
      { name: 'Ensalada César', qty: 1, notes: 'Sin crutones' },
    ],
  },
];

export default function Kitchen() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Cocina</h1>
          <p className="text-slate-600 mt-1">{tickets.length} tickets activos</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-emerald-700">En vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-2xl border-2 overflow-hidden ${
              ticket.urgent ? 'border-rose-300' : 'border-slate-200'
            }`}
          >
            <div className={`p-4 ${ticket.urgent ? 'bg-rose-50' : 'bg-slate-50'} border-b border-slate-200`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">{ticket.id}</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    ticket.urgent ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-600'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {ticket.time}
                </span>
              </div>
              <div className="text-sm text-slate-600 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                {ticket.table}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {ticket.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0 tabular-nums">
                    {item.qty}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1 inline-block">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 pt-0">
              <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                Marcar listo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
