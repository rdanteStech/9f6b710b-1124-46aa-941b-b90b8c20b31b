import { useState, useEffect } from 'react';
import {
  Thermometer, Wifi, AlertTriangle, CheckCircle2, Snowflake, Battery,
  Activity, TrendingDown, Bell, Shield, Zap, Clock
} from 'lucide-react';

interface Sensor {
  id: string;
  location: string;
  type: 'freezer' | 'fridge' | 'cellar' | 'prep';
  targetMin: number;
  targetMax: number;
  current: number;
  battery: number;
  signal: number;
  lastPing: string;
  status: 'ok' | 'warning' | 'critical' | 'offline';
  trend: number[];
}

const sensors: Sensor[] = [
  {
    id: 's1', location: 'Cámara congelado carnes', type: 'freezer',
    targetMin: -22, targetMax: -18, current: -19.4, battery: 87, signal: 4,
    lastPing: 'hace 12s', status: 'ok',
    trend: [-19.1, -19.3, -19.5, -19.4, -19.2, -19.4, -19.6, -19.4]
  },
  {
    id: 's2', location: 'Cámara refrigerado lácteos', type: 'fridge',
    targetMin: 2, targetMax: 6, current: 7.8, battery: 62, signal: 3,
    lastPing: 'hace 8s', status: 'warning',
    trend: [4.1, 4.5, 5.2, 6.1, 6.8, 7.2, 7.6, 7.8]
  },
  {
    id: 's3', location: 'Cámara pescadería', type: 'fridge',
    targetMin: 0, targetMax: 4, current: 2.1, battery: 91, signal: 4,
    lastPing: 'hace 5s', status: 'ok',
    trend: [2.3, 2.4, 2.2, 2.1, 2.0, 2.1, 2.2, 2.1]
  },
  {
    id: 's4', location: 'Cava vinos', type: 'cellar',
    targetMin: 12, targetMax: 16, current: 13.8, battery: 78, signal: 4,
    lastPing: 'hace 15s', status: 'ok',
    trend: [13.5, 13.6, 13.7, 13.8, 13.8, 13.7, 13.8, 13.8]
  },
  {
    id: 's5', location: 'Mesa fría línea', type: 'prep',
    targetMin: 2, targetMax: 8, current: 12.4, battery: 45, signal: 2,
    lastPing: 'hace 3m', status: 'critical',
    trend: [6.1, 7.2, 8.5, 9.8, 10.9, 11.5, 12.1, 12.4]
  },
  {
    id: 's6', location: 'Cámara verduras', type: 'fridge',
    targetMin: 4, targetMax: 8, current: 5.6, battery: 89, signal: 4,
    lastPing: 'hace 7s', status: 'ok',
    trend: [5.4, 5.5, 5.6, 5.7, 5.6, 5.5, 5.6, 5.6]
  }
];

export default function GastroSense() {
  const [live, setLive] = useState(sensors);
  const [selectedId, setSelectedId] = useState<string | null>(sensors[1].id);

  useEffect(() => {
    const t = setInterval(() => {
      setLive(prev => prev.map(s => ({
        ...s,
        current: s.current + (Math.random() - 0.5) * 0.2
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const critical = live.filter(s => s.status === 'critical').length;
  const warning = live.filter(s => s.status === 'warning').length;
  const ok = live.filter(s => s.status === 'ok').length;

  const selected = live.find(s => s.id === selectedId) || live[0];

  const statusColor = (s: string) => {
    if (s === 'critical') return 'from-rose-500 to-red-600';
    if (s === 'warning') return 'from-amber-500 to-orange-500';
    if (s === 'offline') return 'from-slate-500 to-slate-600';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroSense</h1>
                <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
                  IoT · HACCP automático
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Sensores inalámbricos de temperatura · Trazabilidad continua · Alarmas ante fallas técnicas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                <Shield className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200 text-sm">HACCP OK</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-500">Sensores activos</p>
                <p className="text-white font-bold">{live.length} · Todos comunicando</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <p className="text-emerald-200 text-sm font-medium">En rango</p>
            </div>
            <p className="text-3xl font-bold text-white">{ok}</p>
          </div>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              <p className="text-amber-200 text-sm font-medium">Advertencia</p>
            </div>
            <p className="text-3xl font-bold text-white">{warning}</p>
          </div>
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-rose-300" />
              <p className="text-rose-200 text-sm font-medium">Crítico</p>
            </div>
            <p className="text-3xl font-bold text-white">{critical}</p>
          </div>
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-purple-300" />
              <p className="text-purple-200 text-sm font-medium">Mermas evitadas</p>
            </div>
            <p className="text-3xl font-bold text-white">$1.2M</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sensor grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {live.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedId === s.id
                    ? 'bg-white/10 border-white/30 shadow-xl'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${statusColor(s.status)}`}>
                      <Snowflake className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{s.location}</p>
                      <p className="text-xs text-slate-500">Rango {s.targetMin}° a {s.targetMax}°C</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-3xl font-bold text-white">{s.current.toFixed(1)}°</p>
                  {s.status !== 'ok' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'critical' ? 'bg-rose-500/20 text-rose-200' : 'bg-amber-500/20 text-amber-200'
                    }`}>
                      Fuera de rango
                    </span>
                  )}
                </div>

                {/* mini spark */}
                <div className="flex items-end gap-0.5 h-8 mb-3">
                  {s.trend.map((v, i) => {
                    const max = Math.max(...s.trend);
                    const min = Math.min(...s.trend);
                    const h = ((v - min) / (max - min + 0.01)) * 100;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${
                          s.status === 'critical' ? 'bg-rose-400' :
                          s.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ height: `${Math.max(h, 15)}%`, opacity: 0.4 + (i / s.trend.length) * 0.6 }}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    <span>{s.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>{s.signal}/4</span>
                  </div>
                  <span>{s.lastPing}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-300" />
                <h3 className="text-white font-semibold">Detalle de sensor</h3>
              </div>
              <p className="text-slate-400 text-xs mb-1">Ubicación</p>
              <p className="text-white font-medium mb-4">{selected.location}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500">Actual</p>
                  <p className="text-xl font-bold text-white">{selected.current.toFixed(1)}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-500">Rango objetivo</p>
                  <p className="text-xl font-bold text-white">{selected.targetMin}° - {selected.targetMax}°</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Batería</span>
                  <span className="text-white">{selected.battery}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full ${
                    selected.battery > 60 ? 'bg-emerald-400' : selected.battery > 30 ? 'bg-amber-400' : 'bg-rose-400'
                  }`} style={{ width: `${selected.battery}%` }} />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-400/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                <p className="text-rose-200 font-medium text-sm">Alerta crítica</p>
              </div>
              <p className="text-white text-sm mb-1">Mesa fría línea</p>
              <p className="text-xs text-slate-400 mb-3">12.4°C desde hace 8 min · fuera de rango HACCP</p>
              <button className="w-full py-2 rounded-lg bg-rose-500/20 text-rose-200 text-sm font-medium hover:bg-rose-500/30 border border-rose-400/30 cursor-pointer">
                Notificar a mantención
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-400/20 flex gap-3">
              <Zap className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 text-sm font-medium">Auditoría automática</p>
                <p className="text-xs text-slate-400 mt-1">
                  Log HACCP exportable a PDF para inspecciones sanitarias. Registros cada 60 segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
