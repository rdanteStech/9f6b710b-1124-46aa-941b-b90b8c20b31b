import { useState } from 'react';
import {
  Leaf, TrendingDown, Recycle, Award, TreePine, Droplet,
  Sparkles, Info, Search, Filter, ChevronRight
} from 'lucide-react';

interface DishFootprint {
  id: string;
  name: string;
  co2: number;
  water: number;
  local: number;
  seasonal: boolean;
  vegan: boolean;
  ecoScore: 'A' | 'B' | 'C' | 'D';
  category: string;
}

const dishes: DishFootprint[] = [
  { id: 'd1', name: 'Ensalada de estación', co2: 0.4, water: 120, local: 92, seasonal: true, vegan: true, ecoScore: 'A', category: 'Entrada' },
  { id: 'd2', name: 'Risotto de hongos silvestres', co2: 0.9, water: 320, local: 78, seasonal: true, vegan: false, ecoScore: 'A', category: 'Principal' },
  { id: 'd3', name: 'Poke de atún local', co2: 1.4, water: 480, local: 85, seasonal: true, vegan: false, ecoScore: 'B', category: 'Principal' },
  { id: 'd4', name: 'Ravioles de centolla', co2: 2.1, water: 890, local: 68, seasonal: true, vegan: false, ecoScore: 'B', category: 'Principal' },
  { id: 'd5', name: 'Ojo de bife 350g', co2: 8.4, water: 2400, local: 55, seasonal: false, vegan: false, ecoScore: 'D', category: 'Principal' },
  { id: 'd6', name: 'Tiramisú artesanal', co2: 1.6, water: 340, local: 45, seasonal: false, vegan: false, ecoScore: 'C', category: 'Postre' },
  { id: 'd7', name: 'Bowl vegano de quinoa', co2: 0.6, water: 180, local: 88, seasonal: true, vegan: true, ecoScore: 'A', category: 'Principal' },
  { id: 'd8', name: 'Cordero patagónico', co2: 6.7, water: 1800, local: 72, seasonal: false, vegan: false, ecoScore: 'C', category: 'Principal' }
];

const scoreColors: Record<string, string> = {
  A: 'from-emerald-500 to-teal-500',
  B: 'from-lime-500 to-emerald-500',
  C: 'from-amber-500 to-orange-500',
  D: 'from-rose-500 to-red-500'
};

export default function GastroGreen() {
  const [selected, setSelected] = useState<string | null>(dishes[0].id);
  const totalCO2 = dishes.reduce((s, d) => s + d.co2, 0);
  const avgCO2 = totalCO2 / dishes.length;
  const greenDishes = dishes.filter(d => d.ecoScore === 'A').length;
  const localAvg = Math.round(dishes.reduce((s, d) => s + d.local, 0) / dishes.length);
  const selectedDish = dishes.find(d => d.id === selected) || dishes[0];

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroGreen</h1>
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-200">
                  Sostenibilidad · Sello Verde
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Huella de carbono por plato · Trazabilidad de economía circular · Certificación eco-gastronomy
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
              <Award className="w-6 h-6 text-emerald-300" />
              <div>
                <p className="text-xs text-emerald-200">Sello verde</p>
                <p className="text-white font-bold">Grado A · Certificado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TreePine className="w-4 h-4 text-emerald-300" />
              <p className="text-slate-400 text-sm">CO₂ promedio/plato</p>
            </div>
            <p className="text-3xl font-bold text-white">{avgCO2.toFixed(1)} kg</p>
            <p className="text-xs text-emerald-300 mt-1">↓ 18% vs. promedio industria</p>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Platos Grado A</p>
            </div>
            <p className="text-3xl font-bold text-white">{greenDishes}</p>
            <p className="text-xs text-slate-500 mt-1">De {dishes.length} en carta</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-cyan-300" />
              <p className="text-slate-400 text-sm">Ingredientes locales</p>
            </div>
            <p className="text-3xl font-bold text-white">{localAvg}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Recycle className="w-4 h-4 text-purple-300" />
              <p className="text-slate-400 text-sm">Merma valorizada</p>
            </div>
            <p className="text-3xl font-bold text-white">84%</p>
            <p className="text-xs text-slate-500 mt-1">Compost + donación</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dishes list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Huella por plato</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 cursor-pointer"><Search className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 cursor-pointer"><Filter className="w-4 h-4" /></button>
              </div>
            </div>

            {dishes.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selected === d.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scoreColors[d.ecoScore]} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                    {d.ecoScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{d.name}</p>
                      {d.vegan && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs">Vegano</span>}
                      {d.seasonal && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-xs">Estacional</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><TreePine className="w-3 h-3" /> {d.co2} kg CO₂</span>
                      <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> {d.water}L agua</span>
                      <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> {d.local}% local</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${scoreColors[selectedDish.ecoScore]} flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4`}>
                {selectedDish.ecoScore}
              </div>
              <p className="text-xl font-bold text-white">{selectedDish.name}</p>
              <p className="text-sm text-slate-400 mb-4">{selectedDish.category}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Ingredientes locales</span>
                    <span className="text-white">{selectedDish.local}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${selectedDish.local}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-slate-500">CO₂</p>
                    <p className="text-lg font-bold text-white">{selectedDish.co2} kg</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-slate-500">Agua</p>
                    <p className="text-lg font-bold text-white">{selectedDish.water}L</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-emerald-300" />
                <p className="text-white font-medium">Sello Verde en carta QR</p>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Los platos Grado A aparecen con un ícono de hoja verde en la carta digital para incentivar opciones de bajo impacto ambiental.
              </p>
              <button className="w-full py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 cursor-pointer">
                Configurar visualización
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-400/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 text-sm font-medium">Sugerencia IA</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cambiar el ojo de bife por corte de productor local en Colchagua reduciría su huella un 34% y agregaría trazabilidad para el Sello.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
