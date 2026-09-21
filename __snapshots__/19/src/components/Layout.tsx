import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MODULES, SIDEBAR_GROUPS } from '../data/modules'
import {
  ChefHat, Bell, Search, ChevronDown, LogOut, Settings,
  LayoutDashboard, BookOpen, UtensilsCrossed, LayoutGrid,
  Package, TrendingUp, Users, ClipboardList, BarChart3,
  Brain, Heart, Globe, Smartphone, Calendar, Network,
  Truck, Plug, GraduationCap, ChevronRight, Zap, X, QrCode
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, BookOpen, UtensilsCrossed, LayoutGrid,
  Package, TrendingUp, Users, ClipboardList, BarChart3,
  Brain, Heart, Globe, Smartphone, Calendar, Network,
  Truck, Plug, GraduationCap, QrCode,
}

const NOTIFICATIONS = [
  { id: 1, type: 'urgent', text: 'Stock crítico: Harina 000 (3.2 kg restantes)', time: '2 min' },
  { id: 2, type: 'info', text: 'Mesa 7 lista para servir — Pedido #4822', time: '5 min' },
  { id: 3, type: 'success', text: 'Cierre de caja completado: $847.650', time: '1 h' },
  { id: 4, type: 'info', text: 'Nueva reserva: García — 20:30 (Mesa 4)', time: '2 h' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const currentModule = MODULES.find(m => location.pathname === `/${m.id}`)

  const getModuleById = (id: string) => MODULES.find(m => m.id === id)

  const filteredGroups = SIDEBAR_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(id => {
      const mod = getModuleById(id)
      return !searchQuery || mod?.name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  })).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-gastro-bg flex">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
        style={{ background: '#0d0d18', borderRight: '1px solid #1e1e2e' }}>

        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b" style={{ borderColor: '#1e1e2e' }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)' }}>
              <ChefHat size={16} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm truncate">
                <span className="gradient-text-primary">Gastro</span>
                <span className="text-gastro-text">360</span>
              </span>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gastro-muted hover:text-gastro-text transition-colors flex-shrink-0 ml-1">
            <ChevronRight size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Restaurant info */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b" style={{ borderColor: '#1e1e2e' }}>
            <div className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f472b6, #9E7FFF)' }}>
                {user?.restaurant.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gastro-text truncate">{user?.restaurant.name}</div>
                <div className="text-xs text-gastro-subtle truncate">{user?.restaurant.type}</div>
              </div>
              <ChevronDown size={12} className="text-gastro-muted flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar módulo..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#e8e8f0' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gastro-muted">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {filteredGroups.map(group => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4a6a' }}>
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map(id => {
                  const mod = getModuleById(id)
                  if (!mod) return null
                  const Icon = ICON_MAP[mod.icon] || LayoutDashboard
                  const isActive = location.pathname === `/${mod.id}` || (mod.id === 'dashboard' && location.pathname === '/dashboard')
                  return (
                    <button
                      key={id}
                      onClick={() => navigate(mod.path)}
                      title={sidebarCollapsed ? mod.name : undefined}
                      className={`sidebar-item w-full ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
                      <Icon size={16} style={{ color: isActive ? mod.color : undefined, flexShrink: 0 }} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{mod.name}</span>
                          {mod.badge && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                              style={{ background: 'rgba(158,127,255,0.2)', color: '#9E7FFF', fontSize: '9px' }}>
                              {mod.badge}
                            </span>
                          )}
                          {mod.isNew && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                              style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '9px' }}>
                              NEW
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Plan badge */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 border-t" style={{ borderColor: '#1e1e2e' }}>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(158,127,255,0.08)', border: '1px solid rgba(158,127,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-primary-400" />
                <span className="text-xs font-bold text-primary-400 uppercase">Plan Pro</span>
              </div>
              <div className="text-xs text-gastro-subtle">3 locales · 20 usuarios</div>
            </div>
          </div>
        )}

        {/* User */}
        <div className="px-2 py-2 border-t" style={{ borderColor: '#1e1e2e' }}>
          <div className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)' }}>
              {user?.avatar}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gastro-text truncate">{user?.name}</div>
                <div className="text-xs text-gastro-subtle truncate">{user?.role}</div>
              </div>
            )}
          </div>
          {showUserMenu && !sidebarCollapsed && (
            <div className="mt-1 rounded-xl overflow-hidden" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-colors">
                <Settings size={13} /> Configuración
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors">
                <LogOut size={13} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: '#0d0d18', borderBottom: '1px solid #1e1e2e' }}>
          <div>
            <h1 className="text-sm font-bold text-gastro-text">
              {currentModule?.name || 'Dashboard'}
            </h1>
            <p className="text-xs text-gastro-subtle">{currentModule?.description || 'Vista ejecutiva en tiempo real'}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-success">En vivo</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ border: '1px solid #2a2a3d' }}>
                <Bell size={16} className="text-gastro-subtle" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50 animate-slide-down"
                  style={{ background: '#1a1a26', border: '1px solid #2a2a3d', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#2a2a3d' }}>
                    <span className="text-sm font-bold text-gastro-text">Notificaciones</span>
                    <span className="badge badge-error text-xs">4 nuevas</span>
                  </div>
                  <div className="divide-y" style={{ borderColor: '#2a2a3d' }}>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'urgent' ? 'bg-error' : n.type === 'success' ? 'bg-success' : 'bg-primary-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gastro-text leading-relaxed">{n.text}</p>
                            <p className="text-xs text-gastro-subtle mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
