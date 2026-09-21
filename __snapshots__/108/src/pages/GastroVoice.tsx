import { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, Headphones, Waves, Check, Clock, Sparkles,
  ChefHat, Radio, Zap, ArrowRight
} from 'lucide-react';

interface VoiceLog {
  id: string;
  timestamp: string;
  speaker: string;
  transcript: string;
  intent: string;
  action: string;
  confidence: number;
  status: 'processed' | 'listening' | 'error';
}

const seedLogs: VoiceLog[] = [
  {
    id: '1', timestamp: '20:47:12', speaker: 'Chef Diego',
    transcript: 'Marcar el ravioles de la mesa doce como listo',
    intent: 'kds.mark_ready', action: 'Ravioles centolla · Mesa 12 → LISTO',
    confidence: 98, status: 'processed'
  },
  {
    id: '2', timestamp: '20:47:04', speaker: 'Cocina fría',
    transcript: 'Reservar ceviche para pedido del delivery',
    intent: 'kds.reserve', action: 'Ceviche corvina · reservado 5 min',
    confidence: 94, status: 'processed'
  },
  {
    id: '3', timestamp: '20:46:51', speaker: 'Chef Diego',
    transcript: 'Cuánto tiempo lleva el bife de la mesa siete',
    intent: 'kds.query_time', action: 'Ojo de bife M7 · 8 min · en cocción',
    confidence: 96, status: 'processed'
  },
  {
    id: '4', timestamp: '20:46:33', speaker: 'Parrilla',
    transcript: 'Necesito reposición de sal gruesa urgente',
    intent: 'inventory.alert', action: 'Alerta a bodeguero · Sal gruesa',
    confidence: 91, status: 'processed'
  }
];

export default function GastroVoice() {
  const [listening, setListening] = useState(true);
  const [logs] = useState<VoiceLog[]>(seedLogs);
  const [waveform, setWaveform] = useState<number[]>(Array(40).fill(0.3));

  useEffect(() => {
    if (!listening) return;
    const t = setInterval(() => {
      setWaveform(Array(40).fill(0).map(() => Math.random() * 0.7 + 0.2));
    }, 100);
    return () => clearInterval(t);
  }, [listening]);

  const totalToday = 342;
  const accuracy = 96.4;
  const timeSaved = 47;

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroVoice</h1>
                <span className="px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-xs font-semibold text-cyan-200">
                  Voice-KDS · NLP en cocina
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Auriculares inteligentes con procesamiento de lenguaje natural · Manos libres para chefs
              </p>
            </div>
            <button
              onClick={() => setListening(!listening)}
              className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-all ${
                listening
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              {listening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              {listening ? 'Escuchando · Cocina activa' : 'Micrófonos apagados'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live listening panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-300" />
                  <h3 className="text-white font-semibold">Audio en vivo · Estación caliente</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-xs font-medium">Chef Diego conectado</span>
                </div>
              </div>

              <div className="flex items-center gap-1 h-24 mb-6">
                {waveform.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full transition-all duration-100"
                    style={{ height: `${v * 100}%`, opacity: listening ? 1 : 0.2 }}
                  />
                ))}
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">Transcripción en tiempo real</p>
                <p className="text-white text-lg font-medium">
                  {listening
                    ? '"Marcar el risotto de la mesa quince como listo para servir…"'
                    : 'Micrófonos silenciados'}
                </p>
                {listening && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs">Intent: kds.mark_ready</div>
                    <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs">Confianza: 97%</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice log */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Registro de comandos</h3>
              <span className="text-xs text-slate-500">Últimos 60 minutos</span>
            </div>

            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Mic className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm">{log.speaker}</p>
                        <span className="text-xs text-slate-500">{log.timestamp}</span>
                        <span className="ml-auto text-xs text-emerald-300">{log.confidence}% ✓</span>
                      </div>
                      <p className="text-slate-300 text-sm italic mb-2">"{log.transcript}"</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400">{log.intent}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-300">{log.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs + estaciones */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-300" />
              <p className="text-emerald-200 text-sm font-medium">Comandos hoy</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalToday}</p>
            <p className="text-xs text-slate-400 mt-1">+18% vs. ayer</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Precisión NLP</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{accuracy}%</p>
              <span className="text-xs text-emerald-300">+2.1% semana</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${accuracy}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-purple-300" />
              <p className="text-white text-sm font-medium">Tiempo ahorrado</p>
            </div>
            <p className="text-3xl font-bold text-white">{timeSaved} min</p>
            <p className="text-xs text-slate-500 mt-1">Estimado en manipulación KDS táctil</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-white font-medium text-sm mb-3">Estaciones conectadas</h4>
            <div className="space-y-2">
              {[
                { name: 'Caliente', chef: 'Diego Muñoz', active: true },
                { name: 'Fría', chef: 'Paula Silva', active: true },
                { name: 'Parrilla', chef: 'Rodrigo Cea', active: true },
                { name: 'Panadería', chef: 'Ana Herrera', active: false }
              ].map(s => (
                <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className={`p-1.5 rounded-lg ${s.active ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                    <ChefHat className={`w-3.5 h-3.5 ${s.active ? 'text-emerald-300' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.chef}</p>
                  </div>
                  {s.active && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-400/20 flex gap-3">
            <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-200 text-sm font-medium">Sugerencia IA</p>
              <p className="text-xs text-slate-400 mt-1">
                Diego usa 12 comandos de "marcar listo" por hora. Considera un shortcut de voz "todo listo mesa X".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
