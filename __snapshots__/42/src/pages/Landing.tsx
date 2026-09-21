import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import {
  Zap, Globe, BarChart3, Users, Package, TrendingUp,
  Heart, Brain, Smartphone, ArrowRight, Check, Star, Play,
  UtensilsCrossed, BookOpen, LayoutGrid, Network, Truck,
  Shield, Clock, Layers, ChevronDown, Menu, X, Sparkles,
  Building2, Coffee, ShoppingBag, Bike
} from 'lucide-react'

const NAV_LINKS = ['Plataforma', 'Módulos', 'Precios', 'Casos de uso', 'Blog']

const FEATURES = [
  { icon: BookOpen, title: 'Carta Omnicanal', desc: 'Una sola fuente de verdad para todos tus canales de venta', color: '#2563EB' },
  { icon: UtensilsCrossed, title: 'GastroServe', desc: 'Pedidos, mesas, KDS y pagos integrados en tiempo real', color: '#3B82F6' },
  { icon: Brain, title: 'IA Integrada', desc: 'Predicción de demanda, optimización de menú y alertas inteligentes', color: '#60A5FA' },
  { icon: BarChart3, title: 'Analítica Avanzada', desc: 'Dashboards ejecutivos con KPIs en tiempo real y proyecciones', color: '#10b981' },
  { icon: Package, title: 'GastroStock', desc: 'Inventario, recetas, mermas y órdenes de compra automatizadas', color: '#f59e0b' },
  { icon: Users, title: 'GastroTalent', desc: 'Gestión de turnos, RRHH y red profesional gastronómica', color: '#60A5FA' },
  { icon: Globe, title: 'GastroWeb', desc: 'Sitio web propio con pedidos online y delivery integrado', color: '#3B82F6' },
  { icon: Heart, title: 'GastroLoyalty', desc: 'Programa de fidelización, CRM y marketing automatizado', color: '#2563EB' },
]

const MODULES_SHOWCASE = [
  { id: 'serve', name: 'GastroServe', icon: UtensilsCrossed, color: '#3B82F6', desc: 'Pedidos & Mesas' },
  { id: 'menu', name: 'GastroMenu', icon: BookOpen, color: '#2563EB', desc: 'Carta Omnicanal' },
  { id: 'stock', name: 'GastroStock', icon: Package, color: '#f59e0b', desc: 'Inventario' },
  { id: 'finance', name: 'GastroFinance', icon: TrendingUp, color: '#10b981', desc: 'Finanzas' },
  { id: 'talent', name: 'GastroTalent', icon: Users, color: '#60A5FA', desc: 'Talento' },
  { id: 'insight', name: 'GastroInsight', icon: BarChart3, color: '#2563EB', desc: 'Analítica IA' },
  { id: 'loyalty', name: 'GastroLoyalty', icon: Heart, color: '#60A5FA', desc: 'Fidelización' },
  { id: 'web', name: 'GastroWeb', icon: Globe, color: '#3B82F6', desc: 'Web Propia' },
  { id: 'network', name: 'GastroNetwork', icon: Network, color: '#60A5FA', desc: 'Red Pro' },
  { id: 'supply', name: 'GastroSupply', icon: Truck, color: '#10b981', desc: 'Proveedores' },
  { id: 'go', name: 'GastroGo', icon: Smartphone, color: '#2563EB', desc: 'App Cliente' },
  { id: 'predict', name: 'GastroPredict', icon: Brain, color: '#3B82F6', desc: 'Predicción IA' },
]

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    desc: 'Para restaurantes que empiezan',
    color: '#8899BB',
    features: ['Hasta 1 local', 'GastroMenu básico', 'GastroServe (50 mesas)', 'GastroStock básico', 'Soporte por email', '5 usuarios'],
    cta: 'Empezar gratis',
  },
  {
    name: 'Pro',
    price: 149,
    desc: 'Para restaurantes en crecimiento',
    color: '#2563EB',
    popular: true,
    features: ['Hasta 3 locales', 'Todos los módulos core', 'GastroInsight + IA básica', 'GastroLoyalty', 'GastroWeb incluido', 'Integraciones delivery', '20 usuarios', 'Soporte prioritario'],
    cta: 'Comenzar prueba',
  },
  {
    name: 'Enterprise',
    price: 399,
    desc: 'Para cadenas y grupos gastronómicos',
    color: '#3B82F6',
    features: ['Locales ilimitados', 'Todos los módulos', 'GastroBrain IA completa', 'GastroNetwork acceso total', 'API personalizada', 'Hardware integrado', 'Usuarios ilimitados', 'SLA 99.9% + soporte 24/7'],
    cta: 'Hablar con ventas',
  },
]

const TESTIMONIALS = [
  {
    name: 'Valentina Ríos',
    role: 'Directora de Operaciones',
    company: 'Grupo Gastronómico Ríos (12 locales)',
    avatar: 'VR',
    text: 'Gastro360 transformó completamente nuestra operación. Pasamos de manejar 12 locales con 6 sistemas distintos a tener todo centralizado. El ROI fue visible en el primer mes.',
    rating: 5,
  },
  {
    name: 'Marcos Delgado',
    role: 'Chef & Propietario',
    company: 'Bistró Delgado',
    avatar: 'MD',
    text: 'La carta omnicanal es un game changer. Antes perdía horas actualizando precios en cada plataforma. Ahora cambio todo desde un lugar y se sincroniza solo.',
    rating: 5,
  },
  {
    name: 'Carolina Fuentes',
    role: 'Gerente General',
    company: 'Dark Kitchen Fuentes',
    avatar: 'CF',
    text: 'GastroPredict nos ayudó a reducir el desperdicio de alimentos en un 31%. La IA predice la demanda con una precisión increíble. Imprescindible para cualquier dark kitchen.',
    rating: 5,
  },
]

const STATS = [
  { value: '4.200+', label: 'Restaurantes activos' },
  { value: '98.7%', label: 'Uptime garantizado' },
  { value: '31%', label: 'Reducción de costos promedio' },
  { value: '2.4x', label: 'ROI promedio primer año' },
]

const BUSINESS_TYPES = [
  { icon: UtensilsCrossed, label: 'Restaurantes' },
  { icon: Coffee, label: 'Cafeterías' },
  { icon: Building2, label: 'Hoteles A&B' },
  { icon: ShoppingBag, label: 'Dark Kitchens' },
  { icon: Bike, label: 'Food Trucks' },
  { icon: Layers, label: 'Cadenas' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule(prev => (prev + 1) % MODULES_SHOWCASE.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gastro-bg text-gastro-text overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-10 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-gastro-border' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer"
            aria-label="Gastro360 — Inicio">
            <Logo size="md" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm text-gastro-subtle hover:text-gastro-text transition-colors duration-200">
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="btn-secondary text-sm px-4 py-2">
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/login')}
              className="btn-primary text-sm px-4 py-2">
              Prueba gratis <ArrowRight size={14} />
            </button>
          </div>

          <button className="md:hidden text-gastro-subtle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-gastro-border px-6 py-4 space-y-3 animate-slide-down">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="block text-sm text-gastro-subtle hover:text-gastro-text py-1">
                {link}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <button onClick={() => navigate('/login')} className="btn-secondary text-sm justify-center">Iniciar sesión</button>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm justify-center">Prueba gratis</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <Sparkles size={14} className="text-primary-400" />
            <span className="text-xs font-semibold text-primary-400">El sistema operativo de la gastronomía moderna</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-up">
            <span className="text-gastro-text">Todo tu restaurante.</span>
            <br />
            <span className="gradient-text">Un solo ecosistema.</span>
          </h1>

          <p className="text-lg md:text-xl text-gastro-subtle max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
            Gastro360 centraliza operaciones, ventas, inventario, finanzas, talento, fidelización e inteligencia artificial en una plataforma modular diseñada para restaurantes, cadenas, dark kitchens y más.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animate-delay-300">
            <button onClick={() => navigate('/login')}
              className="btn-primary text-base px-8 py-4 animate-pulse-glow">
              Comenzar gratis — 14 días <ArrowRight size={18} />
            </button>
            <button className="btn-secondary text-base px-8 py-4 gap-3">
              <Play size={16} className="text-primary-400" />
              Ver demo en vivo
            </button>
          </div>

          {/* Business types */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-up animate-delay-400">
            {BUSINESS_TYPES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gastro-subtle"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon size={13} />
                {label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-up animate-delay-500">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black gradient-text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-gastro-subtle">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <ChevronDown size={20} className="text-gastro-muted" />
        </div>
      </section>

      {/* Modules orbit */}
      <section id="plataforma" className="landing-section relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4">Plataforma modular</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gastro-text">12+ módulos.</span>
              <br />
              <span className="gradient-text">Un ecosistema completo.</span>
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Empieza con lo esencial y activa nuevos módulos a medida que creces. Sin migraciones, sin fricciones.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MODULES_SHOWCASE.map((mod, i) => {
              const Icon = mod.icon
              const isActive = i === activeModule
              return (
                <div key={mod.id}
                  className={`card-gastro cursor-pointer transition-all duration-500 ${isActive ? 'scale-105' : ''}`}
                  style={isActive ? { borderColor: mod.color, boxShadow: `0 0 30px ${mod.color}20` } : {}}
                  onMouseEnter={() => setActiveModule(i)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${mod.color}18` }}>
                    <Icon size={20} style={{ color: mod.color }} />
                  </div>
                  <div className="font-bold text-sm text-gastro-text">{mod.name}</div>
                  <div className="text-xs text-gastro-subtle mt-0.5">{mod.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features deep dive */}
      <section id="módulos" className="landing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4">Funcionalidades clave</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gastro-text">
              Diseñado para la operación real
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Cada módulo fue construido con lógica de negocio profunda, pensando en los desafíos reales de la industria gastronómica.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div key={i} className="card-gastro group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${feat.color}15` }}>
                    <Icon size={22} style={{ color: feat.color }} />
                  </div>
                  <h3 className="font-bold text-gastro-text mb-2">{feat.title}</h3>
                  <p className="text-sm text-gastro-subtle leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Omnichannel highlight */}
      <section className="landing-section">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="badge badge-primary mb-4">Carta Maestra Omnicanal</div>
                <h2 className="text-3xl md:text-4xl font-black text-gastro-text mb-4">
                  Una sola fuente de verdad para todos tus canales
                </h2>
                <p className="text-gastro-subtle mb-6 leading-relaxed">
                  Gestiona productos, precios, disponibilidad y modificadores desde un único lugar. Los cambios se propagan instantáneamente a todos los canales: salón, QR, web, app, delivery propio y plataformas externas.
                </p>
                <div className="space-y-3">
                  {['Precios diferenciados por canal', 'Disponibilidad en tiempo real', 'Horarios específicos por producto', 'Exclusivos por canal o zona', 'Sincronización con Uber Eats, Rappi y PedidosYa'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.2)' }}>
                        <Check size={11} className="text-success" />
                      </div>
                      <span className="text-sm text-gastro-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { channel: 'Salón & QR', icon: UtensilsCrossed, status: 'Activo', color: '#2563EB', items: '84 productos' },
                  { channel: 'Web Propia', icon: Globe, status: 'Activo', color: '#3B82F6', items: '76 productos' },
                  { channel: 'Uber Eats', icon: Bike, status: 'Activo', color: '#10b981', items: '62 productos' },
                  { channel: 'Rappi', icon: Smartphone, status: 'Activo', color: '#f59e0b', items: '58 productos' },
                  { channel: 'Take Away', icon: ShoppingBag, status: 'Activo', color: '#60A5FA', items: '84 productos' },
                ].map(ch => {
                  const Icon = ch.icon
                  return (
                    <div key={ch.channel} className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${ch.color}18` }}>
                        <Icon size={16} style={{ color: ch.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gastro-text">{ch.channel}</div>
                        <div className="text-xs text-gastro-subtle">{ch.items}</div>
                      </div>
                      <div className="badge badge-success text-xs">{ch.status}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="landing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4">
              <Sparkles size={11} className="mr-1" /> Inteligencia Artificial
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="gradient-text">GastroBrain</span>
              <span className="text-gastro-text"> trabaja mientras tú duermes</span>
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Cuatro capas de IA que aprenden de tu operación y te ayudan a tomar mejores decisiones, reducir costos y maximizar ingresos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'GastroAI', icon: Brain, color: '#2563EB', desc: 'Asistente conversacional para operaciones, menú y gestión diaria' },
              { name: 'GastroBrain', icon: Zap, color: '#3B82F6', desc: 'Motor de optimización que analiza toda la operación en tiempo real' },
              { name: 'GastroPredict', icon: BarChart3, color: '#60A5FA', desc: 'Predicción de demanda, stock y comportamiento de clientes' },
              { name: 'GastroMenu AI', icon: Sparkles, color: '#f59e0b', desc: 'Optimización de carta, precios dinámicos y análisis de rentabilidad' },
            ].map(ai => {
              const Icon = ai.icon
              return (
                <div key={ai.name} className="card-gastro gradient-border group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${ai.color}15` }}>
                    <Icon size={22} style={{ color: ai.color }} />
                  </div>
                  <div className="font-bold text-gastro-text mb-1">{ai.name}</div>
                  <p className="text-sm text-gastro-subtle">{ai.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gastro-text mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-gastro-subtle">Más de 4.200 negocios gastronómicos confían en Gastro360</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-gastro">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-gastro-subtle leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gastro-text">{t.name}</div>
                    <div className="text-xs text-gastro-subtle">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="landing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4">Precios transparentes</div>
            <h2 className="text-4xl md:text-5xl font-black text-gastro-text mb-4">
              Crece a tu ritmo
            </h2>
            <p className="text-gastro-subtle">Sin contratos anuales obligatorios. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.name}
                className={`rounded-2xl p-8 transition-all duration-300 relative ${plan.popular ? 'scale-105' : ''}`}
                style={{
                  background: plan.popular ? 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(59,130,246,0.06) 100%)' : '#0F1628',
                  border: `1px solid ${plan.popular ? 'rgba(37,99,235,0.4)' : '#1A2540'}`,
                  boxShadow: plan.popular ? '0 0 40px rgba(37,99,235,0.15)' : 'none',
                }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="badge badge-primary text-xs px-3 py-1">Más popular</div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gastro-text mb-1">{plan.name}</h3>
                  <p className="text-xs text-gastro-subtle mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black" style={{ color: plan.color }}>${plan.price}</span>
                    <span className="text-gastro-subtle text-sm">/mes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gastro-subtle">
                      <Check size={14} className="text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.popular ? 'btn-primary justify-center' : 'btn-secondary justify-center'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="landing-section">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(59,130,246,0.06) 50%, rgba(96,165,250,0.06) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.3) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Logo size="lg" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gastro-text mb-4">
                Tu restaurante merece el mejor sistema
              </h2>
              <p className="text-gastro-subtle text-lg mb-8 max-w-xl mx-auto">
                Únete a más de 4.200 negocios gastronómicos que ya operan con Gastro360. 14 días gratis, sin tarjeta de crédito.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => navigate('/login')}
                  className="btn-primary text-base px-8 py-4">
                  Comenzar ahora — Es gratis <ArrowRight size={18} />
                </button>
                <button className="btn-secondary text-base px-8 py-4">
                  Agendar demo personalizada
                </button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gastro-subtle">
                <div className="flex items-center gap-1.5"><Shield size={12} /> Sin tarjeta de crédito</div>
                <div className="flex items-center gap-1.5"><Clock size={12} /> Setup en 5 minutos</div>
                <div className="flex items-center gap-1.5"><Zap size={12} /> Soporte incluido</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gastro-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="text-xs text-gastro-subtle">
              © 2025 Gastro360. El sistema operativo de la gastronomía moderna.
            </div>
            <div className="flex gap-6 text-xs text-gastro-subtle">
              <a href="#" className="hover:text-gastro-text transition-colors">Privacidad</a>
              <a href="#" className="hover:text-gastro-text transition-colors">Términos</a>
              <a href="#" className="hover:text-gastro-text transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
