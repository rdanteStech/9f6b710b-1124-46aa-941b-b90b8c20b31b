export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'sound' | 'kds' | 'slack'

export interface NotificationRule {
  id: string
  module: string
  moduleLabel: string
  label: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  channels: Record<NotificationChannel, boolean>
  enabled: boolean
}

export interface NotificationSettings {
  masterEnabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  digestMode: 'instant' | 'hourly' | 'daily'
  rules: NotificationRule[]
}

export interface EyeModuleConfig {
  minConfidence: number
  handRaiseSeconds: number
  longWaitMinutes: number
  autoAssign: boolean
  maxAssignDistance: number
  reassignIfFar: boolean
  privacyBlur: boolean
  recordClips: boolean
  activeHoursStart: string
  activeHoursEnd: string
  cooldownSeconds: number
  detections: Record<string, boolean>
}

export interface ReserveModuleConfig {
  slotDuration: number
  maxAdvanceDays: number
  minAdvanceHours: number
  maxPartySize: number
  autoConfirm: boolean
  requireDeposit: boolean
  depositAmount: number
  noShowGraceMinutes: number
  sendReminder: boolean
  reminderHours: number
  allowWaitlist: boolean
  maxWaitlistSize: number
}

export interface ServeModuleConfig {
  kdsAutoAccept: boolean
  kdsSoundAlerts: boolean
  tableTurnoverAlert: boolean
  tableTurnoverMinutes: number
  autoPrintTickets: boolean
  splitBillEnabled: boolean
}

export interface StockModuleConfig {
  lowStockThreshold: number
  criticalStockThreshold: number
  autoReorder: boolean
  reorderLeadDays: number
  expiryAlertDays: number
}

export interface GoModuleConfig {
  deliveryEnabled: boolean
  pickupEnabled: boolean
  minOrderAmount: number
  deliveryRadius: number
  prepTimeMinutes: number
  autoAcceptOrders: boolean
}

export interface PredictModuleConfig {
  demandForecast: boolean
  staffSuggestions: boolean
  weatherIntegration: boolean
  alertThreshold: number
}

export interface RestaurantConfig {
  name: string
  type: string
  address: string
  phone: string
  email: string
  timezone: string
  currency: string
  taxRate: number
  openingTime: string
  closingTime: string
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
  status: 'active' | 'maintenance' | 'inactive'
  tables: number
  staff: number
}

export interface SystemGlobalConfig {
  brandName: string
  defaultLanguage: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  multiLocation: boolean
  inheritFromGlobal: boolean
  auditLogEnabled: boolean
  dataRetentionDays: number
  apiRateLimit: number
  maintenanceMode: boolean
}

export const LOCATIONS: Location[] = [
  { id: 'loc-001', name: 'Trattoria Bellavista — Bellavista', address: 'Constitución 2847', city: 'Santiago', status: 'active', tables: 24, staff: 18 },
  { id: 'loc-002', name: 'Trattoria Bellavista — Providencia', address: 'Av. Providencia 2150', city: 'Providencia', status: 'active', tables: 18, staff: 14 },
  { id: 'loc-003', name: 'Trattoria Bellavista — Las Condes', address: 'Av. Apoquindo 4500', city: 'Las Condes', status: 'maintenance', tables: 16, staff: 12 },
]

export const DEFAULT_SYSTEM_CONFIG: SystemGlobalConfig = {
  brandName: 'Trattoria Bellavista',
  defaultLanguage: 'es-CL',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  multiLocation: true,
  inheritFromGlobal: true,
  auditLogEnabled: true,
  dataRetentionDays: 365,
  apiRateLimit: 1000,
  maintenanceMode: false,
}

export const MODULE_CONFIG_STATUS = [
  { id: 'eye', label: 'GastroEye', configured: true, lastChange: 'Hace 2 días', overrides: 1 },
  { id: 'reserve', label: 'GastroReserve', configured: true, lastChange: 'Hace 5 días', overrides: 0 },
  { id: 'serve', label: 'GastroServe', configured: true, lastChange: 'Hace 1 sem', overrides: 2 },
  { id: 'stock', label: 'GastroStock', configured: true, lastChange: 'Hace 3 días', overrides: 0 },
  { id: 'go', label: 'GastroGo', configured: false, lastChange: 'Sin configurar', overrides: 0 },
  { id: 'predict', label: 'GastroPredict', configured: true, lastChange: 'Hace 2 sem', overrides: 0 },
  { id: 'notifications', label: 'Notificaciones', configured: true, lastChange: 'Hoy', overrides: 3 },
]

export const NOTIFICATION_CHANNELS: { id: NotificationChannel; label: string; icon: string }[] = [
  { id: 'push', label: 'Push', icon: 'Bell' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'Phone' },
  { id: 'sound', label: 'Sonido', icon: 'Volume2' },
  { id: 'kds', label: 'KDS', icon: 'Monitor' },
  { id: 'slack', label: 'Slack', icon: 'Hash' },
]

export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'eye-alert',
    module: 'eye',
    moduleLabel: 'GastroEye',
    label: 'Alertas de salón IA',
    description: 'Vasos vacíos, manos levantadas, espera prolongada',
    priority: 'critical',
    enabled: true,
    channels: { push: true, email: false, sms: false, whatsapp: true, sound: true, kds: true, slack: false },
  },
  {
    id: 'eye-reassign',
    module: 'eye',
    moduleLabel: 'GastroEye',
    label: 'Reasignación de mozo',
    description: 'Cuando GastroEye reasigna alerta a mozo más cercano',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: false, sms: false, whatsapp: false, sound: true, kds: true, slack: false },
  },
  {
    id: 'reserve-new',
    module: 'reserve',
    moduleLabel: 'GastroReserve',
    label: 'Nueva reserva',
    description: 'Reserva confirmada o pendiente de confirmación',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: true, sound: false, kds: false, slack: false },
  },
  {
    id: 'reserve-noshow',
    module: 'reserve',
    moduleLabel: 'GastroReserve',
    label: 'No-show detectado',
    description: 'Cliente no se presentó dentro del tiempo de gracia',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: false, sms: true, whatsapp: false, sound: true, kds: false, slack: false },
  },
  {
    id: 'reserve-waitlist',
    module: 'reserve',
    moduleLabel: 'GastroReserve',
    label: 'Lista de espera',
    description: 'Mesa disponible para cliente en espera',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: false, sms: true, whatsapp: true, sound: false, kds: false, slack: false },
  },
  {
    id: 'serve-order-ready',
    module: 'serve',
    moduleLabel: 'GastroServe',
    label: 'Pedido listo',
    description: 'Cocina marcó pedido como listo para servir',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: false, sms: false, whatsapp: false, sound: true, kds: true, slack: false },
  },
  {
    id: 'serve-table-call',
    module: 'serve',
    moduleLabel: 'GastroServe',
    label: 'Llamada de mesa',
    description: 'Cliente solicita atención desde QR o botón',
    priority: 'critical',
    enabled: true,
    channels: { push: true, email: false, sms: false, whatsapp: false, sound: true, kds: true, slack: false },
  },
  {
    id: 'stock-low',
    module: 'stock',
    moduleLabel: 'GastroStock',
    label: 'Stock bajo',
    description: 'Insumo por debajo del umbral mínimo',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: true },
  },
  {
    id: 'stock-critical',
    module: 'stock',
    moduleLabel: 'GastroStock',
    label: 'Stock crítico',
    description: 'Insumo en nivel crítico — riesgo de quiebre',
    priority: 'critical',
    enabled: true,
    channels: { push: true, email: true, sms: true, whatsapp: true, sound: true, kds: false, slack: true },
  },
  {
    id: 'stock-expiry',
    module: 'stock',
    moduleLabel: 'GastroStock',
    label: 'Vencimiento próximo',
    description: 'Producto próximo a vencer en inventario',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'finance-close',
    module: 'finance',
    moduleLabel: 'GastroFinance',
    label: 'Cierre de caja',
    description: 'Resumen al completar cierre diario',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'finance-anomaly',
    module: 'finance',
    moduleLabel: 'GastroFinance',
    label: 'Anomalía financiera',
    description: 'Desvío significativo vs. promedio histórico',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: true },
  },
  {
    id: 'predict-alert',
    module: 'predict',
    moduleLabel: 'GastroPredict',
    label: 'Predicción de demanda',
    description: 'Pico de demanda o falta de personal prevista',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'insight-recommendation',
    module: 'insight',
    moduleLabel: 'GastroInsight',
    label: 'Recomendación IA',
    description: 'Insights y sugerencias de optimización',
    priority: 'low',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'go-new-order',
    module: 'go',
    moduleLabel: 'GastroGo',
    label: 'Nuevo pedido online',
    description: 'Pedido delivery o takeaway recibido',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: false, sms: false, whatsapp: true, sound: true, kds: true, slack: false },
  },
  {
    id: 'go-delivery-delay',
    module: 'go',
    moduleLabel: 'GastroGo',
    label: 'Retraso en delivery',
    description: 'Pedido supera tiempo estimado de entrega',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: false, sms: true, whatsapp: true, sound: true, kds: false, slack: false },
  },
  {
    id: 'loyalty-campaign',
    module: 'loyalty',
    moduleLabel: 'GastroLoyalty',
    label: 'Campaña enviada',
    description: 'Confirmación de campaña de fidelización',
    priority: 'low',
    enabled: false,
    channels: { push: false, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'events-booking',
    module: 'events',
    moduleLabel: 'GastroEvents',
    label: 'Nuevo evento / catering',
    description: 'Consulta o reserva de evento corporativo',
    priority: 'medium',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: true, sound: false, kds: false, slack: false },
  },
  {
    id: 'connect-webhook',
    module: 'connect',
    moduleLabel: 'GastroConnect',
    label: 'Error de integración',
    description: 'Webhook o API externa falló',
    priority: 'critical',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: true },
  },
  {
    id: 'review-low',
    module: 'general',
    moduleLabel: 'General',
    label: 'Reseña negativa',
    description: 'Cliente dejó calificación menor a 3 estrellas',
    priority: 'high',
    enabled: true,
    channels: { push: true, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
  {
    id: 'daily-report',
    module: 'general',
    moduleLabel: 'General',
    label: 'Reporte diario',
    description: 'Resumen de operaciones al cierre del día',
    priority: 'low',
    enabled: true,
    channels: { push: false, email: true, sms: false, whatsapp: false, sound: false, kds: false, slack: false },
  },
]

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '02:00',
  quietHoursEnd: '08:00',
  digestMode: 'instant',
  rules: DEFAULT_NOTIFICATION_RULES,
}

export const DEFAULT_EYE_CONFIG: EyeModuleConfig = {
  minConfidence: 85,
  handRaiseSeconds: 6,
  longWaitMinutes: 10,
  autoAssign: true,
  maxAssignDistance: 15,
  reassignIfFar: true,
  privacyBlur: true,
  recordClips: true,
  activeHoursStart: '11:00',
  activeHoursEnd: '01:00',
  cooldownSeconds: 30,
  detections: {
    empty_glass: true,
    empty_plate: true,
    raised_hand: true,
    long_wait: true,
    spill: true,
    table_ready: false,
  },
}

export const DEFAULT_RESERVE_CONFIG: ReserveModuleConfig = {
  slotDuration: 90,
  maxAdvanceDays: 60,
  minAdvanceHours: 2,
  maxPartySize: 12,
  autoConfirm: true,
  requireDeposit: false,
  depositAmount: 10000,
  noShowGraceMinutes: 15,
  sendReminder: true,
  reminderHours: 24,
  allowWaitlist: true,
  maxWaitlistSize: 20,
}

export const DEFAULT_SERVE_CONFIG: ServeModuleConfig = {
  kdsAutoAccept: true,
  kdsSoundAlerts: true,
  tableTurnoverAlert: true,
  tableTurnoverMinutes: 90,
  autoPrintTickets: false,
  splitBillEnabled: true,
}

export const DEFAULT_STOCK_CONFIG: StockModuleConfig = {
  lowStockThreshold: 20,
  criticalStockThreshold: 10,
  autoReorder: false,
  reorderLeadDays: 3,
  expiryAlertDays: 5,
}

export const DEFAULT_GO_CONFIG: GoModuleConfig = {
  deliveryEnabled: true,
  pickupEnabled: true,
  minOrderAmount: 8000,
  deliveryRadius: 5,
  prepTimeMinutes: 25,
  autoAcceptOrders: false,
}

export const DEFAULT_PREDICT_CONFIG: PredictModuleConfig = {
  demandForecast: true,
  staffSuggestions: true,
  weatherIntegration: true,
  alertThreshold: 75,
}

export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  name: 'Trattoria Bellavista',
  type: 'Restaurante italiano',
  address: 'Constitución 2847, Bellavista, Santiago',
  phone: '+56 2 2345 6789',
  email: 'hola@trattoriabellavista.cl',
  timezone: 'America/Santiago',
  currency: 'CLP',
  taxRate: 19,
  openingTime: '12:00',
  closingTime: '00:00',
}

export const NOTIFICATION_HISTORY = [
  { id: 1, ruleId: 'stock-critical', text: 'Stock crítico: Harina 000 (3.2 kg restantes)', time: 'Hace 2 min', read: false, priority: 'critical' as const },
  { id: 2, ruleId: 'serve-order-ready', text: 'Mesa 7 lista para servir — Pedido #4822', time: 'Hace 5 min', read: false, priority: 'high' as const },
  { id: 3, ruleId: 'finance-close', text: 'Cierre de caja completado: $847.650', time: 'Hace 1 h', read: true, priority: 'medium' as const },
  { id: 4, ruleId: 'reserve-new', text: 'Nueva reserva: García — 20:30 (Mesa 4)', time: 'Hace 2 h', read: true, priority: 'medium' as const },
  { id: 5, ruleId: 'eye-alert', text: 'GastroEye: Mano levantada en Mesa 12 — asignado a Valentina', time: 'Hace 3 h', read: true, priority: 'critical' as const },
  { id: 6, ruleId: 'go-new-order', text: 'GastroGo: Nuevo pedido delivery #8841 — $24.500', time: 'Hace 4 h', read: true, priority: 'high' as const },
  { id: 7, ruleId: 'predict-alert', text: 'GastroPredict: Pico de demanda previsto sábado 21:00', time: 'Ayer', read: true, priority: 'medium' as const },
  { id: 8, ruleId: 'connect-webhook', text: 'GastroConnect: Error webhook Uber Eats — reintentando', time: 'Ayer', read: true, priority: 'critical' as const },
]

export const INTEGRATIONS = [
  { id: 'uber', name: 'Uber Eats', status: 'connected' as const, desc: 'Sincronización de carta y pedidos activa' },
  { id: 'rappi', name: 'Rappi', status: 'connected' as const, desc: 'Sincronización de carta y pedidos activa' },
  { id: 'pedidosya', name: 'PedidosYa', status: 'disconnected' as const, desc: 'No conectado' },
  { id: 'mercadopago', name: 'MercadoPago', status: 'connected' as const, desc: 'Pagos QR y online activos' },
  { id: 'stripe', name: 'Stripe', status: 'disconnected' as const, desc: 'No conectado' },
  { id: 'google', name: 'Google My Business', status: 'connected' as const, desc: 'Reseñas y horarios sincronizados' },
]
