import { useState } from 'react';
import { Plus, Minus, Trash2, CreditCard, Search } from 'lucide-react';

const categories = ['Todos', 'Entradas', 'Principales', 'Postres', 'Bebidas'];

const products = [
  { id: 1, name: 'Bruschetta', category: 'Entradas', price: 12.5, img: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 2, name: 'Ensalada César', category: 'Entradas', price: 14.0, img: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 3, name: 'Risotto de Trufa', category: 'Principales', price: 30.0, img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 4, name: 'Salmón Teriyaki', category: 'Principales', price: 32.0, img: 'https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 5, name: 'Pasta Carbonara', category: 'Principales', price: 25.0, img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 6, name: 'Ribeye Steak', category: 'Principales', price: 60.0, img: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 7, name: 'Tiramisú', category: 'Postres', price: 10.0, img: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 8, name: 'Cheesecake', category: 'Postres', price: 11.0, img: 'https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 9, name: 'Vino Tinto', category: 'Bebidas', price: 18.0, img: 'https://images.pexels.com/photos/1470545/pexels-photo-1470545.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 10, name: 'Cerveza Artesanal', category: 'Bebidas', price: 8.0, img: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 11, name: 'Café Espresso', category: 'Bebidas', price: 4.5, img: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 12, name: 'Jugo Natural', category: 'Bebidas', price: 6.0, img: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

type CartItem = { id: number; name: string; price: number; qty: number };

export default function POS() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([
    { id: 3, name: 'Risotto de Trufa', price: 30.0, qty: 1 },
    { id: 9, name: 'Vino Tinto', price: 18.0, qty: 2 },
  ]);

  const filtered = products.filter(
    (p) =>
      (activeCategory === 'Todos' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Punto de Venta</h1>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer text-left group"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <div className="text-xs text-slate-500">{p.category}</div>
                <div className="font-semibold text-slate-900 text-sm truncate">{p.name}</div>
                <div className="font-bold text-indigo-600 mt-1 tabular-nums">${p.price.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Orden actual</h2>
            <span className="text-sm text-slate-500">Mesa 12</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-96 lg:max-h-none">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Sin productos en la orden</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">{item.name}</div>
                  <div className="text-xs text-slate-500 tabular-nums">${item.price.toFixed(2)} c/u</div>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-l-lg cursor-pointer"
                    aria-label="Restar"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-r-lg cursor-pointer"
                    aria-label="Sumar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>IVA (16%)</span>
            <span className="tabular-nums">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
          >
            <CreditCard className="w-5 h-5" />
            Cobrar
          </button>
        </div>
      </div>
    </div>
  );
}
