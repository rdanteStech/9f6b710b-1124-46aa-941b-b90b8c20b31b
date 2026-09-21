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
  { id: 'dashboard', name: 'Dashboard', description: 'Vista ejecutiva en tiempo real', icon: 'LayoutDashboard', color: '#0066FF', category: 'core', path: '/dashboard' },
  { id: 'menu', name: 'GastroMenu', description: 'Carta maestra omnicanal', icon: 'BookOpen', color: '#0066FF', category: 'core', path: '/menu' },
  { id: 'serve', name: 'GastroServe', description: 'Pedidos, mesas y KDS', icon: 'UtensilsCrossed', color: '#3399FF', category: 'core', path: '/serve' },
  { id: 'layout', name: 'GastroLayout', description: 'Diseño de espacios drag & drop', icon: 'LayoutGrid', color: '#3399FF', category: 'core', path: '/layout' },
  // Operations
  { id: 'stock', name: 'GastroStock', description: 'Inventario, recetas y compras', icon: 'Package', color: '#f59e0b', category: 'operations', path: '/stock' },
  { id: 'finance', name: 'GastroFinance', description: 'Caja, cierres y márgenes', icon: 'TrendingUp', color: '#10b981', category: 'operations', path: '/finance' },
  { id: 'talent', name: 'GastroTalent', description: 'Turnos, RRHH y contratación', icon: 'Users', color: '#00B4FF', category: 'operations', path: '/talent' },
  { id: 'ops', name: 'GastroOps', description: 'Operaciones y checklists', icon: 'ClipboardList', color: '#f59e0b', category: 'operations', path: '/ops' },
  // Intelligence
  { id: 'insight', name: 'GastroInsight', description: 'Analítica avanzada e IA', icon: 'BarChart3', color: '#0066FF', category: 'intelligence', path: '/insight', badge: 'AI' },
  { id: 'predict', name: 'GastroPredict', description: 'Predicción de demanda y stock', icon: 'Brain', color: '#3399FF', category: 'intelligence', path: '/predict', badge: 'AI', isNew: true },
  // Growth
  { id: 'loyalty', name: 'GastroLoyalty', description: 'Fidelización y CRM', icon: 'Heart', color: '#00B4FF', category: 'growth', path: '/loyalty' },
  { id: 'web', name: 'GastroWeb', description: 'Sitio web propio del restaurante', icon: 'Globe', color: '#3399FF', category: 'growth', path: '/web' },
  { id: 'go', name: 'GastroGo', description: 'App cliente y delivery propio', icon: 'Smartphone', color: '#0066FF', category: 'growth', path: '/go' },
  { id: 'events', name: 'GastroEvents', description: 'Eventos, catering y reservas', icon: 'Calendar', color: '#f59e0b', category: 'growth', path: '/events' },
  // Network
  { id: 'network', name: 'GastroNetwork', description: 'Red profesional gastronómica', icon: 'Network', color: '#00B4FF', category: 'network', path: '/network', isNew: true },
  { id: 'supply', name: 'GastroSupply', description: 'Proveedores y marketplace', icon: 'Truck', color: '#10b981', category: 'network', path: '/supply' },
  { id: 'connect', name: 'GastroConnect', description: 'Integraciones y APIs', icon: 'Plug', color: '#8899BB', category: 'network', path: '/connect' },
  { id: 'academy', name: 'GastroAcademy', description: 'Formación y certificaciones', icon: 'GraduationCap', color: '#f59e0b', category: 'network', path: '/academy' },
];

export const SIDEBAR_GROUPS = [
  {
    label: 'Principal',
    items: ['dashboard', 'menu', 'serve', 'layout'],
  },
  {
    label: 'Operaciones',
    items: ['stock', 'finance', 'talent', 'ops'],
  },
  {
    label: 'Inteligencia',
    items: ['insight', 'predict'],
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
