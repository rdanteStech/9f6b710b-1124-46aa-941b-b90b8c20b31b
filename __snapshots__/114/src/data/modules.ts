import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Package,
  ChefHat,
  Receipt,
  BarChart3,
  Settings,
  Calendar,
  Truck,
  DollarSign,
  ClipboardList,
  Store,
  UserCog,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export type ModuleCategory = 'operations' | 'sales' | 'inventory' | 'people' | 'analytics' | 'admin';

export interface AppModule {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  category: ModuleCategory;
  color: string;
  enabled: boolean;
  order: number;
}

export const MODULES: AppModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Vista general de operaciones y KPIs en tiempo real',
    path: '/dashboard',
    icon: LayoutDashboard,
    category: 'analytics',
    color: '#6366f1',
    enabled: true,
    order: 1,
  },
  {
    id: 'pos',
    name: 'Punto de Venta',
    description: 'Toma de pedidos y facturación rápida',
    path: '/pos',
    icon: ShoppingCart,
    category: 'sales',
    color: '#f59e0b',
    enabled: true,
    order: 2,
  },
  {
    id: 'tables',
    name: 'Mesas',
    description: 'Mapa de mesas y gestión de ocupación',
    path: '/tables',
    icon: UtensilsCrossed,
    category: 'operations',
    color: '#10b981',
    enabled: true,
    order: 3,
  },
  {
    id: 'kitchen',
    name: 'Cocina (KDS)',
    description: 'Pantalla de órdenes para cocina',
    path: '/kitchen',
    icon: ChefHat,
    category: 'operations',
    color: '#ef4444',
    enabled: true,
    order: 4,
  },
  {
    id: 'orders',
    name: 'Pedidos',
    description: 'Historial y seguimiento de pedidos',
    path: '/orders',
    icon: ClipboardList,
    category: 'operations',
    color: '#8b5cf6',
    enabled: true,
    order: 5,
  },
  {
    id: 'reservations',
    name: 'Reservas',
    description: 'Agenda de reservas y clientes',
    path: '/reservations',
    icon: Calendar,
    category: 'operations',
    color: '#06b6d4',
    enabled: true,
    order: 6,
  },
  {
    id: 'menu',
    name: 'Menú',
    description: 'Gestión de carta, categorías y precios',
    path: '/menu',
    icon: FileText,
    category: 'sales',
    color: '#f97316',
    enabled: true,
    order: 7,
  },
  {
    id: 'inventory',
    name: 'Inventario',
    description: 'Stock, mermas y control de insumos',
    path: '/inventory',
    icon: Package,
    category: 'inventory',
    color: '#0ea5e9',
    enabled: true,
    order: 8,
  },
  {
    id: 'suppliers',
    name: 'Proveedores',
    description: 'Gestión de proveedores y órdenes de compra',
    path: '/suppliers',
    icon: Truck,
    category: 'inventory',
    color: '#14b8a6',
    enabled: true,
    order: 9,
  },
  {
    id: 'customers',
    name: 'Clientes',
    description: 'Base de clientes y programa de fidelización',
    path: '/customers',
    icon: Users,
    category: 'people',
    color: '#ec4899',
    enabled: true,
    order: 10,
  },
  {
    id: 'staff',
    name: 'Personal',
    description: 'Empleados, turnos y roles',
    path: '/staff',
    icon: UserCog,
    category: 'people',
    color: '#a855f7',
    enabled: true,
    order: 11,
  },
  {
    id: 'billing',
    name: 'Facturación',
    description: 'Boletas, facturas y documentos tributarios',
    path: '/billing',
    icon: Receipt,
    category: 'sales',
    color: '#eab308',
    enabled: true,
    order: 12,
  },
  {
    id: 'finance',
    name: 'Finanzas',
    description: 'Ingresos, egresos y flujo de caja',
    path: '/finance',
    icon: DollarSign,
    category: 'analytics',
    color: '#22c55e',
    enabled: true,
    order: 13,
  },
  {
    id: 'reports',
    name: 'Reportes',
    description: 'Analítica y reportes de gestión',
    path: '/reports',
    icon: BarChart3,
    category: 'analytics',
    color: '#3b82f6',
    enabled: true,
    order: 14,
  },
  {
    id: 'branches',
    name: 'Sucursales',
    description: 'Gestión multi-sucursal',
    path: '/branches',
    icon: Store,
    category: 'admin',
    color: '#64748b',
    enabled: true,
    order: 15,
  },
  {
    id: 'settings',
    name: 'Configuración',
    description: 'Ajustes generales del sistema',
    path: '/settings',
    icon: Settings,
    category: 'admin',
    color: '#475569',
    enabled: true,
    order: 16,
  },
];

export const MODULE_CATEGORIES: Record<ModuleCategory, { label: string; color: string }> = {
  operations: { label: 'Operaciones', color: '#10b981' },
  sales: { label: 'Ventas', color: '#f59e0b' },
  inventory: { label: 'Inventario', color: '#0ea5e9' },
  people: { label: 'Personas', color: '#ec4899' },
  analytics: { label: 'Analítica', color: '#6366f1' },
  admin: { label: 'Administración', color: '#64748b' },
};

export const getModuleById = (id: string): AppModule | undefined =>
  MODULES.find((m) => m.id === id);

export const getModulesByCategory = (category: ModuleCategory): AppModule[] =>
  MODULES.filter((m) => m.category === category).sort((a, b) => a.order - b.order);

export const getEnabledModules = (): AppModule[] =>
  MODULES.filter((m) => m.enabled).sort((a, b) => a.order - b.order);

// ============================================================
// Sidebar navigation groups
// ============================================================
export interface SidebarGroup {
  id: ModuleCategory;
  label: string;
  color: string;
  modules: AppModule[];
}

export const SIDEBAR_GROUP_ORDER: ModuleCategory[] = [
  'analytics',
  'sales',
  'operations',
  'inventory',
  'people',
  'admin',
];

export const SIDEBAR_GROUPS: SidebarGroup[] = SIDEBAR_GROUP_ORDER.map((cat) => ({
  id: cat,
  label: MODULE_CATEGORIES[cat].label,
  color: MODULE_CATEGORIES[cat].color,
  modules: getModulesByCategory(cat),
})).filter((g) => g.modules.length > 0);

// Alias export for compatibility with imports using lowercase `modules`
export const modules = MODULES;

export default MODULES;
