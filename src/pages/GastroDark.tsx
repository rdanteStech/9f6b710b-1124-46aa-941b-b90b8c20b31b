import { useState } from 'react';
import {
  ChefHat, Package, DollarSign, TrendingUp, Boxes, Layers, PieChart,
  Plus, Sparkles, Activity, ShoppingBag, Utensils
} from 'lucide-react';
import { formatCLP } from '../lib/locale';

interface VirtualBrand {
  id: string;
  name: string;
  concept: string;
  logo: string;
  color: string;
  ordersToday: number;
  revenueToday: number;
  channels: string[];
  sharedIngredients: number;
  margin: number;
  status: 'active' | 'paused';
}

const brands: VirtualBrand[] = [
  {
    id: 'b1', name: 'Bao Bang', concept: 'Bao asiático fusión',
    logo: '🥟', color: 'from-rose-500 to-pink-500',
    ordersToday: 48, revenueToday: 384000,
    channels: ['UberEats', 'Rappi', 'PedidosYa'],
    sharedIngredients: 12, margin: 42, status: 'active'
  },
  {
    id: 'b2', name: 'La Trufa Loca', concept: 'Pastas artesanales premium',
    logo: '🍝', color: 'from-amber-500 to-orange-500',
    ordersToday: 34, revenueToday: 510000,
    channels: ['UberEats', 'Rappi', 'Web propia'],
    sharedIngredients: 8, margin: 38, status: 'active'
  },
  {
    id: 'b3', name: 'Poke Republic', concept: 'Poke bowls saludables',
    logo: '🥗', color: 'from-emerald-500 to-teal-500',
    ordersToday: 62, revenueToday: 434000,
    channels: ['UberEats', 'Rappi'],
    sharedIngredients: 15, margin: 45, status: 'active'
  },
  {
    id: 'b4', name: 'Burger Society', concept: 'Smash burgers premium',
    logo: '🍔', color: 'from-purple-500 to-fuchsia-500',
    ordersToday: 89, revenueToday: 712000,
    channels: ['UberEats', 'Rappi', 'PedidosYa', 'Web propia'],
    sharedIngredients: 10, margin: 41, status: 'active'
  },
  {
    id: 'b5', name: 'Sweet Alchemy', concept: 'Postres autor',
    logo: '🍰', color: 'from-pink-500 to-rose-500',
    ordersToday: 21, revenueToday: 168000,
    channels: ['Rappi', 'Web propia'],
    sharedIngredients: 6, margin: 52, status: 'paused'
  }
];

export default function GastroDark() {
  const [selected, setSelected] = useState<string | null>(brands[0].id);
  const [showNewBrand, setShowNewBrand] = useState(false);

  const totalOrders = brands.reduce((s, b) => s + b.ordersToday, 0);
  const totalRevenue = brands.reduce((s, b) => s + b.revenueToday, 0);
  const activeBrands = brands.filter(b => b.status === 'active').length;
  const selectedBrand = brands.find(b => b.id === selected) || brands[0];

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-fuchsia-950/20 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroDark</h1>
                <span className="px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-xs font-semibold text-fuchsia-200">
                  Virtual Brands Hub · Dark Kitchens
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Múltiples marcas virtuales desde una misma cocina física · Inventario centralizado y compartido
              </p>
            </div>
            <button
              onClick={() => setShowNewBrand(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-medium flex items-center gap-2 hover:shadow-xl hover:shadow-fuchsia-500/30 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Lanzar nueva marca virtual
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-4 h-4 text-fuchsia-300" />
              <p className="text-slate-400 text-sm">Marcas activas</p>
            </div>
            <p className="text-3xl font-bold text-white">{activeBrands} / {brands.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-purple-300" />
              <p className="text-slate-400 text-sm">Pedidos hoy</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              <p className="text-slate-400 text-sm">Ingresos hoy</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(totalRevenue)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Utilización cocina</p>
            </div>
            <p className="text-3xl font-bold text-white">78%</p>
            <p className="text-xs text-slate-500 mt-1">+34pp vs. solo marca principal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Brands grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                  selected === b.id
                    ? 'bg-white/10 border-white/30 shadow-xl'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {b.logo}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    b.status === 'active' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {b.status === 'active' ? 'Activa' : 'Pausada'}
                  </span>
                </div>
                <p className="text-white font-semibold mb-1">{b.name}</p>
                <p className="text-xs text-slate-400 mb-4">{b.concept}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Pedidos hoy</p>
                    <p className="text-white font-bold">{b.ordersToday}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ingresos</p>
                    <p className="text-white font-bold">{formatCLP(b.revenueToday)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Margen</p>
                    <p className="text-emerald-300 font-bold">{b.margin}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Canales</p>
                    <p className="text-white font-bold">{b.channels.length}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedBrand.color} flex items-center justify-center text-4xl shadow-xl mb-4`}>
                {selectedBrand.logo}
              </div>
              <h3 className="text-xl font-bold text-white">{selectedBrand.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{selectedBrand.concept}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Canales activos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBrand.channels.map(c => (
                      <span key={c} className="px-2 py-1 rounded-full bg-white/10 text-white text-xs">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Boxes className="w-4 h-4 text-cyan-300" />
                    <p className="text-slate-300 text-sm font-medium">Inventario compartido</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedBrand.sharedIngredients} ingredientes del stock central se usan en esta marca. Al vender, GastroStock descuenta automáticamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-400/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 font-medium text-sm">Oportunidad IA</p>
                <p className="text-xs text-slate-400 mt-1">
                  El horario 21:00-23:00 tiene 40% menos pedidos. Lanzar una marca virtual de "cenas tardías" podría capturar +$180K/día.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-emerald-300" />
                <p className="text-emerald-200 font-medium text-sm">Cross-brand insights</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2"><PieChart className="w-3 h-3" /> Salmón: usado en 3 marcas</li>
                <li className="flex items-center gap-2"><Utensils className="w-3 h-3" /> Palta: usada en 4 marcas</li>
                <li className="flex items-center gap-2"><Package className="w-3 h-3" /> Ahorro por consolidación: 22%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showNewBrand && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowNewBrand(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Lanzar marca virtual</h3>
            <p className="text-sm text-slate-400 mb-6">Configura una nueva identidad de marca sobre tu cocina existente. Aparecerá en los canales que selecciones y compartirá tu inventario.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Nombre de marca</label>
                <input className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" placeholder="Ej. Ramen Master" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Concepto</label>
                <input className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" placeholder="Ramen japonés artesanal" />
              </div>
              <button onClick={() => setShowNewBrand(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-medium cursor-pointer">
                Crear marca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
