import { useNavigate } from 'react-router-dom'
import { Check, Zap, ArrowRight, CreditCard, Shield, Clock } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    desc: 'Para restaurantes que empiezan',
    color: '#8899BB',
    features: ['Hasta 1 local', 'GastroMenu básico', 'GastroServe (50 mesas)', 'GastroStock básico', 'Soporte por email', '5 usuarios'],
    current: false,
  },
  {
    name: 'Pro',
    price: 149,
    desc: 'Para restaurantes en crecimiento',
    color: '#0066FF',
    popular: true,
    features: ['Hasta 3 locales', 'Todos los módulos core', 'GastroInsight + IA básica', 'GastroLoyalty', 'GastroWeb incluido', 'Integraciones delivery', '20 usuarios', 'Soporte prioritario'],
    current: true,
  },
  {
    name: 'Enterprise',
    price: 399,
    desc: 'Para cadenas y grupos gastronómicos',
    color: '#3399FF',
    features: ['Locales ilimitados', 'Todos los módulos', 'GastroBrain IA completa', 'GastroNetwork acceso total', 'API personalizada', 'Hardware integrado', 'Usuarios ilimitados', 'SLA 99.9% + soporte 24/7'],
    current: false,
  },
]

export default function Billing() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Plan & Facturación</h2>
        <p className="section-subtitle">Gestiona tu suscripción y método de pago</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div key={plan.name}
            className={`rounded-2xl p-6 relative transition-all duration-300 ${plan.current ? 'scale-105' : ''}`}
            style={{
              background: plan.current ? 'linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(51,153,255,0.06) 100%)' : '#0F1628',
              border: `1px solid ${plan.current ? 'rgba(0,102,255,0.4)' : '#1A2540'}`,
              boxShadow: plan.current ? '0 0 40px rgba(0,102,255,0.15)' : 'none',
            }}>
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="badge badge-primary text-xs px-3 py-1">Plan actual</div>
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
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.current ? 'text-gastro-subtle cursor-default' : plan.popular ? 'btn-primary justify-center' : 'btn-secondary justify-center'}`}
              style={plan.current ? { background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' } : {}}>
              {plan.current ? 'Plan activo' : plan.name === 'Enterprise' ? 'Hablar con ventas' : 'Cambiar a este plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="card-gastro">
        <h3 className="font-bold text-gastro-text mb-4">Método de pago</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
          <CreditCard size={20} className="text-primary-400" />
          <div className="flex-1">
            <div className="font-semibold text-gastro-text text-sm">Visa terminada en 4242</div>
            <div className="text-xs text-gastro-subtle">Vence 12/2027</div>
          </div>
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Cambiar</button>
        </div>
        <div className="flex items-center gap-6 text-xs text-gastro-subtle">
          <div className="flex items-center gap-1.5"><Shield size={12} /> Pagos seguros con Stripe</div>
          <div className="flex items-center gap-1.5"><Clock size={12} /> Cancela cuando quieras</div>
        </div>
      </div>
    </div>
  )
}
