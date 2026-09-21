const customers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '+52 555 100 2000', visits: 24, total: 3450, lastVisit: 'Hoy' },
  { id: 2, name: 'María López', email: 'maria@email.com', phone: '+52 555 200 3000', visits: 18, total: 2890, lastVisit: 'Ayer' },
  { id: 3, name: 'Carlos Ruiz', email: 'carlos@email.com', phone: '+52 555 300 4000', visits: 32, total: 5120, lastVisit: 'Hace 3 días' },
  { id: 4, name: 'Ana García', email: 'ana@email.com', phone: '+52 555 400 5000', visits: 12, total: 1980, lastVisit: 'Hace 1 semana' },
  { id: 5, name: 'Pedro Sánchez', email: 'pedro@email.com', phone: '+52 555 500 6000', visits: 8, total: 1250, lastVisit: 'Hace 2 semanas' },
  { id: 6, name: 'Laura Fernández', email: 'laura@email.com', phone: '+52 555 600 7000', visits: 15, total: 2340, lastVisit: 'Hoy' },
];

export default function Customers() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-600 mt-1">{customers.length} clientes frecuentes</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitas</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total gastado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 tabular-nums font-medium">{c.visits}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 tabular-nums">${c.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
