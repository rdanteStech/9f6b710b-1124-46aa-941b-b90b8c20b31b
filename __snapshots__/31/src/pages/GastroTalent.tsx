import { useState } from 'react'
import { STAFF_DATA } from '../data/mockData'
import {
  Users, Clock, Star, Plus, Search, Calendar, Award,
  CheckCircle, AlertCircle, Coffee, Briefcase, TrendingUp,
  ChevronDown, ChevronRight, Building2, Crown, ChefHat,
  UtensilsCrossed, Wine, ShoppingCart, Settings, Edit3,
  MoreHorizontal, UserPlus, Layers
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

// ─── Org Chart Data ───────────────────────────────────────────────────────────
interface OrgNode {
  id: string
  name: string
  role: string
  department: string
  avatar: string
  color: string
  status: 'active' | 'vacation' | 'off'
  reports?: OrgNode[]
}

const ORG_DATA: OrgNode = {
  id: '1',
  name: 'Martín Rodríguez',
  role: 'Dueño / Director General',
  department: 'Dirección',
  avatar: 'MR',
  color: '#9E7FFF',
  status: 'active',
  reports: [
    {
      id: '2',
      name: 'Sofía Herrera',
      role: 'Gerente General',
      department: 'Gerencia',
      avatar: 'SH',
      color: '#38bdf8',
      status: 'active',
      reports: [
        {
          id: '3',
          name: 'Carlos Méndez',
          role: 'Chef Ejecutivo',
          department: 'Cocina',
          avatar: 'CM',
          color: '#f59e0b',
          status: 'active',
          reports: [
            {
              id: '6',
              name: 'Luis Paredes',
              role: 'Sous Chef',
              department: 'Cocina',
              avatar: 'LP',
              color: '#f59e0b',
              status: 'active',
              reports: [
                { id: '10', name: 'Ana Ríos', role: 'Cocinero/a', department: 'Cocina', avatar: 'AR', color: '#f59e0b', status: 'active' },
                { id: '11', name: 'Pedro Vega', role: 'Cocinero/a', department: 'Cocina', avatar: 'PV', color: '#f59e0b', status: 'off' },
                { id: '12', name: 'Lucía Mora', role: 'Pastelera', department: 'Cocina', avatar: 'LM', color: '#f59e0b', status: 'active' },
              ]
            },
          ]
        },
        {
          id: '4',
          name: 'Valentina Castro',
          role: 'Jefa de Salón',
          department: 'Salón',
          avatar: 'VC',
          color: '#f472b6',
          status: 'active',
          reports: [
            { id: '7', name: 'María González', role: 'Moza Senior', department: 'Salón', avatar: 'MG', color: '#f472b6', status: 'active' },
            { id: '8', name: 'Roberto Sosa', role: 'Mozo', department: 'Salón', avatar: 'RS', color: '#f472b6', status: 'vacation' },
            { id: '9', name: 'Camila Torres', role: 'Moza', department: 'Salón', avatar: 'CT', color: '#f472b6', status: 'active' },
          ]
        },
        {
          id: '5',
          name: 'Diego Fuentes',
          role: 'Jefe de Barra',
          department: 'Barra',
          avatar: 'DF',
          color: '#10b981',
          status: 'active',
          reports: [
            { id: '13', name: 'Nicolás Paz', role: 'Bartender', department: 'Barra', avatar: 'NP', color: '#10b981', status: 'active' },
            { id: '14', name: 'Florencia Gil', role: 'Barista', department: 'Barra', avatar: 'FG', color: '#10b981', status: 'active' },
          ]
        },
      ]
    }
  ]
}

const DEPT_COLORS: Record<string, string> = {
  'Dirección': '#9E7FFF',
  'Gerencia': '#38bdf8',
  'Cocina': '#f59e0b',
  'Salón': '#f472b6',
  'Barra': '#10b981',
}

const STATUS_CONFIG = {
  active: { label: 'Activo', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  vacation: { label: 'Vacaciones', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  off: { label: 'Libre', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

// ─── OrgCard Component ────────────────────────────────────────────────────────
function OrgCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasReports = node.reports && node.reports.length > 0
  const status = STATUS_CONFIG[node.status]
  const isRoot = depth === 0

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className="relative group">
        <div
          className="rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-105"
          style={{
            background: isRoot
              ? `linear-gradient(135deg, rgba(158,127,255,0.18), rgba(56,189,248,0.10))`
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isRoot ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
            minWidth: isRoot ? '200px' : '160px',
            boxShadow: isRoot ? '0 0 24px rgba(158,127,255,0.15)' : 'none',
          }}
          onClick={() => hasReports && setExpanded(!expanded)}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white relative"
              style={{ background: `linear-gradient(135deg, ${node.color}, ${node.color}99)` }}
            >
              {node.avatar}
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                style={{
                  background: status.color,
                  borderColor: '#171717',
                }}
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-gastro-text text-xs leading-tight">{node.name}</div>
              <div className="text-xs mt-0.5" style={{ color: node.color }}>{node.role}</div>
              <div
                className="text-xs mt-1.5 px-2 py-0.5 rounded-full inline-block"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </div>
            </div>
          </div>

          {/* Expand toggle */}
          {hasReports && (
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
              style={{ background: node.color, border: '2px solid #171717' }}
            >
              {expanded
                ? <ChevronDown size={12} className="text-white" />
                : <ChevronRight size={12} className="text-white" />
              }
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(158,127,255,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <Edit3 size={10} className="text-primary-400" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasReports && expanded && (
        <div className="flex flex-col items-center mt-6">
          {/* Vertical line down */}
          <div className="w-px h-6" style={{ background: '#2a2a3d' }} />

          {/* Horizontal line + children */}
          <div className="flex items-start gap-0">
            {node.reports!.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Horizontal connector */}
                <div
                  className="h-px"
                  style={{
                    background: '#2a2a3d',
                    width: node.reports!.length === 1 ? '0px' : '100%',
                    position: 'absolute',
                    top: 0,
                    left: idx === 0 ? '50%' : 0,
                    right: idx === node.reports!.length - 1 ? '50%' : 0,
                  }}
                />
                {/* Vertical line to child */}
                <div className="w-px h-6" style={{ background: '#2a2a3d' }} />
                <div className="px-3">
                  <OrgCard node={child} depth={depth + 1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Department Legend ────────────────────────────────────────────────────────
function DeptLegend() {
  const depts = [
    { name: 'Dirección', color: '#9E7FFF', count: 1, icon: Crown },
    { name: 'Gerencia', color: '#38bdf8', count: 1, icon: Building2 },
    { name: 'Cocina', color: '#f59e0b', count: 5, icon: ChefHat },
    { name: 'Salón', color: '#f472b6', count: 4, icon: UtensilsCrossed },
    { name: 'Barra', color: '#10b981', count: 3, icon: Wine },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {depts.map(d => {
        const Icon = d.icon
        return (
          <div
            key={d.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: `${d.color}12`, border: `1px solid ${d.color}30`, color: d.color }}
          >
            <Icon size={12} />
            {d.name}
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-black"
              style={{ background: d.color, fontSize: '9px' }}
            >
              {d.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GastroTalent() {
  const [activeView, setActiveView] = useState<'team' | 'shifts' | 'recruitment' | 'organigrama'>('team')

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'team', label: 'Equipo' },
            { id: 'shifts', label: 'Turnos' },
            { id: 'recruitment', label: 'Reclutamiento' },
            { id: 'organigrama', label: 'Organigrama' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Agregar empleado
        </button>
      </div>

      {/* ── Team ── */}
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

      {/* ── Shifts ── */}
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

      {/* ── Recruitment ── */}
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

      {/* ── Organigrama ── */}
      {activeView === 'organigrama' && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="card-gastro">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(158,127,255,0.15)' }}>
                    <Layers size={16} className="text-primary-400" />
                  </div>
                  <h3 className="font-bold text-gastro-text">Organigrama del Restaurante</h3>
                </div>
                <p className="text-sm text-gastro-subtle ml-11">Estructura jerárquica del equipo · 14 personas en 5 departamentos</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs px-3 py-2">
                  <Settings size={13} /> Editar estructura
                </button>
                <button className="btn-primary text-xs px-3 py-2">
                  <UserPlus size={13} /> Agregar posición
                </button>
              </div>
            </div>

            {/* Department legend */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2a2a3d' }}>
              <div className="text-xs text-gastro-subtle mb-2 font-semibold uppercase tracking-wider">Departamentos</div>
              <DeptLegend />
            </div>

            {/* Status legend */}
            <div className="mt-3 flex gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-gastro-subtle">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
                  {val.label}
                </div>
              ))}
            </div>
          </div>

          {/* Org chart canvas */}
          <div
            className="card-gastro overflow-auto"
            style={{ minHeight: '520px' }}
          >
            <div className="flex justify-center py-6" style={{ minWidth: '900px' }}>
              <OrgCard node={ORG_DATA} depth={0} />
            </div>
          </div>

          {/* Quick stats by dept */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { dept: 'Dirección', count: 1, color: '#9E7FFF', icon: Crown },
              { dept: 'Gerencia', count: 1, color: '#38bdf8', icon: Building2 },
              { dept: 'Cocina', count: 5, color: '#f59e0b', icon: ChefHat },
              { dept: 'Salón', count: 4, color: '#f472b6', icon: UtensilsCrossed },
              { dept: 'Barra', count: 3, color: '#10b981', icon: Wine },
            ].map(d => {
              const Icon = d.icon
              return (
                <div
                  key={d.dept}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: `${d.color}08`, border: `1px solid ${d.color}25` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${d.color}18` }}
                  >
                    <Icon size={18} style={{ color: d.color }} />
                  </div>
                  <div className="text-2xl font-black" style={{ color: d.color }}>{d.count}</div>
                  <div className="text-xs text-gastro-subtle mt-0.5">{d.dept}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
