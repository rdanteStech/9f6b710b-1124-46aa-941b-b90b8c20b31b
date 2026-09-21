import { useState } from 'react'
import { Network, Users, Star, Briefcase, MapPin, Search, Filter, Plus, Heart, MessageCircle, Share2, CheckCircle } from 'lucide-react'

const PROFESSIONALS = [
  {
    id: 1, name: 'Chef Martín Acosta', role: 'Executive Chef', location: 'Buenos Aires', rating: 4.9,
    experience: '12 años', specialties: ['Cocina italiana', 'Pastas artesanales', 'Gestión de cocina'],
    available: true, avatar: 'MA', followers: 1284, posts: 48,
    image: 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?w=400',
    verified: true,
  },
  {
    id: 2, name: 'Ana Rodríguez', role: 'Sommelier & Wine Director', location: 'Mendoza', rating: 4.8,
    experience: '8 años', specialties: ['Vinos argentinos', 'Maridaje', 'Catas'],
    available: false, avatar: 'AR', followers: 892, posts: 31,
    image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?w=400',
    verified: true,
  },
  {
    id: 3, name: 'Roberto Silva', role: 'Bartender & Mixólogo', location: 'Córdoba', rating: 4.7,
    experience: '6 años', specialties: ['Cócteles clásicos', 'Mixología molecular', 'Bar management'],
    available: true, avatar: 'RS', followers: 654, posts: 22,
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400',
    verified: false,
  },
  {
    id: 4, name: 'Valentina Cruz', role: 'Sous Chef & Pastelera', location: 'Buenos Aires', rating: 4.9,
    experience: '9 años', specialties: ['Pastelería francesa', 'Chocolatería', 'Panadería artesanal'],
    available: true, avatar: 'VC', followers: 2140, posts: 87,
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=400',
    verified: true,
  },
  {
    id: 5, name: 'Diego Ramírez', role: 'Restaurant Manager', location: 'Rosario', rating: 4.6,
    experience: '10 años', specialties: ['Gestión operativa', 'Atención al cliente', 'Liderazgo de equipos'],
    available: false, avatar: 'DR', followers: 428, posts: 15,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400',
    verified: true,
  },
  {
    id: 6, name: 'Camila Torres', role: 'Chef de Partie', location: 'Buenos Aires', rating: 4.5,
    experience: '4 años', specialties: ['Cocina peruana', 'Ceviches', 'Cocina fusión'],
    available: true, avatar: 'CT', followers: 312, posts: 19,
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?w=400',
    verified: false,
  },
]

const FEED_POSTS = [
  {
    id: 1, author: 'Chef Martín Acosta', avatar: 'MA', role: 'Executive Chef', time: 'Hace 2 horas',
    content: 'Nuevo plato en carta: Risotto nero con calamares y espuma de parmesano. Tres semanas de desarrollo para lograr el balance perfecto entre el tintero y la cremosidad.',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=600',
    likes: 284, comments: 42, verified: true,
  },
  {
    id: 2, author: 'Valentina Cruz', avatar: 'VC', role: 'Sous Chef & Pastelera', time: 'Hace 5 horas',
    content: 'Tip de pastelería: Para un tiramisú perfecto, el secreto está en la temperatura del mascarpone (siempre a temperatura ambiente) y en el café bien cargado y frío. Nunca caliente.',
    image: null,
    likes: 198, comments: 28, verified: true,
  },
  {
    id: 3, author: 'Roberto Silva', avatar: 'RS', role: 'Bartender & Mixólogo', time: 'Hace 1 día',
    content: 'Explorando el Negroni con vermut artesanal mendocino. El resultado es increíble: más herbáceo, menos dulce, con notas de lavanda. La coctelería argentina tiene mucho para dar.',
    image: 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?w=600',
    likes: 156, comments: 19, verified: false,
  },
]

export default function GastroNetwork() {
  const [activeView, setActiveView] = useState<'discover' | 'feed' | 'jobs'>('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPros = PROFESSIONALS.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.1) 0%, rgba(37,99,235,0.08) 100%)', border: '1px solid rgba(96,165,250,0.2)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20"
          style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)', boxShadow: '0 0 30px rgba(96,165,250,0.4)' }}>
            <Network size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gastro-text mb-1">GastroNetwork</h2>
            <p className="text-sm text-gastro-subtle">La red profesional de la gastronomía. Conecta con chefs, sommeliers, bartenders y gestores de todo el país.</p>
          </div>
          <div className="ml-auto grid-cols-3 gap-6 text-center hidden md:grid">
            {[
              { value: '12.400+', label: 'Profesionales' },
              { value: '840+', label: 'Empresas' },
              { value: '2.100+', label: 'Empleos' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl font-black" style={{ color: '#60A5FA' }}>{stat.value}</div>
                <div className="text-xs text-gastro-subtle">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Conexiones', value: '284', color: '#60A5FA', icon: Users },
          { label: 'Perfil visto', value: '1.2K', color: '#2563EB', icon: Network },
          { label: 'Postulaciones', value: '12', color: '#3B82F6', icon: Briefcase },
          { label: 'Reputación', value: '4.9', color: '#f59e0b', icon: Star },
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
            { id: 'discover', label: 'Descubrir profesionales' },
            { id: 'feed', label: 'Feed de la red' },
            { id: 'jobs', label: 'Empleos' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id
                ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Publicar oferta
        </button>
      </div>

      {/* Discover */}
      {activeView === 'discover' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, rol o especialidad..."
                className="input-gastro pl-10"
              />
            </div>
            <button className="btn-secondary text-sm px-4 py-2"><Filter size={14} /> Filtrar</button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPros.map(pro => (
              <div key={pro.id} className="card-gastro group cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <img src={pro.image} alt={pro.name}
                      className="w-14 h-14 rounded-2xl object-cover" />
                    {pro.available && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2"
                        style={{ borderColor: '#0F1628' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gastro-text text-sm truncate">{pro.name}</h4>
                      {pro.verified && (
                        <CheckCircle size={13} className="text-primary-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gastro-subtle">{pro.role}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-gastro-muted" />
                      <span className="text-xs text-gastro-subtle">{pro.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={12} className="text-warning fill-warning" />
                    <span className="text-xs font-bold text-gastro-text">{pro.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pro.specialties.map(spec => (
                    <span key={spec} className="module-chip text-xs">{spec}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#1A2540' }}>
                  <div className="flex gap-4 text-xs text-gastro-subtle">
                    <span><strong className="text-gastro-text">{pro.followers}</strong> seguidores</span>
                    <span><strong className="text-gastro-text">{pro.experience}</strong></span>
                  </div>
                  <div className={`badge text-xs ${pro.available ? 'badge-success' : 'badge-error'}`}>
                    {pro.available ? 'Disponible' : 'No disponible'}
                  </div>
                </div>

                <button className="w-full mt-3 py-2 rounded-xl text-xs font-semibold transition-all text-primary-400 hover:text-white"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)' }}>
                  Ver perfil completo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      {activeView === 'feed' && (
        <div className="max-w-2xl space-y-4">
          <div className="card-gastro">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                SM
              </div>
              <div className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gastro-subtle cursor-pointer hover:bg-white/5 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                ¿Qué quieres compartir con la red?
              </div>
            </div>
          </div>

          {FEED_POSTS.map(post => (
            <div key={post.id} className="card-gastro">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)' }}>
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gastro-text text-sm">{post.author}</span>
                    {post.verified && <CheckCircle size={13} className="text-primary-400" />}
                  </div>
                  <div className="text-xs text-gastro-subtle">{post.role} · {post.time}</div>
                </div>
              </div>

              <p className="text-sm text-gastro-subtle leading-relaxed mb-4">{post.content}</p>

              {post.image && (
                <img src={post.image} alt="Post" className="w-full h-48 object-cover rounded-xl mb-4" />
              )}

              <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: '#1A2540' }}>
                <button className="flex items-center gap-1.5 text-xs text-gastro-subtle hover:text-accent-400 transition-colors">
                  <Heart size={14} /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gastro-subtle hover:text-primary-400 transition-colors">
                  <MessageCircle size={14} /> {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gastro-subtle hover:text-secondary-400 transition-colors ml-auto">
                  <Share2 size={14} /> Compartir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs */}
      {activeView === 'jobs' && (
        <div className="space-y-4">
          {[
            { id: 1, title: 'Executive Chef', company: 'Grupo Gastronómico Ríos', location: 'Buenos Aires', type: 'Full-time', salary: '$280.000 - $380.000', posted: 'Hace 1 día', applicants: 18, urgent: true },
            { id: 2, title: 'Sommelier', company: 'Hotel Alvear Palace', location: 'Buenos Aires', type: 'Full-time', salary: '$180.000 - $240.000', posted: 'Hace 3 días', applicants: 9, urgent: false },
            { id: 3, title: 'Bartender Senior', company: 'Florería Atlántico', location: 'Buenos Aires', type: 'Full-time', salary: '$150.000 - $200.000', posted: 'Hace 5 días', applicants: 24, urgent: false },
            { id: 4, title: 'Sous Chef Pastelería', company: 'Mishiguene', location: 'Buenos Aires', type: 'Full-time', salary: '$160.000 - $220.000', posted: 'Hace 1 semana', applicants: 14, urgent: false },
            { id: 5, title: 'Restaurant Manager', company: 'Don Julio', location: 'Buenos Aires', type: 'Full-time', salary: '$200.000 - $280.000', posted: 'Hace 2 semanas', applicants: 31, urgent: false },
          ].map(job => (
            <div key={job.id} className="card-gastro">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(37,99,235,0.12)' }}>
                  <Briefcase size={20} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gastro-text">{job.title}</h4>
                        {job.urgent && <span className="badge badge-error text-xs">Urgente</span>}
                      </div>
                      <div className="text-sm text-gastro-subtle">{job.company}</div>
                    </div>
                    <button className="btn-primary text-xs px-4 py-2 flex-shrink-0">Postularme</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gastro-subtle">
                      <MapPin size={11} /> {job.location}
                    </div>
                    <div className="badge badge-blue text-xs">{job.type}</div>
                    <div className="text-xs font-semibold text-success">{job.salary}</div>
                    <div className="text-xs text-gastro-subtle ml-auto">{job.applicants} postulantes · {job.posted}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
