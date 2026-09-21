import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import {
  Zap, Globe, BarChart3, Users, Package, TrendingUp,
  Heart, Brain, Smartphone, ArrowRight, Check, Star, Play,
  UtensilsCrossed, BookOpen, Network, Truck,
  Shield, Clock, Layers, ChevronDown, Menu, X, Sparkles,
  Building2, Coffee, ShoppingBag, Bike, Eye, ChefHat,
  Monitor, QrCode, Flame
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Plataforma', href: '#plataforma' },
  { label: 'Módulos', href: '#modulos' },
  { label: 'Experiencia', href: '#experiencia' },
  { label: 'Precios', href: '#precios' },
]

const HERO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=85', alt: 'Restaurante fine dining' },
  { src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=85', alt: 'Chef en cocina profesional' },
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=85', alt: 'Salón de restaurante' },
]

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1546069901-ba9599a722e8?w=600&q=80', label: 'Platos gourmet' },
  { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', label: 'Pizza artesanal' },
  { src: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80', label: 'Sushi premium' },
  { src: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', label: 'Carnes a la parrilla' },
  { src: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', label: 'Postres de autor' },
  { src: 'https://images.unsplash.com/photo-1493857671505-7291e2717b85?w=600&q=80', label: 'Cafetería specialty' },
  { src: 'https://images.unsplash.com/photo-1476224207901-18c5d9e9cf3f?w=600&q=80', label: 'Bar & coctelería' },
  { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', label: 'Dark kitchen' },
  { src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80', label: 'Cocina en acción' },
  { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', label: 'Servicio de mesa' },
]

const FEATURES = [
  { icon: BookOpen, title: 'Carta Omnicanal', desc: 'Una sola fuente de verdad para todos tus canales de venta', color: '#2563EB', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { icon: UtensilsCrossed, title: 'GastroServe', desc: 'Pedidos, mesas, KDS y pagos integrados en tiempo real', color: '#3B82F6', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
  { icon: Brain, title: 'IA Integrada', desc: 'Predicción de demanda, optimización de menú y alertas inteligentes', color: '#60A5FA', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80' },
  { icon: BarChart3, title: 'Analítica Avanzada', desc: 'Dashboards ejecutivos con KPIs en tiempo real y proyecciones', color: '#10b981', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { icon: Package, title: 'GastroStock', desc: 'Inventario, recetas, mermas y órdenes de compra automatizadas', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80' },
  { icon: Users, title: 'GastroTalent', desc: 'Gestión de turnos, RRHH y red profesional gastronómica', color: '#60A5FA', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80' },
  { icon: Globe, title: 'GastroWeb', desc: 'Sitio web propio con pedidos online y delivery integrado', color: '#3B82F6', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80' },
  { icon: Heart, title: 'GastroLoyalty', desc: 'Programa de fidelización, CRM y marketing automatizado', color: '#2563EB', image: 'https://images.unsplash.com/photo-1493857671505-7291e2717b85?w=800&q=80' },
]

const MODULES_SHOWCASE = [
  { id: 'serve', name: 'GastroServe', icon: UtensilsCrossed, color: '#3B82F6', desc: 'Pedidos & Mesas', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
  { id: 'menu', name: 'GastroMenu', icon: BookOpen, color: '#2563EB', desc: 'Carta Omnicanal', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
  { id: 'stock', name: 'GastroStock', icon: Package, color: '#f59e0b', desc: 'Inventario', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80' },
  { id: 'recipe', name: 'GastroRecipe', icon: ChefHat, color: '#f59e0b', desc: 'Recetas & IA', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80' },
  { id: 'finance', name: 'GastroFinance', icon: TrendingUp, color: '#10b981', desc: 'Finanzas', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { id: 'talent', name: 'GastroTalent', icon: Users, color: '#60A5FA', desc: 'Talento', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80' },
  { id: 'insight', name: 'GastroInsight', icon: BarChart3, color: '#2563EB', desc: 'Analítica IA', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  { id: 'loyalty', name: 'GastroLoyalty', icon: Heart, color: '#60A5FA', desc: 'Fidelización', image: 'https://images.unsplash.com/photo-1493857671505-7291e2717b85?w=600&q=80' },
  { id: 'web', name: 'GastroWeb', icon: Globe, color: '#3B82F6', desc: 'Web Propia', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
  { id: 'network', name: 'GastroNetwork', icon: Network, color: '#60A5FA', desc: 'Red Pro', image: 'https://images.unsplash.com/photo-1476224207901-18c5d9e9cf3f?w=600&q=80' },
  { id: 'supply', name: 'GastroSupply', icon: Truck, color: '#3B82F6', desc: 'Proveedores', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80' },
  { id: 'go', name: 'GastroGo', icon: Smartphone, color: '#2563EB', desc: 'App Cliente', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80' },
  { id: 'predict', name: 'GastroPredict', icon: Brain, color: '#3B82F6', desc: 'Predicción IA', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80' },
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
    company: 'Grupo Gastronómico Ríos (12 locales en Chile)',
    avatar: 'VR',
    text: 'Gastro360 transformó completamente nuestra operación. Pasamos de manejar 12 locales con 6 sistemas distintos a tener todo centralizado. El ROI fue visible en el primer mes.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
  {
    name: 'Marcos Delgado',
    role: 'Chef & Propietario',
    company: 'Bistró Delgado',
    avatar: 'MD',
    text: 'La carta omnicanal es un game changer. Antes perdía horas actualizando precios en cada plataforma. Ahora cambio todo desde un lugar y se sincroniza solo.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
  },
  {
    name: 'Carolina Fuentes',
    role: 'Gerente General',
    company: 'Dark Kitchen Fuentes',
    avatar: 'CF',
    text: 'GastroPredict nos ayudó a reducir el desperdicio de alimentos en un 31%. La IA predice la demanda con una precisión increíble. Imprescindible para cualquier dark kitchen.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  },
]

const STATS = [
  { value: 4200, suffix: '+', label: 'Restaurantes activos' },
  { value: 98.7, suffix: '%', label: 'Uptime garantizado', decimals: 1 },
  { value: 31, suffix: '%', label: 'Reducción de costos promedio' },
  { value: 2.4, suffix: 'x', label: 'ROI promedio primer año', decimals: 1 },
]

const BUSINESS_TYPES = [
  { icon: UtensilsCrossed, label: 'Restaurantes' },
  { icon: Coffee, label: 'Cafeterías' },
  { icon: Building2, label: 'Hoteles A&B' },
  { icon: ShoppingBag, label: 'Dark Kitchens' },
  { icon: Bike, label: 'Food Trucks' },
  { icon: Layers, label: 'Cadenas' },
]

const EXPERIENCE_STEPS = [
  { icon: QrCode, title: 'Cliente escanea QR', desc: 'Desde la mesa, sin app ni registro', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
  { icon: Monitor, title: 'Pedido en cocina', desc: 'KDS inteligente con priorización automática', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80' },
  { icon: ChefHat, title: 'Chef prepara', desc: 'Recetas, tiempos y alertas en tiempo real', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80' },
  { icon: Eye, title: 'GastroEye vigila', desc: 'Visión IA que detecta anomalías y optimiza', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
]

/* ─── Hooks & helpers ──────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  delay = 0,
  scale = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  scale?: boolean
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`${scale ? 'landing-reveal-scale' : 'landing-reveal'} ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function AnimatedCounter({
  value,
  suffix = '',
  decimals = 0,
  duration = 2000,
}: {
  value: number
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const { ref, visible } = useInView(0.3)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [visible, value, duration])

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('es-CL')}
      {suffix}
    </span>
  )
}

/* ─── Sub-components ───────────────────────────────────────────────── */

function ImageMarquee() {
  const doubled = [...GALLERY_IMAGES, ...GALLERY_IMAGES]
  return (
    <div className="landing-marquee-mask overflow-hidden py-4">
      <div className="flex gap-4 animate-marquee w-max">
        {doubled.map((img, i) => (
          <div key={i} className="relative flex-shrink-0 w-64 h-40 md:w-80 md:h-52 rounded-2xl overflow-hidden group">
            <img src={img.src} alt={img.label} className="landing-image animate-ken-burns group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-xs font-semibold text-white/90">{img.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FloatingDashboard({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const tx = (mouseX - 0.5) * 20
  const ty = (mouseY - 0.5) * 15
  return (
    <div
      className="landing-glass-card rounded-2xl p-5 w-full max-w-sm transition-transform duration-300 ease-out"
      style={{ transform: `translate(${tx}px, ${ty}px) rotateX(${-ty * 0.3}deg) rotateY(${tx * 0.3}deg)` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-gastro-text">Operación en vivo</span>
        </div>
        <span className="text-xs text-gastro-subtle">Hoy</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Ventas', val: '$682K', change: '+12%', color: '#2563EB' },
          { label: 'Mesas', val: '34/42', change: '81%', color: '#3B82F6' },
          { label: 'Ticket', val: '$18.4K', change: '+8%', color: '#10b981' },
          { label: 'Pedidos', val: '187', change: '+23', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
            <div className="text-[10px] text-gastro-subtle mb-0.5">{s.label}</div>
            <div className="text-sm font-bold text-gastro-text">{s.val}</div>
            <div className="text-[10px] font-semibold" style={{ color: s.color }}>{s.change}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {['Mesa 12 — Entrada lista', 'Pedido #847 — En cocina', 'Delivery #203 — En camino'].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] text-gastro-subtle px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Flame size={10} className="text-warning flex-shrink-0" />
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState(0)
  const [activeHero, setActiveHero] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [activeStep, setActiveStep] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setScrollY(window.scrollY)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule(prev => (prev + 1) % MODULES_SHOWCASE.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero(prev => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % EXPERIENCE_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gastro-bg text-gastro-text overflow-x-hidden">
      <div className="noise-overlay" />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-10 animate-float-delayed"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-gastro-border shadow-lg shadow-black/20' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="cursor-pointer" aria-label="Gastro360 — Inicio">
            <Logo size="md" />
          </button>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm text-gastro-subtle hover:text-gastro-text transition-colors duration-200 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="btn-secondary text-sm px-4 py-2">Iniciar sesión</button>
            <button onClick={() => navigate('/login')} className="btn-primary text-sm px-4 py-2">
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
              <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gastro-subtle hover:text-gastro-text py-1">{link.label}</a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <button onClick={() => navigate('/login')} className="btn-secondary text-sm justify-center">Iniciar sesión</button>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm justify-center">Prueba gratis</button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO CINEMATOGRÁFICO ═══ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
        className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image carousel with parallax */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[2000ms]"
            style={{
              opacity: i === activeHero ? 1 : 0,
              transform: `translateY(${scrollY * 0.3}px) scale(${i === activeHero ? 1.05 : 1.1})`,
            }}>
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 landing-image-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
          </div>
        ))}

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <div className="landing-scan-line animate-scan-line" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
                style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                <Sparkles size={14} className="text-primary-400" />
                <span className="text-xs font-semibold text-primary-400">El sistema operativo de la gastronomía moderna</span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-up">
                <span className="text-white">Todo tu restaurante.</span>
                <br />
                <span className="text-shimmer-gradient">Un solo ecosistema.</span>
              </h1>

              <p className="text-lg text-white/70 max-w-xl mb-10 leading-relaxed animate-fade-up animate-delay-200">
                Gastro360 centraliza operaciones, ventas, inventario, finanzas, talento, fidelización e inteligencia artificial en una plataforma modular diseñada para restaurantes, cadenas, dark kitchens y más.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 animate-fade-up animate-delay-300">
                <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-4 animate-pulse-glow">
                  Comenzar gratis — 14 días <ArrowRight size={18} />
                </button>
                <button className="btn-secondary text-base px-8 py-4 gap-3 bg-white/5 border-white/10 hover:bg-white/10">
                  <Play size={16} className="text-primary-400" />
                  Ver demo en vivo
                </button>
              </div>

              {/* Hero image dots */}
              <div className="flex gap-2 mb-10">
                {HERO_IMAGES.map((_, i) => (
                  <button key={i} onClick={() => setActiveHero(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${i === activeHero ? 'w-8 bg-primary-500' : 'w-4 bg-white/20'}`}
                    aria-label={`Imagen ${i + 1}`} />
                ))}
              </div>

              <div className="flex flex-wrap gap-3 animate-fade-up animate-delay-400">
                {BUSINESS_TYPES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/60 backdrop-blur-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon size={13} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating dashboard mockup */}
            <div className="hidden lg:block relative animate-fade-up animate-delay-500">
              <div className="absolute -inset-8 rounded-3xl opacity-30 animate-glow-pulse"
                style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.4) 0%, transparent 70%)' }} />
              <FloatingDashboard mouseX={mousePos.x} mouseY={mousePos.y} />

              {/* Floating mini cards */}
              <div className="absolute -top-6 -right-4 landing-glass-card rounded-xl px-4 py-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                    <TrendingUp size={14} className="text-success" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gastro-subtle">Ventas hoy</div>
                    <div className="text-sm font-bold text-success">+23.4%</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 landing-glass-card rounded-xl px-4 py-3 animate-float-slow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.2)' }}>
                    <Brain size={14} className="text-primary-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gastro-subtle">GastroPredict</div>
                    <div className="text-sm font-bold text-primary-400">94% precisión</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10 animate-fade-up animate-delay-600">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black gradient-text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle z-10">
          <ChevronDown size={20} className="text-white/40" />
        </div>
      </section>

      {/* ═══ MARQUEE FOTOGRÁFICO ═══ */}
      <section className="py-8 border-y border-gastro-border/50 bg-gastro-surface/50">
        <ImageMarquee />
      </section>

      {/* ═══ PLATAFORMA MODULAR ═══ */}
      <section id="plataforma" className="landing-section relative">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="badge badge-primary mb-4">Plataforma modular</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gastro-text">12+ módulos.</span>
              <br />
              <span className="gradient-text">Un ecosistema completo.</span>
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Empieza con lo esencial y activa nuevos módulos a medida que creces. Sin migraciones, sin fricciones.
            </p>
          </Reveal>

          {/* Featured module spotlight */}
          <Reveal scale className="mb-10">
            <div className="relative rounded-3xl overflow-hidden h-64 md:h-80">
              <img
                src={MODULES_SHOWCASE[activeModule].image}
                alt={MODULES_SHOWCASE[activeModule].name}
                className="w-full h-full object-cover transition-all duration-700 animate-ken-burns"
                key={activeModule}
              />
              <div className="absolute inset-0 landing-image-overlay-left" />
              <div className="absolute inset-0 flex items-end p-8 md:p-12">
                <div className="flex items-center gap-4">
                  {(() => {
                    const mod = MODULES_SHOWCASE[activeModule]
                    const Icon = mod.icon
                    return (
                      <>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md"
                          style={{ background: `${mod.color}30`, border: `1px solid ${mod.color}50` }}>
                          <Icon size={28} style={{ color: mod.color }} />
                        </div>
                        <div>
                          <div className="text-2xl md:text-3xl font-black text-white">{mod.name}</div>
                          <div className="text-white/60">{mod.desc}</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MODULES_SHOWCASE.map((mod, i) => {
              const Icon = mod.icon
              const isActive = i === activeModule
              return (
                <Reveal key={mod.id} delay={i * 50}>
                  <div
                    className={`card-gastro cursor-pointer transition-all duration-500 h-full ${isActive ? 'scale-[1.03]' : ''}`}
                    style={isActive ? { borderColor: mod.color, boxShadow: `0 0 30px ${mod.color}25` } : {}}
                    onMouseEnter={() => setActiveModule(i)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${mod.color}18` }}>
                      <Icon size={20} style={{ color: mod.color }} />
                    </div>
                    <div className="font-bold text-sm text-gastro-text">{mod.name}</div>
                    <div className="text-xs text-gastro-subtle mt-0.5">{mod.desc}</div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ EXPERIENCIA INTERACTIVA (sticky scroll) ═══ */}
      <section id="experiencia" className="landing-section relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=60" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gastro-bg/90" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-16">
            <div className="badge badge-primary mb-4">Experiencia completa</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gastro-text">Del QR a la mesa,</span>
              <br />
              <span className="gradient-text">todo conectado.</span>
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Sigue el recorrido completo de un pedido en tiempo real, desde que el cliente escanea el QR hasta que el plato llega a la mesa.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Steps */}
            <div className="space-y-4">
              {EXPERIENCE_STEPS.map((step, i) => {
                const Icon = step.icon
                const isActive = i === activeStep
                return (
                  <Reveal key={i} delay={i * 100}>
                    <button
                      onClick={() => setActiveStep(i)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-500 ${isActive ? 'landing-glass-card scale-[1.02]' : 'opacity-50 hover:opacity-80'}`}
                      style={isActive ? { borderColor: 'rgba(37,99,235,0.4)' } : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isActive ? 'bg-primary-500/20' : 'bg-white/5'}`}>
                        <Icon size={22} className={isActive ? 'text-primary-400' : 'text-gastro-subtle'} />
                      </div>
                      <div>
                        <div className="font-bold text-gastro-text">{step.title}</div>
                        <div className="text-sm text-gastro-subtle">{step.desc}</div>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                      )}
                    </button>
                  </Reveal>
                )
              })}
            </div>

            {/* Visual */}
            <Reveal scale>
              <div className="landing-photo-frame aspect-[4/3] relative">
                <img
                  src={EXPERIENCE_STEPS[activeStep].image}
                  alt={EXPERIENCE_STEPS[activeStep].title}
                  className="w-full h-full object-cover transition-all duration-700"
                  key={activeStep}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="landing-glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-semibold text-white">{EXPERIENCE_STEPS[activeStep].title}</span>
                      <span className="text-xs text-white/50 ml-auto">Paso {activeStep + 1}/{EXPERIENCE_STEPS.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES BENTO GRID ═══ */}
      <section id="modulos" className="landing-section">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="badge badge-primary mb-4">Funcionalidades clave</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gastro-text">
              Diseñado para la operación real
            </h2>
            <p className="text-gastro-subtle max-w-xl mx-auto">
              Cada módulo fue construido con lógica de negocio profunda, pensando en los desafíos reales de la industria gastronómica.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              const isHovered = hoveredFeature === i
              return (
                <Reveal key={i} delay={i * 60}>
                  <div
                    className="landing-bento h-72 relative group cursor-pointer"
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}>
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-50' : 'brightness-[0.35]'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
                        style={{ background: `${feat.color}25`, border: `1px solid ${feat.color}40` }}>
                        <Icon size={22} style={{ color: feat.color }} />
                      </div>
                      <h3 className="font-bold text-white mb-1">{feat.title}</h3>
                      <p className={`text-sm text-white/60 leading-relaxed transition-all duration-500 ${isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ OMNICANAL CON IMAGEN ═══ */}
      <section className="landing-section">
        <div className="max-w-7xl mx-auto">
          <Reveal scale>
            <div className="rounded-3xl relative overflow-hidden min-h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
                alt="Carta omnicanal"
                className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
              />
              <div className="absolute inset-0 landing-image-overlay-left" />

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-8 md:p-12 min-h-[500px]">
                <div>
                  <div className="badge badge-primary mb-4">Carta Maestra Omnicanal</div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Una sola fuente de verdad para todos tus canales
                  </h2>
                  <p className="text-white/60 mb-6 leading-relaxed">
                    Gestiona productos, precios, disponibilidad y modificadores desde un único lugar. Los cambios se propagan instantáneamente a todos los canales.
                  </p>
                  <div className="space-y-3">
                    {['Precios diferenciados por canal', 'Disponibilidad en tiempo real', 'Horarios específicos por producto', 'Sincronización con Uber Eats, Rappi y PedidosYa'].map(item => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(16,185,129,0.25)' }}>
                          <Check size={11} className="text-success" />
                        </div>
                        <span className="text-sm text-white/80">{item}</span>
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
                      <div key={ch.channel} className="landing-glass-card flex items-center gap-4 p-4 rounded-xl">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${ch.color}18` }}>
                          <Icon size={16} style={{ color: ch.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{ch.channel}</div>
                          <div className="text-xs text-white/50">{ch.items}</div>
                        </div>
                        <div className="badge badge-success text-xs">{ch.status}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ IA SECTION ═══ */}
      <section className="landing-section relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=60" alt="" className="w-full h-full object-cover opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-16">
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
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'GastroAI', icon: Brain, color: '#2563EB', desc: 'Asistente conversacional para operaciones, menú y gestión diaria' },
              { name: 'GastroBrain', icon: Zap, color: '#3B82F6', desc: 'Motor de optimización que analiza toda la operación en tiempo real' },
              { name: 'GastroPredict', icon: BarChart3, color: '#60A5FA', desc: 'Predicción de demanda, stock y comportamiento de clientes' },
              { name: 'GastroMenu AI', icon: Sparkles, color: '#f59e0b', desc: 'Optimización de carta, precios dinámicos y análisis de rentabilidad' },
            ].map((ai, i) => {
              const Icon = ai.icon
              return (
                <Reveal key={ai.name} delay={i * 100}>
                  <div className="card-gastro gradient-border group h-full hover:scale-[1.03] transition-transform duration-300">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: `${ai.color}15` }}>
                      <Icon size={22} style={{ color: ai.color }} />
                    </div>
                    <div className="font-bold text-gastro-text mb-1">{ai.name}</div>
                    <p className="text-sm text-gastro-subtle">{ai.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ FULL-WIDTH PARALLAX BANNER ═══ */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a722e8?w=1920&q=85"
            alt="Gastronomía de autor"
            className="w-full h-[120%] object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Reveal className="text-center px-6">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              La tecnología que tu cocina <span className="gradient-text">merece</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Desde el primer plato hasta el último reporte financiero, Gastro360 potencia cada aspecto de tu negocio gastronómico.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="landing-section">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl font-black text-gastro-text mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-gastro-subtle">Más de 4.200 negocios gastronómicos confían en Gastro360</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="card-gastro h-full flex flex-col overflow-hidden p-0">
                  <div className="h-32 relative overflow-hidden">
                    <img src={t.image} alt={t.company} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gastro-card to-transparent" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-gastro-subtle leading-relaxed mb-6 flex-1">"{t.text}"</p>
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
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reverse marquee */}
      <section className="py-6 border-y border-gastro-border/50">
        <div className="landing-marquee-mask overflow-hidden">
          <div className="flex gap-4 animate-marquee-reverse w-max">
            {[...GALLERY_IMAGES.slice().reverse(), ...GALLERY_IMAGES.slice().reverse()].map((img, i) => (
              <div key={i} className="relative flex-shrink-0 w-48 h-32 md:w-64 md:h-40 rounded-xl overflow-hidden">
                <img src={img.src} alt={img.label} className="landing-image" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="precios" className="landing-section">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="badge badge-primary mb-4">Precios transparentes</div>
            <h2 className="text-4xl md:text-5xl font-black text-gastro-text mb-4">Crece a tu ritmo</h2>
            <p className="text-gastro-subtle">Sin contratos anuales obligatorios. Cancela cuando quieras.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <div
                  className={`rounded-2xl p-8 transition-all duration-300 relative h-full ${plan.popular ? 'scale-105' : ''}`}
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="landing-section">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal scale>
            <div className="rounded-3xl p-12 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
                alt="Restaurante"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/75" />
              <div className="absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.4) 0%, transparent 60%)' }} />

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <Logo size="lg" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Tu restaurante merece el mejor sistema
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                  Únete a más de 4.200 negocios gastronómicos que ya operan con Gastro360. 14 días gratis, sin tarjeta de crédito.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-4">
                    Comenzar ahora — Es gratis <ArrowRight size={18} />
                  </button>
                  <button className="btn-secondary text-base px-8 py-4 bg-white/5 border-white/10">
                    Agendar demo personalizada
                  </button>
                </div>
                <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/50">
                  <div className="flex items-center gap-1.5"><Shield size={12} /> Sin tarjeta de crédito</div>
                  <div className="flex items-center gap-1.5"><Clock size={12} /> Setup en 5 minutos</div>
                  <div className="flex items-center gap-1.5"><Zap size={12} /> Soporte incluido</div>
                </div>
              </div>
            </div>
          </Reveal>
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
