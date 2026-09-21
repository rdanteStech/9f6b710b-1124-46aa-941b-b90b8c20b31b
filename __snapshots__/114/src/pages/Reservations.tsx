import { Calendar, Users, Clock, Phone } from 'lucide-react';

const reservations = [
  { id: 1, name: 'Familia Rodríguez', people: 4, date: 'Hoy', time: '19:30', phone: '+52 555 123 4567', table: 'M04', notes: 'Aniversario' },
  { id: 2, name: 'Empresa Techno', people: 8, date: 'Hoy', time: '20:00', phone: '+52 555 987 6543', table: 'M09', notes: 'Cena corporativa' },
  { id: 3, name: 'Pedro Sánchez', people: 2, date: 'Hoy', time: '21:00', phone: '+52 555 456 7890', table: 'M01' },
  { id: 4, name: 'Laura Fernández', people: 6, date: 'Mañana', time: '13:30', phone: '+52 555 234 5678', table: 'M12', notes: 'Cumpleaños' },
  { id: 5, name: 'Roberto Díaz', people: 3, date: 'Mañana', time: '19:00', phone: '+52 555 345 6789', table: 'M03' },
];

export default function Reservations() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Reservas</h1>
          <p className="text-slate-600 mt-1">{reservations.length} reservas próximas</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 cursor-pointer">
          <Calendar className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{r.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">Mesa {r.table}</div>
              </div>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full">
                {r.date}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="tabular-nums">{r.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{r.people} personas</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="tabular-nums">{r.phone}</span>
              </div>
            </div>

            {r.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
                "{r.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
