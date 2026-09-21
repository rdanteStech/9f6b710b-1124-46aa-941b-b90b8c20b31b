import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('admin@osteriamoderna.com')
  const [password, setPassword] = useState('demo1234')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    login(email, password)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gastro-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex justify-center mb-4 cursor-pointer animate-pulse-glow rounded-xl p-2"
            aria-label="Gastro360 — Volver al inicio">
            <Logo size="lg" className="mx-auto" />
          </button>
          <p className="text-sm text-gastro-subtle mt-1">El sistema operativo de tu restaurante</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
          <h2 className="text-xl font-bold text-gastro-text mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-gastro-subtle mb-6">Ingresa a tu panel de control</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-gastro pl-10"
                  placeholder="tu@restaurante.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-gastro pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gastro-muted hover:text-gastro-text transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 text-sm">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Ingresar al panel <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <Sparkles size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gastro-subtle">
              <span className="text-primary-400 font-semibold">Demo precargada:</span> Usa las credenciales ya completadas para explorar la plataforma completa.
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gastro-subtle mt-6">
          ¿No tienes cuenta?{' '}
          <button onClick={() => navigate('/')} className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Ver planes y precios
          </button>
        </p>
      </div>
    </div>
  )
}
