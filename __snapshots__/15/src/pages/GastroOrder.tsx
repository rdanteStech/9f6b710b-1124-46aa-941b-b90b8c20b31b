import { useState, useEffect } from 'react'
import {
  QrCode, Users, ShoppingCart, CreditCard, CheckCircle, Clock,
  Plus, Minus, Trash2, ChevronRight, Smartphone, Zap, X,
  SplitSquareHorizontal, User, ArrowRight, RotateCcw, Wifi,
  UtensilsCrossed, Coffee, Wine, Cake, Salad, Pizza, Star,
  AlertCircle, Check, DollarSign, Receipt, Send
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  tags: string[]
  popular?: boolean
  allergens?: string[]
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  qty: number
  notes?: string
}

interface Diner {
  id: string
  name: string
  emoji: string
  cart: CartItem[]
  paid: boolean
  paymentMethod?: string
}

interface TableSession {
  id: string
  tableNumber: string
  tableLabel: string
  zone: string
  status: 'waiting' | 'ordering' | 'sent' | 'paying' | 'closed'
  diners: Diner[]
  totalDiners: number
  openedAt: string
  sentAt?: string
}

// ─── Mock Menu Data ───────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  // Entradas
  { id: 'm1', name: 'Burrata con Tomates', description: 'Burrata fresca, tomates cherry asados, albahaca y aceite de oliva extra virgen', price: 1850, category: 'Entradas', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400', tags: ['vegetariano'], popular: true },
  { id: 'm2', name: 'Ceviche Clásico', description: 'Corvina marinada en limón, cebolla morada, ají amarillo y choclo', price: 2200, category: 'Entradas', image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400', tags: ['sin gluten', 'fresco'] },
  { id: 'm3', name: 'Tabla de Embutidos', description: 'Selección de jamones ibéricos, quesos curados y encurtidos artesanales', price: 3400, category: 'Entradas', image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?w=400', tags: ['para compartir'] },
  // Principales
  { id: 'm4', name: 'Risotto de Hongos', description: 'Arroz arbóreo, mix de hongos silvestres, parmesano 24 meses y trufa negra', price: 3200, category: 'Principales', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400', tags: ['vegetariano'], popular: true },
  { id: 'm5', name: 'Lomo a la Pimienta', description: 'Lomo de res 300g, salsa de pimienta verde, papas rosti y espárragos', price: 4800, category: 'Principales', image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?w=400', tags: ['sin gluten'] },
  { id: 'm6', name: 'Pasta Carbonara', description: 'Spaghetti artesanal, guanciale, yema de huevo, pecorino y pimienta negra', price: 2900, category: 'Principales', image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400', tags: [] },
  { id: 'm7', name: 'Salmón Grillado', description: 'Salmón atlántico, quinoa tricolor, salsa de maracuyá y vegetales de estación', price: 4200, category: 'Principales', image: 'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?w=400', tags: ['sin gluten', 'saludable'] },
  // Bebidas
  { id: 'm8', name: 'Agua Mineral', description: 'Agua mineral sin gas o con gas 500ml', price: 450, category: 'Bebidas', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?w=400', tags: [] },
  { id: 'm9', name: 'Vino Tinto Copa', description: 'Malbec Reserva, Mendoza. Copa 150ml', price: 1200, category: 'Bebidas', image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?w=400', tags: [] },
  { id: 'm10', name: 'Limonada Artesanal', description: 'Limón exprimido, menta fresca, jengibre y agua con gas', price: 850, category: 'Bebidas', image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?w=400', tags: ['sin alcohol'], popular: true },
  // Postres
  { id: 'm11', name: 'Tiramisú Clásico', description: 'Mascarpone, café espresso, savoiardi y cacao en polvo', price: 1600, category: 'Postres', image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?w=400', tags: ['vegetariano'], popular: true },
  { id: 'm12', name: 'Coulant de Chocolate', description: 'Bizcocho de chocolate 70%, centro fundente y helado de vainilla', price: 1800, category: 'Postres', image: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?w=400', tags: ['vegetariano'] },
]

const CATEGORIES = ['Todos', 'Entradas', 'Principales', 'Bebidas', 'Postres']

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Todos': <UtensilsCrossed size={14} />,
  'Entradas': <Salad size={14} />,
  'Principales': <Pizza size={14} />,
  'Bebidas': <Wine size={14} />,
  'Postres': <Cake size={14} />,
}

const DINER_EMOJIS = ['🧑', '👩', '👨', '🧔', '👱', '🧕', '👴', '👵', '🧒', '👦']

const MOCK_TABLES = [
  { number: 'M1', label: 'Mesa 1', zone: 'Salón' },
  { number: 'M2', label: 'Mesa 2', zone: 'Salón' },
  { number: 'M3', label: 'Mesa 3', zone: 'Salón' },
  { number: 'M4', label: 'Mesa 4', zone: 'Terraza' },
  { number: 'M5', label: 'Mesa 5', zone: 'Terraza' },
  { number: 'VIP', label: 'VIP', zone: 'VIP' },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

// ─── QR Kiosk View (mobile-first) ────────────────────────────────────────────

function KioskView({
  session,
  currentDinerId,
  onJoin,
  onAddItem,
  onRemoveItem,
  onSendOrder,
  onClose,
}: {
  session: TableSession
  currentDinerId: string | null
  onJoin: (name: string) => void
  onAddItem: (dinerId: string, item: MenuItem) => void
  onRemoveItem: (dinerId: string, itemId: string) => void
  onSendOrder: () => void
  onClose: () => void
}) {
  const [view, setView] = useState<'join' | 'menu' | 'cart' | 'payment'>('join')
  const [joinName, setJoinName] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemNotes, setItemNotes] = useState('')
  const [paymentView, setPaymentView] = useState<'select' | 'processing' | 'done'>('select')
  const [splitMode, setSplitMode] = useState<'individual' | 'equal' | 'custom'>('individual')

  const currentDiner = session.diners.find(d => d.id === currentDinerId)
  const myCart = currentDiner?.cart ?? []
  const myTotal = myCart.reduce((s, i) => s + i.price * i.qty, 0)
  const sessionTotal = session.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0)

  const filteredItems = MENU_ITEMS.filter(i => activeCategory === 'Todos' || i.category === activeCategory)

  useEffect(() => {
    if (currentDinerId && view === 'join') setView('menu')
  }, [currentDinerId, view])

  if (view === 'join') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
          {/* Header */}
          <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.2), rgba(56,189,248,0.1))' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)' }}>
              <QrCode size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">{session.tableLabel}</h2>
            <p className="text-sm text-gastro-subtle">{session.zone} · Osteria Moderna</p>
          </div>

          <div className="p-6">
            {/* Session info */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-5"
              style={{ background: 'rgba(158,127,255,0.08)', border: '1px solid rgba(158,127,255,0.2)' }}>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary-400" />
                <span className="text-xs font-semibold text-gastro-text">
                  {session.diners.length} de {session.totalDiners} comensales
                </span>
              </div>
              <div className="flex -space-x-1">
                {session.diners.slice(0, 4).map(d => (
                  <div key={d.id} className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: '#2a2a3d', border: '1px solid #1a1a26' }}>
                    {d.emoji}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                ¿Cómo te llamás?
              </label>
              <input
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && joinName.trim() && onJoin(joinName.trim())}
                placeholder="Tu nombre..."
                className="input-gastro text-base"
                autoFocus
              />
            </div>

            <button
              onClick={() => joinName.trim() && onJoin(joinName.trim())}
              disabled={!joinName.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)' }}>
              Unirme a la mesa →
            </button>

            <p className="text-xs text-center text-gastro-subtle mt-3">
              Al unirte podés ver el menú y hacer tu pedido
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'payment') {
    const unpaidDiners = session.diners.filter(d => !d.paid)
    const equalSplit = sessionTotal / session.diners.length

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d18' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#2a2a3d' }}>
          <button onClick={() => setView('cart')} className="text-gastro-subtle hover:text-gastro-text">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h2 className="font-bold text-gastro-text">Pagar cuenta</h2>
          <div />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Total */}
          <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.2)' }}>
            <div className="text-xs text-gastro-subtle mb-1">Total de la mesa</div>
            <div className="text-3xl font-black text-white">${sessionTotal.toLocaleString()}</div>
            <div className="text-xs text-gastro-subtle mt-1">{session.diners.length} comensales</div>
          </div>

          {/* Split mode */}
          <div>
            <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-3">Forma de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'individual', label: 'Mi pedido', icon: User },
                { id: 'equal', label: 'Partes iguales', icon: SplitSquareHorizontal },
                { id: 'custom', label: 'Personalizado', icon: Users },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id}
                  onClick={() => setSplitMode(id as typeof splitMode)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: splitMode === id ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${splitMode === id ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                    color: splitMode === id ? '#9E7FFF' : '#8888aa',
                  }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          {splitMode === 'individual' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Tu pedido</p>
              {myCart.map(item => (
                <div key={item.menuItemId} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-sm text-gastro-text">{item.qty}x {item.name}</span>
                  <span className="text-sm font-bold text-gastro-text">${(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-xl font-bold"
                style={{ background: 'rgba(158,127,255,0.1)' }}>
                <span className="text-sm text-gastro-text">Total a pagar</span>
                <span className="text-lg text-primary-400">${myTotal.toLocaleString()}</span>
              </div>
            </div>
          )}

          {splitMode === 'equal' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">División igualitaria</p>
              {session.diners.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: d.id === currentDinerId ? 'rgba(158,127,255,0.1)' : 'rgba(255,255,255,0.03)', border: d.id === currentDinerId ? '1px solid rgba(158,127,255,0.3)' : '1px solid transparent' }}>
                  <div className="flex items-center gap-2">
                    <span>{d.emoji}</span>
                    <span className="text-sm text-gastro-text">{d.name}</span>
                    {d.id === currentDinerId && <span className="text-xs text-primary-400">(vos)</span>}
                  </div>
                  <span className="text-sm font-bold text-gastro-text">${Math.round(equalSplit).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {splitMode === 'custom' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Seleccioná quién paga</p>
              {session.diners.map(d => {
                const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
                return (
                  <div key={d.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{d.emoji}</span>
                        <span className="text-sm font-semibold text-gastro-text">{d.name}</span>
                        {d.paid && <span className="text-xs text-success">✓ Pagado</span>}
                      </div>
                      <span className="text-sm font-bold text-gastro-text">${dTotal.toLocaleString()}</span>
                    </div>
                    {d.cart.map(item => (
                      <div key={item.menuItemId} className="flex items-center justify-between pl-6 text-xs text-gastro-subtle">
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {/* Payment methods */}
          {paymentView === 'select' && (
            <div>
              <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-3">Método de pago</p>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentView('processing')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, rgba(0,100,200,0.2), rgba(0,60,150,0.2))', border: '1px solid rgba(0,100,200,0.4)', color: '#60a5fa' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs"
                    style={{ background: 'linear-gradient(135deg, #0064c8, #003c96)' }}>W+</div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">WebpayPlus</div>
                    <div className="text-xs opacity-70">Tarjeta débito / crédito</div>
                  </div>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setPaymentView('processing')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <CreditCard size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gastro-text">Pagar en caja</div>
                    <div className="text-xs">Efectivo o tarjeta al mozo</div>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {paymentView === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
                style={{ background: 'rgba(158,127,255,0.2)', border: '2px solid rgba(158,127,255,0.4)' }}>
                <CreditCard size={24} className="text-primary-400" />
              </div>
              <p className="font-bold text-gastro-text mb-2">Procesando pago...</p>
              <p className="text-xs text-gastro-subtle">Redirigiendo a WebpayPlus</p>
              <button onClick={() => setPaymentView('done')}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-semibold text-success"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                Simular pago exitoso
              </button>
            </div>
          )}

          {paymentView === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <CheckCircle size={28} className="text-success" />
              </div>
              <p className="font-black text-xl text-gastro-text mb-2">¡Pago exitoso!</p>
              <p className="text-sm text-gastro-subtle mb-4">Tu boleta fue enviada por email</p>
              <button onClick={onClose}
                className="px-8 py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d18' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#2a2a3d', background: '#0d0d18' }}>
        <div>
          <div className="font-bold text-gastro-text text-sm">{session.tableLabel}</div>
          <div className="text-xs text-gastro-subtle">{currentDiner?.emoji} {currentDiner?.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('cart')}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
            <ShoppingCart size={14} />
            {myCart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black text-white flex items-center justify-center"
                style={{ background: '#9E7FFF', fontSize: '9px' }}>
                {myCart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
            ${myTotal.toLocaleString()}
          </button>
          <button onClick={onClose} className="text-gastro-muted hover:text-gastro-text">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Diners bar */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2a2a3d' }}>
        {session.diners.map(d => {
          const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
          return (
            <div key={d.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl flex-shrink-0 text-xs"
              style={{
                background: d.id === currentDinerId ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${d.id === currentDinerId ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                color: d.id === currentDinerId ? '#9E7FFF' : '#8888aa',
              }}>
              <span>{d.emoji}</span>
              <span className="font-semibold">{d.name.split(' ')[0]}</span>
              {dTotal > 0 && <span className="opacity-70">${dTotal.toLocaleString()}</span>}
            </div>
          )
        })}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl flex-shrink-0 text-xs text-gastro-muted"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3d' }}>
          <Users size={11} />
          <span>{session.diners.length}/{session.totalDiners}</span>
        </div>
      </div>

      {view === 'menu' && (
        <>
          {/* Category tabs */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                style={{
                  background: activeCategory === cat ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeCategory === cat ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                  color: activeCategory === cat ? '#9E7FFF' : '#8888aa',
                }}>
                {CATEGORY_ICONS[cat]}
                {cat}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {filteredItems.map(item => {
              const inCart = myCart.find(c => c.menuItemId === item.id)
              return (
                <div key={item.id}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
                  <div className="flex gap-3 p-3">
                    <img src={item.image} alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="font-bold text-gastro-text text-sm">{item.name}</h4>
                            {item.popular && <Star size={11} className="text-warning fill-warning flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gastro-subtle leading-relaxed line-clamp-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-lg"
                                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-gastro-text">${item.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRemoveItem(currentDinerId!, item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-black text-gastro-text w-5 text-center">{inCart.qty}</span>
                            <button
                              onClick={() => onAddItem(currentDinerId!, item)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => currentDinerId && onAddItem(currentDinerId, item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                            <Plus size={12} /> Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Send order CTA */}
          {myCart.length > 0 && (
            <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#2a2a3d' }}>
              <button
                onClick={() => setView('cart')}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)' }}>
                <ShoppingCart size={16} />
                Ver mi pedido · ${myTotal.toLocaleString()}
              </button>
            </div>
          )}
        </>
      )}

      {view === 'cart' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gastro-text">Mi pedido</h3>
              <button onClick={() => setView('menu')} className="text-xs text-primary-400 font-semibold">
                + Agregar más
              </button>
            </div>

            {myCart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={32} className="text-gastro-muted mx-auto mb-3" />
                <p className="text-gastro-subtle text-sm">Tu carrito está vacío</p>
                <button onClick={() => setView('menu')} className="mt-3 text-xs text-primary-400 font-semibold">
                  Ver menú →
                </button>
              </div>
            ) : (
              <>
                {myCart.map(item => (
                  <div key={item.menuItemId} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gastro-text">{item.name}</div>
                      <div className="text-xs text-gastro-subtle">${item.price.toLocaleString()} c/u</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onRemoveItem(currentDinerId!, item.menuItemId)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-black text-gastro-text w-5 text-center">{item.qty}</span>
                      <button onClick={() => {
                        const mi = MENU_ITEMS.find(m => m.id === item.menuItemId)
                        if (mi && currentDinerId) onAddItem(currentDinerId, mi)
                      }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-gastro-text w-16 text-right">
                      ${(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* All diners summary */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                  <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-2">Resumen de la mesa</p>
                  {session.diners.map(d => {
                    const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
                    return (
                      <div key={d.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{d.emoji}</span>
                          <span className="text-xs text-gastro-subtle">{d.name}</span>
                          {d.id === currentDinerId && <span className="text-xs text-primary-400">(vos)</span>}
                        </div>
                        <span className="text-xs font-semibold text-gastro-text">${dTotal.toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <div className="border-t mt-2 pt-2 flex items-center justify-between" style={{ borderColor: '#2a2a3d' }}>
                    <span className="text-xs font-bold text-gastro-text">Total mesa</span>
                    <span className="text-sm font-black text-primary-400">${sessionTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {myCart.length > 0 && (
            <div className="p-4 border-t space-y-2 flex-shrink-0" style={{ borderColor: '#2a2a3d' }}>
              {session.status === 'ordering' && (
                <button onClick={onSendOrder}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Send size={16} />
                  Enviar pedido a cocina
                </button>
              )}
              <button onClick={() => setView('payment')}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                <CreditCard size={16} />
                Pagar mi cuenta
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── QR Code Display ──────────────────────────────────────────────────────────

function QRCodeDisplay({ tableLabel, tableNumber }: { tableLabel: string; tableNumber: string }) {
  // SVG QR code simulation
  const size = 120
  const cells = 21
  const cellSize = size / cells
  // Deterministic pattern based on table number
  const seed = tableNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Finder patterns
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return true
      // Data modules (pseudo-random)
      return ((r * cells + c + seed) * 2654435761) % 4 < 2
    })
  )

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 rounded-xl bg-white">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {pattern.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`}
                  x={c * cellSize} y={r * cellSize}
                  width={cellSize} height={cellSize}
                  fill="#000" />
              ) : null
            )
          )}
        </svg>
      </div>
      <div className="text-xs text-gastro-subtle text-center">
        <div className="font-bold text-gastro-text">{tableLabel}</div>
        <div>Escanear para ordenar</div>
      </div>
    </div>
  )
}

// ─── Main GastroOrder Component ───────────────────────────────────────────────

export default function GastroOrder() {
  const [sessions, setSessions] = useState<TableSession[]>([
    {
      id: 's1', tableNumber: 'M2', tableLabel: 'Mesa 2', zone: 'Salón',
      status: 'ordering', totalDiners: 3,
      openedAt: '20:15',
      diners: [
        {
          id: 'd1', name: 'Martina', emoji: '👩', paid: false,
          cart: [
            { menuItemId: 'm4', name: 'Risotto de Hongos', price: 3200, qty: 1 },
            { menuItemId: 'm10', name: 'Limonada Artesanal', price: 850, qty: 1 },
          ]
        },
        {
          id: 'd2', name: 'Lucas', emoji: '👨', paid: false,
          cart: [
            { menuItemId: 'm5', name: 'Lomo a la Pimienta', price: 4800, qty: 1 },
            { menuItemId: 'm9', name: 'Vino Tinto Copa', price: 1200, qty: 2 },
          ]
        },
      ]
    },
    {
      id: 's2', tableNumber: 'M4', tableLabel: 'Mesa 4', zone: 'Terraza',
      status: 'sent', totalDiners: 2,
      openedAt: '20:30', sentAt: '20:35',
      diners: [
        {
          id: 'd3', name: 'Ana', emoji: '🧕', paid: false,
          cart: [{ menuItemId: 'm1', name: 'Burrata con Tomates', price: 1850, qty: 1 }]
        },
        {
          id: 'd4', name: 'Pedro', emoji: '🧔', paid: false,
          cart: [{ menuItemId: 'm6', name: 'Pasta Carbonara', price: 2900, qty: 1 }]
        },
      ]
    },
  ])

  const [activeView, setActiveView] = useState<'sessions' | 'qr' | 'kiosk'>('sessions')
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(null)
  const [kioskSession, setKioskSession] = useState<TableSession | null>(null)
  const [kioskDinerId, setKioskDinerId] = useState<string | null>(null)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionTable, setNewSessionTable] = useState(MOCK_TABLES[0])
  const [newSessionDiners, setNewSessionDiners] = useState(2)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const openKiosk = (session: TableSession) => {
    setKioskSession(session)
    setKioskDinerId(null)
    setActiveView('kiosk')
  }

  const handleJoinSession = (sessionId: string, name: string) => {
    const emoji = DINER_EMOJIS[Math.floor(Math.random() * DINER_EMOJIS.length)]
    const newDiner: Diner = { id: uid(), name, emoji, cart: [], paid: false }
    setSessions(prev => prev.map(s => s.id === sessionId
      ? { ...s, diners: [...s.diners, newDiner] }
      : s
    ))
    setKioskDinerId(newDiner.id)
    // Update kiosk session ref
    setKioskSession(prev => prev ? { ...prev, diners: [...prev.diners, newDiner] } : prev)
  }

  const handleAddItem = (sessionId: string, dinerId: string, item: MenuItem) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      return {
        ...s,
        diners: s.diners.map(d => {
          if (d.id !== dinerId) return d
          const existing = d.cart.find(c => c.menuItemId === item.id)
          if (existing) {
            return { ...d, cart: d.cart.map(c => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c) }
          }
          return { ...d, cart: [...d.cart, { menuItemId: item.id, name: item.name, price: item.price, qty: 1 }] }
        })
      }
    }))
    setKioskSession(prev => {
      if (!prev || prev.id !== sessionId) return prev
      return {
        ...prev,
        diners: prev.diners.map(d => {
          if (d.id !== dinerId) return d
          const existing = d.cart.find(c => c.menuItemId === item.id)
          if (existing) {
            return { ...d, cart: d.cart.map(c => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c) }
          }
          return { ...d, cart: [...d.cart, { menuItemId: item.id, name: item.name, price: item.price, qty: 1 }] }
        })
      }
    })
  }

  const handleRemoveItem = (sessionId: string, dinerId: string, itemId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      return {
        ...s,
        diners: s.diners.map(d => {
          if (d.id !== dinerId) return d
          const existing = d.cart.find(c => c.menuItemId === itemId)
          if (!existing) return d
          if (existing.qty <= 1) return { ...d, cart: d.cart.filter(c => c.menuItemId !== itemId) }
          return { ...d, cart: d.cart.map(c => c.menuItemId === itemId ? { ...c, qty: c.qty - 1 } : c) }
        })
      }
    }))
    setKioskSession(prev => {
      if (!prev || prev.id !== sessionId) return prev
      return {
        ...prev,
        diners: prev.diners.map(d => {
          if (d.id !== dinerId) return d
          const existing = d.cart.find(c => c.menuItemId === itemId)
          if (!existing) return d
          if (existing.qty <= 1) return { ...d, cart: d.cart.filter(c => c.menuItemId !== itemId) }
          return { ...d, cart: d.cart.map(c => c.menuItemId === itemId ? { ...c, qty: c.qty - 1 } : c) }
        })
      }
    })
  }

  const handleSendOrder = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'sent', sentAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) } : s))
  }

  const handleCloseSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const handleCreateSession = () => {
    const newSession: TableSession = {
      id: uid(),
      tableNumber: newSessionTable.number,
      tableLabel: newSessionTable.label,
      zone: newSessionTable.zone,
      status: 'ordering',
      totalDiners: newSessionDiners,
      openedAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      diners: [],
    }
    setSessions(prev => [...prev, newSession])
    setShowNewSession(false)
  }

  const STATUS_CONFIG_SESSION = {
    waiting: { label: 'Esperando', color: '#8888aa', bg: 'rgba(136,136,170,0.15)' },
    ordering: { label: 'Ordenando', color: '#9E7FFF', bg: 'rgba(158,127,255,0.15)' },
    sent: { label: 'En cocina', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
    paying: { label: 'Pagando', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    closed: { label: 'Cerrada', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  }

  const totalActive = sessions.filter(s => s.status !== 'closed').length
  const totalDiners = sessions.reduce((s, sess) => s + sess.diners.length, 0)
  const totalRevenue = sessions.reduce((s, sess) =>
    s + sess.diners.reduce((ss, d) => ss + d.cart.reduce((sss, i) => sss + i.price * i.qty, 0), 0), 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sesiones activas', value: totalActive, color: '#9E7FFF', icon: Wifi },
          { label: 'Comensales online', value: totalDiners, color: '#38bdf8', icon: Users },
          { label: 'Pedidos en curso', value: sessions.filter(s => s.status === 'sent').length, color: '#10b981', icon: UtensilsCrossed },
          { label: 'Total en mesa', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: '#f59e0b', icon: DollarSign },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'sessions', label: 'Sesiones activas' },
            { id: 'qr', label: 'QR por mesa' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNewSession(true)} className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Nueva sesión
        </button>
      </div>

      {/* Sessions view */}
      {activeView === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 && (
            <div className="card-gastro text-center py-16">
              <Wifi size={32} className="text-gastro-muted mx-auto mb-3" />
              <p className="text-gastro-subtle">No hay sesiones activas</p>
              <button onClick={() => setShowNewSession(true)} className="btn-primary text-sm px-4 py-2 mt-4">
                <Plus size={15} /> Abrir primera sesión
              </button>
            </div>
          )}

          {sessions.map(session => {
            const cfg = STATUS_CONFIG_SESSION[session.status]
            const sessionTotal = session.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0)
            const isExpanded = expandedSession === session.id

            return (
              <div key={session.id} className="card-gastro">
                {/* Session header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                      style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                      {session.tableNumber}
                    </div>
                    <div>
                      <div className="font-bold text-gastro-text">{session.tableLabel}</div>
                      <div className="text-xs text-gastro-subtle">{session.zone} · Abierta {session.openedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gastro-subtle">
                      <Users size={12} />
                      {session.diners.length}/{session.totalDiners}
                    </div>
                  </div>
                </div>

                {/* Diners */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {session.diners.map(diner => {
                    const dTotal = diner.cart.reduce((s, i) => s + i.price * i.qty, 0)
                    return (
                      <div key={diner.id}
                        className="p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
                        onClick={() => setExpandedSession(isExpanded && expandedSession === session.id ? null : session.id)}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{diner.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-gastro-text">{diner.name}</div>
                            <div className="text-xs text-gastro-subtle">{diner.cart.length} items</div>
                          </div>
                        </div>
                        <div className="text-sm font-black" style={{ color: dTotal > 0 ? '#9E7FFF' : '#8888aa' }}>
                          ${dTotal.toLocaleString()}
                        </div>
                        {diner.paid && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle size={10} className="text-success" />
                            <span className="text-xs text-success">Pagado</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {/* Waiting slots */}
                  {Array.from({ length: Math.max(0, session.totalDiners - session.diners.length) }).map((_, i) => (
                    <div key={`empty-${i}`}
                      className="p-3 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed #2a2a3d' }}>
                      <div className="text-center">
                        <div className="text-lg text-gastro-muted">👤</div>
                        <div className="text-xs text-gastro-muted">Esperando...</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mb-4 p-4 rounded-xl space-y-3 animate-slide-down"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                    <p className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Detalle por comensal</p>
                    {session.diners.map(diner => (
                      <div key={diner.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>{diner.emoji}</span>
                          <span className="text-sm font-bold text-gastro-text">{diner.name}</span>
                        </div>
                        {diner.cart.length === 0 ? (
                          <p className="text-xs text-gastro-muted pl-6">Sin pedidos aún</p>
                        ) : (
                          <div className="pl-6 space-y-1">
                            {diner.cart.map(item => (
                              <div key={item.menuItemId} className="flex items-center justify-between text-xs">
                                <span className="text-gastro-subtle">{item.qty}x {item.name}</span>
                                <span className="text-gastro-text font-semibold">${(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="border-t pt-2 flex items-center justify-between" style={{ borderColor: '#2a2a3d' }}>
                      <span className="text-xs font-bold text-gastro-text">Total mesa</span>
                      <span className="text-sm font-black text-primary-400">${sessionTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#2a2a3d' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gastro-text">${sessionTotal.toLocaleString()}</span>
                    <span className="text-xs text-gastro-subtle">total</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openKiosk(session)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                      <Smartphone size={13} /> Kiosco
                    </button>
                    {session.status === 'ordering' && (
                      <button
                        onClick={() => handleSendOrder(session.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                        <Send size={13} /> Enviar a cocina
                      </button>
                    )}
                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      <RotateCcw size={13} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* QR view */}
      {activeView === 'qr' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_TABLES.map(table => {
            const activeSession = sessions.find(s => s.tableNumber === table.number && s.status !== 'closed')
            return (
              <div key={table.number} className="card-gastro">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gastro-text">{table.label}</h3>
                    <p className="text-xs text-gastro-subtle">{table.zone}</p>
                  </div>
                  {activeSession ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                      Sesión activa
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                      Disponible
                    </span>
                  )}
                </div>

                <div className="flex justify-center mb-4">
                  <QRCodeDisplay tableLabel={table.label} tableNumber={table.number} />
                </div>

                {activeSession && (
                  <div className="p-2.5 rounded-xl mb-3 text-xs"
                    style={{ background: 'rgba(158,127,255,0.08)', border: '1px solid rgba(158,127,255,0.2)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-gastro-subtle">Comensales</span>
                      <span className="font-bold text-gastro-text">{activeSession.diners.length}/{activeSession.totalDiners}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gastro-subtle">Total</span>
                      <span className="font-bold text-primary-400">
                        ${activeSession.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (activeSession) {
                        openKiosk(activeSession)
                      } else {
                        const newSession: TableSession = {
                          id: uid(), tableNumber: table.number, tableLabel: table.label,
                          zone: table.zone, status: 'ordering', totalDiners: 2,
                          openedAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                          diners: [],
                        }
                        setSessions(prev => [...prev, newSession])
                        openKiosk(newSession)
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                    <Smartphone size={13} /> Simular QR
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
                    <QrCode size={13} /> Imprimir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New session modal */}
      {showNewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gastro-text">Nueva sesión de mesa</h3>
              <button onClick={() => setShowNewSession(false)} className="text-gastro-muted hover:text-gastro-text"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">Mesa</label>
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_TABLES.map(t => (
                    <button key={t.number}
                      onClick={() => setNewSessionTable(t)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: newSessionTable.number === t.number ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${newSessionTable.number === t.number ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                        color: newSessionTable.number === t.number ? '#9E7FFF' : '#8888aa',
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  Cantidad de comensales
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNewSessionDiners(d => Math.max(1, d - 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center btn-secondary">
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-black text-gastro-text w-12 text-center">{newSessionDiners}</span>
                  <button onClick={() => setNewSessionDiners(d => Math.min(12, d + 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center btn-secondary">
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-xs text-gastro-subtle mt-2">
                  El primer comensal en escanear el QR abre la sesión. Los demás se acoplan automáticamente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewSession(false)} className="btn-secondary flex-1 justify-center py-2.5">
                Cancelar
              </button>
              <button onClick={handleCreateSession} className="btn-primary flex-1 justify-center py-2.5">
                <Zap size={15} /> Abrir sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kiosk overlay */}
      {activeView === 'kiosk' && kioskSession && (
        <KioskView
          session={kioskSession}
          currentDinerId={kioskDinerId}
          onJoin={(name) => handleJoinSession(kioskSession.id, name)}
          onAddItem={(dinerId, item) => handleAddItem(kioskSession.id, dinerId, item)}
          onRemoveItem={(dinerId, itemId) => handleRemoveItem(kioskSession.id, dinerId, itemId)}
          onSendOrder={() => handleSendOrder(kioskSession.id)}
          onClose={() => {
            setActiveView('sessions')
            setKioskSession(null)
            setKioskDinerId(null)
          }}
        />
      )}
    </div>
  )
}
