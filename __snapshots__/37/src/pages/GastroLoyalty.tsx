import { LOYALTY_MEMBERS } from '../data/mockData'
import {
  Heart, Star, Gift, Users, TrendingUp, Crown,
  Plus, Search, Mail, Smartphone, ChevronRight, Award
} from 'lucide-react'

const TIER_CONFIG = {
  Platinum: { color: '#9E7FFF', bg: 'rgba(158,127,255,0.12)', icon: Crown },
  Gold: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Award },
  Silver: { color: '#8888aa', bg: 'rgba(136,136,170,0.12)', icon: Star },
}

const CAMPAIGNS = [
  { id: 1, name: 'Cumpleaños VIP', type: 'Email + Push', status: 'active', sent: 48, opened: 38, converted: 22 },
  { id: 2, name: 'Miércoles de vino', type: 'Push notification', status: 'active', sent: 284, opened: 198, converted: 87 },
  { id: 3, name: 'Reactivación inactivos', type: 'Email', status: 'scheduled', sent: 0, opened: 0, converted: 0 },
]

export default function GastroLoyalty() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Miembros activos', value: '1.284', color: '#f472b6', icon: Users },
          { label: 'Puntos emitidos', value: '284K', color: '#9E7FFF', icon: Star },
          { label: 'Tasa de retención', value: '78%', color: '#10b981', icon: TrendingUp },
          { label: 'Valor promedio miembro', value: '$48K', color: '#f59e0b', icon: Crown },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-2 card-gastro">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gastro-text">Top miembros</h3>
            <button className="btn-primary text-xs px-3 py-2"><Plus size={13} /> Agregar miembro</button>
          </div>
          <div className="space-y-3">
            {LOYALTY_MEMBERS.map((member, i) => {
              const cfg = TIER_CONFIG[member.tier as keyof typeof TIER_CONFIG]
              const TierIcon = cfg.icon
              return (
                <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-black text-gastro-muted w-4">{i + 1}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #9E7FFF, #f472b6)' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gastro-text text-sm">{member.name}</div>
                    <div className="text-xs text-gastro-subtle">{member.visits} visitas · Último: {member.lastVisit}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gastro-text text-sm">{member.points.toLocaleString()}</div>
                    <div className="text-xs text-gastro-subtle">puntos</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: cfg.bg }}>
                    <TierIcon size={12} style={{ color: cfg.color }} />
                    <span className="text-xs font-bold" style={{ color: cfg.color }}>{member.tier}</span>
                  </div>
                  <ChevronRight size={14} className="text-gastro-muted" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-4">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4">Niveles de fidelización</h3>
            <div className="space-y-3">
              {[
                { tier: 'Platinum', members: 48, min: 10000, color: '#9E7FFF', perks: ['20% descuento', 'Mesa prioritaria', 'Sommelier personal'] },
                { tier: 'Gold', members: 186, min: 5000, color: '#f59e0b', perks: ['15% descuento', 'Reserva prioritaria', 'Postre de regalo'] },
                { tier: 'Silver', members: 412, min: 2000, color: '#8888aa', perks: ['10% descuento', 'Puntos dobles martes'] },
                { tier: 'Bronze', members: 638, min: 0, color: '#cd7f32', perks: ['5% descuento', 'Puntos por visita'] },
              ].map(tier => (
                <div key={tier.tier} className="p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: tier.color }}>{tier.tier}</span>
                    <span className="text-xs text-gastro-subtle">{tier.members} miembros</span>
                  </div>
                  <div className="text-xs text-gastro-subtle mb-2">Desde {tier.min.toLocaleString()} pts</div>
                  <div className="flex flex-wrap gap-1">
                    {tier.perks.map(perk => (
                      <span key={perk} className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: `${tier.color}12`, color: tier.color }}>
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="card-gastro">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gastro-text">Campañas de marketing</h3>
          <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Nueva campaña</button>
        </div>
        <div className="space-y-3">
          {CAMPAIGNS.map(campaign => (
            <div key={campaign.id} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(244,114,182,0.12)' }}>
                {campaign.type.includes('Email') ? <Mail size={18} className="text-accent-400" /> : <Smartphone size={18} className="text-accent-400" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gastro-text text-sm">{campaign.name}</div>
                <div className="text-xs text-gastro-subtle">{campaign.type}</div>
              </div>
              {campaign.status === 'active' && (
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="font-bold text-gastro-text">{campaign.sent}</div>
                    <div className="text-xs text-gastro-subtle">Enviados</div>
                  </div>
                  <div>
                    <div className="font-bold text-gastro-text">{campaign.opened}</div>
                    <div className="text-xs text-gastro-subtle">Abiertos</div>
                  </div>
                  <div>
                    <div className="font-bold text-success">{campaign.converted}</div>
                    <div className="text-xs text-gastro-subtle">Convertidos</div>
                  </div>
                </div>
              )}
              <div className={`badge text-xs ${campaign.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {campaign.status === 'active' ? 'Activa' : 'Programada'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
