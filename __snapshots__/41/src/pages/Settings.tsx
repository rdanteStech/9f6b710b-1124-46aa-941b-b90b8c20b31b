import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Settings, User, Bell, Shield, Globe, Plug, CreditCard,
  Building2, Users, ChevronRight, Check, Zap, Save
} from 'lucide-react'

const INTEGRATIONS = [
  { id: 'uber', name: 'Uber Eats', status: 'connected', color: '#10b981', desc: 'Sincronización de carta y pedidos activa' },
  { id: 'rappi', name: 'Rappi', status: 'connected', color: '#10b981', desc: 'Sincronización de carta y pedidos activa' },
  { id: 'pedidosya', name: 'PedidosYa', status: 'disconnected', color: '#8899BB', desc: 'No conectado' },
  { id: 'mercadopago', name: 'MercadoPago', status: 'connected', color: '#10b981', desc: 'Pagos QR y online activos' },
  { id: 'stripe', name: 'Stripe', status: 'disconnected', color: '#8899BB', desc: 'No conectado' },
  { id: 'google', name: 'Google My Business', status: 'connected', color: '#10b981', desc: 'Reseñas y horarios sincronizados' },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('general')
  const [notifications, setNotifications] = useState({
    stockAlerts: true,
    orderReady: true,
    dailyReport: true,
    aiInsights: true,
    newReservation: true,
    lowRating: false,
  })

  const SECTIONS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'restaurant', label: 'Restaurante', icon: Building2 },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'integrations', label: 'Integraciones', icon: Plug },
    { id: 'team', label: 'Equipo & Roles', icon: Users },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'billing', label: 'Plan & Facturación', icon: CreditCard },
  ]

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="card-gastro h-fit">
        <h3 className="font-bold text-gastro-text mb-4 text-sm">Configuración</h3>
        <nav className="space-y-1">
          {SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <button key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`sidebar-item w-full ${activeSection === section.id ? 'active' : ''}`}>
                <Icon size={15} />
                <span>{section.label}</span>
                <ChevronRight size={13} className="ml-auto opacity-50" />
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="lg:col-span-3 space-y-6">
        {activeSection === 'general' && (
          <div className="card-gastro space-y-6">
            <h3 className="font-bold text-gastro-text">Perfil de usuario</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0066FF, #3399FF)' }}>
                {user?.avatar}
              </div>
              <div>
                <div className="font-bold text-gastro-text">{user?.name}</div>
                <div className="text-sm text-gastro-subtle">{user?.email}</div>
                <button className="text-xs text-primary-400 hover:text-primary-300 mt-1 transition-colors">Cambiar foto</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Nombre completo</label>
                <input defaultValue={user?.name} className="input-gastro" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Email</label>
                <input defaultValue={user?.email} className="input-gastro" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Rol</label>
                <input defaultValue={user?.role} readOnly className="input-gastro opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Idioma</label>
                <select className="input-gastro">
                  <option>Español (Argentina)</option>
                  <option>English</option>
                  <option>Português</option>
                </select>
              </div>
            </div>
            <button className="btn-primary text-sm px-6 py-2.5"><Save size={15} /> Guardar cambios</button>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="card-gastro space-y-4">
            <h3 className="font-bold text-gastro-text">Preferencias de notificaciones</h3>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, { label: string; desc: string }> = {
                  stockAlerts: { label: 'Alertas de stock', desc: 'Cuando un insumo llega al mínimo o nivel crítico' },
                  orderReady: { label: 'Pedido listo', desc: 'Cuando un pedido está listo para servir' },
                  dailyReport: { label: 'Reporte diario', desc: 'Resumen de operaciones al cierre del día' },
                  aiInsights: { label: 'Insights de IA', desc: 'Recomendaciones y alertas de GastroBrain' },
                  newReservation: { label: 'Nueva reserva', desc: 'Cuando se registra una nueva reserva' },
                  lowRating: { label: 'Calificación baja', desc: 'Cuando un cliente deja una reseña menor a 3 estrellas' },
                }
                const info = labels[key]
                return (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div>
                      <div className="font-semibold text-gastro-text text-sm">{info.label}</div>
                      <div className="text-xs text-gastro-subtle">{info.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                      style={{ background: value ? 'rgba(0,102,255,0.4)' : 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute top-1 w-4 h-4 rounded-full transition-all duration-300"
                        style={{
                          background: value ? '#0066FF' : '#8899BB',
                          left: value ? '26px' : '4px',
                          boxShadow: value ? '0 0 8px rgba(0,102,255,0.6)' : 'none',
                        }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === 'integrations' && (
          <div className="card-gastro space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gastro-text">Integraciones activas</h3>
              <span className="badge badge-success text-xs">{INTEGRATIONS.filter(i => i.status === 'connected').length} conectadas</span>
            </div>
            <div className="space-y-3">
              {INTEGRATIONS.map(integration => (
                <div key={integration.id} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: integration.status === 'connected' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)' }}>
                    <Plug size={18} style={{ color: integration.status === 'connected' ? '#10b981' : '#8899BB' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gastro-text text-sm">{integration.name}</div>
                    <div className="text-xs text-gastro-subtle">{integration.desc}</div>
                  </div>
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${integration.status === 'connected' ? 'text-error hover:bg-error/10' : 'text-primary-400 hover:bg-primary-400/10'}`}
                    style={{ border: `1px solid ${integration.status === 'connected' ? 'rgba(239,68,68,0.3)' : 'rgba(0,102,255,0.3)'}` }}>
                    {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'billing' && (
          <div className="space-y-4">
            <div className="card-gastro">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gastro-text">Plan actual</h3>
                <span className="badge badge-primary">Plan Pro</span>
              </div>
              <div className="p-4 rounded-xl mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(51,153,255,0.06) 100%)', border: '1px solid rgba(0,102,255,0.25)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-gastro-text">$149 <span className="text-sm font-normal text-gastro-subtle">/mes</span></div>
                    <div className="text-sm text-gastro-subtle mt-1">Próxima facturación: 15 de febrero 2025</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-primary-400" />
                    <span className="font-bold text-primary-400">Pro</span>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { label: 'Locales', used: 3, total: 3 },
                  { label: 'Usuarios', used: 8, total: 20 },
                  { label: 'Pedidos/mes', used: 3842, total: 10000 },
                ].map(usage => (
                  <div key={usage.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="text-xs text-gastro-subtle mb-1">{usage.label}</div>
                    <div className="text-sm font-bold text-gastro-text mb-2">{usage.used.toLocaleString()} / {usage.total.toLocaleString()}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(usage.used / usage.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeSection === 'restaurant' || activeSection === 'team' || activeSection === 'security') && (
          <div className="card-gastro flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(0,102,255,0.1)' }}>
              <Settings size={28} className="text-primary-400" />
            </div>
            <h3 className="font-bold text-gastro-text mb-2">Sección en construcción</h3>
            <p className="text-sm text-gastro-subtle max-w-xs">Esta sección estará disponible próximamente con todas las opciones de configuración avanzada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
