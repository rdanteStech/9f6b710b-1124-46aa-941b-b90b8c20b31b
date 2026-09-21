import { useState } from 'react'
import {
  Plug, Search, Filter, CheckCircle, RefreshCw, Key, Webhook,
  Activity, Copy, Eye, EyeOff, Plus, Trash2, ExternalLink, Zap,
  Truck, CreditCard, Monitor, Megaphone, Calculator, Calendar,
  AlertTriangle, Clock, ArrowUpRight, ArrowDownLeft, Shield, Code2,
  Settings, Link2, Unlink, Check, X
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type IntegrationCategory = 'delivery' | 'payments' | 'pos' | 'marketing' | 'accounting' | 'reservations'
type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'
type LogStatus = 'success' | 'error' | 'warning'

interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  status: IntegrationStatus
  color: string
  lastSync?: string
  syncHealth?: number
  features: string[]
  isPopular?: boolean
  isPro?: boolean
  isNew?: boolean
}

interface ApiKey {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string
  permissions: string[]
  active: boolean
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  lastDelivery: string
  successRate: number
}

interface ActivityLog {
  id: string
  integration: string
  event: string
  direction: 'inbound' | 'outbound'
  status: LogStatus
  timestamp: string
  details: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CATEGORY_META: Record<IntegrationCategory, { label: string; icon: typeof Truck; color: string }> = {
  delivery: { label: 'Delivery', icon: Truck, color: '#f59e0b' },
  payments: { label: 'Pagos', icon: CreditCard, color: '#10b981' },
  pos: { label: 'POS & Hardware', icon: Monitor, color: '#3B82F6' },
  marketing: { label: 'Marketing', icon: Megaphone, color: '#60A5FA' },
  accounting: { label: 'Contabilidad', icon: Calculator, color: '#2563EB' },
  reservations: { label: 'Reservas', icon: Calendar, color: '#3B82F6' },
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'uber', name: 'Uber Eats', description: 'Sincroniza carta, precios y pedidos en tiempo real',
    category: 'delivery', status: 'connected', color: '#10b981', lastSync: 'Hace 2 min', syncHealth: 98,
    features: ['Carta automática', 'Pedidos en vivo', 'Reportes de comisiones'], isPopular: true,
  },
  {
    id: 'rappi', name: 'Rappi', description: 'Integración bidireccional de menú y fulfillment',
    category: 'delivery', status: 'connected', color: '#10b981', lastSync: 'Hace 5 min', syncHealth: 95,
    features: ['Menú sync', 'Tracking de pedidos', 'Promociones'],
  },
  {
    id: 'pedidosya', name: 'PedidosYa', description: 'Conecta tu carta y recibe pedidos directamente en GastroServe',
    category: 'delivery', status: 'disconnected', color: '#8899BB',
    features: ['Carta online', 'Pedidos centralizados', 'Analytics'],
  },
  {
    id: 'mercadopago', name: 'MercadoPago', description: 'Pagos QR, link de pago y checkout online',
    category: 'payments', status: 'connected', color: '#10b981', lastSync: 'Hace 1 min', syncHealth: 100,
    features: ['QR dinámico', 'Split payments', 'Conciliación automática'], isPopular: true,
  },
  {
    id: 'stripe', name: 'Stripe', description: 'Procesamiento internacional de pagos con tarjeta',
    category: 'payments', status: 'disconnected', color: '#8899BB',
    features: ['Tarjetas internacionales', 'Suscripciones', 'Apple/Google Pay'], isPro: true,
  },
  {
    id: 'google', name: 'Google My Business', description: 'Reseñas, horarios y reservas desde Google',
    category: 'marketing', status: 'connected', color: '#10b981', lastSync: 'Hace 15 min', syncHealth: 92,
    features: ['Reseñas sync', 'Horarios', 'Reservas Google'],
  },
  {
    id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing y campañas automatizadas',
    category: 'marketing', status: 'disconnected', color: '#8899BB',
    features: ['Segmentación CRM', 'Automatizaciones', 'Templates'],
  },
  {
    id: 'xubio', name: 'Xubio', description: 'Facturación electrónica y contabilidad integrada',
    category: 'accounting', status: 'connected', color: '#10b981', lastSync: 'Hace 30 min', syncHealth: 88,
    features: ['Factura E', 'Libro IVA', 'Reportes fiscales'],
  },
  {
    id: 'covermanager', name: 'CoverManager', description: 'Gestión avanzada de reservas y lista de espera',
    category: 'reservations', status: 'disconnected', color: '#8899BB',
    features: ['Reservas online', 'Lista de espera', 'No-shows'],
  },
  {
    id: 'fudo', name: 'Fudo POS', description: 'Sincronización con terminal de punto de venta Fudo',
    category: 'pos', status: 'error', color: '#ef4444', lastSync: 'Hace 2 h', syncHealth: 45,
    features: ['Caja sync', 'Impresoras', 'Turnos caja'],
  },
  {
    id: 'whatsapp', name: 'WhatsApp Business', description: 'Notificaciones y pedidos por WhatsApp',
    category: 'marketing', status: 'pending', color: '#f59e0b', lastSync: 'Configurando...',
    features: ['Pedidos WA', 'Confirmaciones', 'Menú interactivo'], isNew: true,
  },
  {
    id: 'instagram', name: 'Instagram Shopping', description: 'Vincula tu carta con Instagram y Facebook Shop',
    category: 'marketing', status: 'disconnected', color: '#8899BB',
    features: ['Catálogo social', 'Stories shop', 'Analytics'],
  },
]

const API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Producción — App principal', prefix: 'gastro_live_••••••••7f3a', created: '12 Ene 2025', lastUsed: 'Hace 3 min', permissions: ['read:orders', 'write:menu', 'read:stock'], active: true },
  { id: 'k2', name: 'Staging — Desarrollo', prefix: 'gastro_test_••••••••9b2c', created: '28 Dic 2024', lastUsed: 'Hace 2 días', permissions: ['read:orders', 'read:menu'], active: true },
  { id: 'k3', name: 'Webhook listener externo', prefix: 'gastro_wh_••••••••4d1e', created: '5 Nov 2024', lastUsed: 'Hace 1 semana', permissions: ['webhooks:receive'], active: false },
]

const WEBHOOKS: WebhookEndpoint[] = [
  { id: 'w1', url: 'https://api.trattoriabellavista.cl/webhooks/gastro360', events: ['order.created', 'order.updated', 'payment.completed'], status: 'active', lastDelivery: 'Hace 45 seg', successRate: 99.2 },
  { id: 'w2', url: 'https://hooks.zapier.com/hooks/catch/1234567/abcdef', events: ['stock.low', 'reservation.created'], status: 'active', lastDelivery: 'Hace 12 min', successRate: 97.8 },
  { id: 'w3', url: 'https://legacy-system.internal/events', events: ['order.created'], status: 'failed', lastDelivery: 'Hace 3 h', successRate: 62.1 },
]

const ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'l1', integration: 'Uber Eats', event: 'order.received', direction: 'inbound', status: 'success', timestamp: '06:31:42', details: 'Pedido #UE-8842 recibido — $12.400' },
  { id: 'l2', integration: 'MercadoPago', event: 'payment.completed', direction: 'inbound', status: 'success', timestamp: '06:30:18', details: 'Pago QR confirmado — Mesa 7 — $28.500' },
  { id: 'l3', integration: 'Gastro360 API', event: 'menu.updated', direction: 'outbound', status: 'success', timestamp: '06:28:55', details: 'Carta sincronizada a Rappi (47 ítems)' },
  { id: 'l4', integration: 'Fudo POS', event: 'cash.close', direction: 'inbound', status: 'error', timestamp: '06:15:03', details: 'Timeout de conexión — reintentando...' },
  { id: 'l5', integration: 'Xubio', event: 'invoice.created', direction: 'outbound', status: 'success', timestamp: '06:12:44', details: 'Factura E #0004-00012847 emitida' },
  { id: 'l6', integration: 'Google My Business', event: 'review.received', direction: 'inbound', status: 'success', timestamp: '05:58:21', details: 'Nueva reseña 5★ — "Excelente pasta"' },
  { id: 'l7', integration: 'Webhook', event: 'order.created', direction: 'outbound', status: 'warning', timestamp: '05:45:10', details: 'Delivery lento (2.4s) — legacy-system.internal' },
  { id: 'l8', integration: 'Rappi', event: 'menu.sync', direction: 'outbound', status: 'success', timestamp: '05:30:00', details: 'Sync programado completado — 0 errores' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function GastroConnect() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'api' | 'webhooks' | 'logs'>('marketplace')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [connectModal, setConnectModal] = useState<Integration | null>(null)

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const errorCount = integrations.filter(i => i.status === 'error').length

  const filteredIntegrations = integrations.filter(i => {
    const matchSearch = !searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = categoryFilter === 'all' || i.category === categoryFilter
    return matchSearch && matchCategory
  })

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i
      if (i.status === 'connected') return { ...i, status: 'disconnected' as IntegrationStatus, lastSync: undefined, syncHealth: undefined }
      return { ...i, status: 'connected' as IntegrationStatus, lastSync: 'Recién conectado', syncHealth: 100 }
    }))
    setConnectModal(null)
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const statusBadge = (status: IntegrationStatus) => {
    const map: Record<IntegrationStatus, { label: string; cls: string }> = {
      connected: { label: 'Conectado', cls: 'badge-success' },
      disconnected: { label: 'Desconectado', cls: 'badge' },
      error: { label: 'Error', cls: 'badge-error' },
      pending: { label: 'Pendiente', cls: 'badge-warning' },
    }
    const s = map[status]
    return <span className={`badge text-xs ${s.cls}`}>{s.label}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(59,130,246,0.06) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 opacity-15"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 0 30px rgba(37,99,235,0.35)' }}>
              <Plug size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gastro-text mb-1">GastroConnect</h2>
              <p className="text-sm text-gastro-subtle">Hub de integraciones, APIs y webhooks. Conecta tu ecosistema gastronómico en un solo lugar.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
            {[
              { value: `${connectedCount}`, label: 'Conectadas' },
              { value: '12.4K', label: 'API calls/día' },
              { value: `${WEBHOOKS.filter(w => w.status === 'active').length}`, label: 'Webhooks activos' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl font-black" style={{ color: '#2563EB' }}>{stat.value}</div>
                <div className="text-xs text-gastro-subtle">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Integraciones activas', value: connectedCount, color: '#10b981', icon: CheckCircle },
          { label: 'Con errores', value: errorCount, color: '#ef4444', icon: AlertTriangle },
          { label: 'API keys activas', value: API_KEYS.filter(k => k.active).length, color: '#2563EB', icon: Key },
          { label: 'Uptime sync', value: '99.7%', color: '#3B82F6', icon: Activity },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            ['marketplace', 'Integraciones', Plug],
            ['api', 'API Keys', Key],
            ['webhooks', 'Webhooks', Webhook],
            ['logs', 'Actividad', Activity],
          ] as const).map(([id, label, Icon]) => (
            <button key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${activeTab === id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeTab === id
                ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        {activeTab === 'api' && (
          <button className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            <Plus size={15} /> Nueva API key
          </button>
        )}
        {activeTab === 'webhooks' && (
          <button className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            <Plus size={15} /> Nuevo webhook
          </button>
        )}
      </div>

      {/* ── Marketplace ── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar integración..."
                className="input-gastro pl-10"
                aria-label="Buscar integración"
              />
            </div>
            <button className="btn-secondary text-sm px-4 py-2"><Filter size={14} /> Filtros</button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${categoryFilter === 'all' ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={categoryFilter === 'all'
                ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              Todas
            </button>
            {(Object.entries(CATEGORY_META) as [IntegrationCategory, typeof CATEGORY_META[IntegrationCategory]][]).map(([key, meta]) => {
              const Icon = meta.icon
              return (
                <button key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${categoryFilter === key ? '' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={categoryFilter === key
                    ? { background: `${meta.color}18`, border: `1px solid ${meta.color}44`, color: meta.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                  <Icon size={12} /> {meta.label}
                </button>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => {
              const catMeta = CATEGORY_META[integration.category]
              const CatIcon = catMeta.icon
              return (
                <div key={integration.id} className="card-gastro group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: integration.status === 'connected' ? 'rgba(16,185,129,0.12)' : integration.status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)' }}>
                      <Plug size={20} style={{ color: integration.status === 'connected' ? '#10b981' : integration.status === 'error' ? '#ef4444' : '#8899BB' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gastro-text text-sm">{integration.name}</h4>
                        {integration.isPopular && <span className="badge badge-primary text-xs">Popular</span>}
                        {integration.isNew && <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>NEW</span>}
                        {integration.isPro && <span className="badge text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Pro</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CatIcon size={11} style={{ color: catMeta.color }} />
                        <span className="text-xs text-gastro-subtle">{catMeta.label}</span>
                      </div>
                    </div>
                    {statusBadge(integration.status)}
                  </div>

                  <p className="text-xs text-gastro-subtle leading-relaxed mb-3">{integration.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {integration.features.map(f => (
                      <span key={f} className="module-chip text-xs">{f}</span>
                    ))}
                  </div>

                  {integration.status === 'connected' && integration.syncHealth !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gastro-subtle">Salud de sync</span>
                        <span className="font-bold" style={{ color: integration.syncHealth >= 90 ? '#10b981' : integration.syncHealth >= 70 ? '#f59e0b' : '#ef4444' }}>
                          {integration.syncHealth}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${integration.syncHealth}%`,
                          background: integration.syncHealth >= 90 ? '#10b981' : integration.syncHealth >= 70 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      {integration.lastSync && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gastro-subtle">
                          <RefreshCw size={10} /> {integration.lastSync}
                        </div>
                      )}
                    </div>
                  )}

                  {integration.status === 'error' && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl mb-4 text-xs"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      <AlertTriangle size={13} /> Conexión interrumpida — revisar credenciales
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t" style={{ borderColor: '#1A2540' }}>
                    {integration.status === 'connected' ? (
                      <>
                        <button
                          onClick={() => toggleConnection(integration.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-error transition-all hover:bg-error/10 cursor-pointer"
                          style={{ border: '1px solid rgba(239,68,68,0.3)' }}
                          aria-label={`Desconectar ${integration.name}`}>
                          <Unlink size={12} /> Desconectar
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gastro-subtle hover:text-gastro-text transition-all hover:bg-white/5 cursor-pointer"
                          style={{ border: '1px solid #1A2540' }}
                          aria-label={`Configurar ${integration.name}`}>
                          <Settings size={12} />
                        </button>
                      </>
                    ) : integration.status === 'pending' ? (
                      <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-warning cursor-pointer"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Clock size={12} className="inline mr-1" /> Configuración en curso...
                      </button>
                    ) : (
                      <button
                        onClick={() => setConnectModal(integration)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-primary-400 transition-all hover:text-white cursor-pointer"
                        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}
                        aria-label={`Conectar ${integration.name}`}>
                        <Link2 size={12} /> Conectar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="card-gastro text-center py-12">
              <Plug size={32} className="mx-auto text-gastro-muted mb-3" />
              <p className="text-gastro-subtle text-sm">No se encontraron integraciones con esos filtros.</p>
            </div>
          )}
        </div>
      )}

      {/* ── API Keys ── */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="card-gastro p-4 flex items-start gap-3"
            style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <Shield size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gastro-text">API REST v2 — Documentación</p>
              <p className="text-xs text-gastro-subtle mt-0.5">Base URL: <code className="text-primary-400">https://api.gastro360.com/v2</code></p>
              <button className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2 transition-colors cursor-pointer">
                Ver documentación <ExternalLink size={11} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {API_KEYS.map(key => (
              <div key={key.id} className="card-gastro">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: key.active ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)' }}>
                    <Key size={18} style={{ color: key.active ? '#2563EB' : '#8899BB' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gastro-text text-sm">{key.name}</h4>
                      <span className={`badge text-xs ${key.active ? 'badge-success' : ''}`}>
                        {key.active ? 'Activa' : 'Revocada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs text-gastro-subtle font-mono">
                        {visibleKeys.has(key.id) ? key.prefix.replace(/•/g, 'x') : key.prefix}
                      </code>
                      <button
                        onClick={() => setVisibleKeys(prev => {
                          const next = new Set(prev)
                          next.has(key.id) ? next.delete(key.id) : next.add(key.id)
                          return next
                        })}
                        className="text-gastro-muted hover:text-gastro-text transition-colors cursor-pointer"
                        aria-label={visibleKeys.has(key.id) ? 'Ocultar clave' : 'Mostrar clave'}>
                        {visibleKeys.has(key.id) ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => handleCopy(key.id, key.prefix)}
                        className="text-gastro-muted hover:text-gastro-text transition-colors cursor-pointer"
                        aria-label="Copiar clave API">
                        {copiedId === key.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {key.permissions.map(p => (
                        <span key={p} className="module-chip text-xs font-mono">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gastro-subtle flex-shrink-0">
                    <div>Creada: {key.created}</div>
                    <div className="mt-0.5">Último uso: {key.lastUsed}</div>
                  </div>
                  <button className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    aria-label={`Revocar ${key.name}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text text-sm mb-4 flex items-center gap-2">
              <Code2 size={16} className="text-primary-400" /> Ejemplo rápido
            </h3>
            <pre className="p-4 rounded-xl text-xs overflow-x-auto leading-relaxed"
              style={{ background: '#0A0F1A', border: '1px solid #1A2540', color: '#8899BB' }}>
{`curl -X GET "https://api.gastro360.com/v2/orders?status=active" \\
  -H "Authorization: Bearer gastro_live_xxxxxxxx" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>
        </div>
      )}

      {/* ── Webhooks ── */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {WEBHOOKS.map(webhook => (
            <div key={webhook.id} className="card-gastro">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: webhook.status === 'active' ? 'rgba(16,185,129,0.12)' : webhook.status === 'failed' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  }}>
                  <Webhook size={18} style={{
                    color: webhook.status === 'active' ? '#10b981' : webhook.status === 'failed' ? '#ef4444' : '#f59e0b',
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-sm text-gastro-text font-mono truncate">{webhook.url}</code>
                    <span className={`badge text-xs ${webhook.status === 'active' ? 'badge-success' : webhook.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                      {webhook.status === 'active' ? 'Activo' : webhook.status === 'failed' ? 'Fallido' : 'Pausado'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {webhook.events.map(ev => (
                      <span key={ev} className="module-chip text-xs font-mono">{ev}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-gastro-subtle flex-shrink-0">
                  <div className="text-center">
                    <div className="font-bold text-gastro-text">{webhook.successRate}%</div>
                    <div>Éxito</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gastro-text">{webhook.lastDelivery}</div>
                    <div>Último envío</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="btn-secondary text-xs px-3 py-2 cursor-pointer">Editar</button>
                  {webhook.status === 'failed' && (
                    <button className="btn-primary text-xs px-3 py-2 cursor-pointer">
                      <RefreshCw size={12} /> Reintentar
                    </button>
                  )}
                </div>
              </div>
              {webhook.status === 'failed' && (
                <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <AlertTriangle size={13} /> 3 entregas fallidas consecutivas — verificar endpoint
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Activity Logs ── */}
      {activeTab === 'logs' && (
        <div className="card-gastro overflow-hidden p-0">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1A2540' }}>
            <span className="text-sm font-bold text-gastro-text">Registro de actividad</span>
            <button className="flex items-center gap-1.5 text-xs text-gastro-subtle hover:text-gastro-text transition-colors cursor-pointer">
              <RefreshCw size={12} /> Actualizar
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gastro-subtle uppercase tracking-wider" style={{ borderBottom: '1px solid #1A2540' }}>
                  <th className="text-left px-4 py-3 font-semibold">Hora</th>
                  <th className="text-left px-4 py-3 font-semibold">Integración</th>
                  <th className="text-left px-4 py-3 font-semibold">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold">Dirección</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #1A2540' }}>
                    <td className="px-4 py-3 text-xs font-mono text-gastro-subtle">{log.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-gastro-text text-xs">{log.integration}</td>
                    <td className="px-4 py-3"><span className="module-chip text-xs font-mono">{log.event}</span></td>
                    <td className="px-4 py-3">
                      {log.direction === 'inbound'
                        ? <span className="flex items-center gap-1 text-xs text-secondary-400"><ArrowDownLeft size={12} /> Entrada</span>
                        : <span className="flex items-center gap-1 text-xs text-accent-400"><ArrowUpRight size={12} /> Salida</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${log.status === 'success' ? 'badge-success' : log.status === 'error' ? 'badge-error' : 'badge-warning'}`}>
                        {log.status === 'success' ? 'OK' : log.status === 'error' ? 'Error' : 'Alerta'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gastro-subtle max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: '#1A2540' }}>
            {ACTIVITY_LOGS.map(log => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gastro-text text-sm">{log.integration}</span>
                  <span className={`badge text-xs ${log.status === 'success' ? 'badge-success' : log.status === 'error' ? 'badge-error' : 'badge-warning'}`}>
                    {log.status === 'success' ? 'OK' : log.status === 'error' ? 'Error' : 'Alerta'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gastro-subtle">
                  <span className="font-mono">{log.timestamp}</span>
                  <span>·</span>
                  <span className="module-chip font-mono">{log.event}</span>
                </div>
                <p className="text-xs text-gastro-subtle">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect modal */}
      {connectModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          role="dialog"
          aria-labelledby="connect-modal-title">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-down"
            style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 id="connect-modal-title" className="font-bold text-gastro-text">Conectar {connectModal.name}</h3>
              <button onClick={() => setConnectModal(null)} className="text-gastro-muted hover:text-gastro-text cursor-pointer" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl mb-5"
              style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(37,99,235,0.15)' }}>
                <Plug size={18} className="text-primary-400" />
              </div>
              <div>
                <div className="font-semibold text-gastro-text text-sm">{connectModal.name}</div>
                <div className="text-xs text-gastro-subtle">{connectModal.description}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="connect-api-key" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  API Key / Token
                </label>
                <input id="connect-api-key" type="password" placeholder="Pega tu clave de API aquí" className="input-gastro text-sm" />
              </div>
              <div>
                <label htmlFor="connect-store-id" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  ID de local (opcional)
                </label>
                <input id="connect-store-id" type="text" placeholder="Ej: store_abc123" className="input-gastro text-sm" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setConnectModal(null)} className="btn-secondary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => toggleConnection(connectModal.id)} className="btn-primary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                <Zap size={15} /> Conectar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
