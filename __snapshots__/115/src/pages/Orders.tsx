const orders = [
  { id: '#4521', table: 'Mesa 12', customer: 'Walk-in', items: 4, total: 142.5, status: 'Preparando', payment: 'Pendiente', time: '10:45' },
  { id: '#4520', table: 'Mesa 08', customer: 'Juan Pérez', items: 2, total: 68.0, status: 'Servido', payment: 'Pagado', time: '10:32' },
  { id: '#4519', table: 'Barra 03', customer: 'Walk-in', items: 6, total: 215.75, status: 'Listo', payment: 'Pendiente', time: '10:29' },
  { id: '#4518', table: 'Mesa 15', customer: 'María López', items: 3, total: 95.2, status: 'Pagado', payment: 'Pagado', time: '10:15' },
  { id: '#4517', table: 'Mesa 04', customer: 'Walk-in', items: 5, total: 178.9, status: 'Preparando', payment: 'Pendiente', time: '10:08' },
  { id: '#4516', table: 'Delivery', customer: 'Carlos Ruiz', items: 2, total: 45.0, status: 'Enviado', payment: 'Pagado', time: '09:55' },
  { id: '#4515', table: 'Mesa 02', customer: 'Ana García', items: 4, total: 132.4, status: 'Pagado', payment: 'Pagado', time: '09:40' },
];

const statusColors: Record<string, string> = {
  Preparando: 'bg-amber-50 text-amber-700 border-amber-200',
  Servido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Listo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Pagado: 'bg-slate-100 text-slate-700 border-slate-200',
  Enviado: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function Orders() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-slate-600 mt-1">Historial completo de órdenes de hoy</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mesa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pago</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 font-semibold text-slate-900">{o.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{o.table}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{o.customer}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">{o.items}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 tabular-nums">${o.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${o.payment === 'Pagado' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {o.payment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
