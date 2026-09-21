import { useState } from 'react';
import {
  Building2, DollarSign, TrendingUp, FileText, Percent, MapPin,
  Sparkles, Download, ChevronRight, Award, ShoppingCart, Users
} from 'lucide-react';
import { formatCLP } from '../lib/locale';

interface Franchise {
  id: string;
  name: string;
  location: string;
  owner: string;
  status: 'active' | 'onboarding' | 'review';
  monthlyRevenue: number;
  royaltyRate: number;
  royaltyDue: number;
  paidOnTime: boolean;
  centralPurchaseVolume: number;
  compliance: number;
  openedAt: string;
}

const franchises: Franchise[] = [
  {
    id: 'f1', name: 'Trattoria Bellavista · Providencia', location: 'Av. Providencia 1234',
    owner: 'María Elena Pérez', status: 'active', monthlyRevenue: 84500000, royaltyRate: 6,
    royaltyDue: 5070000, paidOnTime: true, centralPurchaseVolume: 32800000, compliance: 96,
    openedAt: 'Enero 2023'
  },
  {
    id: 'f2', name: 'Trattoria Bellavista · Las Condes', location: 'Alonso de Córdova 5870',
    owner: 'Roberto Silva', status: 'active', monthlyRevenue: 128400000, royaltyRate: 6,
    royaltyDue: 7704000, paidOnTime: true, centralPurchaseVolume: 48200000, compliance: 92,
    openedAt: 'Mayo 2022'
  },
  {
    id: 'f3', name: 'Trattoria Bellavista · Viña del Mar', location: 'Av. San Martín 458',
    owner: 'Isabel Contreras', status: 'active', monthlyRevenue: 62300000, royaltyRate: 6,
    royaltyDue: 3738000, paidOnTime: false, centralPurchaseVolume: 21400000, compliance: 78,
    openedAt: 'Agosto 2023'
  },
  {
    id: 'f4', name: 'Trattoria Bellavista · Concepción', location: 'Barros Arana 890',
    owner: 'Andrés Muñoz', status: 'onboarding', monthlyRevenue: 0, royaltyRate: 6,
    royaltyDue: 0, paidOnTime: true, centralPurchaseVolume: 0, compliance: 100,
    openedAt: 'Abr 2025 (proyectada)'
  },
  {
    id: 'f5', name: 'Trattoria Bellavista · Puerto Varas', location: 'Del Salvador 320',
    owner: 'Carolina Vega', status: 'active', monthlyRevenue: 42800000, royaltyRate: 6,
    royaltyDue: 2568000, paidOnTime: true, centralPurchaseVolume: 16400000, compliance: 88,
    openedAt: 'Nov 2023'
  }
];

export default function GastroFranchise() {
  const [selectedId, setSelectedId] = useState<string>(franchises[0].id);
  const selected = franchises.find(f => f.id === selectedId)!;

  const active = franchises.filter(f => f.status === 'active');
  const totalRevenue = active.reduce((s, f) => s + f.monthlyRevenue, 0);
  const totalRoyalties = active.reduce((s, f) => s + f.royaltyDue, 0);
  const totalCentralPurchases = active.reduce((s, f) => s + f.centralPurchaseVolume, 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">GastroFranchise</h1>
                <span className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
                  Multi-sociedad · Royalties
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Consolidación contable · Cálculo automatizado de royalties · Central de compras corporativa
              </p>
            </div>
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium flex items-center gap-2 hover:shadow-xl hover:shadow-indigo-500/30 cursor-pointer">
              <Download className="w-5 h-5" /> Exportar consolidado
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-indigo-300" />
              <p className="text-slate-400 text-sm">Sucursales activas</p>
            </div>
            <p className="text-3xl font-bold text-white">{active.length}</p>
            <p className="text-xs text-slate-500 mt-1">+ 1 en apertura</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              <p className="text-slate-400 text-sm">Facturación mes</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(totalRevenue)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-purple-300" />
              <p className="text-purple-200 text-sm">Royalties devengados</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(totalRoyalties)}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-cyan-300" />
              <p className="text-slate-400 text-sm">Compras centrales</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCLP(totalCentralPurchases)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Franchise list */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-white font-semibold mb-2">Sucursales franquiciadas</h3>
            {franchises.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedId === f.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20">
                    <Building2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{f.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        f.status === 'active' ? 'bg-emerald-500/20 text-emerald-200' :
                        f.status === 'onboarding' ? 'bg-amber-500/20 text-amber-200' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {f.status === 'active' ? 'Activa' : f.status === 'onboarding' ? 'En apertura' : 'Revisión'}
                      </span>
                      {!f.paidOnTime && f.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 text-xs">Royalty atrasado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {f.owner}</span>
                    </div>
                    {f.status === 'active' && (
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <p className="text-xs text-slate-500">Facturación</p>
                          <p className="text-white font-bold text-sm">{formatCLP(f.monthlyRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Royalty {f.royaltyRate}%</p>
                          <p className="text-purple-300 font-bold text-sm">{formatCLP(f.royaltyDue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Compliance</p>
                          <p className={`font-bold text-sm ${f.compliance >= 90 ? 'text-emerald-300' : f.compliance >= 80 ? 'text-amber-300' : 'text-rose-300'}`}>
                            {f.compliance}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 w-fit mb-3">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-semibold">{selected.name}</p>
              <p className="text-xs text-slate-400 mb-4">Abierto: {selected.openedAt}</p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Titular</span>
                    <span className="text-white">{selected.owner}</span>
                  </div>
                </div>
                {selected.status === 'active' && (
                  <>
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-slate-500 mb-1">Compras centralizadas mes</p>
                      <p className="text-lg font-bold text-white">{formatCLP(selected.centralPurchaseVolume)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Compliance</span>
                        <span className="text-white">{selected.compliance}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full ${
                          selected.compliance >= 90 ? 'bg-emerald-400' :
                          selected.compliance >= 80 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} style={{ width: `${selected.compliance}%` }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center justify-center gap-2 border border-white/10 cursor-pointer">
              <FileText className="w-4 h-4" /> Ver contrato y anexos
            </button>

            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-400/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 text-sm font-medium">Panel Global de Predicciones</p>
                <p className="text-xs text-slate-400 mt-1">
                  La sucursal Viña del Mar muestra ↓12% de compras centrales este trimestre. Posible fuga a proveedores locales — auditar catálogo asignado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
