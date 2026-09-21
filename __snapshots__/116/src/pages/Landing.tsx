import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Users,
  ChefHat,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';

const features = [
  { icon: Zap, title: 'POS ultrarrápido', desc: 'Cobra en segundos con una interfaz diseñada para el ritmo del servicio.' },
  { icon: ChefHat, title: 'Cocina conectada', desc: 'Tickets digitales en tiempo real con alertas de urgencia y modificadores.' },
  { icon: BarChart3, title: 'Reportes en vivo', desc: 'Métricas de ventas, rotación de mesas y platos estrella al instante.' },
  { icon: Users, title: 'Personal y turnos', desc: 'Gestiona meseros, cocineros y horarios desde un solo lugar.' },
  { icon: Shield, title: 'Facturación CFDI', desc: 'Emite facturas electrónicas compatibles con SAT sin fricción.' },
  { icon: Sparkles, title: 'Multi-sucursal', desc: 'Administra 1 o 100 locales con reportes consolidados.' },
];

const plans = [
  {
    name: 'Starter',
    price: '$799',
    period: '/mes',
    desc: 'Ideal para restaurantes pequeños',
    features: ['1 sucursal', 'Hasta 5 usuarios', 'POS + Mesas', 'Reportes básicos', 'Soporte por email'],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$1,999',
    period: '/mes',
    desc: 'Para operaciones en crecimiento',
    features: ['Hasta 3 sucursales', 'Usuarios ilimitados', 'Todo lo del Starter', 'Cocina digital (KDS)', 'Facturación CFDI', 'Inventario avanzado', 'Soporte prioritario'],
    cta: 'Probar 14 días',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Para cadenas y franquicias',
    features: ['Sucursales ilimitadas', 'API personalizada', 'Reportes consolidados', 'Manager dedicado', 'SLA garantizado', 'Onboarding on-site'],
    cta: 'Contactar ventas',
    highlighted: false,
  },
];

const testimonials = [
  { name: 'Elena Rojas', role: 'Dueña, Bistró Alma', quote: 'Savora nos ahorró 12 horas semanales en administración. La cocina fluye como nunca.', img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Marcelo Vega', role: 'Director, Grupo Gastronómico Norte', quote: 'Gestionamos 8 sucursales desde un solo panel. El ROI se vio en el primer mes.', img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Isabella Muñoz', role: 'Chef ejecutiva, La Terraza', quote: 'La KDS es una locura. Redujimos tiempos de preparación en 30%.', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Savora</div>
              <div className="text-[10px] text-slate-500 leading-tight">Restaurant OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900">Producto</a>
            <a href="#pricing" className="hover:text-slate-900">Precios</a>
            <a href="#testimonials" className="hover:text-slate-900">Clientes</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/app" className="hidden sm:inline text-sm font-medium text-slate-700 hover:text-slate-900">
              Iniciar sesión
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Empezar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-violet-200/40 rounded-full blur-3xl -z-0"></div>
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl -z-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-sm mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Nueva versión 2.5 — Cocina IA disponible
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              El sistema operativo de tu{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                restaurante
              </span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Desde el POS hasta la cocina, el inventario y las finanzas. Todo en una plataforma diseñada para chefs, meseros y dueños.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 cursor-pointer transition-all hover:scale-[1.02]"
              >
                Explorar demo en vivo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl hover:border-slate-300 cursor-pointer transition-colors"
              >
                Ver características
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                14 días de prueba gratis
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Sin tarjeta requerida
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Setup en 15 min
              </div>
            </div>
          </div>

          <div className="mt-16 lg:mt-24 relative max-w-6xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img
                src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Dashboard Savora"
                className="w-full aspect-[16/9] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confían en nosotros +2,400 restaurantes en LATAM
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '2.4M+', label: 'Órdenes procesadas / mes' },
              { value: '99.9%', label: 'Uptime garantizado' },
              { value: '4.9/5', label: 'Rating promedio' },
              { value: '15 min', label: 'Setup promedio' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Todo en uno</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Diseñado para cada rol de tu equipo
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sin integraciones frágiles ni docenas de apps. Todo lo que tu restaurante necesita, en una sola plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Testimonios</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Restaurantes que ya transformaron su operación
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Precios</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Planes que crecen con tu negocio
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sin permanencia. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-900 text-white shadow-2xl scale-105'
                    : 'bg-white border-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    <TrendingUp className="w-3 h-3" />
                    Más popular
                  </div>
                )}
                <div className={`text-sm font-semibold ${plan.highlighted ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {plan.name}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tabular-nums">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{plan.desc}</p>

                <Link
                  to="/app"
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                    plan.highlighted
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 rounded-3xl p-8 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">
                ¿Listo para transformar tu restaurante?
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Únete a más de 2,400 restaurantes que ya operan con Savora.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 shadow-2xl cursor-pointer transition-all hover:scale-[1.02]"
                >
                  Empezar prueba gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 cursor-pointer transition-colors"
                >
                  Ver planes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Savora</span>
            <span className="text-xs text-slate-500">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacidad</a>
            <a href="#" className="hover:text-slate-900">Términos</a>
            <a href="#" className="hover:text-slate-900">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
