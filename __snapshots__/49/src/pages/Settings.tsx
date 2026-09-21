import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Settings, Bell, Shield, Plug, CreditCard, Building2, Users,
  ChevronRight, Check, Zap, Save, ScanEye, CalendarCheck,
  UtensilsCrossed, Package, Smartphone, Brain, Moon, Mail,
  Volume2, Monitor, Hash, MessageSquare, Phone, ExternalLink,
  CheckCheck, AlertTriangle, Clock, ToggleLeft, ToggleRight,
  Search
} from 'lucide-react'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_EYE_CONFIG,
  DEFAULT_RESERVE_CONFIG,
  DEFAULT_SERVE_CONFIG,
  DEFAULT_STOCK_CONFIG,
  DEFAULT_GO_CONFIG,
  DEFAULT_PREDICT_CONFIG,
  DEFAULT_RESTAURANT_CONFIG,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_HISTORY,
  INTEGRATIONS,
  type NotificationRule,
  type NotificationChannel,
  type EyeModuleConfig,
  type ReserveModuleConfig,
  type ServeModuleConfig,
  type StockModuleConfig,
  type GoModuleConfig,
  type PredictModuleConfig,
  type RestaurantConfig,
} from '../data/systemConfig'

type SectionId =
  | 'general' | 'restaurant' | 'notifications' | 'eye' | 'reserve'
  | 'serve' | 'stock' | 'go' | 'predict' | 'integrations'
  | 'team' | 'security' | 'billing'

const SECTIONS: { id: SectionId; label: string; icon: typeof Settings; group?: string }[] = [
  { id: 'general', label: 'General', icon: Settings, group: 'Cuenta' },
  { id: 'restaurant', label: 'Restaurante', icon: Building2, group: 'Cuenta' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, group: 'Sistema' },
  { id: 'eye', label: 'GastroEye', icon: ScanEye, group: 'Módulos' },
  { id: 'reserve', label: 'GastroReserve', icon: CalendarCheck, group: 'Módulos' },
  { id: 'serve', label: 'GastroServe', icon: UtensilsCrossed, group: 'Módulos' },
  { id: 'stock', label: 'GastroStock', icon: Package, group: 'Módulos' },
  { id: 'go', label: 'GastroGo', icon: Smartphone, group: 'Módulos' },
  { id: 'predict', label: 'GastroPredict', icon: Brain, group: 'Módulos' },
  { id: 'integrations', label: 'Integraciones', icon: Plug, group: 'Sistema' },
  { id: 'team', label: 'Equipo & Roles', icon: Users, group: 'Sistema' },
  { id: 'security', label: 'Seguridad', icon: Shield, group: 'Sistema' },
  { id: 'billing', label: 'Plan & Facturación', icon: CreditCard, group: 'Sistema' },
]

const PRIORITY_CFG = {
  critical: { label: 'Crítica', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  high: { label: 'Alta', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  medium: { label: 'Media', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  low: { label: 'Baja', color: '#8899BB', bg: 'rgba(136,153,187,0.12)' },
}

const CHANNEL_ICONS: Record<NotificationChannel, typeof Bell> = {
  push: Bell, email: Mail, sms: MessageSquare, whatsapp: Phone,
  sound: Volume2, kds: Monitor, slack: Hash,
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!enabled)} className="flex-shrink-0">
      {enabled
        ? <ToggleRight size={26} style={{ color: '#2563EB' }} />
        : <ToggleLeft size={26} style={{ color: '#4A5A7A' }} />}
    </button>
  )
}

function ConfigSlider({ label, value, min, max, step, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string
  onChange: (v: number) => void; hint?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gastro-text">{label}</span>
        <span className="text-sm font-bold" style={{ color: '#2563EB' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #2563EB ${((value - min) / (max - min)) * 100}%, #1A2540 ${((value - min) / (max - min)) * 100}%)` }} />
      {hint && <p className="text-xs text-gastro-subtle mt-1">{hint}</p>}
    </div>
  )
}

function SaveBar({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#1A2540' }}>
      {saved ? (
        <span className="flex items-center gap-2 text-sm text-success"><Check size={16} /> Cambios guardados</span>
      ) : (
        <span className="text-xs text-gastro-subtle">Los cambios se aplican a todo el sistema</span>
      )}
      <button onClick={onSave} className="btn-primary text-sm px-5 py-2"><Save size={15} /> Guardar</button>
    </div>
  )
}

function ModuleLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
      <ExternalLink size={12} /> {label}
    </Link>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSection = (searchParams.get('section') as SectionId) || 'general'
  const [activeSection, setActiveSection] = useState<SectionId>(
    SECTIONS.some(s => s.id === initialSection) ? initialSection : 'general'
  )
  const [saved, setSaved] = useState(false)
  const [notifFilter, setNotifFilter] = useState<string>('all')
  const [notifSearch, setNotifSearch] = useState('')

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATION_SETTINGS)
  const [eyeConfig, setEyeConfig] = useState<EyeModuleConfig>(DEFAULT_EYE_CONFIG)
  const [reserveConfig, setReserveConfig] = useState<ReserveModuleConfig>(DEFAULT_RESERVE_CONFIG)
  const [serveConfig, setServeConfig] = useState<ServeModuleConfig>(DEFAULT_SERVE_CONFIG)
  const [stockConfig, setStockConfig] = useState<StockModuleConfig>(DEFAULT_STOCK_CONFIG)
  const [goConfig, setGoConfig] = useState<GoModuleConfig>(DEFAULT_GO_CONFIG)
  const [predictConfig, setPredictConfig] = useState<PredictModuleConfig>(DEFAULT_PREDICT_CONFIG)
  const [restaurant, setRestaurant] = useState<RestaurantConfig>({
    ...DEFAULT_RESTAURANT_CONFIG,
    name: user?.restaurant.name || DEFAULT_RESTAURANT_CONFIG.name,
    type: user?.restaurant.type || DEFAULT_RESTAURANT_CONFIG.type,
  })
  const [history, setHistory] = useState(NOTIFICATION_HISTORY)

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id)
    setSearchParams({ section: id })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const updateRule = (id: string, patch: Partial<NotificationRule>) => {
    setNotifications(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === id ? { ...r, ...patch } : r),
    }))
    setSaved(false)
  }

  const updateRuleChannel = (ruleId: string, channel: NotificationChannel, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId ? { ...r, channels: { ...r.channels, [channel]: value } } : r
      ),
    }))
    setSaved(false)
  }

  const filteredRules = useMemo(() => {
    return notifications.rules.filter(r => {
      const matchModule = notifFilter === 'all' || r.module === notifFilter
      const matchSearch = !notifSearch ||
        r.label.toLowerCase().includes(notifSearch.toLowerCase()) ||
        r.moduleLabel.toLowerCase().includes(notifSearch.toLowerCase())
      return matchModule && matchSearch
    })
  }, [notifications.rules, notifFilter, notifSearch])

  const moduleGroups = useMemo(() => {
    const modules = [...new Set(notifications.rules.map(r => r.module))]
    return modules.map(m => ({
      id: m,
      label: notifications.rules.find(r => r.module === m)?.moduleLabel || m,
      count: notifications.rules.filter(r => r.module === m && r.enabled).length,
    }))
  }, [notifications.rules])

  const unreadCount = history.filter(h => !h.read).length
  const enabledRulesCount = notifications.rules.filter(r => r.enabled).length

  const sidebarGroups = [...new Set(SECTIONS.map(s => s.group))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gastro-text">Configuración del sistema</h2>
          <p className="text-sm text-gastro-subtle mt-1">
            Centro de control — notificaciones, módulos e integraciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Bell size={14} className="text-primary-400" />
            <span className="text-gastro-text font-semibold">{enabledRulesCount} reglas activas</span>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={14} className="text-error" />
              <span className="text-gastro-text font-semibold">{unreadCount} sin leer</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card-gastro h-fit lg:sticky lg:top-6">
          <h3 className="font-bold text-gastro-text mb-4 text-sm">Secciones</h3>
          <nav className="space-y-4">
            {sidebarGroups.map(group => (
              <div key={group}>
                <div className="px-3 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gastro-muted">{group}</span>
                </div>
                <div className="space-y-0.5">
                  {SECTIONS.filter(s => s.group === group).map(section => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <button key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`sidebar-item w-full ${isActive ? 'active' : ''}`}>
                        <Icon size={15} />
                        <span>{section.label}</span>
                        {section.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: '#ef4444', color: '#fff', fontSize: '10px' }}>
                            {unreadCount}
                          </span>
                        )}
                        {!isActive && section.id !== 'notifications' && (
                          <ChevronRight size={13} className="ml-auto opacity-50" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ── General ── */}
          {activeSection === 'general' && (
            <div className="card-gastro space-y-6">
              <h3 className="font-bold text-gastro-text">Perfil de usuario</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
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
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── Restaurant ── */}
          {activeSection === 'restaurant' && (
            <div className="card-gastro space-y-6">
              <div>
                <h3 className="font-bold text-gastro-text">Datos del restaurante</h3>
                <p className="text-xs text-gastro-subtle mt-1">Información general visible en reservas, web y delivery</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {([
                  { key: 'name', label: 'Nombre comercial' },
                  { key: 'type', label: 'Tipo de negocio' },
                  { key: 'address', label: 'Dirección' },
                  { key: 'phone', label: 'Teléfono' },
                  { key: 'email', label: 'Email de contacto' },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">{field.label}</label>
                    <input value={restaurant[field.key]}
                      onChange={e => { setRestaurant(r => ({ ...r, [field.key]: e.target.value })); setSaved(false) }}
                      className="input-gastro" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Zona horaria</label>
                  <select value={restaurant.timezone}
                    onChange={e => { setRestaurant(r => ({ ...r, timezone: e.target.value })); setSaved(false) }}
                    className="input-gastro">
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                    <option value="America/Santiago">Santiago (GMT-4)</option>
                    <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Moneda</label>
                  <select value={restaurant.currency}
                    onChange={e => { setRestaurant(r => ({ ...r, currency: e.target.value })); setSaved(false) }}
                    className="input-gastro">
                    <option value="ARS">ARS — Peso argentino</option>
                    <option value="USD">USD — Dólar</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Apertura</label>
                  <input type="time" value={restaurant.openingTime}
                    onChange={e => { setRestaurant(r => ({ ...r, openingTime: e.target.value })); setSaved(false) }}
                    className="input-gastro" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Cierre</label>
                  <input type="time" value={restaurant.closingTime}
                    onChange={e => { setRestaurant(r => ({ ...r, closingTime: e.target.value })); setSaved(false) }}
                    className="input-gastro" />
                </div>
              </div>
              <ConfigSlider label="IVA / Impuesto" value={restaurant.taxRate} min={0} max={30} unit="%"
                onChange={v => { setRestaurant(r => ({ ...r, taxRate: v })); setSaved(false) }} />
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              {/* Global settings */}
              <div className="card-gastro space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gastro-text">Centro de notificaciones</h3>
                    <p className="text-xs text-gastro-subtle mt-1">Configurá canales, prioridades y horarios de silencio</p>
                  </div>
                  <ToggleSwitch enabled={notifications.masterEnabled}
                    onChange={v => { setNotifications(n => ({ ...n, masterEnabled: v })); setSaved(false) }} />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="text-2xl font-black text-primary-400">{enabledRulesCount}</div>
                    <div className="text-xs text-gastro-subtle">Reglas activas</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="text-2xl font-black text-gastro-text">{NOTIFICATION_CHANNELS.length}</div>
                    <div className="text-xs text-gastro-subtle">Canales disponibles</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="text-2xl font-black text-error">{unreadCount}</div>
                    <div className="text-xs text-gastro-subtle">Sin leer hoy</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon size={16} className="text-primary-400" />
                        <span className="text-sm font-semibold text-gastro-text">Horario de silencio</span>
                      </div>
                      <ToggleSwitch enabled={notifications.quietHoursEnabled}
                        onChange={v => { setNotifications(n => ({ ...n, quietHoursEnabled: v })); setSaved(false) }} />
                    </div>
                    {notifications.quietHoursEnabled && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gastro-subtle">Desde</label>
                          <input type="time" value={notifications.quietHoursStart}
                            onChange={e => { setNotifications(n => ({ ...n, quietHoursStart: e.target.value })); setSaved(false) }}
                            className="input-gastro mt-1" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gastro-subtle">Hasta</label>
                          <input type="time" value={notifications.quietHoursEnd}
                            onChange={e => { setNotifications(n => ({ ...n, quietHoursEnd: e.target.value })); setSaved(false) }}
                            className="input-gastro mt-1" />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gastro-subtle">Solo alertas críticas durante este período</p>
                  </div>
                  <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-primary-400" />
                      <span className="text-sm font-semibold text-gastro-text">Modo de entrega</span>
                    </div>
                    <select value={notifications.digestMode}
                      onChange={e => { setNotifications(n => ({ ...n, digestMode: e.target.value as typeof n.digestMode })); setSaved(false) }}
                      className="input-gastro">
                      <option value="instant">Instantáneo — en tiempo real</option>
                      <option value="hourly">Resumen cada hora</option>
                      <option value="daily">Resumen diario</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Channel legend */}
              <div className="card-gastro">
                <h4 className="text-sm font-bold text-gastro-text mb-3">Canales de notificación</h4>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_CHANNELS.map(ch => {
                    const Icon = CHANNEL_ICONS[ch.id]
                    return (
                      <span key={ch.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', color: '#60A5FA' }}>
                        <Icon size={12} /> {ch.label}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Rules */}
              <div className="card-gastro space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-gastro-text">Reglas por módulo</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
                      <input value={notifSearch} onChange={e => setNotifSearch(e.target.value)}
                        placeholder="Buscar regla..." className="input-gastro pl-8 py-1.5 text-xs w-44" />
                    </div>
                    <select value={notifFilter} onChange={e => setNotifFilter(e.target.value)}
                      className="input-gastro py-1.5 text-xs">
                      <option value="all">Todos los módulos</option>
                      {moduleGroups.map(m => (
                        <option key={m.id} value={m.id}>{m.label} ({m.count})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredRules.map(rule => {
                    const prio = PRIORITY_CFG[rule.priority]
                    return (
                      <div key={rule.id} className="rounded-xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540', opacity: rule.enabled ? 1 : 0.6 }}>
                        <div className="flex items-center gap-3 p-4">
                          <ToggleSwitch enabled={rule.enabled}
                            onChange={v => updateRule(rule.id, { enabled: v })} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gastro-text text-sm">{rule.label}</span>
                              <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: prio.bg, color: prio.color }}>
                                {prio.label}
                              </span>
                              <span className="text-xs text-gastro-muted">{rule.moduleLabel}</span>
                            </div>
                            <p className="text-xs text-gastro-subtle mt-0.5">{rule.description}</p>
                          </div>
                        </div>
                        {rule.enabled && (
                          <div className="px-4 pb-4 flex flex-wrap gap-2">
                            {NOTIFICATION_CHANNELS.map(ch => {
                              const Icon = CHANNEL_ICONS[ch.id]
                              const active = rule.channels[ch.id]
                              return (
                                <button key={ch.id}
                                  onClick={() => updateRuleChannel(rule.id, ch.id, !active)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                                  style={{
                                    background: active ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${active ? 'rgba(37,99,235,0.3)' : '#1A2540'}`,
                                    color: active ? '#60A5FA' : '#4A5A7A',
                                  }}>
                                  <Icon size={11} /> {ch.label}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <SaveBar saved={saved} onSave={handleSave} />
              </div>

              {/* History */}
              <div className="card-gastro space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gastro-text">Historial reciente</h4>
                  <button onClick={() => setHistory(h => h.map(n => ({ ...n, read: true })))}
                    className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    <CheckCheck size={13} /> Marcar todas como leídas
                  </button>
                </div>
                <div className="divide-y" style={{ borderColor: '#1A2540' }}>
                  {history.map(item => {
                    const prio = PRIORITY_CFG[item.priority]
                    return (
                      <div key={item.id}
                        onClick={() => setHistory(h => h.map(n => n.id === item.id ? { ...n, read: true } : n))}
                        className="flex items-start gap-3 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ background: item.read ? '#2A3550' : prio.color }} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${item.read ? 'text-gastro-subtle' : 'text-gastro-text font-medium'}`}>
                            {item.text}
                          </p>
                          <p className="text-xs text-gastro-muted mt-0.5">{item.time}</p>
                        </div>
                        {!item.read && (
                          <span className="text-xs px-2 py-0.5 rounded font-bold flex-shrink-0"
                            style={{ background: prio.bg, color: prio.color, fontSize: '10px' }}>Nueva</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── GastroEye ── */}
          {activeSection === 'eye' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <ScanEye size={18} className="text-primary-400" /> GastroEye — Visión IA
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">Detecciones, umbrales y asignación de mozos</p>
                </div>
                <ModuleLink to="/eye" label="Abrir módulo" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gastro-text mb-3">Tipos de detección</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(eyeConfig.detections).map(([key, val]) => {
                    const labels: Record<string, string> = {
                      empty_glass: 'Vaso vacío', empty_plate: 'Plato vacío', raised_hand: 'Mano levantada',
                      long_wait: 'Espera prolongada', spill: 'Derrame', table_ready: 'Mesa lista',
                    }
                    return (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                        <span className="text-sm text-gastro-text">{labels[key] || key}</span>
                        <ToggleSwitch enabled={val}
                          onChange={v => { setEyeConfig(c => ({ ...c, detections: { ...c.detections, [key]: v } })); setSaved(false) }} />
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <ConfigSlider label="Confianza mínima IA" value={eyeConfig.minConfidence} min={70} max={99} unit="%"
                  onChange={v => { setEyeConfig(c => ({ ...c, minConfidence: v })); setSaved(false) }}
                  hint="Por debajo de este umbral no se generan alertas" />
                <ConfigSlider label="Mano levantada — tiempo" value={eyeConfig.handRaiseSeconds} min={3} max={15} unit="s"
                  onChange={v => { setEyeConfig(c => ({ ...c, handRaiseSeconds: v })); setSaved(false) }} />
                <ConfigSlider label="Espera prolongada" value={eyeConfig.longWaitMinutes} min={5} max={20} unit=" min"
                  onChange={v => { setEyeConfig(c => ({ ...c, longWaitMinutes: v })); setSaved(false) }} />
                <ConfigSlider label="Cooldown entre alertas" value={eyeConfig.cooldownSeconds} min={10} max={120} unit="s"
                  onChange={v => { setEyeConfig(c => ({ ...c, cooldownSeconds: v })); setSaved(false) }} />
              </div>
              <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <h4 className="text-sm font-semibold text-gastro-text">Asignación de mozos</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gastro-text">Asignación automática al mozo más cercano</span>
                  <ToggleSwitch enabled={eyeConfig.autoAssign}
                    onChange={v => { setEyeConfig(c => ({ ...c, autoAssign: v })); setSaved(false) }} />
                </div>
                <ConfigSlider label="Distancia máxima de asignación" value={eyeConfig.maxAssignDistance} min={5} max={30} unit=" m"
                  onChange={v => { setEyeConfig(c => ({ ...c, maxAssignDistance: v })); setSaved(false) }} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gastro-text">Reasignar si mozo está lejos</span>
                  <ToggleSwitch enabled={eyeConfig.reassignIfFar}
                    onChange={v => { setEyeConfig(c => ({ ...c, reassignIfFar: v })); setSaved(false) }} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <span className="text-sm text-gastro-text">Desenfoque de privacidad</span>
                  <ToggleSwitch enabled={eyeConfig.privacyBlur}
                    onChange={v => { setEyeConfig(c => ({ ...c, privacyBlur: v })); setSaved(false) }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <span className="text-sm text-gastro-text">Grabar clips de alertas</span>
                  <ToggleSwitch enabled={eyeConfig.recordClips}
                    onChange={v => { setEyeConfig(c => ({ ...c, recordClips: v })); setSaved(false) }} />
                </div>
              </div>
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── GastroReserve ── */}
          {activeSection === 'reserve' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <CalendarCheck size={18} className="text-primary-400" /> GastroReserve
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">Turnos, confirmaciones y lista de espera</p>
                </div>
                <ModuleLink to="/reserve" label="Abrir módulo" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <ConfigSlider label="Duración de turno" value={reserveConfig.slotDuration} min={60} max={180} step={15} unit=" min"
                  onChange={v => { setReserveConfig(c => ({ ...c, slotDuration: v })); setSaved(false) }} />
                <ConfigSlider label="Anticipación máxima" value={reserveConfig.maxAdvanceDays} min={7} max={90} unit=" días"
                  onChange={v => { setReserveConfig(c => ({ ...c, maxAdvanceDays: v })); setSaved(false) }} />
                <ConfigSlider label="Anticipación mínima" value={reserveConfig.minAdvanceHours} min={0} max={48} unit=" hs"
                  onChange={v => { setReserveConfig(c => ({ ...c, minAdvanceHours: v })); setSaved(false) }} />
                <ConfigSlider label="Máximo comensales" value={reserveConfig.maxPartySize} min={2} max={30} unit=" pax"
                  onChange={v => { setReserveConfig(c => ({ ...c, maxPartySize: v })); setSaved(false) }} />
                <ConfigSlider label="Gracia no-show" value={reserveConfig.noShowGraceMinutes} min={5} max={30} unit=" min"
                  onChange={v => { setReserveConfig(c => ({ ...c, noShowGraceMinutes: v })); setSaved(false) }} />
                <ConfigSlider label="Recordatorio anticipado" value={reserveConfig.reminderHours} min={1} max={72} unit=" hs"
                  onChange={v => { setReserveConfig(c => ({ ...c, reminderHours: v })); setSaved(false) }} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { key: 'autoConfirm' as const, label: 'Confirmación automática' },
                  { key: 'requireDeposit' as const, label: 'Requerir seña' },
                  { key: 'sendReminder' as const, label: 'Enviar recordatorio' },
                  { key: 'allowWaitlist' as const, label: 'Lista de espera activa' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <span className="text-sm text-gastro-text">{item.label}</span>
                    <ToggleSwitch enabled={reserveConfig[item.key]}
                      onChange={v => { setReserveConfig(c => ({ ...c, [item.key]: v })); setSaved(false) }} />
                  </div>
                ))}
              </div>
              {reserveConfig.requireDeposit && (
                <ConfigSlider label="Monto de seña" value={reserveConfig.depositAmount} min={5000} max={50000} step={1000} unit=""
                  onChange={v => { setReserveConfig(c => ({ ...c, depositAmount: v })); setSaved(false) }} />
              )}
              {reserveConfig.allowWaitlist && (
                <ConfigSlider label="Capacidad lista de espera" value={reserveConfig.maxWaitlistSize} min={5} max={50} unit=" personas"
                  onChange={v => { setReserveConfig(c => ({ ...c, maxWaitlistSize: v })); setSaved(false) }} />
              )}
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── GastroServe ── */}
          {activeSection === 'serve' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-primary-400" /> GastroServe
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">KDS, mesas y flujo de servicio</p>
                </div>
                <ModuleLink to="/serve" label="Abrir módulo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { key: 'kdsAutoAccept' as const, label: 'KDS — Aceptar pedidos automáticamente' },
                  { key: 'kdsSoundAlerts' as const, label: 'KDS — Alertas sonoras' },
                  { key: 'tableTurnoverAlert' as const, label: 'Alerta de rotación de mesa' },
                  { key: 'autoPrintTickets' as const, label: 'Imprimir tickets automáticamente' },
                  { key: 'splitBillEnabled' as const, label: 'Permitir división de cuenta' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <span className="text-sm text-gastro-text">{item.label}</span>
                    <ToggleSwitch enabled={serveConfig[item.key]}
                      onChange={v => { setServeConfig(c => ({ ...c, [item.key]: v })); setSaved(false) }} />
                  </div>
                ))}
              </div>
              {serveConfig.tableTurnoverAlert && (
                <ConfigSlider label="Tiempo máximo por mesa" value={serveConfig.tableTurnoverMinutes} min={45} max={180} unit=" min"
                  onChange={v => { setServeConfig(c => ({ ...c, tableTurnoverMinutes: v })); setSaved(false) }}
                  hint="Alerta cuando una mesa supera este tiempo ocupada" />
              )}
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── GastroStock ── */}
          {activeSection === 'stock' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <Package size={18} className="text-primary-400" /> GastroStock
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">Umbrales de inventario y alertas</p>
                </div>
                <ModuleLink to="/stock" label="Abrir módulo" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <ConfigSlider label="Umbral stock bajo" value={stockConfig.lowStockThreshold} min={5} max={50} unit="%"
                  onChange={v => { setStockConfig(c => ({ ...c, lowStockThreshold: v })); setSaved(false) }} />
                <ConfigSlider label="Umbral stock crítico" value={stockConfig.criticalStockThreshold} min={1} max={20} unit="%"
                  onChange={v => { setStockConfig(c => ({ ...c, criticalStockThreshold: v })); setSaved(false) }} />
                <ConfigSlider label="Alerta de vencimiento" value={stockConfig.expiryAlertDays} min={1} max={30} unit=" días"
                  onChange={v => { setStockConfig(c => ({ ...c, expiryAlertDays: v })); setSaved(false) }} />
                <ConfigSlider label="Días de anticipación reposición" value={stockConfig.reorderLeadDays} min={1} max={14} unit=" días"
                  onChange={v => { setStockConfig(c => ({ ...c, reorderLeadDays: v })); setSaved(false) }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                <div>
                  <span className="text-sm text-gastro-text">Reposición automática</span>
                  <p className="text-xs text-gastro-subtle">Generar orden de compra al alcanzar umbral</p>
                </div>
                <ToggleSwitch enabled={stockConfig.autoReorder}
                  onChange={v => { setStockConfig(c => ({ ...c, autoReorder: v })); setSaved(false) }} />
              </div>
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── GastroGo ── */}
          {activeSection === 'go' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <Smartphone size={18} className="text-primary-400" /> GastroGo
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">Delivery, takeaway y app cliente</p>
                </div>
                <ModuleLink to="/go" label="Abrir módulo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { key: 'deliveryEnabled' as const, label: 'Delivery activo' },
                  { key: 'pickupEnabled' as const, label: 'Takeaway / retiro' },
                  { key: 'autoAcceptOrders' as const, label: 'Aceptar pedidos automáticamente' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <span className="text-sm text-gastro-text">{item.label}</span>
                    <ToggleSwitch enabled={goConfig[item.key]}
                      onChange={v => { setGoConfig(c => ({ ...c, [item.key]: v })); setSaved(false) }} />
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <ConfigSlider label="Pedido mínimo" value={goConfig.minOrderAmount} min={3000} max={30000} step={500} unit=""
                  onChange={v => { setGoConfig(c => ({ ...c, minOrderAmount: v })); setSaved(false) }} />
                <ConfigSlider label="Radio de delivery" value={goConfig.deliveryRadius} min={1} max={15} unit=" km"
                  onChange={v => { setGoConfig(c => ({ ...c, deliveryRadius: v })); setSaved(false) }} />
                <ConfigSlider label="Tiempo de preparación" value={goConfig.prepTimeMinutes} min={10} max={60} unit=" min"
                  onChange={v => { setGoConfig(c => ({ ...c, prepTimeMinutes: v })); setSaved(false) }} />
              </div>
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── GastroPredict ── */}
          {activeSection === 'predict' && (
            <div className="card-gastro space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gastro-text flex items-center gap-2">
                    <Brain size={18} className="text-primary-400" /> GastroPredict
                  </h3>
                  <p className="text-xs text-gastro-subtle mt-1">Predicción de demanda e inteligencia operativa</p>
                </div>
                <ModuleLink to="/predict" label="Abrir módulo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { key: 'demandForecast' as const, label: 'Pronóstico de demanda' },
                  { key: 'staffSuggestions' as const, label: 'Sugerencias de personal' },
                  { key: 'weatherIntegration' as const, label: 'Integración meteorológica' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <span className="text-sm text-gastro-text">{item.label}</span>
                    <ToggleSwitch enabled={predictConfig[item.key]}
                      onChange={v => { setPredictConfig(c => ({ ...c, [item.key]: v })); setSaved(false) }} />
                  </div>
                ))}
              </div>
              <ConfigSlider label="Umbral de alerta predictiva" value={predictConfig.alertThreshold} min={50} max={95} unit="%"
                onChange={v => { setPredictConfig(c => ({ ...c, alertThreshold: v })); setSaved(false) }}
                hint="Confianza mínima para generar alertas de predicción" />
              <SaveBar saved={saved} onSave={handleSave} />
            </div>
          )}

          {/* ── Integrations ── */}
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
                      style={{ border: `1px solid ${integration.status === 'connected' ? 'rgba(239,68,68,0.3)' : 'rgba(37,99,235,0.3)'}` }}>
                      {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <ModuleLink to="/connect" label="Gestionar en GastroConnect" />
              </div>
            </div>
          )}

          {/* ── Team ── */}
          {activeSection === 'team' && (
            <div className="card-gastro space-y-6">
              <div>
                <h3 className="font-bold text-gastro-text">Equipo & Roles</h3>
                <p className="text-xs text-gastro-subtle mt-1">Permisos y accesos por rol en el sistema</p>
              </div>
              <div className="space-y-3">
                {[
                  { role: 'Administrador', users: 2, perms: 'Acceso total — configuración, facturación, todos los módulos' },
                  { role: 'Gerente', users: 3, perms: 'Operaciones, finanzas, reportes — sin facturación' },
                  { role: 'Mozo', users: 8, perms: 'GastroServe, GastroEye alertas, reservas del día' },
                  { role: 'Cocina', users: 5, perms: 'KDS, GastroStock lectura, recetas' },
                ].map(r => (
                  <div key={r.role} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <Users size={18} className="text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gastro-text text-sm">{r.role}</span>
                        <span className="text-xs text-gastro-muted">{r.users} usuarios</span>
                      </div>
                      <p className="text-xs text-gastro-subtle mt-0.5">{r.perms}</p>
                    </div>
                    <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Editar</button>
                  </div>
                ))}
              </div>
              <ModuleLink to="/talent" label="Gestionar en GastroTalent" />
            </div>
          )}

          {/* ── Security ── */}
          {activeSection === 'security' && (
            <div className="card-gastro space-y-6">
              <h3 className="font-bold text-gastro-text">Seguridad</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="font-semibold text-gastro-text text-sm mb-3">Cambiar contraseña</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="password" placeholder="Contraseña actual" className="input-gastro" />
                    <input type="password" placeholder="Nueva contraseña" className="input-gastro" />
                  </div>
                  <button className="btn-primary text-sm px-5 py-2 mt-3">Actualizar contraseña</button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div>
                    <div className="font-semibold text-gastro-text text-sm">Autenticación de dos factores (2FA)</div>
                    <div className="text-xs text-gastro-subtle">Protección adicional con app autenticadora</div>
                  </div>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-primary-400"
                    style={{ border: '1px solid rgba(37,99,235,0.3)' }}>Activar</button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div>
                    <div className="font-semibold text-gastro-text text-sm">Sesiones activas</div>
                    <div className="text-xs text-gastro-subtle">2 dispositivos conectados — Chrome, Safari iOS</div>
                  </div>
                  <button className="text-xs text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ border: '1px solid rgba(239,68,68,0.3)' }}>Cerrar otras</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {activeSection === 'billing' && (
            <div className="space-y-4">
              <div className="card-gastro">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gastro-text">Plan actual</h3>
                  <span className="badge badge-primary">Plan Pro</span>
                </div>
                <div className="p-4 rounded-xl mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(59,130,246,0.06) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
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

        </div>
      </div>
    </div>
  )
}
