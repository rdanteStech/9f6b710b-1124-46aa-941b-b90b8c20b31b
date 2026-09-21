import { useState, useEffect } from 'react';
import {
  Users, Split, CreditCard, Bell, QrCode, Plus, Minus, Check,
  UserPlus, DollarSign, Percent, Divide, Hand, Sparkles, Radio, Wifi
} from 'lucide-react';
import { formatCLP } from '../lib/locale';

interface Diner {
  id: string;
  name: string;
  color: string;
  avatar: string;
  items: DinerItem[];
  connected: boolean;
}

interface DinerItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  shared?: string[];
}

interface TableSession {
  tableId: string;
  tableNumber: number;
  status: 'active' | 'requesting-bill' | 'paid';
  waiter: string;
  startedAt: string;
  diners: Diner[];
}

const seedSession: TableSession = {
  tableId: 't-12',
  tableNumber: 12,
  status: 'active',
  waiter: 'Camila Rojas',
  startedAt: '20:14',
  diners: [
    {
      id: 'd1', name: 'Matías', color: 'from-purple-500 to-pink-500', avatar: 'M', connected: true,
      items: [
        { itemId: 'i1', name: 'Ravioles de centolla', price: 14900, qty: 1 },
        { itemId: 'i2', name: 'Malbec copa', price: 6500, qty: 2 }
      ]
    },
    {
      id: 'd2', name: 'Sofía', color: 'from-blue-500 to-cyan-500', avatar: 'S', connected: true,
      items: [
        { itemId: 'i3', name: 'Risotto trufa', price: 13500, qty: 1 },
        { itemId: 'i4', name: 'Agua mineral', price: 3200, qty: 1 }
      ]
    },
    {
      id: 'd3', name: 'Andrés', color: 'from-emerald-500 to-teal-500', avatar: 'A', connected: true,
      items: [
        { itemId: 'i5', name: 'Ojo de bife 350g', price: 22900, qty: 1 },
        { itemId: 'i6', name: 'Cabernet copa', price: 7200, qty: 1 }
      ]
    },
    {
      id: 'd4', name: 'Valentina', color: 'from-amber-500 to-orange-500', avatar: 'V', connected: true,
      items: [
        { itemId: 'i7', name: 'Tiramisú', price: 6900, qty: 1, shared: ['d1', 'd2'] },
        { itemId: 'i8', name: 'Espresso doble', price: 3500, qty: 1 }
      ]
    }
  ]
};

type SplitMode = 'exact' | 'equal' | 'shared' | 'custom';

export default function GastroTable() {
  const [session] = useState<TableSession>(seedSession);
  const [splitMode, setSplitMode] = useState<SplitMode>('exact');
  const [selectedDiner, setSelectedDiner] = useState<string>(session.diners[0].id);
  const [nfcPaying, setNfcPaying] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);

  const dinerTotal = (d: Diner) =>
    d.items.reduce((s, i) => {
      if (i.shared && i.shared.length > 0) {
        return s + (i.price * i.qty) / (i.shared.length + 1);
      }
      return s + i.price * i.qty;
    }, 0);

  const grandTotal = session.diners.reduce((s, d) => {
    return s + d.items.reduce((ss, i) => ss + i.price * i.qty, 0);
  }, 0);

  const tip = grandTotal * 0.1;
  const finalTotal = grandTotal + tip;

  const startNfcPayment = () => {
    setNfcPaying(true);
    setNfcSuccess(false);
    setTimeout(() => {
      setNfcSuccess(true);
      setTimeout(() => { setNfcPaying(false); setNfcSuccess(false); }, 2500);
    }, 2200);
  };

  const activeDiner = session.diners.find(d => d.id === selectedDiner)!;

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroTable</h1>
                <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-200">
                  Carta QR Colaborativa
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Sesión grupal en tiempo real · Comensales comparten carrito y dividen la cuenta
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-emerald-300 text-sm font-medium">WebSocket · Live</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-500">Mesa</p>
                <p className="text-white font-bold">#{session.tableNumber} · {session.diners.length} comensales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Diners lista */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold">Comensales conectados</h2>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          {session.diners.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDiner(d.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDiner === d.id
                  ? 'bg-white/10 border-white/30 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${d.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{d.name}</p>
                    {d.connected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-500">{d.items.length} items · {formatCLP(dinerTotal(d))}</p>
                </div>
              </div>
            </button>
          ))}

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Hand className="w-4 h-4 text-amber-300" />
              <p className="text-amber-200 font-semibold text-sm">Solicitud del garzón</p>
            </div>
            <p className="text-xs text-slate-300">Andrés levantó la mano → detectado por GastroEye</p>
            <button className="mt-3 w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-sm font-medium border border-amber-400/30 cursor-pointer">
              Notificar a Camila Rojas
            </button>
          </div>
        </div>

        {/* Detalle + split */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeDiner.color} flex items-center justify-center text-white font-bold`}>
                  {activeDiner.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold">Consumo de {activeDiner.name}</p>
                  <p className="text-xs text-slate-500">Actualizado en vivo</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{formatCLP(dinerTotal(activeDiner))}</p>
            </div>

            <div className="space-y-2">
              {activeDiner.items.map(item => (
                <div key={item.itemId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm">{item.name}</p>
                      {item.shared && item.shared.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs text-purple-200 border border-purple-400/30">
                          Compartido ×{item.shared.length + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{formatCLP(item.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/20">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white font-medium w-6 text-center">{item.qty}</span>
                    <button className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/20">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Split modes */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Split className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Formas de dividir la cuenta</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'exact', label: 'Consumo exacto', icon: DollarSign },
                { id: 'equal', label: 'División 100% equitativa', icon: Divide },
                { id: 'shared', label: 'Ítems compartidos', icon: Users },
                { id: 'custom', label: 'Subgrupos proporcionales', icon: Percent }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id as SplitMode)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    splitMode === mode.id
                      ? 'bg-purple-500/20 border-purple-400/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <mode.icon className={`w-5 h-5 mb-2 ${splitMode === mode.id ? 'text-purple-300' : 'text-slate-400'}`} />
                  <p className="text-xs text-white text-left leading-tight">{mode.label}</p>
                </button>
              ))}
            </div>

            {/* Desglose */}
            <div className="space-y-2 mb-4">
              {session.diners.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${d.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {d.avatar}
                    </div>
                    <p className="text-white text-sm">{d.name}</p>
                  </div>
                  <p className="text-white font-medium">
                    {formatCLP(splitMode === 'equal' ? finalTotal / session.diners.length : dinerTotal(d) * 1.1)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span><span>{formatCLP(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Propina 10%</span><span>{formatCLP(tip)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span><span>{formatCLP(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* NFC pay */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-400/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-300" />
                <h3 className="text-white font-semibold">Smart POS NFC · Camila Rojas</h3>
              </div>
              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-xs text-blue-200 border border-blue-400/30">
                Contactless activo
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              El garzón puede cobrar con su celular (tarjetas contactless, Apple Pay, Google Pay, MercadoPago QR).
            </p>

            <button
              onClick={startNfcPayment}
              disabled={nfcPaying}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                nfcSuccess
                  ? 'bg-emerald-500 text-white'
                  : nfcPaying
                  ? 'bg-blue-500/50 text-white/70'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-blue-500/30'
              }`}
            >
              {nfcSuccess ? (
                <><Check className="w-5 h-5" /> Pago aprobado · {formatCLP(finalTotal)}</>
              ) : nfcPaying ? (
                <>
                  <Wifi className="w-5 h-5 animate-pulse" />
                  Acerca la tarjeta al celular…
                </>
              ) : (
                <><CreditCard className="w-5 h-5" /> Cobrar {formatCLP(finalTotal)} con NFC</>
              )}
            </button>

            {nfcPaying && !nfcSuccess && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    style={{
                      opacity: (Math.sin((pulse + i * 15) / 10) + 1) / 2
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-400/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-200 font-medium text-sm">Sugerencia IA</p>
              <p className="text-xs text-slate-400 mt-1">
                Sofía suele pedir postre después del risotto. Ofrecerle el tiramisú (que ya está compartido) puede convertir +{formatCLP(3450)} adicionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
