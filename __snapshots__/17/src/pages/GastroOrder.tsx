import { useState, useEffect } from 'react'
import {
  QrCode, Users, ShoppingCart, CreditCard, CheckCircle, Clock,
  Plus, Minus, ChevronRight, Smartphone, Zap, X,
  SplitSquareHorizontal, User, ArrowRight, RotateCcw, Wifi,
  UtensilsCrossed, Wine, Cake, Salad, Pizza, Star,
  DollarSign, Send, UserPlus, Receipt, AlertCircle
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
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  qty: number
}

interface Diner {
  id: string
  name: string
  emoji: string
  cart: CartItem[]
  paid: boolean
  paymentMethod?: string
  joinedAt: string
}

interface TableSession {
  id: string
  tableNumber: string
  tableLabel: string
  zone: string
  // status: ordering = abierta y tomando pedidos
  //         sent     = enviada a cocina (puede seguir agregando)
  //         paying   = al menos un pago registrado
  //         closed   = todos pagaron → se resetea
  status: 'ordering' | 'sent' | 'paying' | 'closed'
  diners: Diner[]
  tableCapacity: number   // capacidad física de la mesa (referencial)
  openedAt: string
  sentAt?: string
  openedByFirstScan: boolean  // true = abierta automáticamente por primer QR scan
}

interface TableConfig {
  number: string
  label: string
  zone: string
  capacity: number
}

// ─── Mock Menu ────────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Burrata con Tomates', description: 'Burrata fresca, tomates cherry asados, albahaca y aceite de oliva extra virgen', price: 1850, category: 'Entradas', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400', tags: ['vegetariano'], popular: true },
  { id: 'm2', name: 'Ceviche Clásico', description: 'Corvina marinada en limón, cebolla morada, ají amarillo y choclo', price: 2200, category: 'Entradas', image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400', tags: ['sin gluten'] },
  { id: 'm3', name: 'Tabla de Embutidos', description: 'Selección de jamones ibéricos, quesos curados y encurtidos artesanales', price: 3400, category: 'Entradas', image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?w=400', tags: ['para compartir'] },
  { id: 'm4', name: 'Risotto de Hongos', description: 'Arroz arbóreo, mix de hongos silvestres, parmesano 24 meses y trufa negra', price: 3200, category: 'Principales', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400', tags: ['vegetariano'], popular: true },
  { id: 'm5', name: 'Lomo a la Pimienta', description: 'Lomo de res 300g, salsa de pimienta verde, papas rosti y espárragos', price: 4800, category: 'Principales', image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?w=400', tags: ['sin gluten'] },
  { id: 'm6', name: 'Pasta Carbonara', description: 'Spaghetti artesanal, guanciale, yema de huevo, pecorino y pimienta negra', price: 2900, category: 'Principales', image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400', tags: [] },
  { id: 'm7', name: 'Salmón Grillado', description: 'Salmón atlántico, quinoa tricolor, salsa de maracuyá y vegetales de estación', price: 4200, category: 'Principales', image: 'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?w=400', tags: ['sin gluten', 'saludable'] },
  { id: 'm8', name: 'Agua Mineral', description: 'Agua mineral sin gas o con gas 500ml', price: 450, category: 'Bebidas', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?w=400', tags: [] },
  { id: 'm9', name: 'Vino Tinto Copa', description: 'Malbec Reserva, Mendoza. Copa 150ml', price: 1200, category: 'Bebidas', image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?w=400', tags: [] },
  { id: 'm10', name: 'Limonada Artesanal', description: 'Limón exprimido, menta fresca, jengibre y agua con gas', price: 850, category: 'Bebidas', image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?w=400', tags: ['sin alcohol'], popular: true },
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

const DINER_EMOJIS = ['🧑', '👩', '👨', '🧔', '👱', '🧕', '👴', '👵', '🧒', '👦', '🧑‍🦱', '🧑‍🦰']

const MOCK_TABLES: TableConfig[] = [
  { number: 'M1', label: 'Mesa 1', zone: 'Salón', capacity: 4 },
  { number: 'M2', label: 'Mesa 2', zone: 'Salón', capacity: 2 },
  { number: 'M3', label: 'Mesa 3', zone: 'Salón', capacity: 6 },
  { number: 'M4', label: 'Mesa 4', zone: 'Terraza', capacity: 4 },
  { number: 'M5', label: 'Mesa 5', zone: 'Terraza', capacity: 4 },
  { number: 'VIP', label: 'VIP', zone: 'VIP', capacity: 8 },
]

function uid() { return Math.random().toString(36).slice(2, 9) }
function nowTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crea una sesión nueva automáticamente (primer scan del QR) */
function createAutoSession(table: TableConfig): TableSession {
  return {
    id: uid(),
    tableNumber: table.number,
    tableLabel: table.label,
    zone: table.zone,
    status: 'ordering',
    diners: [],
    tableCapacity: table.capacity,
    openedAt: nowTime(),
    openedByFirstScan: true,
  }
}

/** Etiqueta del contador de comensales: "X de Y" donde Y es capacidad referencial */
function dinerCountLabel(diners: number, capacity: number): string {
  return `${diners} de ${capacity}`
}

// ─── QR Code SVG ─────────────────────────────────────────────────────────────

function QRCodeDisplay({ tableLabel, tableNumber, size = 120 }: {
  tableLabel: string; tableNumber: string; size?: number
}) {
  const cells = 21
  const cellSize = size / cells
  const seed = tableNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return true
      return ((r * cells + c + seed) * 2654435761) % 4 < 2
    })
  )
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 rounded-xl bg-white shadow-lg">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {pattern.map((row, r) =>
            row.map((filled, c) =>
              filled ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#000" /> : null
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

// ─── Kiosk View ───────────────────────────────────────────────────────────────

function KioskView({
  session,
  currentDinerId,
  onJoin,
  onAddItem,
  onRemoveItem,
  onSendOrder,
  onRegisterPayment,
  onClose,
}: {
  session: TableSession
  currentDinerId: string | null
  onJoin: (name: string) => void
  onAddItem: (dinerId: string, item: MenuItem) => void
  onRemoveItem: (dinerId: string, itemId: string) => void
  onSendOrder: () => void
  onRegisterPayment: (dinerIds: string[], method: string) => void
  onClose: () => void
}) {
  const [view, setView] = useState<'join' | 'menu' | 'cart' | 'payment'>('join')
  const [joinName, setJoinName] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [paymentStep, setPaymentStep] = useState<'split' | 'method' | 'processing' | 'done'>('split')
  const [splitMode, setSplitMode] = useState<'individual' | 'equal' | 'custom'>('individual')
  const [selectedPayers, setSelectedPayers] = useState<string[]>([])

  const currentDiner = session.diners.find(d => d.id === currentDinerId)
  const myCart = currentDiner?.cart ?? []
  const myTotal = myCart.reduce((s, i) => s + i.price * i.qty, 0)
  const sessionTotal = session.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0)
  const unpaidDiners = session.diners.filter(d => !d.paid)
  const equalSplit = unpaidDiners.length > 0 ? Math.round(
    unpaidDiners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0) / unpaidDiners.length
  ) : 0

  const filteredItems = MENU_ITEMS.filter(i => activeCategory === 'Todos' || i.category === activeCategory)

  useEffect(() => {
    if (currentDinerId && view === 'join') setView('menu')
  }, [currentDinerId, view])

  // ── Join screen ──────────────────────────────────────────────────────────
  if (view === 'join') {
    const isFirstDiner = session.diners.length === 0
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }}>
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
          {/* Hero */}
          <div className="p-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.25), rgba(56,189,248,0.12))' }}>
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #9E7FFF 0%, transparent 60%), radial-gradient(circle at 70% 50%, #38bdf8 0%, transparent 60%)' }} />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 relative"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)', boxShadow: '0 8px 32px rgba(158,127,255,0.4)' }}>
              <QrCode size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">{session.tableLabel}</h2>
            <p className="text-sm" style={{ color: '#a0a0c0' }}>{session.zone} · Osteria Moderna</p>
          </div>

          <div className="p-6">
            {/* Live diner count */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-5"
              style={{ background: 'rgba(158,127,255,0.08)', border: '1px solid rgba(158,127,255,0.2)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold text-gastro-text">
                  {isFirstDiner
                    ? 'Sé el primero en unirte'
                    : `${dinerCountLabel(session.diners.length, session.tableCapacity)} en la mesa`}
                </span>
              </div>
              {session.diners.length > 0 && (
                <div className="flex -space-x-1">
                  {session.diners.slice(0, 5).map(d => (
                    <div key={d.id} className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: '#2a2a3d', border: '2px solid #1a1a26' }}>
                      {d.emoji}
                    </div>
                  ))}
                  {session.diners.length > 5 && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#9E7FFF22', border: '2px solid #1a1a26', color: '#9E7FFF' }}>
                      +{session.diners.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isFirstDiner && (
              <div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <AlertCircle size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: '#7dd3fc' }}>
                  Sos el primero en escanear. La sesión se abre automáticamente. Los demás pueden unirse escaneando el mismo QR.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#8888aa' }}>
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
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.35)' }}>
              <UserPlus size={16} />
              {isFirstDiner ? 'Abrir mesa y ordenar' : 'Unirme a la mesa'}
            </button>

            <p className="text-xs text-center mt-3" style={{ color: '#6666aa' }}>
              Podés ordenar, pagar tu parte y ver el resumen de la mesa
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment screen ───────────────────────────────────────────────────────
  if (view === 'payment') {
    const payingDiners = splitMode === 'individual'
      ? session.diners.filter(d => d.id === currentDinerId)
      : splitMode === 'equal'
      ? unpaidDiners
      : session.diners.filter(d => selectedPayers.includes(d.id))

    const amountToPay = splitMode === 'individual'
      ? myTotal
      : splitMode === 'equal'
      ? equalSplit
      : payingDiners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0)

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d18' }}>
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: '#2a2a3d' }}>
          <button onClick={() => { setView('cart'); setPaymentStep('split') }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2a3d' }}>
            <ChevronRight size={16} className="rotate-180 text-gastro-subtle" />
          </button>
          <h2 className="font-bold text-gastro-text">Pagar cuenta</h2>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Total badge */}
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.12), rgba(56,189,248,0.08))', border: '1px solid rgba(158,127,255,0.2)' }}>
            <div className="text-xs mb-1" style={{ color: '#8888aa' }}>Total de la mesa</div>
            <div className="text-3xl font-black text-white">${sessionTotal.toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: '#8888aa' }}>
              {dinerCountLabel(session.diners.length, session.tableCapacity)} comensales
            </div>
          </div>

          {paymentStep === 'split' && (
            <>
              {/* Split mode selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>¿Cómo querés pagar?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'individual', label: 'Solo mi pedido', icon: User },
                    { id: 'equal', label: 'Partes iguales', icon: SplitSquareHorizontal },
                    { id: 'custom', label: 'Elegir quién', icon: Users },
                  ].map(({ id, label, icon: Icon }) => (
                    <button key={id}
                      onClick={() => { setSplitMode(id as typeof splitMode); setSelectedPayers([]) }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: splitMode === id ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${splitMode === id ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                        color: splitMode === id ? '#9E7FFF' : '#8888aa',
                      }}>
                      <Icon size={16} />
                      <span className="text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              {splitMode === 'individual' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>Tu pedido</p>
                  {myCart.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: '#6666aa' }}>No tenés items en tu pedido</p>
                  ) : (
                    <>
                      {myCart.map(item => (
                        <div key={item.menuItemId} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-sm text-gastro-text">{item.qty}x {item.name}</span>
                          <span className="text-sm font-bold text-gastro-text">${(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-3 rounded-xl font-bold"
                        style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.2)' }}>
                        <span className="text-sm text-gastro-text">Total a pagar</span>
                        <span className="text-lg text-primary-400">${myTotal.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {splitMode === 'equal' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>División igualitaria</p>
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
                    Total pendiente ÷ {unpaidDiners.length} comensales sin pagar = <strong>${equalSplit.toLocaleString()} c/u</strong>
                  </div>
                  {session.diners.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: d.id === currentDinerId ? 'rgba(158,127,255,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${d.id === currentDinerId ? 'rgba(158,127,255,0.3)' : 'transparent'}`,
                      }}>
                      <div className="flex items-center gap-2">
                        <span>{d.emoji}</span>
                        <span className="text-sm text-gastro-text">{d.name}</span>
                        {d.id === currentDinerId && <span className="text-xs text-primary-400">(vos)</span>}
                        {d.paid && <span className="text-xs text-success">✓ pagado</span>}
                      </div>
                      <span className="text-sm font-bold" style={{ color: d.paid ? '#10b981' : '#e8e8f0' }}>
                        {d.paid ? '—' : `$${equalSplit.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {splitMode === 'custom' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>Seleccioná quién paga ahora</p>
                  {session.diners.filter(d => !d.paid).map(d => {
                    const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
                    const isSelected = selectedPayers.includes(d.id)
                    return (
                      <button key={d.id}
                        onClick={() => setSelectedPayers(prev =>
                          isSelected ? prev.filter(id => id !== d.id) : [...prev, d.id]
                        )}
                        className="w-full p-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? 'rgba(158,127,255,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                        }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: isSelected ? '#9E7FFF' : 'rgba(255,255,255,0.08)', border: `1px solid ${isSelected ? '#9E7FFF' : '#3a3a52'}` }}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span>{d.emoji}</span>
                            <span className="text-sm font-semibold text-gastro-text">{d.name}</span>
                            {d.id === currentDinerId && <span className="text-xs text-primary-400">(vos)</span>}
                          </div>
                          <span className="text-sm font-bold text-gastro-text">${dTotal.toLocaleString()}</span>
                        </div>
                        <div className="pl-10 space-y-0.5">
                          {d.cart.map(item => (
                            <div key={item.menuItemId} className="flex items-center justify-between text-xs" style={{ color: '#8888aa' }}>
                              <span>{item.qty}x {item.name}</span>
                              <span>${(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                  {selectedPayers.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl font-bold"
                      style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.2)' }}>
                      <span className="text-sm text-gastro-text">Subtotal seleccionados</span>
                      <span className="text-lg text-primary-400">
                        ${session.diners.filter(d => selectedPayers.includes(d.id))
                          .reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setPaymentStep('method')}
                disabled={splitMode === 'custom' && selectedPayers.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.3)' }}>
                <CreditCard size={16} />
                Continuar al pago · ${amountToPay.toLocaleString()}
              </button>
            </>
          )}

          {paymentStep === 'method' && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>Método de pago</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setPaymentStep('processing')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all"
                    style={{ background: 'linear-gradient(135deg, rgba(0,100,200,0.2), rgba(0,60,150,0.15))', border: '1px solid rgba(0,100,200,0.4)', color: '#60a5fa' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0064c8, #003c96)' }}>W+</div>
                    <div className="flex-1 text-left">
                      <div className="font-bold">WebpayPlus</div>
                      <div className="text-xs opacity-70">Tarjeta débito / crédito / prepago</div>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => {
                      onRegisterPayment(
                        splitMode === 'individual' ? [currentDinerId!]
                          : splitMode === 'equal' ? unpaidDiners.map(d => d.id)
                          : selectedPayers,
                        'caja'
                      )
                      setPaymentStep('done')
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Receipt size={16} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-gastro-text">Pagar en caja</div>
                      <div className="text-xs">Efectivo o tarjeta al mozo</div>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse"
                style={{ background: 'rgba(158,127,255,0.15)', border: '2px solid rgba(158,127,255,0.3)' }}>
                <CreditCard size={28} className="text-primary-400" />
              </div>
              <p className="font-bold text-gastro-text mb-2">Procesando pago...</p>
              <p className="text-xs mb-6" style={{ color: '#8888aa' }}>Redirigiendo a WebpayPlus</p>
              <button
                onClick={() => {
                  onRegisterPayment(
                    splitMode === 'individual' ? [currentDinerId!]
                      : splitMode === 'equal' ? unpaidDiners.map(d => d.id)
                      : selectedPayers,
                    'webpay'
                  )
                  setPaymentStep('done')
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                ✓ Simular pago exitoso
              </button>
            </div>
          )}

          {paymentStep === 'done' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.35)' }}>
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="font-black text-2xl text-gastro-text mb-2">¡Pago registrado!</p>
              <p className="text-sm mb-1" style={{ color: '#8888aa' }}>Tu boleta fue enviada por email</p>
              <p className="text-xs mb-6" style={{ color: '#6666aa' }}>
                {session.diners.filter(d => d.paid).length + payingDiners.length} de {session.diners.length} comensales pagaron
              </p>
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

  // ── Menu / Cart screens ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d18' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#2a2a3d', background: '#0d0d18' }}>
        <div>
          <div className="font-bold text-gastro-text text-sm">{session.tableLabel}</div>
          <div className="text-xs" style={{ color: '#8888aa' }}>
            {currentDiner?.emoji} {currentDiner?.name}
            <span className="ml-2 opacity-60">· {dinerCountLabel(session.diners.length, session.tableCapacity)} en mesa</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === 'menu' && (
            <button onClick={() => setView('cart')}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
              <ShoppingCart size={14} />
              {myCart.reduce((s, i) => s + i.qty, 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-black"
                  style={{ background: '#9E7FFF', fontSize: '9px' }}>
                  {myCart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
              ${myTotal.toLocaleString()}
            </button>
          )}
          {view === 'cart' && (
            <button onClick={() => setView('menu')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
              <ChevronRight size={14} className="rotate-180" /> Menú
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: '1px solid #2a2a3d' }}>
            <X size={16} className="text-gastro-subtle" />
          </button>
        </div>
      </div>

      {/* Diners strip */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto flex-shrink-0 scrollbar-none"
        style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid #2a2a3d' }}>
        {session.diners.map(d => {
          const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
          const isMe = d.id === currentDinerId
          return (
            <div key={d.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl flex-shrink-0 text-xs"
              style={{
                background: isMe ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isMe ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
                color: isMe ? '#9E7FFF' : '#8888aa',
              }}>
              <span>{d.emoji}</span>
              <span className="font-semibold">{d.name.split(' ')[0]}</span>
              {dTotal > 0 && <span className="opacity-60">${dTotal.toLocaleString()}</span>}
              {d.paid && <span className="text-success text-xs">✓</span>}
            </div>
          )
        })}
        {/* Capacity indicator */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl flex-shrink-0 text-xs"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3d', color: '#6666aa' }}>
          <Users size={11} />
          <span>{dinerCountLabel(session.diners.length, session.tableCapacity)}</span>
        </div>
      </div>

      {/* Menu view */}
      {view === 'menu' && (
        <>
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
                {CATEGORY_ICONS[cat]}{cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {filteredItems.map(item => {
              const inCart = myCart.find(c => c.menuItemId === item.id)
              return (
                <div key={item.id} className="rounded-2xl overflow-hidden"
                  style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
                  <div className="flex gap-3 p-3">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="font-bold text-gastro-text text-sm truncate">{item.name}</h4>
                            {item.popular && <Star size={11} className="text-warning fill-warning flex-shrink-0" />}
                          </div>
                          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#8888aa' }}>{item.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-lg"
                                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="font-black text-gastro-text flex-shrink-0">${item.price.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => onRemoveItem(currentDinerId!, item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-black text-gastro-text w-5 text-center">{inCart.qty}</span>
                            <button onClick={() => onAddItem(currentDinerId!, item)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => currentDinerId && onAddItem(currentDinerId, item)}
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

          {myCart.length > 0 && (
            <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#2a2a3d' }}>
              <button onClick={() => setView('cart')}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.3)' }}>
                <ShoppingCart size={16} />
                Ver mi pedido · ${myTotal.toLocaleString()}
              </button>
            </div>
          )}
        </>
      )}

      {/* Cart view */}
      {view === 'cart' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gastro-text">Mi pedido</h3>
              <button onClick={() => setView('menu')} className="text-xs font-semibold" style={{ color: '#9E7FFF' }}>
                + Agregar más
              </button>
            </div>

            {myCart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={32} className="mx-auto mb-3" style={{ color: '#4a4a6a' }} />
                <p className="text-sm" style={{ color: '#8888aa' }}>Tu carrito está vacío</p>
                <button onClick={() => setView('menu')} className="mt-3 text-xs font-semibold" style={{ color: '#9E7FFF' }}>
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
                      <div className="text-xs" style={{ color: '#8888aa' }}>${item.price.toLocaleString()} c/u</div>
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
              </>
            )}

            {/* Mesa summary */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>Resumen de la mesa</p>
                <span className="text-xs" style={{ color: '#6666aa' }}>
                  {dinerCountLabel(session.diners.length, session.tableCapacity)}
                </span>
              </div>
              {session.diners.map(d => {
                const dTotal = d.cart.reduce((s, i) => s + i.price * i.qty, 0)
                return (
                  <div key={d.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{d.emoji}</span>
                      <span className="text-xs" style={{ color: '#8888aa' }}>{d.name}</span>
                      {d.id === currentDinerId && <span className="text-xs text-primary-400">(vos)</span>}
                      {d.paid && <span className="text-xs text-success">✓</span>}
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
          </div>

          {myCart.length > 0 && (
            <div className="p-4 border-t space-y-2 flex-shrink-0" style={{ borderColor: '#2a2a3d' }}>
              {(session.status === 'ordering') && (
                <button onClick={onSendOrder}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
                  <Send size={16} />
                  Enviar pedido a cocina
                </button>
              )}
              {session.status === 'sent' && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold"
                  style={{ color: '#38bdf8' }}>
                  <Clock size={13} />
                  Pedido enviado a cocina · podés seguir agregando
                </div>
              )}
              <button onClick={() => { setView('payment'); setPaymentStep('split') }}
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

// ─── Main GastroOrder ─────────────────────────────────────────────────────────

export default function GastroOrder() {
  const [sessions, setSessions] = useState<TableSession[]>([
    {
      id: 's1', tableNumber: 'M2', tableLabel: 'Mesa 2', zone: 'Salón',
      status: 'ordering', tableCapacity: 2, openedAt: '20:15', openedByFirstScan: true,
      diners: [
        { id: 'd1', name: 'Martina', emoji: '👩', paid: false, joinedAt: '20:15',
          cart: [
            { menuItemId: 'm4', name: 'Risotto de Hongos', price: 3200, qty: 1 },
            { menuItemId: 'm10', name: 'Limonada Artesanal', price: 850, qty: 1 },
          ]
        },
        { id: 'd2', name: 'Lucas', emoji: '👨', paid: false, joinedAt: '20:16',
          cart: [
            { menuItemId: 'm5', name: 'Lomo a la Pimienta', price: 4800, qty: 1 },
            { menuItemId: 'm9', name: 'Vino Tinto Copa', price: 1200, qty: 2 },
          ]
        },
        // Mesa de 2 con 3 comensales — válido, capacidad es referencial
        { id: 'd3', name: 'Sofía', emoji: '👱', paid: false, joinedAt: '20:22',
          cart: [
            { menuItemId: 'm10', name: 'Limonada Artesanal', price: 850, qty: 1 },
          ]
        },
      ]
    },
    {
      id: 's2', tableNumber: 'M4', tableLabel: 'Mesa 4', zone: 'Terraza',
      status: 'sent', tableCapacity: 4, openedAt: '20:30', sentAt: '20:35', openedByFirstScan: true,
      diners: [
        { id: 'd4', name: 'Ana', emoji: '🧕', paid: false, joinedAt: '20:30',
          cart: [{ menuItemId: 'm1', name: 'Burrata con Tomates', price: 1850, qty: 1 }]
        },
        { id: 'd5', name: 'Pedro', emoji: '🧔', paid: false, joinedAt: '20:31',
          cart: [{ menuItemId: 'm6', name: 'Pasta Carbonara', price: 2900, qty: 1 }]
        },
      ]
    },
  ])

  const [activeView, setActiveView] = useState<'sessions' | 'qr'>('sessions')
  const [kioskSession, setKioskSession] = useState<TableSession | null>(null)
  const [kioskDinerId, setKioskDinerId] = useState<string | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // ── Session helpers ────────────────────────────────────────────────────────

  /** Simula el scan del QR: si no hay sesión activa, la crea automáticamente */
  const handleQRScan = (table: TableConfig) => {
    const existing = sessions.find(s => s.tableNumber === table.number && s.status !== 'closed')
    if (existing) {
      setKioskSession(existing)
      setKioskDinerId(null)
      setActiveView('sessions')
    } else {
      const newSession = createAutoSession(table)
      setSessions(prev => [...prev, newSession])
      setKioskSession(newSession)
      setKioskDinerId(null)
    }
  }

  const handleJoin = (sessionId: string, name: string) => {
    const emoji = DINER_EMOJIS[Math.floor(Math.random() * DINER_EMOJIS.length)]
    const newDiner: Diner = { id: uid(), name, emoji, cart: [], paid: false, joinedAt: nowTime() }

    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, diners: [...s.diners, newDiner] } : s
    ))
    setKioskDinerId(newDiner.id)
    setKioskSession(prev => prev ? { ...prev, diners: [...prev.diners, newDiner] } : prev)
  }

  const handleAddItem = (sessionId: string, dinerId: string, item: MenuItem) => {
    const updater = (s: TableSession): TableSession => ({
      ...s,
      diners: s.diners.map(d => {
        if (d.id !== dinerId) return d
        const existing = d.cart.find(c => c.menuItemId === item.id)
        if (existing) return { ...d, cart: d.cart.map(c => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c) }
        return { ...d, cart: [...d.cart, { menuItemId: item.id, name: item.name, price: item.price, qty: 1 }] }
      })
    })
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s))
    setKioskSession(prev => prev?.id === sessionId ? updater(prev) : prev)
  }

  const handleRemoveItem = (sessionId: string, dinerId: string, itemId: string) => {
    const updater = (s: TableSession): TableSession => ({
      ...s,
      diners: s.diners.map(d => {
        if (d.id !== dinerId) return d
        const existing = d.cart.find(c => c.menuItemId === itemId)
        if (!existing) return d
        if (existing.qty <= 1) return { ...d, cart: d.cart.filter(c => c.menuItemId !== itemId) }
        return { ...d, cart: d.cart.map(c => c.menuItemId === itemId ? { ...c, qty: c.qty - 1 } : c) }
      })
    })
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s))
    setKioskSession(prev => prev?.id === sessionId ? updater(prev) : prev)
  }

  const handleSendOrder = (sessionId: string) => {
    const updater = (s: TableSession): TableSession => ({
      ...s, status: 'sent', sentAt: nowTime()
    })
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s))
    setKioskSession(prev => prev?.id === sessionId ? updater(prev) : prev)
  }

  /**
   * Registra el pago de uno o más comensales.
   * Si TODOS los comensales pagaron → cierra la sesión automáticamente.
   */
  const handleRegisterPayment = (sessionId: string, dinerIds: string[], method: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const updatedDiners = s.diners.map(d =>
        dinerIds.includes(d.id) ? { ...d, paid: true, paymentMethod: method } : d
      )
      const allPaid = updatedDiners.every(d => d.paid)
      return {
        ...s,
        diners: updatedDiners,
        status: allPaid ? 'closed' : 'paying',
      }
    }))
    // Si todos pagaron, cerrar kiosco
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      const remaining = session.diners.filter(d => !dinerIds.includes(d.id) && !d.paid)
      if (remaining.length === 0) {
        setTimeout(() => {
          setSessions(prev => prev.filter(s => s.id !== sessionId))
          setKioskSession(null)
          setKioskDinerId(null)
        }, 2000)
      }
    }
  }

  const handleForceClose = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (kioskSession?.id === sessionId) {
      setKioskSession(null)
      setKioskDinerId(null)
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const activeSessions = sessions.filter(s => s.status !== 'closed')
  const totalDiners = activeSessions.reduce((s, sess) => s + sess.diners.length, 0)
  const totalRevenue = activeSessions.reduce((s, sess) =>
    s + sess.diners.reduce((ss, d) => ss + d.cart.reduce((sss, i) => sss + i.price * i.qty, 0), 0), 0)

  const STATUS_CFG = {
    ordering: { label: 'Ordenando', color: '#9E7FFF', bg: 'rgba(158,127,255,0.15)' },
    sent:     { label: 'En cocina', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
    paying:   { label: 'Pagando',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    closed:   { label: 'Cerrada',   color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sesiones activas', value: activeSessions.length, color: '#9E7FFF', icon: Wifi },
          { label: 'Comensales online', value: totalDiners, color: '#38bdf8', icon: Users },
          { label: 'En cocina', value: activeSessions.filter(s => s.status === 'sent').length, color: '#10b981', icon: UtensilsCrossed },
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'sessions', label: 'Sesiones activas' },
            { id: 'qr', label: 'QR por mesa' },
          ].map(v => (
            <button key={v.id}
              onClick={() => setActiveView(v.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === v.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === v.id
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              {v.label}
            </button>
          ))}
        </div>
        {/* Info pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
          style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
          <QrCode size={12} />
          Sesiones se abren automáticamente al primer scan
        </div>
      </div>

      {/* Sessions view */}
      {activeView === 'sessions' && (
        <div className="space-y-4">
          {activeSessions.length === 0 && (
            <div className="card-gastro text-center py-16">
              <Wifi size={32} className="mx-auto mb-3" style={{ color: '#4a4a6a' }} />
              <p className="text-gastro-subtle mb-2">No hay sesiones activas</p>
              <p className="text-xs mb-4" style={{ color: '#6666aa' }}>
                Las sesiones se abren automáticamente cuando un comensal escanea el QR de la mesa
              </p>
              <button onClick={() => setActiveView('qr')}
                className="btn-primary text-sm px-4 py-2">
                <QrCode size={15} /> Ver QR por mesa
              </button>
            </div>
          )}

          {activeSessions.map(session => {
            const cfg = STATUS_CFG[session.status]
            const sessionTotal = session.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0)
            const isExpanded = expandedSession === session.id
            const overCapacity = session.diners.length > session.tableCapacity

            return (
              <div key={session.id} className="card-gastro">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                      style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                      {session.tableNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gastro-text">{session.tableLabel}</div>
                        {session.openedByFirstScan && (
                          <span className="text-xs px-1.5 py-0.5 rounded-lg"
                            style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px' }}>
                            Auto-QR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gastro-subtle">{session.zone} · Abierta {session.openedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {/* Diner count — shows real vs capacity */}
                    <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{
                        background: overCapacity ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${overCapacity ? 'rgba(245,158,11,0.3)' : '#2a2a3d'}`,
                        color: overCapacity ? '#f59e0b' : '#8888aa',
                      }}>
                      <Users size={11} />
                      {dinerCountLabel(session.diners.length, session.tableCapacity)}
                      {overCapacity && <span className="ml-0.5">↑</span>}
                    </div>
                  </div>
                </div>

                {/* Diners grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-4">
                  {session.diners.map(diner => {
                    const dTotal = diner.cart.reduce((s, i) => s + i.price * i.qty, 0)
                    return (
                      <button key={diner.id}
                        className="p-3 rounded-xl text-left transition-all hover:bg-white/5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{diner.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gastro-text truncate">{diner.name}</div>
                            <div className="text-xs" style={{ color: '#8888aa' }}>{diner.cart.length} items</div>
                          </div>
                        </div>
                        <div className="text-sm font-black" style={{ color: dTotal > 0 ? '#9E7FFF' : '#4a4a6a' }}>
                          ${dTotal.toLocaleString()}
                        </div>
                        {diner.paid && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle size={10} className="text-success" />
                            <span className="text-xs text-success">Pagado</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mb-4 p-4 rounded-xl space-y-3 animate-slide-down"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>
                      Detalle por comensal
                    </p>
                    {session.diners.map(diner => (
                      <div key={diner.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>{diner.emoji}</span>
                          <span className="text-sm font-bold text-gastro-text">{diner.name}</span>
                          <span className="text-xs" style={{ color: '#6666aa' }}>· {diner.joinedAt}</span>
                          {diner.paid && (
                            <span className="text-xs px-1.5 py-0.5 rounded-lg text-success"
                              style={{ background: 'rgba(16,185,129,0.12)' }}>
                              ✓ {diner.paymentMethod === 'webpay' ? 'WebpayPlus' : 'Caja'}
                            </span>
                          )}
                        </div>
                        {diner.cart.length === 0 ? (
                          <p className="text-xs pl-6" style={{ color: '#4a4a6a' }}>Sin pedidos aún</p>
                        ) : (
                          <div className="pl-6 space-y-1">
                            {diner.cart.map(item => (
                              <div key={item.menuItemId} className="flex items-center justify-between text-xs">
                                <span style={{ color: '#8888aa' }}>{item.qty}x {item.name}</span>
                                <span className="font-semibold text-gastro-text">${(item.price * item.qty).toLocaleString()}</span>
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
                    {session.diners.some(d => d.paid) && (
                      <span className="text-xs px-1.5 py-0.5 rounded-lg text-success"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                        {session.diners.filter(d => d.paid).length} pagaron
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setKioskSession(session)
                        setKioskDinerId(null)
                      }}
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
                      onClick={() => handleForceClose(session.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      <RotateCcw size={13} /> Cerrar
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
                    <p className="text-xs text-gastro-subtle">{table.zone} · cap. {table.capacity} personas</p>
                  </div>
                  {activeSession ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                        Sesión activa
                      </span>
                      {/* Real vs capacity */}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                        style={{
                          background: activeSession.diners.length > table.capacity ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                          color: activeSession.diners.length > table.capacity ? '#f59e0b' : '#8888aa',
                        }}>
                        {dinerCountLabel(activeSession.diners.length, table.capacity)}
                      </span>
                    </div>
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
                  <div className="p-3 rounded-xl mb-3 space-y-1.5"
                    style={{ background: 'rgba(158,127,255,0.06)', border: '1px solid rgba(158,127,255,0.15)' }}>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Comensales</span>
                      <span className="font-bold text-gastro-text">
                        {dinerCountLabel(activeSession.diners.length, table.capacity)}
                        {activeSession.diners.length > table.capacity && (
                          <span className="ml-1 text-warning">↑ ajustados</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Estado</span>
                      <span className="font-semibold" style={{ color: STATUS_CFG[activeSession.status].color }}>
                        {STATUS_CFG[activeSession.status].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Total</span>
                      <span className="font-bold text-primary-400">
                        ${activeSession.diners.reduce((s, d) => s + d.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Pagaron</span>
                      <span className="font-semibold text-success">
                        {activeSession.diners.filter(d => d.paid).length} / {activeSession.diners.length}
                      </span>
                    </div>
                  </div>
                )}

                {!activeSession && (
                  <div className="p-3 rounded-xl mb-3 text-xs text-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3d', color: '#6666aa' }}>
                    El primer scan abre la sesión automáticamente
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleQRScan(table)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                    <Smartphone size={13} />
                    {activeSession ? 'Unirse / Ver menú' : 'Simular primer scan'}
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

      {/* Kiosk overlay */}
      {kioskSession && (
        <KioskView
          session={kioskSession}
          currentDinerId={kioskDinerId}
          onJoin={name => handleJoin(kioskSession.id, name)}
          onAddItem={(dinerId, item) => handleAddItem(kioskSession.id, dinerId, item)}
          onRemoveItem={(dinerId, itemId) => handleRemoveItem(kioskSession.id, dinerId, itemId)}
          onSendOrder={() => handleSendOrder(kioskSession.id)}
          onRegisterPayment={(dinerIds, method) => handleRegisterPayment(kioskSession.id, dinerIds, method)}
          onClose={() => {
            setKioskSession(null)
            setKioskDinerId(null)
          }}
        />
      )}
    </div>
  )
}
