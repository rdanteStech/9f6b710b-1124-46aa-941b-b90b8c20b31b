export type ClientTier = 'VIP' | 'Frecuente' | 'Regular' | 'Nuevo' | 'Inactivo'
export type ClientStatus = 'active' | 'inactive' | 'blocked'
export type DietaryTag = 'vegetariano' | 'vegano' | 'sin_gluten' | 'sin_lactosa' | 'alergia_mariscos' | 'alergia_frutos_secos'

export interface ClientVisit {
  id: string
  date: string
  channel: 'salon' | 'delivery' | 'takeaway' | 'reserva'
  guests: number
  total: number
  rating?: number
  waiter?: string
  table?: string
}

export interface ClientOrder {
  id: string
  date: string
  items: { name: string; qty: number; price: number }[]
  total: number
  channel: string
}

export interface ClientNote {
  id: string
  date: string
  author: string
  text: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  tier: ClientTier
  status: ClientStatus
  loyaltyPoints: number
  totalSpent: number
  totalVisits: number
  avgTicket: number
  lastVisit: string
  firstVisit: string
  birthday?: string
  location: string
  preferredChannel: 'salon' | 'delivery' | 'takeaway'
  favoriteDishes: string[]
  dietaryTags: DietaryTag[]
  allergies: string[]
  drinkPreference?: string
  seatingPreference?: string
  visits: ClientVisit[]
  orders: ClientOrder[]
  notes: ClientNote[]
  tags: string[]
  churnRisk?: 'low' | 'medium' | 'high'
  npsScore?: number
}

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sin_gluten: 'Sin gluten',
  sin_lactosa: 'Sin lactosa',
  alergia_mariscos: 'Alergia mariscos',
  alergia_frutos_secos: 'Alergia frutos secos',
}

export const TIER_CONFIG: Record<ClientTier, { color: string; bg: string }> = {
  VIP: { color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  Frecuente: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Regular: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  Nuevo: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Inactivo: { color: '#8899BB', bg: 'rgba(136,153,187,0.12)' },
}

export const CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Alejandro Vega',
    email: 'alejandro.vega@gmail.com',
    phone: '+56 9 8765 4321',
    avatar: 'AV',
    tier: 'VIP',
    status: 'active',
    loyaltyPoints: 12450,
    totalSpent: 2840000,
    totalVisits: 48,
    avgTicket: 59167,
    lastVisit: '2025-07-19',
    firstVisit: '2023-03-12',
    birthday: '1985-11-14',
    location: 'Providencia, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Risotto de Hongos', 'Lomo a la Pimienta', 'Tiramisú Artesanal'],
    dietaryTags: [],
    allergies: [],
    drinkPreference: 'Malbec reserva — copa grande',
    seatingPreference: 'Mesa 12 o terraza, lejos del aire acondicionado',
    visits: [
      { id: 'v1', date: '2025-07-19', channel: 'salon', guests: 4, total: 89400, rating: 5, waiter: 'Carlos M.', table: 'Mesa 12' },
      { id: 'v2', date: '2025-07-12', channel: 'salon', guests: 2, total: 52800, rating: 5, waiter: 'Ana R.', table: 'Mesa 7' },
      { id: 'v3', date: '2025-07-05', channel: 'reserva', guests: 6, total: 142000, rating: 4, waiter: 'Luis P.', table: 'Mesa 15' },
    ],
    orders: [
      {
        id: 'o1', date: '2025-07-19', channel: 'Salón', total: 89400,
        items: [
          { name: 'Risotto de Hongos', qty: 2, price: 10500 },
          { name: 'Lomo a la Pimienta', qty: 1, price: 18000 },
          { name: 'Tiramisú Artesanal', qty: 2, price: 4500 },
        ],
      },
    ],
    notes: [
      { id: 'n1', date: '2025-06-01', author: 'Carlos M.', text: 'Cliente VIP — siempre reserva con 1 semana de anticipación. Prefiere vino tinto.' },
      { id: 'n2', date: '2025-07-19', author: 'Ana R.', text: 'Celebró aniversario de bodas. Solicitar vela en postre.' },
    ],
    tags: ['corporativo', 'alta-frecuencia', 'vino-premium'],
    churnRisk: 'low',
    npsScore: 10,
  },
  {
    id: 'c2',
    name: 'Sofía Herrera',
    email: 'sofia.herrera@outlook.cl',
    phone: '+56 9 7654 3210',
    avatar: 'SH',
    tier: 'Frecuente',
    status: 'active',
    loyaltyPoints: 7820,
    totalSpent: 1560000,
    totalVisits: 31,
    avgTicket: 50323,
    lastVisit: '2025-07-16',
    firstVisit: '2023-08-20',
    birthday: '1990-04-22',
    location: 'Las Condes, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Burrata con Tomates', 'Ceviche Clásico', 'Ensalada César'],
    dietaryTags: ['sin_gluten'],
    allergies: ['Gluten'],
    drinkPreference: 'Sauvignon Blanc — sin hielo',
    seatingPreference: 'Terraza, preferencia luz natural',
    visits: [
      { id: 'v4', date: '2025-07-16', channel: 'salon', guests: 2, total: 45600, rating: 5, waiter: 'María G.', table: 'Terraza 3' },
      { id: 'v5', date: '2025-07-09', channel: 'delivery', guests: 1, total: 28400, rating: 4 },
    ],
    orders: [
      {
        id: 'o2', date: '2025-07-16', channel: 'Salón', total: 45600,
        items: [
          { name: 'Burrata con Tomates', qty: 1, price: 7000 },
          { name: 'Ceviche Clásico', qty: 1, price: 8500 },
          { name: 'Ensalada César (sin crutones)', qty: 1, price: 5800 },
        ],
      },
    ],
    notes: [
      { id: 'n3', date: '2025-05-10', author: 'María G.', text: 'Celíaca confirmada — verificar preparación sin contaminación cruzada.' },
    ],
    tags: ['sin-gluten', 'terraza'],
    churnRisk: 'low',
    npsScore: 9,
  },
  {
    id: 'c3',
    name: 'Martín López',
    email: 'martin.lopez@gmail.com',
    phone: '+56 9 6543 2109',
    avatar: 'ML',
    tier: 'Frecuente',
    status: 'active',
    loyaltyPoints: 6340,
    totalSpent: 1280000,
    totalVisits: 27,
    avgTicket: 47407,
    lastVisit: '2025-07-20',
    firstVisit: '2024-01-15',
    location: 'Ñuñoa, Santiago',
    preferredChannel: 'delivery',
    favoriteDishes: ['Pizza Margherita', 'Pasta Carbonara'],
    dietaryTags: [],
    allergies: [],
    drinkPreference: 'Cerveza artesanal IPA',
    visits: [
      { id: 'v6', date: '2025-07-20', channel: 'delivery', guests: 2, total: 35200, rating: 4 },
    ],
    orders: [
      {
        id: 'o3', date: '2025-07-20', channel: 'GastroGo', total: 35200,
        items: [
          { name: 'Pizza Margherita', qty: 1, price: 9200 },
          { name: 'Pasta Carbonara', qty: 1, price: 9800 },
        ],
      },
    ],
    notes: [],
    tags: ['delivery', 'fin-de-semana'],
    churnRisk: 'low',
    npsScore: 8,
  },
  {
    id: 'c4',
    name: 'Camila Torres',
    email: 'camila.torres@yahoo.cl',
    phone: '+56 9 5432 1098',
    avatar: 'CT',
    tier: 'Regular',
    status: 'active',
    loyaltyPoints: 3210,
    totalSpent: 640000,
    totalVisits: 14,
    avgTicket: 45714,
    lastVisit: '2025-07-14',
    firstVisit: '2024-06-10',
    location: 'Vitacura, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Tiramisú Artesanal', 'Ensalada César'],
    dietaryTags: ['vegetariano'],
    allergies: [],
    drinkPreference: 'Limonada de menta',
    visits: [
      { id: 'v7', date: '2025-07-14', channel: 'salon', guests: 3, total: 62400, rating: 5, waiter: 'Roberto S.', table: 'Mesa 5' },
    ],
    orders: [],
    notes: [
      { id: 'n4', date: '2025-07-14', author: 'Roberto S.', text: 'Vegetariana estricta — no ofrecer platos con caldo de carne.' },
    ],
    tags: ['vegetariano', 'postres'],
    churnRisk: 'medium',
    npsScore: 9,
  },
  {
    id: 'c5',
    name: 'Diego Ramírez',
    email: 'diego.ramirez@gmail.com',
    phone: '+56 9 4321 0987',
    avatar: 'DR',
    tier: 'Regular',
    status: 'active',
    loyaltyPoints: 2890,
    totalSpent: 580000,
    totalVisits: 12,
    avgTicket: 48333,
    lastVisit: '2025-07-18',
    firstVisit: '2024-09-05',
    location: 'La Reina, Santiago',
    preferredChannel: 'takeaway',
    favoriteDishes: ['Lomo a la Pimienta', 'Risotto de Hongos'],
    dietaryTags: [],
    allergies: ['Mariscos'],
    drinkPreference: 'Agua con gas',
    visits: [
      { id: 'v8', date: '2025-07-18', channel: 'takeaway', guests: 1, total: 22500, rating: 4 },
    ],
    orders: [],
    notes: [
      { id: 'n5', date: '2024-09-05', author: 'Sistema', text: 'Alergia a mariscos registrada en primera visita.' },
    ],
    tags: ['takeaway', 'alergia-mariscos'],
    churnRisk: 'medium',
    npsScore: 7,
  },
  {
    id: 'c6',
    name: 'Valentina Cruz',
    email: 'vale.cruz@icloud.com',
    phone: '+56 9 3210 9876',
    avatar: 'VC',
    tier: 'Nuevo',
    status: 'active',
    loyaltyPoints: 450,
    totalSpent: 89000,
    totalVisits: 2,
    avgTicket: 44500,
    lastVisit: '2025-07-17',
    firstVisit: '2025-07-10',
    location: 'Bellavista, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Burrata con Tomates'],
    dietaryTags: ['vegano'],
    allergies: [],
    visits: [
      { id: 'v9', date: '2025-07-17', channel: 'salon', guests: 2, total: 52000, rating: 5, waiter: 'Luis P.', table: 'Mesa 3' },
      { id: 'v10', date: '2025-07-10', channel: 'salon', guests: 2, total: 37000, rating: 4, waiter: 'Ana R.', table: 'Mesa 8' },
    ],
    orders: [],
    notes: [],
    tags: ['nuevo', 'vegano'],
    churnRisk: 'low',
    npsScore: 10,
  },
  {
    id: 'c7',
    name: 'Roberto Silva',
    email: 'roberto.silva@empresa.cl',
    phone: '+56 9 2109 8765',
    avatar: 'RS',
    tier: 'Inactivo',
    status: 'inactive',
    loyaltyPoints: 1200,
    totalSpent: 420000,
    totalVisits: 8,
    avgTicket: 52500,
    lastVisit: '2025-04-22',
    firstVisit: '2024-02-18',
    location: 'Maipú, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Pizza Margherita', 'Ceviche Clásico'],
    dietaryTags: [],
    allergies: [],
    visits: [],
    orders: [],
    notes: [
      { id: 'n6', date: '2025-05-01', author: 'Sistema IA', text: 'Sin visitas en 90 días — candidato a campaña de reactivación.' },
    ],
    tags: ['inactivo', 'reactivacion'],
    churnRisk: 'high',
    npsScore: 6,
  },
  {
    id: 'c8',
    name: 'Isabella Morales',
    email: 'isabella.m@gmail.com',
    phone: '+56 9 1098 7654',
    avatar: 'IM',
    tier: 'VIP',
    status: 'active',
    loyaltyPoints: 9800,
    totalSpent: 2100000,
    totalVisits: 35,
    avgTicket: 60000,
    lastVisit: '2025-07-15',
    firstVisit: '2023-11-08',
    birthday: '1988-12-03',
    location: 'Lo Barnechea, Santiago',
    preferredChannel: 'salon',
    favoriteDishes: ['Lomo a la Pimienta', 'Burrata con Tomates', 'Tiramisú Artesanal'],
    dietaryTags: ['sin_lactosa'],
    allergies: ['Lactosa'],
    drinkPreference: 'Espresso doble después del postre',
    seatingPreference: 'Salón privado para reuniones de negocios',
    visits: [
      { id: 'v11', date: '2025-07-15', channel: 'reserva', guests: 8, total: 485000, rating: 5, waiter: 'Carlos M.', table: 'Salón Privado' },
    ],
    orders: [],
    notes: [
      { id: 'n7', date: '2025-07-15', author: 'Carlos M.', text: 'Organiza cenas corporativas mensuales — contactar con 2 semanas de anticipación.' },
    ],
    tags: ['corporativo', 'vip', 'eventos'],
    churnRisk: 'low',
    npsScore: 10,
  },
]

export const CLIENT_AI_INSIGHTS = [
  {
    id: 'ai1',
    type: 'churn',
    title: '3 clientes en riesgo de abandono',
    description: 'Roberto Silva, Patricia Núñez y Jorge Fuentes no visitan hace más de 90 días. Enviar campaña personalizada podría recuperar un 40% de ellos.',
    action: 'Crear campaña reactivación',
    clients: ['c7'],
  },
  {
    id: 'ai2',
    type: 'upsell',
    title: 'Oportunidad: Valentina Cruz',
    description: 'Cliente nueva con NPS 10 y preferencia vegana. Sugerir el nuevo menú plant-based aumentaría su ticket en un 25%.',
    action: 'Enviar invitación menú vegano',
    clients: ['c6'],
  },
  {
    id: 'ai3',
    type: 'birthday',
    title: 'Cumpleaños próximos',
    description: 'Alejandro Vega cumple el 14 de noviembre. Enviar promoción VIP con 20% descuento en cena para pareja.',
    action: 'Programar campaña cumpleaños',
    clients: ['c1'],
  },
]
