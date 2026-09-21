import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { NOTIFICATION_HISTORY } from '../data/systemConfig'
import { useAuth } from '../context/AuthContext'
import { MODULES, SIDEBAR_GROUPS } from '../data/modules'
import Logo from './Logo'
import ServeHoursCountdown from './ServeHoursCountdown'
import { DEFAULT_RESTAURANT_CONFIG } from '../data/systemConfig'
import { getRestaurantHoursState } from '../lib/restaurantHours'
import {
  Bell, Search, ChevronDown, LogOut, Settings,
  LayoutDashboard, BookOpen, UtensilsCrossed, LayoutGrid,
  Package, TrendingUp, Users, ClipboardList, BarChart3,
  Brain, Heart, Globe, Smartphone, Calendar, Network,
  Truck, Plug, GraduationCap, ChevronRight, Zap, X, ScanEye, CalendarCheck
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, BookOpen, UtensilsCrossed, LayoutGrid,
  Package, TrendingUp, Users, ClipboardList, BarChart3,
  Brain, Heart, Globe, Smartphone, Calendar, Network,
  Truck, Plug, GraduationCap, ScanEye, CalendarCheck,
}

const PRIORITY_TYPE: Record<string, string> = {
  critical: 'urgent',
  high: 'info',
  medium: 'info',
  low: 'success',
}

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

  const isSettings = location.pathname === '/settings'
  const [isOpen, setIsOpen] = useState(() =>
    getRestaurantHoursState(
      DEFAULT_RESTAURANT_CONFIG.openingTime,
      DEFAULT_RESTAURANT_CONFIG.closingTime,
    ).isOpen,
  )

  useEffect(() => {
    const tick = () => {
      setIsOpen(
        getRestaurantHoursState(
          DEFAULT_RESTAURANT_CONFIG.openingTime,
          DEFAULT_RESTAURANT_CONFIG.closingTime,
        ).isOpen,
      )
    }
    tick()
    const interval = window.setInterval(tick, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const currentModule = isSettings
    ? { name: 'Configuración del sistema', description: 'Parámetros globales y por local' }
    : MODULES.find(m => location.pathname === m.path)

  const unreadNotifications = NOTIFICATION_HISTORY.filter(n => !n.read)

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
        style={{ background: '#0A0F1A', borderRight: '1px solid #152035' }}>

        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b" style={{ borderColor: '#152035' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center flex-1 min-w-0 cursor-pointer"
            aria-label="Gastro360 — Ir al dashboard">
            <Logo size={sidebarCollapsed ? 'xs' : 'sm'} />
          </button>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="text-gastro-muted hover:text-gastro-text transition-colors flex-shrink-0 ml-1 w-11 h-11 flex items-center justify-center cursor-pointer">
            <ChevronRight size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Restaurant info */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b" style={{ borderColor: '#152035' }}>
            <div className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)' }}>
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
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2540', color: '#E8F0FF' }}
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
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A5A7A' }}>
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map(id => {
                  const mod = getModuleById(id)
                  if (!mod) return null
                  const Icon = ICON_MAP[mod.icon] || LayoutDashboard
                  const isActive = location.pathname === mod.path || location.pathname.startsWith(`${mod.path}/`)
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
                              style={{ background: 'rgba(37,99,235,0.2)', color: '#2563EB', fontSize: '9px' }}>
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

          {/* Sistema */}
          <div>
            {!sidebarCollapsed && (
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A5A7A' }}>
                  Sistema
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              <button
                onClick={() => navigate('/settings')}
                title={sidebarCollapsed ? 'Configuración' : undefined}
                className={`sidebar-item w-full ${isSettings ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
                <Settings size={16} style={{ color: isSettings ? '#2563EB' : undefined, flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">Configuración</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={{ background: 'rgba(37,99,235,0.2)', color: '#2563EB', fontSize: '9px' }}>
                      SYS
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Plan badge */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 border-t" style={{ borderColor: '#152035' }}>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-primary-400" />
                <span className="text-xs font-bold text-primary-400 uppercase">Plan Pro</span>
              </div>
              <div className="text-xs text-gastro-subtle">3 locales · 20 usuarios</div>
            </div>
          </div>
        )}

        {/* User */}
        <div className="px-2 py-2 border-t" style={{ borderColor: '#152035' }}>
          <div className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
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
            <div className="mt-1 rounded-xl overflow-hidden" style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
              <button onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-colors">
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
        <header className="h-14 flex items-center justify-between gap-4 px-4 sm:px-6 flex-shrink-0 overflow-visible"
          style={{ background: '#0A0F1A', borderBottom: '1px solid #152035' }}>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-gastro-text truncate">
              {currentModule?.name || 'Dashboard'}
            </h1>
            <p className="text-xs text-gastro-subtle truncate hidden sm:block">
              {currentModule?.description || 'Vista ejecutiva en tiempo real'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 overflow-visible">
            {/* Horario: cuenta regresiva + estado en vivo */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <ServeHoursCountdown
                compact
                openingTime={DEFAULT_RESTAURANT_CONFIG.openingTime}
                closingTime={DEFAULT_RESTAURANT_CONFIG.closingTime}
              />

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0 whitespace-nowrap"
                style={
                  isOpen
                    ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-gastro-muted'}`}
                />
                <span className={`text-xs font-semibold ${isOpen ? 'text-success' : 'text-gastro-subtle'}`}>
                  {isOpen ? 'En vivo' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ border: '1px solid #1A2540' }}>
                <Bell size={16} className="text-gastro-subtle" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50 animate-slide-down"
                  style={{ background: '#0F1628', border: '1px solid #1A2540', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1A2540' }}>
                    <span className="text-sm font-bold text-gastro-text">Notificaciones</span>
                    {unreadNotifications.length > 0 && (
                      <span className="badge badge-error text-xs">{unreadNotifications.length} nuevas</span>
                    )}
                  </div>
                  <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: '#1A2540' }}>
                    {NOTIFICATION_HISTORY.slice(0, 6).map(n => {
                      const type = PRIORITY_TYPE[n.priority] || 'info'
                      return (
                        <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${type === 'urgent' ? 'bg-error' : type === 'success' ? 'bg-success' : 'bg-primary-400'}`}
                              style={{ opacity: n.read ? 0.4 : 1 }} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-relaxed ${n.read ? 'text-gastro-subtle' : 'text-gastro-text font-medium'}`}>{n.text}</p>
                              <p className="text-xs text-gastro-subtle mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t" style={{ borderColor: '#1A2540' }}>
                    <Link to="/settings?section=notifications" onClick={() => setShowNotifications(false)}
                      className="block text-center text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                      Ver centro de notificaciones
                    </Link>
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
