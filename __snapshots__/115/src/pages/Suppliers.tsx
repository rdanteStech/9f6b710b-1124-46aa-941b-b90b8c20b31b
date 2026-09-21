import { Mail, Phone, MapPin } from 'lucide-react';

const suppliers = [
  { id: 1, name: 'Pescados del Mar', contact: 'Roberto Vela', email: 'ventas@pescadosdelmar.mx', phone: '+52 555 111 2222', address: 'Ciudad de México', category: 'Mariscos' },
  { id: 2, name: 'Carnes Selectas', contact: 'María Torres', email: 'contacto@carnesselectas.mx', phone: '+52 555 333 4444', address: 'Monterrey', category: 'Carnes' },
  { id: 3, name: 'Lácteos Italianos', contact: 'Giovanni Rossi', email: 'g.rossi@lacteos.it', phone: '+52 555 555 6666', address: 'Guadalajara', category: 'Lácteos' },
  { id: 4, name: 'Vinos & Co', contact: 'Ana Salinas', email: 'ana@vinosyco.mx', phone: '+52 555 777 8888', address: 'Ensenada', category: 'Bebidas' },
  { id: 5, name: 'Gourmet Import', contact: 'Luis Herrera', email: 'luis@gourmetimport.mx', phone: '+52 555 999 0000', address: 'Ciudad de México', category: 'Especialidades' },
  { id: 6, name: 'Distribuidora Norte', contact: 'Sofía Ramírez', email: 'ventas@distnorte.mx', phone: '+52 555 121 2323', address: 'Tijuana', category: 'Abarrotes' },
];

export default function Suppliers() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Proveedores</h1>
        <p className="text-slate-600 mt-1">{suppliers.length} proveedores activos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{s.contact}</div>
              </div>
              <span className="text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full">
                {s.category}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="tabular-nums">{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{s.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
