import { useState } from 'react'
import { STAFF_DATA } from '../data/mockData'
import {
  Users, Clock, Star, Plus, Search, Calendar, Award,
  CheckCircle, AlertCircle, Coffee, Briefcase, TrendingUp
} from 'lucide-react'

const SHIFTS = [
  { day: 'Lun', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.'] },
  { day: 'Mar', staff: ['Carlos M.', 'Valentina C.', 'Ana R.', 'Roberto S.'] },
  { day: 'Mié', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.'] },
  { day: 'Jue', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'Roberto S.'] },
  { day: 'Vie', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.', 'Roberto S.'] },
  { day: 'Sáb', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.', 'Roberto S.'] },
  { day: 'Dom', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.'] },
]

const JOB_LISTINGS = [
  { id: 1, role: 'Sous Chef', type: 'Full-time', applicants: 12, status: 'active', posted: 'Hace 3 días' },
  { id: 2, role: 'Mozo/Moza', type: 'Part-time', applicants: 28, status: 'active', posted: 'Hace 1 semana' },
  { id: 3, role: 'Bartender', type: 'Full-time', applicants: 8, status: 'reviewing', posted: 'Hace 2 semanas' },
]

export default function GastroTalent() {
  const [activeView, setActiveView] = useState<'team' | 'shifts' | 'recruitment'>('team')

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Personal activo', value: STAFF_DATA.filter(s => s.status === 'active').length, color: '#10b981', icon: Users },
          { label: 'Horas esta semana', value: '284', color: '#9E7FFF', icon: Clock },
          { label: 'Satisfacción promedio', value: '4.7', color: '#f59e0b', icon: Star },
          { label: 'Vacantes abiertas', value: JOB_LISTINGS.length, color: '#38bdf8', icon: Briefcase },
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'team', label: 'Equipo' },
            { id: 'shifts', label: 'Turnos' },
            { id: 'recruitment', label: 'Reclutamiento' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Agregar empleado
        </button>
      </div>

      {/* Team */}
      {activeView === 'team' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAFF_DATA.map(member => (
            <div key={member.id} className="card-gastro">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)' }}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gastro-text text-sm">{member.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
                  </div>
                  <div className="text-xs text-gastro-subtle mb-2">{member.role}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-warning fill-warning" />
                      <span className="text-xs font-bold text-gastro-text">{member.rating}</span>
                    </div>
                    <div className="text-xs text-gastro-subtle">{member.shift}</div>
                  </div>
                  <div className="mt-2">
                    <span className={`badge text-xs ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {member.status === 'active' ? 'En turno' : 'Descanso'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shifts */}
      {activeView === 'shifts' && (
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gastro-text">Turnos de la semana</h3>
            <button className="btn-secondary text-xs px-3 py-2"><Calendar size={13} /> Ver mes completo</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {SHIFTS.map(shift => (
              <div key={shift.day} className="text-center">
                <div className="text-xs font-bold text-gastro-subtle mb-2">{shift.day}</div>
                <div className="space-y-1">
                  {shift.staff.map(name => (
                    <div key={name} className="text-xs px-2 py-1 rounded-lg truncate"
                      style={{ background: 'rgba(158,127,255,0.1)', color: '#9E7FFF', border: '1px solid rgba(158,127,255,0.2)' }}>
                      {name.split(' ')[0]}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gastro-subtle mt-2">{shift.staff.length} personas</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recruitment */}
      {activeView === 'recruitment' && (
        <div className="space-y-4">
          <div className="card-gastro">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gastro-text">Vacantes activas</h3>
              <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Publicar vacante</button>
            </div>
            <div className="space-y-3">
              {JOB_LISTINGS.map(job => (
                <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(158,127,255,0.12)' }}>
                    <Briefcase size={18} className="text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gastro-text">{job.role}</div>
                    <div className="text-xs text-gastro-subtle">{job.type} · Publicado {job.posted}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-gastro-text">{job.applicants}</div>
                    <div className="text-xs text-gastro-subtle">postulantes</div>
                  </div>
                  <div className={`badge text-xs ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {job.status === 'active' ? 'Activa' : 'En revisión'}
                  </div>
                  <button className="btn-secondary text-xs px-3 py-2">Ver postulantes</button>
                </div>
              ))}
            </div>
          </div>

          {/* GastroNetwork teaser */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(158,127,255,0.06) 100%)', border: '1px solid rgba(244,114,182,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(244,114,182,0.15)' }}>
                <Award size={22} className="text-accent-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gastro-text mb-1">GastroNetwork — Red Profesional</h4>
                <p className="text-sm text-gastro-subtle">Accede a la red de más de 12.000 profesionales gastronómicos verificados. Matching inteligente por habilidades, experiencia y disponibilidad.</p>
              </div>
              <button className="btn-primary text-sm px-4 py-2 flex-shrink-0">Explorar red</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
