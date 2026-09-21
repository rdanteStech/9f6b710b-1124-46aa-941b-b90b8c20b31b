import { useState } from 'react';
import {
  Star, MessageCircle, TrendingUp, AlertCircle, ThumbsUp, Reply, Filter,
  Sparkles, Award, ExternalLink, Search
} from 'lucide-react';

interface Review {
  id: string;
  source: 'Google' | 'TripAdvisor' | 'App propia' | 'Instagram';
  author: string;
  rating: number;
  content: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  responded: boolean;
  keywords: string[];
}

const reviews: Review[] = [
  {
    id: 'r1', source: 'Google', author: 'María Fernanda O.', rating: 5,
    content: 'Los ravioles de centolla son una experiencia. Ambiente cálido, servicio impecable con Camila. Volveré sin duda.',
    date: 'hace 2h', sentiment: 'positive', responded: false, keywords: ['ravioles', 'centolla', 'servicio']
  },
  {
    id: 'r2', source: 'TripAdvisor', author: 'Carlos R.', rating: 2,
    content: 'La comida buena pero esperamos 45 minutos por la mesa aun con reserva. La coordinación en la entrada fue un desastre.',
    date: 'hace 4h', sentiment: 'negative', responded: false, keywords: ['espera', 'reserva', 'coordinación']
  },
  {
    id: 'r3', source: 'Google', author: 'Andrea V.', rating: 5,
    content: 'Trattoria Bellavista superó mis expectativas. El maridaje que sugirió el sommelier fue perfecto.',
    date: 'hace 6h', sentiment: 'positive', responded: true, keywords: ['maridaje', 'sommelier']
  },
  {
    id: 'r4', source: 'App propia', author: 'José Luis M.', rating: 3,
    content: 'La comida rica pero el postre llegó frío. Precios acordes al ambiente.',
    date: 'hace 8h', sentiment: 'neutral', responded: false, keywords: ['postre', 'frío', 'precios']
  },
  {
    id: 'r5', source: 'TripAdvisor', author: 'Isabella G.', rating: 5,
    content: 'Best Italian food in Bellavista. The tiramisu is worth every peso. Highly recommended for date night.',
    date: 'hace 1d', sentiment: 'positive', responded: true, keywords: ['tiramisu', 'Bellavista', 'date night']
  },
  {
    id: 'r6', source: 'Google', author: 'Rodrigo P.', rating: 1,
    content: 'El garzón fue seco y poco atento. Cobraron un consumo mínimo que no estaba en la carta. Muy mal.',
    date: 'hace 1d', sentiment: 'negative', responded: false, keywords: ['garzón', 'consumo mínimo', 'cobros']
  }
];

const sourceColors: Record<string, string> = {
  'Google': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  'TripAdvisor': 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  'App propia': 'bg-purple-500/20 text-purple-200 border-purple-400/30',
  'Instagram': 'bg-pink-500/20 text-pink-200 border-pink-400/30'
};

export default function GastroReputation() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'no-response'>('all');

  const filtered = reviews.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'no-response') return !r.responded;
    return r.sentiment === filter;
  });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;
  const unanswered = reviews.filter(r => !r.responded).length;

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroReputation</h1>
                <span className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-semibold text-amber-200">
                  Reputación unificada
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Google · TripAdvisor · App propia · Instagram — todo en un solo panel con alertas tempranas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span className="text-2xl font-bold text-white">{avgRating}</span>
                <span className="text-slate-400 text-sm">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Positivas</p>
            </div>
            <p className="text-3xl font-bold text-white">{positive}</p>
          </div>
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-400/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-300" />
              <p className="text-rose-200 text-sm">Negativas</p>
            </div>
            <p className="text-3xl font-bold text-white">{negative}</p>
            <p className="text-xs text-slate-500 mt-1">Requieren respuesta urgente</p>
          </div>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Reply className="w-4 h-4 text-amber-300" />
              <p className="text-amber-200 text-sm">Sin responder</p>
            </div>
            <p className="text-3xl font-bold text-white">{unanswered}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-300" />
              <p className="text-slate-400 text-sm">Tendencia mes</p>
            </div>
            <p className="text-3xl font-bold text-emerald-300">+0.3</p>
            <p className="text-xs text-slate-500 mt-1">↑ vs. mes anterior</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-400/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-rose-200 font-semibold">Alerta temprana</p>
              <p className="text-slate-300 text-sm mt-1">
                Detectamos 2 reseñas negativas en las últimas 24h mencionando "espera" y "coordinación en la entrada". Sugerimos contactar al gerente de piso hoy mismo.
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-200 text-sm font-medium hover:bg-rose-500/30 border border-rose-400/30 cursor-pointer whitespace-nowrap">
              Ver plan de acción
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          {[
            { id: 'all', label: 'Todas', count: reviews.length },
            { id: 'positive', label: 'Positivas', count: positive },
            { id: 'negative', label: 'Negativas', count: negative },
            { id: 'no-response', label: 'Sin responder', count: unanswered }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all ${
                filter === f.id
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {f.label} · {f.count}
            </button>
          ))}
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`p-5 rounded-2xl border ${
              r.sentiment === 'negative' ? 'bg-rose-500/5 border-rose-400/20' :
              r.sentiment === 'positive' ? 'bg-emerald-500/5 border-emerald-400/20' :
              'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shrink-0">
                  {r.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-medium">{r.author}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${sourceColors[r.source]}`}>
                      {r.source}
                    </span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-300 fill-amber-300' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{r.date}</p>
                  <p className="text-slate-300 text-sm mb-3">{r.content}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {r.keywords.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs">#{k}</span>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      {r.responded ? (
                        <span className="text-xs text-emerald-300 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Respondida
                        </span>
                      ) : (
                        <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 cursor-pointer">
                          <Sparkles className="w-3 h-3" /> Responder con IA
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
