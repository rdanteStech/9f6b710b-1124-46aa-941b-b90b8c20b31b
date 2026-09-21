import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  ChefHat,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  Package,
  Truck,
  Users,
  UserCog,
  Receipt,
  Wallet,
  BarChart3,
  Building2,
  Settings,
  Menu as MenuIcon,
  X,
  Bell,
  Search,
} from 'lucide-react';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
};

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'General' },
  { to: '/pos', label: 'Punto de Venta', icon: ShoppingCart, group: 'Operaciones' },
  { to: '/tables', label: 'Mesas', icon: Utensils, group: 'Operaciones' },
  { to: '/kitchen', label: 'Cocina', icon: ChefHat, group: 'Operaciones' },
  { to: '/orders', label: 'Pedidos', icon: ClipboardList, group: 'Operaciones' },
  { to: '/reservations', label: 'Reservas', icon: CalendarCheck, group: 'Operaciones' },
  { to: '/menu', label: 'Menú', icon: BookOpen, group: 'Catálogo' },
  { to: '/inventory', label: 'Inventario', icon: Package, group: 'Catálogo' },
  { to: '/suppliers', label: 'Proveedores', icon: Truck, group: 'Catálogo' },
  { to: '/customers', label: 'Clientes', icon: Users, group: 'Personas' },
  { to: '/staff', label: 'Personal', icon: UserCog, group: 'Personas' },
  { to: '/billing', label: 'Facturación', icon: Receipt, group: 'Finanzas' },
  { to: '/finance', label: 'Finanzas', icon: Wallet, group: 'Finanzas' },
  { to: '/reports', label: 'Reportes', icon: BarChart3, group: 'Finanzas' },
  { to: '/branches', label: 'Sucursales', icon: Building2, group: 'Sistema' },
  { to: '/settings', label: 'Configuración', icon: Settings, group: 'Sistema' },
];

const groupOrder = ['General', 'Operaciones', 'Catálogo', 'Personas', 'Finanzas', 'Sistema'];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentItem = navItems.find((i) => location.pathname.startsWith(i.to));

  return (
    <div className="min-h-dvh bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-dvh w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Savora</div>
              <div className="text-xs text-slate-500">Restaurant OS</div>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groupOrder.map((group) => {
            const items = navItems.filter((i) => i.group === group);
            return (
              <div key={group}>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group}
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2">
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">Carlos Mendoza</div>
              <div className="text-xs text-slate-500 truncate">Gerente General</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center px-4 lg:px-8 gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
              {currentItem?.label || 'Dashboard'}
            </h1>
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos, mesas, clientes..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <button
            className="relative p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
