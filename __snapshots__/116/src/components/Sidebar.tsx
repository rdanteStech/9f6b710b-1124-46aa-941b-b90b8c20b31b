import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  ChefHat,
  ClipboardList,
  Calendar,
  BookOpen,
  Package,
  Truck,
  Users,
  UserCog,
  Wallet,
  BarChart3,
  Building2,
  FileText,
  Settings,
  X,
} from 'lucide-react';

const navItems = [
  { section: 'Principal', items: [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  ]},
  { section: 'Operaciones', items: [
    { to: '/app/tables', icon: UtensilsCrossed, label: 'Mesas' },
    { to: '/app/kitchen', icon: ChefHat, label: 'Cocina' },
    { to: '/app/orders', icon: ClipboardList, label: 'Pedidos' },
    { to: '/app/reservations', icon: Calendar, label: 'Reservas' },
  ]},
  { section: 'Catálogo', items: [
    { to: '/app/menu', icon: BookOpen, label: 'Menú' },
    { to: '/app/inventory', icon: Package, label: 'Inventario' },
    { to: '/app/suppliers', icon: Truck, label: 'Proveedores' },
  ]},
  { section: 'Personas', items: [
    { to: '/app/customers', icon: Users, label: 'Clientes' },
    { to: '/app/staff', icon: UserCog, label: 'Personal' },
  ]},
  { section: 'Administración', items: [
    { to: '/app/finance', icon: Wallet, label: 'Finanzas' },
    { to: '/app/billing', icon: FileText, label: 'Facturación' },
    { to: '/app/reports', icon: BarChart3, label: 'Reportes' },
    { to: '/app/branches', icon: Building2, label: 'Sucursales' },
    { to: '/app/settings', icon: Settings, label: 'Configuración' },
  ]},
];

type Props = { open: boolean; onClose: () => void };

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <button
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden cursor-pointer"
          aria-label="Cerrar menú"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-dvh w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Savora</div>
              <div className="text-[10px] text-slate-500 leading-tight">Restaurant OS</div>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.section}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              CG
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">Carlos García</div>
              <div className="text-xs text-slate-500 truncate">Gerente General</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
