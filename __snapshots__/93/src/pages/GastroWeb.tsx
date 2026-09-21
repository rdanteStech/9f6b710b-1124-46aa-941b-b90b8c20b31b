import { useState } from 'react'
import { Globe, Smartphone, Eye, Edit, Palette, Layout, ShoppingCart, Star, MapPin, Clock, Phone } from 'lucide-react'

const WEBSITE_SECTIONS = [
  { id: 'hero', label: 'Hero / Portada', active: true },
  { id: 'menu', label: 'Carta online', active: true },
  { id: 'reservations', label: 'Reservas', active: true },
  { id: 'gallery', label: 'Galería', active: true },
  { id: 'reviews', label: 'Reseñas', active: true },
  { id: 'contact', label: 'Contacto', active: true },
  { id: 'delivery', label: 'Delivery propio', active: false },
  { id: 'events', label: 'Eventos', active: false },
]

export default function GastroWeb() {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [activeSection, setActiveSection] = useState('hero')

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Visitas este mes', value: '4.284', color: '#3B82F6', icon: Globe },
          { label: 'Pedidos online', value: '312', color: '#2563EB', icon: ShoppingCart },
          { label: 'Reservas web', value: '87', color: '#10b981', icon: Star },
          { label: 'Conversión', value: '7.3%', color: '#f59e0b', icon: Eye },
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sections panel */}
        <div className="space-y-4">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4 text-sm">Secciones del sitio</h3>
            <div className="space-y-2">
              {WEBSITE_SECTIONS.map(section => (
                <div key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${activeSection === section.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={activeSection === section.id ? { background: 'rgba(37,99,235,0.12)' } : {}}>
                  <span className="text-sm font-medium">{section.label}</span>
                  <div className={`w-8 h-4 rounded-full transition-all ${section.active ? '' : ''}`}
                    style={{ background: section.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)' }}>
                    <div className={`w-3 h-3 rounded-full mt-0.5 transition-all ${section.active ? 'ml-4.5' : 'ml-0.5'}`}
                      style={{ background: section.active ? '#10b981' : '#8899BB', marginLeft: section.active ? '18px' : '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-3 text-sm">Personalización</h3>
            <div className="space-y-2">
              {[
                { icon: Palette, label: 'Colores y tipografía' },
                { icon: Layout, label: 'Plantilla del sitio' },
                { icon: Globe, label: 'Dominio propio' },
                { icon: Smartphone, label: 'App móvil' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button key={item.label}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    <Icon size={14} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 card-gastro">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[
                { id: 'desktop', icon: Globe, label: 'Desktop' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map(view => {
                const Icon = view.icon
                return (
                  <button key={view.id}
                    onClick={() => setActiveView(view.id as typeof activeView)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle'}`}
                    style={activeView === view.id ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                    <Icon size={14} />
                    {view.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs px-3 py-2"><Eye size={13} /> Vista previa</button>
              <button className="btn-primary text-xs px-3 py-2"><Edit size={13} /> Editar</button>
            </div>
          </div>

          {/* Website preview mockup */}
          <div className={`mx-auto rounded-2xl overflow-hidden transition-all duration-300 ${activeView === 'mobile' ? 'max-w-xs' : 'w-full'}`}
            style={{ background: '#000000', border: '1px solid #1A2540' }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#0F1628', borderBottom: '1px solid #1A2540' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-error opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-success opacity-60" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 rounded-lg text-xs text-gastro-subtle"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                trattoriabellavista.gastro360.com
              </div>
            </div>

            {/* Hero section */}
            <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
              <img
                src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=800"
                alt="Restaurant"
                className="w-full h-48 object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }}>
                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Trattoria Bellavista
                </h2>
                <p className="text-sm text-white/80 mb-4">Cocina italiana contemporánea</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                    Reservar mesa
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    Ver carta
                  </button>
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-around p-4" style={{ background: '#0F1628', borderTop: '1px solid #1A2540' }}>
              {[
                { icon: MapPin, text: 'Bellavista, Santiago' },
                { icon: Clock, text: 'Mar-Dom 12-24h' },
                { icon: Phone, text: '+56 2 2345 6789' },
                { icon: Star, text: '4.8 ★ (284 reseñas)' },
              ].map(info => {
                const Icon = info.icon
                return (
                  <div key={info.text} className="flex items-center gap-1.5 text-xs text-gastro-subtle">
                    <Icon size={11} className="text-primary-400" />
                    {info.text}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
