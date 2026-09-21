import { AlertTriangle, Package } from 'lucide-react';

const inventory = [
  { id: 1, name: 'Trufa negra', unit: 'g', stock: 450, min: 200, price: 2.5, supplier: 'Gourmet Import' },
  { id: 2, name: 'Salmón fresco', unit: 'kg', stock: 12, min: 5, price: 18.0, supplier: 'Pescados del Mar' },
  { id: 3, name: 'Arroz Arborio', unit: 'kg', stock: 3, min: 8, price: 4.5, supplier: 'Distribuidora Norte' },
  { id: 4, name: 'Aceite de oliva', unit: 'L', stock: 25, min: 10, price: 12.0, supplier: 'Aceites Premium' },
  { id: 5, name: 'Vino tinto reserva', unit: 'botella', stock: 45, min: 20, price: 15.0, supplier: 'Vinos & Co' },
  { id: 6, name: 'Queso parmesano', unit: 'kg', stock: 2, min: 3, price: 22.0, supplier: 'Lácteos Italianos' },
  { id: 7, name: 'Pasta fresca', unit: 'kg', stock: 8, min: 5, price: 6.5, supplier: 'Pasta Artesanal' },
  { id: 8, name: 'Res premium', unit: 'kg', stock: 15, min: 8, price: 28.0, supplier: 'Carnes Selectas' },
];

export default function Inventory() {
  const lowStock = inventory.filter((i) => i.stock < i.min);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Inventario</h1>
        <p className="text-slate-600 mt-1">{inventory.length} productos · {lowStock.length} con stock bajo</p>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900">Alerta de stock bajo</div>
            <div className="text-sm text-amber-800 mt-0.5">
              {lowStock.map((i) => i.name).join(', ')} necesitan reabastecimiento.
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mínimo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio unit.</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((i) => {
                const low = i.stock < i.min;
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-900">{i.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 tabular-nums">{i.stock} {i.unit}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">{i.min} {i.unit}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 tabular-nums">${i.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{i.supplier}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${low ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {low ? 'Stock bajo' : 'OK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
