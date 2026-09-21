export const MOCK_METRICS = {
  revenue: { value: 2847650, change: 12.4, label: 'Ingresos del mes', prefix: '$', suffix: '' },
  orders: { value: 3842, change: 8.7, label: 'Pedidos totales', prefix: '', suffix: '' },
  avgTicket: { value: 18450, change: 3.2, label: 'Ticket promedio', prefix: '$', suffix: '' },
  occupancy: { value: 78, change: -2.1, label: 'Ocupación promedio', prefix: '', suffix: '%' },
  satisfaction: { value: 4.7, change: 0.2, label: 'Satisfacción clientes', prefix: '', suffix: '/5' },
  foodCost: { value: 28.4, change: -1.3, label: 'Food cost', prefix: '', suffix: '%' },
};

export const REVENUE_DATA = [
  { day: 'Lun', revenue: 380000, orders: 142, target: 350000 },
  { day: 'Mar', revenue: 420000, orders: 168, target: 350000 },
  { day: 'Mié', revenue: 395000, orders: 155, target: 350000 },
  { day: 'Jue', revenue: 510000, orders: 198, target: 400000 },
  { day: 'Vie', revenue: 680000, orders: 267, target: 500000 },
  { day: 'Sáb', revenue: 820000, orders: 312, target: 600000 },
  { day: 'Dom', revenue: 642000, orders: 248, target: 550000 },
];

export const CHANNEL_DATA = [
  { name: 'Salón', value: 42, color: '#2563EB' },
  { name: 'Delivery propio', value: 23, color: '#3B82F6' },
  { name: 'Uber Eats', value: 15, color: '#60A5FA' },
  { name: 'Rappi', value: 12, color: '#f59e0b' },
  { name: 'Take Away', value: 8, color: '#10b981' },
];

export const TOP_PRODUCTS = [
  { id: 1, name: 'Risotto de Hongos', category: 'Pastas', orders: 284, revenue: 5964000, margin: 68, trend: 'up' },
  { id: 2, name: 'Lomo a la Pimienta', category: 'Carnes', orders: 231, revenue: 8316000, margin: 62, trend: 'up' },
  { id: 3, name: 'Burrata con Tomates', category: 'Entradas', orders: 198, revenue: 2772000, margin: 74, trend: 'stable' },
  { id: 4, name: 'Tiramisú Artesanal', category: 'Postres', orders: 187, revenue: 1683000, margin: 81, trend: 'up' },
  { id: 5, name: 'Ceviche Clásico', category: 'Entradas', orders: 165, revenue: 2475000, margin: 71, trend: 'down' },
];

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered'
export type OrderChannel = 'salon' | 'delivery' | 'takeaway' | 'uber' | 'rappi'

export interface OrderLineItem {
  name: string
  qty: number
  price: number
  category: string
  mods: string[]
  status: OrderStatus
  station?: string
}

export interface OrderTimelineEvent {
  time: string
  event: string
  actor?: string
}

export interface OrderEyeAlert {
  type: 'empty_glass' | 'hand_raise' | 'long_wait' | 'ready_dish'
  message: string
  time: string
}

export interface LiveOrder {
  id: string
  table: string
  channel: OrderChannel
  zone: string
  items: number
  guests: number
  status: OrderStatus
  time: string
  waiter: string
  createdAt: string
  lineItems: OrderLineItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'partial'
  notes?: string
  timeline: OrderTimelineEvent[]
  eyeAlerts?: OrderEyeAlert[]
}

export const LIVE_ORDERS: LiveOrder[] = [
  {
    id: '#4821', table: 'Mesa 12', channel: 'salon', zone: 'Salón', items: 4, guests: 5,
    status: 'cooking', time: '8 min', waiter: 'Carlos M.', createdAt: '20:42',
    lineItems: [
      { name: 'Risotto de Hongos', qty: 2, price: 10500, category: 'Pastas', mods: ['Sin sal', 'Extra parmesano'], status: 'cooking', station: 'Caliente' },
      { name: 'Lomo a la Pimienta', qty: 1, price: 18000, category: 'Carnes', mods: [], status: 'cooking', station: 'Parrilla' },
      { name: 'Burrata con Tomates', qty: 1, price: 7000, category: 'Entradas', mods: ['Sin rúcula'], status: 'ready', station: 'Fría' },
    ],
    subtotal: 43000, tax: 8170, tip: 4300, total: 55470,
    paymentMethod: 'Tarjeta', paymentStatus: 'partial',
    notes: 'Mesa cumpleaños — traer vela con postre',
    timeline: [
      { time: '20:42', event: 'Pedido recibido', actor: 'Carlos M.' },
      { time: '20:43', event: 'Enviado a cocina', actor: 'KDS' },
      { time: '20:47', event: 'Burrata lista', actor: 'Cocina fría' },
      { time: '20:50', event: 'Risotto en preparación', actor: 'Cocina caliente' },
    ],
    eyeAlerts: [
      { type: 'empty_glass', message: 'Vaso vacío detectado — Mesa 12', time: '20:49' },
    ],
  },
  {
    id: '#4822', table: 'Mesa 7', channel: 'salon', zone: 'Salón', items: 2, guests: 4,
    status: 'ready', time: '0 min', waiter: 'Ana R.', createdAt: '20:38',
    lineItems: [
      { name: 'Ceviche Clásico', qty: 1, price: 8500, category: 'Entradas', mods: [], status: 'ready', station: 'Fría' },
      { name: 'Tiramisú Artesanal', qty: 1, price: 4500, category: 'Postres', mods: [], status: 'ready', station: 'Pastelería' },
    ],
    subtotal: 13000, tax: 2470, tip: 0, total: 15470,
    paymentMethod: 'Efectivo', paymentStatus: 'pending',
    timeline: [
      { time: '20:38', event: 'Pedido recibido', actor: 'Ana R.' },
      { time: '20:39', event: 'Enviado a cocina', actor: 'KDS' },
      { time: '20:45', event: 'Todos los ítems listos', actor: 'Cocina' },
    ],
    eyeAlerts: [
      { type: 'ready_dish', message: 'Plato listo sin retirar — 3 min', time: '20:48' },
    ],
  },
  {
    id: '#4823', table: 'Delivery', channel: 'delivery', zone: 'Delivery', items: 3, guests: 2,
    status: 'pending', time: '2 min', waiter: 'Sistema', createdAt: '20:50',
    lineItems: [
      { name: 'Pizza Margherita', qty: 1, price: 9200, category: 'Pizzas', mods: ['Masa fina'], status: 'pending', station: 'Horno' },
      { name: 'Ensalada César', qty: 1, price: 5800, category: 'Entradas', mods: ['Sin crutones'], status: 'pending', station: 'Fría' },
      { name: 'Agua mineral', qty: 2, price: 1200, category: 'Bebidas', mods: [], status: 'pending', station: 'Barra' },
    ],
    subtotal: 17400, tax: 3306, tip: 0, total: 20706,
    paymentMethod: 'Mercado Pago', paymentStatus: 'paid',
    notes: 'Entregar en Av. Providencia 2150, Depto 502. Tocar timbre.',
    timeline: [
      { time: '20:50', event: 'Pedido recibido vía GastroGo', actor: 'Sistema' },
      { time: '20:50', event: 'Pago confirmado', actor: 'Mercado Pago' },
    ],
  },
  {
    id: '#4824', table: 'Mesa 3', channel: 'salon', zone: 'Salón', items: 6, guests: 4,
    status: 'cooking', time: '12 min', waiter: 'Luis P.', createdAt: '20:40',
    lineItems: [
      { name: 'Pizza Margherita', qty: 2, price: 9200, category: 'Pizzas', mods: ['Masa fina'], status: 'cooking', station: 'Horno' },
      { name: 'Pasta Carbonara', qty: 2, price: 9800, category: 'Pastas', mods: [], status: 'cooking', station: 'Caliente' },
      { name: 'Ensalada César', qty: 1, price: 5800, category: 'Entradas', mods: ['Sin crutones'], status: 'ready', station: 'Fría' },
      { name: 'Agua mineral', qty: 4, price: 1200, category: 'Bebidas', mods: [], status: 'delivered', station: 'Barra' },
    ],
    subtotal: 51600, tax: 9804, tip: 5160, total: 66564,
    paymentMethod: 'Tarjeta', paymentStatus: 'pending',
    timeline: [
      { time: '20:40', event: 'Pedido recibido', actor: 'Luis P.' },
      { time: '20:41', event: 'Enviado a cocina', actor: 'KDS' },
      { time: '20:44', event: 'Bebidas servidas', actor: 'Luis P.' },
      { time: '20:46', event: 'Ensalada lista', actor: 'Cocina fría' },
    ],
    eyeAlerts: [
      { type: 'hand_raise', message: 'Cliente levantó la mano — atención requerida', time: '20:51' },
      { type: 'long_wait', message: 'Espera prolongada — 12 min sin plato principal', time: '20:52' },
    ],
  },
  {
    id: '#4825', table: 'Mesa 15', channel: 'salon', zone: 'VIP', items: 1, guests: 3,
    status: 'delivered', time: '—', waiter: 'María G.', createdAt: '19:55',
    lineItems: [
      { name: 'Salmón a la Plancha', qty: 1, price: 16500, category: 'Pescados', mods: ['Término medio'], status: 'delivered', station: 'Parrilla' },
    ],
    subtotal: 16500, tax: 3135, tip: 3300, total: 22935,
    paymentMethod: 'Tarjeta', paymentStatus: 'paid',
    notes: 'Cliente VIP — mesa habitual',
    timeline: [
      { time: '19:55', event: 'Pedido recibido', actor: 'María G.' },
      { time: '19:56', event: 'Enviado a cocina', actor: 'KDS' },
      { time: '20:08', event: 'Plato entregado', actor: 'María G.' },
      { time: '20:47', event: 'Cuenta cobrada', actor: 'María G.' },
    ],
  },
  {
    id: '#4826', table: 'Take Away', channel: 'takeaway', zone: 'Mostrador', items: 2, guests: 1,
    status: 'pending', time: '1 min', waiter: 'Sistema', createdAt: '20:51',
    lineItems: [
      { name: 'Risotto de Hongos', qty: 1, price: 10500, category: 'Pastas', mods: [], status: 'pending', station: 'Caliente' },
      { name: 'Tiramisú Artesanal', qty: 1, price: 4500, category: 'Postres', mods: [], status: 'pending', station: 'Pastelería' },
    ],
    subtotal: 15000, tax: 2850, tip: 0, total: 17850,
    paymentMethod: 'Efectivo', paymentStatus: 'pending',
    notes: 'Retira en 25 min — nombre: Diego Torres',
    timeline: [
      { time: '20:51', event: 'Pedido take away recibido', actor: 'Mostrador' },
    ],
  },
];

export const TABLES_DATA = [
  { id: 1, number: '1', capacity: 2, status: 'available', zone: 'Terraza' },
  { id: 2, number: '2', capacity: 4, status: 'occupied', zone: 'Terraza', order: '#4819', time: '45 min', guests: 3 },
  { id: 3, number: '3', capacity: 4, status: 'occupied', zone: 'Salón', order: '#4824', time: '22 min', guests: 4 },
  { id: 4, number: '4', capacity: 6, status: 'reserved', zone: 'Salón', reservation: '20:30', name: 'García' },
  { id: 5, number: '5', capacity: 2, status: 'available', zone: 'Salón' },
  { id: 6, number: '6', capacity: 4, status: 'occupied', zone: 'Salón', order: '#4815', time: '68 min', guests: 2 },
  { id: 7, number: '7', capacity: 4, status: 'occupied', zone: 'Salón', order: '#4822', time: '31 min', guests: 4 },
  { id: 8, number: '8', capacity: 8, status: 'reserved', zone: 'VIP', reservation: '21:00', name: 'Martínez' },
  { id: 9, number: '9', capacity: 2, status: 'available', zone: 'Barra' },
  { id: 10, number: '10', capacity: 2, status: 'occupied', zone: 'Barra', order: '#4820', time: '15 min', guests: 2 },
  { id: 11, number: '11', capacity: 4, status: 'cleaning', zone: 'Terraza' },
  { id: 12, number: '12', capacity: 6, status: 'occupied', zone: 'Salón', order: '#4821', time: '8 min', guests: 5 },
  { id: 13, number: '13', capacity: 4, status: 'available', zone: 'Salón' },
  { id: 14, number: '14', capacity: 2, status: 'available', zone: 'Barra' },
  { id: 15, number: '15', capacity: 4, status: 'occupied', zone: 'VIP', order: '#4825', time: '52 min', guests: 3 },
];

export const MENU_CATEGORIES = [
  { id: 1, name: 'Entradas', icon: '🥗', products: 12, active: true },
  { id: 2, name: 'Pastas', icon: '🍝', products: 8, active: true },
  { id: 3, name: 'Carnes', icon: '🥩', products: 10, active: true },
  { id: 4, name: 'Pescados', icon: '🐟', products: 7, active: true },
  { id: 5, name: 'Pizzas', icon: '🍕', products: 9, active: true },
  { id: 6, name: 'Postres', icon: '🍮', products: 6, active: true },
  { id: 7, name: 'Bebidas', icon: '🍷', products: 24, active: true },
  { id: 8, name: 'Menú del día', icon: '📋', products: 3, active: true },
];

export const MENU_PRODUCTS = [
  {
    id: 1, name: 'Risotto de Hongos Porcini', category: 'Pastas', price: 21000,
    channels: { salon: true, qr: true, web: true, delivery: true, uberEats: true, rappi: true },
    stock: 'available', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400',
    margin: 68, cost: 6720, tags: ['vegetariano', 'sin gluten'],
  },
  {
    id: 2, name: 'Lomo a la Pimienta Verde', category: 'Carnes', price: 36000,
    channels: { salon: true, qr: true, web: true, delivery: false, uberEats: false, rappi: false },
    stock: 'available', image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?w=400',
    margin: 62, cost: 13680, tags: ['sin gluten'],
  },
  {
    id: 3, name: 'Burrata con Tomates Cherry', category: 'Entradas', price: 14000,
    channels: { salon: true, qr: true, web: true, delivery: true, uberEats: true, rappi: true },
    stock: 'low', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
    margin: 74, cost: 3640, tags: ['vegetariano'],
  },
  {
    id: 4, name: 'Tiramisú Artesanal', category: 'Postres', price: 9000,
    channels: { salon: true, qr: true, web: true, delivery: true, uberEats: true, rappi: false },
    stock: 'available', image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?w=400',
    margin: 81, cost: 1710, tags: ['vegetariano'],
  },
  {
    id: 5, name: 'Ceviche Clásico', category: 'Entradas', price: 15000,
    channels: { salon: true, qr: true, web: false, delivery: false, uberEats: false, rappi: false },
    stock: 'available', image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400',
    margin: 71, cost: 4350, tags: ['sin gluten', 'mariscos'],
  },
  {
    id: 6, name: 'Pizza Margherita Artesanal', category: 'Pizzas', price: 18000,
    channels: { salon: true, qr: true, web: true, delivery: true, uberEats: true, rappi: true },
    stock: 'available', image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?w=400',
    margin: 76, cost: 4320, tags: ['vegetariano'],
  },
];

export const INVENTORY_ITEMS = [
  { id: 1, name: 'Lomo de res', unit: 'kg', stock: 12.5, minStock: 5, maxStock: 30, cost: 28000, supplier: 'Carnes Premium SA', status: 'ok' },
  { id: 2, name: 'Harina 000', unit: 'kg', stock: 3.2, minStock: 10, maxStock: 50, cost: 1200, supplier: 'Molinos del Sur', status: 'critical' },
  { id: 3, name: 'Queso Parmesano', unit: 'kg', stock: 4.8, minStock: 3, maxStock: 15, cost: 18000, supplier: 'Lácteos Artesanos', status: 'low' },
  { id: 4, name: 'Tomates Cherry', unit: 'kg', stock: 8.0, minStock: 5, maxStock: 20, cost: 3500, supplier: 'Verduras Frescas', status: 'ok' },
  { id: 5, name: 'Aceite de Oliva EV', unit: 'lt', stock: 6.5, minStock: 4, maxStock: 20, cost: 12000, supplier: 'Importadora Gourmet', status: 'ok' },
  { id: 6, name: 'Hongos Porcini', unit: 'kg', stock: 1.8, minStock: 2, maxStock: 8, cost: 45000, supplier: 'Importadora Gourmet', status: 'low' },
  { id: 7, name: 'Vino Tinto Carmenère', unit: 'bt', stock: 24, minStock: 12, maxStock: 60, cost: 8500, supplier: 'Viña Casablanca', status: 'ok' },
  { id: 8, name: 'Crema de leche', unit: 'lt', stock: 5.5, minStock: 4, maxStock: 15, cost: 2800, supplier: 'Lácteos Artesanos', status: 'ok' },
];

export const STAFF_DATA = [
  { id: 1, name: 'Carlos Morales', role: 'Jefe de Cocina', status: 'active', shift: '12:00 - 22:00', rating: 4.9, avatar: 'CM' },
  { id: 2, name: 'Ana Rodríguez', role: 'Sommelier', status: 'active', shift: '18:00 - 24:00', rating: 4.8, avatar: 'AR' },
  { id: 3, name: 'Luis Pérez', role: 'Mozo', status: 'active', shift: '12:00 - 22:00', rating: 4.6, avatar: 'LP' },
  { id: 4, name: 'María González', role: 'Mozza', status: 'active', shift: '18:00 - 24:00', rating: 4.7, avatar: 'MG' },
  { id: 5, name: 'Roberto Silva', role: 'Bartender', status: 'break', shift: '16:00 - 24:00', rating: 4.5, avatar: 'RS' },
  { id: 6, name: 'Valentina Cruz', role: 'Sous Chef', status: 'active', shift: '10:00 - 20:00', rating: 4.8, avatar: 'VC' },
];

export const LOYALTY_MEMBERS = [
  { id: 1, name: 'Alejandro Vega', tier: 'Platinum', points: 12450, visits: 48, spent: 2840000, lastVisit: 'Hace 2 días' },
  { id: 2, name: 'Sofía Herrera', tier: 'Gold', points: 7820, visits: 31, spent: 1560000, lastVisit: 'Hace 5 días' },
  { id: 3, name: 'Martín López', tier: 'Gold', points: 6340, visits: 27, spent: 1280000, lastVisit: 'Ayer' },
  { id: 4, name: 'Camila Torres', tier: 'Silver', points: 3210, visits: 14, spent: 640000, lastVisit: 'Hace 1 semana' },
  { id: 5, name: 'Diego Ramírez', tier: 'Silver', points: 2890, visits: 12, spent: 580000, lastVisit: 'Hace 3 días' },
];

export const AI_INSIGHTS = [
  {
    id: 1, type: 'revenue', priority: 'high',
    title: 'Oportunidad de upselling detectada',
    description: 'El 67% de las mesas que piden Risotto no ordenan postre. Sugerir Tiramisú podría aumentar el ticket promedio en $4.200.',
    action: 'Activar sugerencia en KDS',
    impact: '+$84.000/semana estimado',
  },
  {
    id: 2, type: 'stock', priority: 'urgent',
    title: 'Stock crítico: Harina 000',
    description: 'Con el ritmo actual de consumo, el stock se agotará en 18 horas. Se recomienda generar orden de compra inmediata.',
    action: 'Generar orden de compra',
    impact: 'Evitar pérdida de $320.000',
  },
  {
    id: 3, type: 'demand', priority: 'medium',
    title: 'Pico de demanda proyectado',
    description: 'Para el sábado próximo se proyecta un 34% más de demanda que el promedio. Considera reforzar el equipo de cocina.',
    action: 'Ver proyección completa',
    impact: 'Optimizar operación',
  },
  {
    id: 4, type: 'menu', priority: 'low',
    title: 'Producto con bajo rendimiento',
    description: 'El Ceviche Clásico tiene el menor margen ajustado por rotación. Considera reformular el precio o la receta.',
    action: 'Analizar producto',
    impact: 'Mejorar rentabilidad',
  },
];

export const FINANCE_DATA = {
  cashFlow: [
    { month: 'Ago', income: 2100000, expenses: 1540000 },
    { month: 'Sep', income: 2380000, expenses: 1680000 },
    { month: 'Oct', income: 2650000, expenses: 1820000 },
    { month: 'Nov', income: 2420000, expenses: 1750000 },
    { month: 'Dic', income: 3100000, expenses: 2100000 },
    { month: 'Ene', income: 2847650, expenses: 1920000 },
  ],
  expenses: [
    { category: 'Materia Prima', amount: 808000, percentage: 28.4 },
    { category: 'Personal', amount: 712000, percentage: 25.0 },
    { category: 'Arriendo', amount: 400000, percentage: 14.1 },
    { category: 'Servicios Básicos', amount: 180000, percentage: 6.3 },
    { category: 'Marketing', amount: 120000, percentage: 4.2 },
    { category: 'Otros', amount: 200000, percentage: 7.0 },
  ],
};
