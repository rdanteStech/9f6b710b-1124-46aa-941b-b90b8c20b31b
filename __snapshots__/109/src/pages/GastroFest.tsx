import { useState } from 'react';
import {
  Radio, CreditCard, Users, DollarSign, TrendingUp, Zap, QrCode,
  Wifi, Activity, ShieldCheck, Clock, ChevronRight, Sparkles
} from 'lucide-react';
import { formatCLP } from '../lib/locale';

interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  capacity: number;
  checkedIn: number;
  wristbandsIssued: number;
  totalTopUp: number;
  totalSpent: number;
  status: 'live' | 'upcoming' | 'closed';
  bars: number;
}

const events: Event[] = [
  {
    id: 'e1', name: 'Lollapalooza Chile 2025', venue: 'Parque Bicentenario', date: '18-20 Mar 2025',
    capacity: 82000, checkedIn: 68400, wristbandsIssued: 68400,
    totalTopUp: 2840000000, totalSpent: 1920000000, status: 'live', bars: 42
  },
  {
    id: 'e2', name: 'Ñam Festival Gastronómico', venue: 'Cerro Santa Lucía', date: '5-7 Abr 2025',
    capacity: 12000, checkedIn: 0, wristbandsIssued: 0,
    totalTopUp: 0, totalSpent: 0, status: 'upcoming', bars: 18
  },
  {
    id: 'e3', name: 'Fauna Primavera 2024', venue: 'Estadio Bicentenario', date: '9-10 Nov 2024',
    capacity: 40000, checkedIn: 38200, wristbandsIssued: 38200,
    totalTopUp: 1420000000, totalSpent: 1385000000, status: 'closed', bars: 28
  }
];

export default function GastroFest() {
  const [selectedId, setSelectedId] = useState<string>(events[0].id);
  const event = events.find(e => e.id === selectedId)!;

  const barData = [
    { name: 'Barra Central', throughput: 342, revenue: 82400000, avgTime: 34 },
    { name: 'Barra Norte', throughput: 298, revenue: 68200000, avgTime: 41 },
    { name: 'Barra VIP', throughput: 84, revenue: 42800000, avgTime: 28 },
    { name: 'Barra Escenario', throughput: 412, revenue: 94100000, avgTime: 29 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-fuchsia-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroFest</h1>
                <span className="px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-xs font-semibold text-fuchsia-200">
                  Modo Festivales · Cashless NFC/RFID
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Pulseras contactless para barras de alta velocidad · Control de aforo por QR
              </p>
            </div>
            {event.status === 'live' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-emerald-300 text-sm font-medium">EN VIVO · {event.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Event switcher */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {events.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={`px-5 py-3 rounded-xl text-left border transition-all cursor-pointer shrink-0 ${
                selectedId === e.id
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="font-semibold text-sm">{e.name}</p>
              <p className={`text-xs mt-0.5 ${selectedId === e.id ? 'text-slate-500' : 'text-slate-500'}`}>{e.date} · {e.venue}</p>
            </button>
          ))}
        </div>

        {/* Live KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-300" />
              <p className="text-cyan-200 text-sm">Ingresados</p>
            </div>
            <p className="text-3xl font-bold text-white">{(event.checkedIn / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-500 mt-1">de {(event.capacity / 1000).toFixed(0)}K aforo</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${(event.checkedIn / event.capacity) * 100}%` }} />
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-400/20">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-fuchsia-300" />
              <p className="text-fuchsia-200 text-sm">Pulseras activas</p>
            </div>
            <p className="text-3xl font-bold text-white">{(event.wristbandsIssued / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-500 mt-1">RFID emparejadas</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              <p className="text-slate-400 text-sm">Recarga total</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(event.totalTopUp)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-300" />
              <p className="text-slate-400 text-sm">Consumido</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(event.totalSpent)}</p>
            <p className="text-xs text-emerald-300 mt-1">{Math.round((event.totalSpent / event.totalTopUp) * 100)}% de recarga</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Barras */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Rendimiento por barra</h3>
                <p className="text-xs text-slate-500 mt-0.5">{event.bars} barras operando · última hora</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                <Zap className="w-3 h-3 text-emerald-300" />
                <span className="text-xs text-emerald-200">Alta velocidad</span>
              </div>
            </div>

            <div className="space-y-3">
              {barData.map(b => (
                <div key={b.name} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{b.name}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        <Clock className="w-3 h-3 inline mr-1" />{b.avgTime}s / trans
                      </span>
                      <span className="text-emerald-300 font-medium">{b.throughput} trans/h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500" style={{ width: `${(b.throughput / 500) * 100}%` }} />
                    </div>
                    <p className="text-white text-sm font-medium">{formatCLP(b.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aforo QR + acciones */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-400/20">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-cyan-300" />
                <p className="text-white font-semibold">Control de aforo</p>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{Math.round((event.checkedIn / event.capacity) * 100)}%</p>
              <p className="text-xs text-slate-400 mb-4">Ocupación actual</p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-300">Escáneres activos</span>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-300">QR/min promedio</span>
                  <span className="text-emerald-300 font-medium">180</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-300">Tiempo espera puertas</span>
                  <span className="text-white font-medium">3 min</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <p className="text-white font-medium text-sm">Antifraude</p>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Cada transacción NFC firmada offline. Sincronización cuando hay señal.
              </p>
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-emerald-300" />
                <span className="text-xs text-emerald-300">92% barras online · 8% offline (sync ok)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-400/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 text-sm font-medium">Sugerencia IA</p>
                <p className="text-xs text-slate-400 mt-1">
                  La Barra Norte tiene un promedio de 41s por transacción. Agregar 2 dispositivos NFC reduciría a 32s (+30% throughput).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
