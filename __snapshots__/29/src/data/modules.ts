export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'core' | 'operations' | 'intelligence' | 'growth' | 'network';
  path: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
}

export const MODULES: Module[] = [
  // Core
  { id: 'dashboard', name: 'Dashboard', description: 'Vista ejecutiva en tiempo real', icon: 'LayoutDashboard', color: '#9E7FFF', category: 'core', path: '/dashboard' },
  { id: 'menu', name: 'GastroMenu', description: 'Carta maestra omnicanal', icon: 'BookOpen', color: '#9E7FFF', category: 'core', path: '/menu' },
  { id: 'serve', name: 'GastroServe', description: 'Pedidos, mesas y KDS', icon: 'UtensilsCrossed', color: '#38bdf8', category: 'core', path: '/serve' },
  { id: 'order', name: 'GastroOrder', description: 'Pedidos QR por mesa', icon: 'QrCode', color: '#10b981', category: 'core', path: '/order', isNew: true },
  { id: 'layout', name: 'GastroLayout', description: 'Diseño de espacios drag & drop', icon: 'LayoutGrid', color: '#38bdf8', category: 'core', path: '/layout' },
  // Operations
  { id: 'stock', name: 'GastroStock', description: 'Inventario, recetas y compras', icon: 'Package', color: '#f59e0b', category: 'operations', path: '/stock' },
  { id: 'finance', name: 'GastroFinance', description: 'Caja, cierres y márgenes', icon: 'TrendingUp', color: '#10b981', category: 'operations', path: '/finance' },
  { id: 'talent', name: 'GastroTalent', description: 'Turnos, RRHH y contratación', icon: 'Users', color: '#f472b6', category: 'operations', path: '/talent' },
  { id: 'ops', name: 'GastroOps', description: 'Operaciones y checklists', icon: 'ClipboardList', color: '#f59e0b', category: 'operations', path: '/ops' },
  // Intelligence
  { id: 'insight', name: 'GastroInsight', description: 'Analítica avanzada e IA', icon: 'BarChart3', color: '#9E7FFF', category: 'intelligence', path: '/insight', badge: 'AI' },
  { id: 'predict', name: 'GastroPredict', description: 'Predicción de demanda y stock', icon: 'Brain', color: '#38bdf8', category: 'intelligence', path: '/predict', badge: 'AI', isNew: true },
  { id: 'eye', name: 'GastroEye', description: 'Visión IA y alertas en tiempo real', icon: 'ScanEye', color: '#f472b6', category: 'intelligence', path: '/eye', badge: 'AI', isNew: true },
  // Growth
  { id: 'loyalty', name: 'GastroLoyalty', description: 'Fidelización y CRM', icon: 'Heart', color: '#f472b6', category: 'growth', path: '/loyalty' },
  { id: 'web', name: 'GastroWeb', description: 'Sitio web propio del restaurante', icon: 'Globe', color: '#38bdf8', category: 'growth', path: '/web' },
  { id: 'go', name: 'GastroGo', description: 'App cliente y delivery propio', icon: 'Smartphone', color: '#9E7FFF', category: 'growth', path: '/go' },
  { id: 'events', name: 'GastroEvents', description: 'Eventos, catering y reservas', icon: 'Calendar', color: '#f59e0b', category: 'growth', path: '/events' },
  // Network
  { id: 'network', name: 'GastroNetwork', description: 'Red profesional gastronómica', icon: 'Network', color: '#f472b6', category: 'network', path: '/network', isNew: true },
  { id: 'supply', name: 'GastroSupply', description: 'Proveedores y marketplace', icon: 'Truck', color: '#10b981', category: 'network', path: '/supply' },
  { id: 'connect', name: 'GastroConnect', description: 'Integraciones y APIs', icon: 'Plug', color: '#8888aa', category: 'network', path: '/connect' },
  { id: 'academy', name: 'GastroAcademy', description: 'Formación y certificaciones', icon: 'GraduationCap', color: '#f59e0b', category: 'network', path: '/academy' },
];

export const SIDEBAR_GROUPS = [
  {
    label: 'Principal',
    items: ['dashboard', 'menu', 'serve', 'order', 'layout'],
  },
  {
    label: 'Operaciones',
    items: ['stock', 'finance', 'talent', 'ops'],
  },
  {
    label: 'Inteligencia',
    items: ['insight', 'predict', 'eye'],
  },
  {
    label: 'Crecimiento',
    items: ['loyalty', 'web', 'go', 'events'],
  },
  {
    label: 'Red & Ecosistema',
    items: ['network', 'supply', 'connect', 'academy'],
  },
];
