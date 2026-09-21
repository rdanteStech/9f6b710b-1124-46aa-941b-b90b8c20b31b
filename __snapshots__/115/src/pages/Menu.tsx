import { Edit2, Plus } from 'lucide-react';

const menu = [
  { id: 1, name: 'Bruschetta', category: 'Entradas', price: 12.5, available: true, img: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 2, name: 'Ensalada César', category: 'Entradas', price: 14.0, available: true, img: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 3, name: 'Risotto de Trufa', category: 'Principales', price: 30.0, available: true, img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 4, name: 'Salmón Teriyaki', category: 'Principales', price: 32.0, available: true, img: 'https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 5, name: 'Pasta Carbonara', category: 'Principales', price: 25.0, available: false, img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 6, name: 'Ribeye Steak', category: 'Principales', price: 60.0, available: true, img: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 7, name: 'Tiramisú', category: 'Postres', price: 10.0, available: true, img: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 8, name: 'Cheesecake', category: 'Postres', price: 11.0, available: true, img: 'https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export default function Menu() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Menú</h1>
          <p className="text-slate-600 mt-1">Gestión de platos y precios</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 cursor-pointer">
          <Plus className="w-4 h-4" />
          Agregar plato
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menu.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              {!item.available && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm px-3 py-1 bg-rose-500 rounded-full">Agotado</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="text-xs text-slate-500 mb-1">{item.category}</div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer" aria-label="Editar">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-indigo-600 tabular-nums">${item.price.toFixed(2)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {item.available ? 'Disponible' : 'Agotado'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
