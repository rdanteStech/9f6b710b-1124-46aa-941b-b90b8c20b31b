const invoices = [
  { id: 'FAC-2025-001', customer: 'Juan Pérez', rfc: 'PEPJ850312AB1', date: '10/01/2025', amount: 142.5, status: 'Emitida' },
  { id: 'FAC-2025-002', customer: 'Empresa Techno SA', rfc: 'ETE180520XY2', date: '10/01/2025', amount: 1250.0, status: 'Emitida' },
  { id: 'FAC-2025-003', customer: 'María López', rfc: 'LOMM920815CD3', date: '09/01/2025', amount: 68.0, status: 'Emitida' },
  { id: 'FAC-2025-004', customer: 'Carlos Ruiz', rfc: 'RUC C880404EF4', date: '09/01/2025', amount: 215.75, status: 'Pendiente' },
  { id: 'FAC-2025-005', customer: 'Consultora Beta', rfc: 'CBE200109GH5', date: '08/01/2025', amount: 3450.0, status: 'Emitida' },
];

export default function Billing() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Facturación</h1>
        <p className="text-slate-600 mt-1">Facturas electrónicas del mes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">Facturas emitidas</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">142</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">Total facturado</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">$45,320</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">Pendientes</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">8</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Folio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">RFC</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 font-semibold text-slate-900">{f.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{f.customer}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">{f.rfc}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">{f.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 tabular-nums">${f.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${f.status === 'Emitida' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
