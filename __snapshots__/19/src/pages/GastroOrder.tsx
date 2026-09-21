import { useState, useEffect } from 'react'
import {
  QrCode, Users, ShoppingCart, CreditCard, CheckCircle, Clock,
  Plus, Minus, ChevronRight, Smartphone, X,
  SplitSquareHorizontal, User, ArrowRight, RotateCcw, Wifi,
  UtensilsCrossed, Wine, Cake, Salad, Pizza, Star,
  DollarSign, Send, UserPlus, Receipt, AlertCircle,
  ChefHat, GlassWater, Share2, Check, Zap,
  BadgeCheck, ClipboardList, UserCheck, Tag, ChevronDown,
  Utensils, Coffee
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
  destination: 'kitchen' | 'bar'
  shareable?: boolean
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  qty: number
  destination: 'kitchen' | 'bar'
  shared?: boolean
  sharedWith?: string[]
  assignedTo?: string | 'all'   // diner ID or 'all' (waiter orders)
  addedByWaiter?: boolean
}

interface OrderRound {
  id: string
  items: CartItem[]
  sentAt: string
  destination: 'kitchen' | 'bar' | 'both'
  addedByWaiter?: boolean
  waiterId?: string
}

interface Diner {
  id: string
  name: string
  emoji: string
  cart: CartItem[]
  rounds: OrderRound[]
  paid: boolean
  paymentMethod?: string
  joinedAt: string
}

interface Waiter {
  id: string
  name: string
  emoji: string
  role: 'waiter'
  color: string
}

interface TableSession {
  id: string
  tableNumber: string
  tableLabel: string
  zone: string
  status: 'ordering' | 'sent' | 'paying' | 'closed'
  diners: Diner[]
  waiters: Waiter[]
  tableCapacity: number
  openedAt: string
  sentAt?: string
  openedByFirstScan: boolean
}

interface TableConfig {
  number: string
  label: string
  zone: string
  capacity: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Burrata con Tomates', description: 'Burrata fresca, tomates cherry asados, albahaca y aceite de oliva extra virgen', price: 1850, category: 'Entradas', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400', tags: ['vegetariano'], popular: true, destination: 'kitchen', shareable: true },
  { id: 'm2', name: 'Ceviche Clásico', description: 'Corvina marinada en limón, cebolla morada, ají amarillo y choclo', price: 2200, category: 'Entradas', image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400', tags: ['sin gluten'], destination: 'kitchen' },
  { id: 'm3', name: 'Tabla de Embutidos', description: 'Selección de jamones ibéricos, quesos curados y encurtidos artesanales', price: 3400, category: 'Entradas', image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?w=400', tags: ['para compartir'], destination: 'kitchen', shareable: true },
  { id: 'm4', name: 'Risotto de Hongos', description: 'Arroz arbóreo, mix de hongos silvestres, parmesano 24 meses y trufa negra', price: 3200, category: 'Principales', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400', tags: ['vegetariano'], popular: true, destination: 'kitchen' },
  { id: 'm5', name: 'Lomo a la Pimienta', description: 'Lomo de res 300g, salsa de pimienta verde, papas rosti y espárragos', price: 4800, category: 'Principales', image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?w=400', tags: ['sin gluten'], destination: 'kitchen' },
  { id: 'm6', name: 'Pasta Carbonara', description: 'Spaghetti artesanal, guanciale, yema de huevo, pecorino y pimienta negra', price: 2900, category: 'Principales', image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400', tags: [], destination: 'kitchen' },
  { id: 'm7', name: 'Salmón Grillado', description: 'Salmón atlántico, quinoa tricolor, salsa de maracuyá y vegetales de estación', price: 4200, category: 'Principales', image: 'https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg?w=400', tags: ['sin gluten', 'saludable'], destination: 'kitchen' },
  { id: 'm8', name: 'Agua Mineral', description: 'Agua mineral sin gas o con gas 500ml', price: 450, category: 'Bebidas', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?w=400', tags: [], destination: 'bar' },
  { id: 'm9', name: 'Vino Tinto Copa', description: 'Malbec Reserva, Mendoza. Copa 150ml', price: 1200, category: 'Bebidas', image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?w=400', tags: [], destination: 'bar' },
  { id: 'm9b', name: 'Vino Tinto Botella', description: 'Malbec Reserva, Mendoza. Botella 750ml — ideal para compartir', price: 4800, category: 'Bebidas', image: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?w=400', tags: ['para compartir'], destination: 'bar', shareable: true },
  { id: 'm10', name: 'Limonada Artesanal', description: 'Limón exprimido, menta fresca, jengibre y agua con gas', price: 850, category: 'Bebidas', image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?w=400', tags: ['sin alcohol'], popular: true, destination: 'bar' },
  { id: 'm11', name: 'Tiramisú Clásico', description: 'Mascarpone, café espresso, savoiardi y cacao en polvo', price: 1600, category: 'Postres', image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?w=400', tags: ['vegetariano'], popular: true, destination: 'kitchen' },
  { id: 'm12', name: 'Coulant de Chocolate', description: 'Bizcocho de chocolate 70%, centro fundente y helado de vainilla', price: 1800, category: 'Postres', image: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?w=400', tags: ['vegetariano'], destination: 'kitchen' },
]

const CATEGORIES = ['Todos', 'Entradas', 'Principales', 'Bebidas', 'Postres']
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Todos': <UtensilsCrossed size={13} />,
  'Entradas': <Salad size={13} />,
  'Principales': <Pizza size={13} />,
  'Bebidas': <Wine size={13} />,
  'Postres': <Cake size={13} />,
}

const DINER_EMOJIS = ['🧑', '👩', '👨', '🧔', '👱', '🧕', '👴', '👵', '🧒', '👦', '🧑‍🦱', '🧑‍🦰']

// Mock waiter profiles (in real app these come from auth)
const MOCK_WAITERS: Waiter[] = [
  { id: 'w1', name: 'Carlos', emoji: '👨‍🍳', role: 'waiter', color: '#f59e0b' },
  { id: 'w2', name: 'Valentina', emoji: '👩‍🍳', role: 'waiter', color: '#f472b6' },
  { id: 'w3', name: 'Rodrigo', emoji: '🧑‍🍳', role: 'waiter', color: '#38bdf8' },
]

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

function createAutoSession(table: TableConfig): TableSession {
  return {
    id: uid(), tableNumber: table.number, tableLabel: table.label, zone: table.zone,
    status: 'ordering', diners: [], waiters: [], tableCapacity: table.capacity,
    openedAt: nowTime(), openedByFirstScan: true,
  }
}

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

// ─── Destination Badge ────────────────────────────────────────────────────────

function DestBadge({ dest, small }: { dest: 'kitchen' | 'bar'; small?: boolean }) {
  const sz = small ? 10 : 12
  if (dest === 'kitchen') return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg font-semibold"
      style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF', fontSize: small ? '9px' : '10px' }}>
      <ChefHat size={sz} /> Cocina
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg font-semibold"
      style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: small ? '9px' : '10px' }}>
      <GlassWater size={sz} /> Barra
    </span>
  )
}

// ─── Confirm Send Modal ───────────────────────────────────────────────────────

function ConfirmSendModal({
  items, dinerName, dinerEmoji, onConfirm, onCancel, isWaiter = false,
}: {
  items: CartItem[]
  dinerName: string
  dinerEmoji: string
  onConfirm: () => void
  onCancel: () => void
  isWaiter?: boolean
}) {
  const kitchenItems = items.filter(i => i.destination === 'kitchen')
  const barItems = items.filter(i => i.destination === 'bar')
  const total = items.reduce((s, i) => {
    const base = i.price * i.qty
    return s + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
  }, 0)

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-t-3xl overflow-hidden" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <div className="p-4 border-b" style={{ borderColor: '#2a2a3d' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: isWaiter ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' }}>
              <Send size={12} style={{ color: isWaiter ? '#f59e0b' : '#10b981' }} />
            </div>
            <h3 className="font-black text-gastro-text text-sm">Confirmar pedido</h3>
            {isWaiter && (
              <span className="text-xs px-1.5 py-0.5 rounded-lg font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                Mozo
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: '#8888aa' }}>
            {dinerEmoji} {dinerName} · revisá antes de enviar
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
          {kitchenItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ChefHat size={12} style={{ color: '#9E7FFF' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9E7FFF' }}>Cocina</span>
              </div>
              {kitchenItems.map(item => {
                const isShared = item.shared && item.sharedWith
                const splitCount = isShared ? (item.sharedWith!.length + 1) : 1
                const myPrice = Math.round(item.price * item.qty / splitCount)
                return (
                  <div key={item.menuItemId} className="flex items-center justify-between py-1.5 border-b last:border-0"
                    style={{ borderColor: '#2a2a3d' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-gastro-text">{item.qty}× {item.name}</span>
                        {isShared && (
                          <span className="text-xs px-1 py-0.5 rounded"
                            style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6', fontSize: '9px' }}>÷{splitCount}</span>
                        )}
                        {item.addedByWaiter && item.assignedTo === 'all' && (
                          <span className="text-xs px-1 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '9px' }}>÷mesa</span>
                        )}
                        {item.addedByWaiter && item.assignedTo !== 'all' && (
                          <span className="text-xs px-1 py-0.5 rounded"
                            style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '9px' }}>asignado</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gastro-text">${myPrice.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
          {barItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <GlassWater size={12} style={{ color: '#38bdf8' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#38bdf8' }}>Barra</span>
              </div>
              {barItems.map(item => {
                const isShared = item.shared && item.sharedWith
                const splitCount = isShared ? (item.sharedWith!.length + 1) : 1
                const myPrice = Math.round(item.price * item.qty / splitCount)
                return (
                  <div key={item.menuItemId} className="flex items-center justify-between py-1.5 border-b last:border-0"
                    style={{ borderColor: '#2a2a3d' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-gastro-text">{item.qty}× {item.name}</span>
                        {isShared && (
                          <span className="text-xs px-1 py-0.5 rounded"
                            style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6', fontSize: '9px' }}>÷{splitCount}</span>
                        )}
                        {item.addedByWaiter && item.assignedTo === 'all' && (
                          <span className="text-xs px-1 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '9px' }}>÷mesa</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gastro-text">${myPrice.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t space-y-3" style={{ borderColor: '#2a2a3d' }}>
          {isWaiter && (
            <div className="flex items-start gap-2 p-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={11} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: '#f59e0b' }}>
                Los ítems "÷mesa" se distribuirán entre todos los comensales al confirmar
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: '#8888aa' }}>
              {isWaiter ? 'Total del pedido' : 'Tu parte de este pedido'}
            </span>
            <span className="text-lg font-black" style={{ color: isWaiter ? '#f59e0b' : '#9E7FFF' }}>
              ${total.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="flex-1 py-3 rounded-2xl text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
              Revisar
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
              style={{
                background: isWaiter
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: isWaiter ? '0 4px 16px rgba(245,158,11,0.3)' : '0 4px 16px rgba(16,185,129,0.3)'
              }}>
              <Send size={13} /> Enviar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({
  item, diners, currentDinerId, onConfirm, onCancel,
}: {
  item: MenuItem
  diners: Diner[]
  currentDinerId: string
  onConfirm: (sharedWith: string[]) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const others = diners.filter(d => d.id !== currentDinerId)
  const splitCount = selected.length + 1
  const myPrice = Math.round(item.price / splitCount)

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-t-3xl overflow-hidden" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <div className="p-4 border-b" style={{ borderColor: '#2a2a3d' }}>
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={14} style={{ color: '#f472b6' }} />
            <h3 className="font-black text-gastro-text text-sm">Compartir ítem</h3>
          </div>
          <p className="text-xs font-semibold text-gastro-text">{item.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#8888aa' }}>Seleccioná con quién compartís el costo</p>
        </div>
        <div className="p-4 space-y-2">
          {others.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: '#6666aa' }}>No hay otros comensales en la mesa aún</p>
          ) : (
            others.map(d => {
              const isSelected = selected.includes(d.id)
              return (
                <button key={d.id}
                  onClick={() => setSelected(prev => isSelected ? prev.filter(id => id !== d.id) : [...prev, d.id])}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: isSelected ? 'rgba(244,114,182,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(244,114,182,0.4)' : '#2a2a3d'}`,
                  }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: isSelected ? '#f472b6' : 'rgba(255,255,255,0.08)', border: `1px solid ${isSelected ? '#f472b6' : '#3a3a52'}` }}>
                    {isSelected && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-lg">{d.emoji}</span>
                  <span className="text-sm font-semibold text-gastro-text flex-1 text-left">{d.name}</span>
                </button>
              )
            })
          )}
          <div className="p-3 rounded-xl mt-2"
            style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)' }}>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: '#8888aa' }}>${item.price.toLocaleString()} ÷ {splitCount} {splitCount === 1 ? 'persona' : 'personas'}</span>
              <span className="font-black" style={{ color: '#f472b6' }}>${myPrice.toLocaleString()} c/u</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex gap-2" style={{ borderColor: '#2a2a3d' }}>
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(selected)}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f472b6, #db2777)' }}>
            {selected.length === 0 ? 'Solo yo' : `Compartir ÷${splitCount}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Waiter Assign Modal ──────────────────────────────────────────────────────

function WaiterAssignModal({
  item, diners, onConfirm, onCancel,
}: {
  item: MenuItem
  diners: Diner[]
  onConfirm: (assignedTo: string | 'all') => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<string | 'all'>('all')
  const splitPrice = diners.length > 0 ? Math.round(item.price / diners.length) : item.price

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-t-3xl overflow-hidden" style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
        <div className="p-4 border-b" style={{ borderColor: '#2a2a3d' }}>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={14} style={{ color: '#f59e0b' }} />
            <h3 className="font-black text-gastro-text text-sm">Asignar ítem</h3>
          </div>
          <p className="text-xs font-semibold text-gastro-text">{item.name} · ${item.price.toLocaleString()}</p>
          <p className="text-xs mt-0.5" style={{ color: '#8888aa' }}>¿A quién se carga este ítem?</p>
        </div>

        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {/* All diners option */}
          <button
            onClick={() => setSelected('all')}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: selected === 'all' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selected === 'all' ? 'rgba(245,158,11,0.4)' : '#2a2a3d'}`,
            }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: selected === 'all' ? '#f59e0b' : 'rgba(255,255,255,0.08)', border: `1px solid ${selected === 'all' ? '#f59e0b' : '#3a3a52'}` }}>
              {selected === 'all' && <Check size={11} className="text-white" />}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-base">👥</span>
              <div className="text-left">
                <div className="text-sm font-bold text-gastro-text">Todos los comensales</div>
                <div className="text-xs" style={{ color: '#8888aa' }}>
                  {diners.length > 0 ? `÷${diners.length} = $${splitPrice.toLocaleString()} c/u` : 'Se divide al unirse comensales'}
                </div>
              </div>
            </div>
            {selected === 'all' && (
              <span className="text-xs px-1.5 py-0.5 rounded-lg font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>÷mesa</span>
            )}
          </button>

          {/* Individual diners */}
          {diners.map(d => (
            <button key={d.id}
              onClick={() => setSelected(d.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: selected === d.id ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected === d.id ? 'rgba(56,189,248,0.4)' : '#2a2a3d'}`,
              }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: selected === d.id ? '#38bdf8' : 'rgba(255,255,255,0.08)', border: `1px solid ${selected === d.id ? '#38bdf8' : '#3a3a52'}` }}>
                {selected === d.id && <Check size={11} className="text-white" />}
              </div>
              <span className="text-lg">{d.emoji}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-gastro-text">{d.name}</div>
                <div className="text-xs" style={{ color: '#8888aa' }}>Cargo individual · ${item.price.toLocaleString()}</div>
              </div>
            </button>
          ))}

          {diners.length === 0 && (
            <div className="p-3 rounded-xl text-xs text-center"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              No hay comensales aún. El ítem se distribuirá cuando se unan.
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2" style={{ borderColor: '#2a2a3d' }}>
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(selected)}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {selected === 'all' ? 'Dividir entre mesa' : 'Asignar a comensal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Waiter Phone Kiosk ───────────────────────────────────────────────────────

function WaiterPhoneKiosk({
  session, waiter, onAddWaiterItem, onSendWaiterRound, onClose,
}: {
  session: TableSession
  waiter: Waiter
  onAddWaiterItem: (item: MenuItem, assignedTo: string | 'all', qty: number) => void
  onSendWaiterRound: (items: CartItem[]) => void
  onClose: () => void
}) {
  const [screen, setScreen] = useState<'overview' | 'menu' | 'cart'>('overview')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [waiterCart, setWaiterCart] = useState<CartItem[]>([])
  const [assignItem, setAssignItem] = useState<MenuItem | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sentFeedback, setSentFeedback] = useState(false)

  const [time, setTime] = useState(nowTime())
  useEffect(() => {
    const t = setInterval(() => setTime(nowTime()), 30000)
    return () => clearInterval(t)
  }, [])

  const filteredItems = MENU_ITEMS.filter(i => activeCategory === 'Todos' || i.category === activeCategory)
  const cartTotal = waiterCart.reduce((s, i) => s + i.price * i.qty, 0)

  const handleAssignConfirm = (item: MenuItem, assignedTo: string | 'all') => {
    setAssignItem(null)
    const existing = waiterCart.find(c => c.menuItemId === item.id && c.assignedTo === assignedTo)
    if (existing) {
      setWaiterCart(prev => prev.map(c =>
        c.menuItemId === item.id && c.assignedTo === assignedTo ? { ...c, qty: c.qty + 1 } : c
      ))
    } else {
      setWaiterCart(prev => [...prev, {
        menuItemId: item.id, name: item.name, price: item.price, qty: 1,
        destination: item.destination, addedByWaiter: true, assignedTo,
      }])
    }
  }

  const handleSendConfirmed = () => {
    setShowConfirm(false)
    onSendWaiterRound(waiterCart)
    setWaiterCart([])
    setSentFeedback(true)
    setTimeout(() => setSentFeedback(false), 2500)
    setScreen('overview')
  }

  // Compute per-diner totals from all rounds
  const getDinerTotal = (dinerId: string) => {
    const diner = session.diners.find(d => d.id === dinerId)
    if (!diner) return 0
    return diner.rounds.reduce((s, r) => s + r.items.reduce((ss, i) => {
      const base = i.price * i.qty
      if (i.addedByWaiter && i.assignedTo === 'all') {
        return ss + Math.round(base / Math.max(session.diners.length, 1))
      }
      return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
    }, 0), 0)
  }

  const sessionTotal = session.diners.reduce((s, d) => s + getDinerTotal(d.id), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>

      <button onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 z-10"
        style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#8888aa' }}>
        <X size={18} />
      </button>

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: waiter.color }} />
        <span className="text-xs font-semibold" style={{ color: '#8888aa' }}>
          Vista del mozo · {waiter.emoji} {waiter.name} · {session.tableLabel}
        </span>
      </div>

      {/* Phone Frame */}
      <div className="relative flex-shrink-0"
        style={{
          width: 375, height: 780, borderRadius: 48,
          background: '#0a0a12', border: '10px solid #1e1e2e',
          boxShadow: `0 0 0 1px ${waiter.color}44, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)`,
          overflow: 'hidden',
        }}>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          style={{ width: 120, height: 32, background: '#1e1e2e', borderRadius: '0 0 20px 20px' }} />

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-2" style={{ height: 44 }}>
          <span className="text-xs font-bold text-white">{time}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} className="text-white" />
            <div className="flex gap-0.5">
              {[3, 4, 5, 6].map(h => <div key={h} className="w-1 rounded-sm bg-white" style={{ height: h }} />)}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ paddingTop: 44 }}>

          {/* ── OVERVIEW SCREEN ── */}
          {screen === 'overview' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              {/* Waiter header */}
              <div className="flex-shrink-0 p-4"
                style={{ background: `linear-gradient(135deg, ${waiter.color}22, transparent)`, borderBottom: '1px solid #1e1e2e' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${waiter.color}22`, border: `1px solid ${waiter.color}44` }}>
                    {waiter.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{waiter.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-lg font-semibold"
                        style={{ background: `${waiter.color}22`, color: waiter.color }}>
                        Mozo
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8888aa' }}>
                      {session.tableLabel} · {session.zone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color: waiter.color }}>${sessionTotal.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: '#6666aa' }}>total mesa</div>
                  </div>
                </div>
              </div>

              {/* Sent feedback */}
              {sentFeedback && (
                <div className="mx-4 mt-3 flex items-center gap-2 p-3 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <CheckCircle size={13} style={{ color: '#f59e0b' }} />
                  <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>¡Pedido enviado a cocina/barra!</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Waiters on this table */}
                {session.waiters.length > 0 && (
                  <div className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                      Mozos en esta mesa
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {session.waiters.map(w => (
                        <div key={w.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                          style={{ background: `${w.color}15`, border: `1px solid ${w.color}33` }}>
                          <span className="text-sm">{w.emoji}</span>
                          <span className="text-xs font-semibold" style={{ color: w.color }}>{w.name}</span>
                          {w.id === waiter.id && (
                            <span className="text-xs" style={{ color: w.color, opacity: 0.7 }}>(vos)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diners summary */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                    Comensales · {session.diners.length} de {session.tableCapacity}
                  </p>
                  {session.diners.length === 0 ? (
                    <div className="p-3 rounded-xl text-xs text-center"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3d', color: '#6666aa' }}>
                      Aún no hay comensales. Los pedidos del mozo se distribuirán cuando se unan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {session.diners.map(d => {
                        const dTotal = getDinerTotal(d.id)
                        return (
                          <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
                            <span className="text-lg">{d.emoji}</span>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-gastro-text">{d.name}</div>
                              <div className="text-xs" style={{ color: '#8888aa' }}>
                                {d.rounds.length} ronda{d.rounds.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black" style={{ color: dTotal > 0 ? '#9E7FFF' : '#4a4a6a' }}>
                                ${dTotal.toLocaleString()}
                              </div>
                              {d.paid && <div className="text-xs text-success">✓ pagado</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Recent waiter rounds */}
                {session.diners.some(d => d.rounds.some(r => r.addedByWaiter)) && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                      Pedidos del mozo
                    </p>
                    {session.diners.flatMap(d => d.rounds.filter(r => r.addedByWaiter)).slice(-3).map(round => (
                      <div key={round.id} className="p-3 rounded-xl mb-2"
                        style={{ background: `${waiter.color}0a`, border: `1px solid ${waiter.color}22` }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BadgeCheck size={11} style={{ color: waiter.color }} />
                          <span className="text-xs font-semibold" style={{ color: waiter.color }}>
                            Mozo · {round.sentAt}
                          </span>
                          <DestBadge dest={round.destination === 'both' ? 'kitchen' : round.destination} small />
                        </div>
                        {round.items.map(item => (
                          <div key={item.menuItemId} className="flex items-center justify-between text-xs py-0.5">
                            <span style={{ color: '#8888aa' }}>
                              {item.qty}× {item.name}
                              {item.assignedTo === 'all'
                                ? <span style={{ color: '#f59e0b' }}> ÷mesa</span>
                                : <span style={{ color: '#38bdf8' }}> → {session.diners.find(d => d.id === item.assignedTo)?.name ?? 'comensal'}</span>
                              }
                            </span>
                            <span className="font-semibold text-gastro-text">${(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#1e1e2e' }}>
                <button onClick={() => setScreen('menu')}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${waiter.color}, ${waiter.color}cc)`,
                    boxShadow: `0 4px 20px ${waiter.color}44`
                  }}>
                  <ClipboardList size={15} />
                  Registrar pedido de la mesa
                </button>
              </div>
            </div>
          )}

          {/* ── WAITER MENU SCREEN ── */}
          {screen === 'menu' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid #1e1e2e' }}>
                <button onClick={() => setScreen('overview')}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: waiter.color }}>
                  <ChevronRight size={14} className="rotate-180" /> Volver
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{waiter.emoji}</span>
                  <h2 className="font-black text-white text-sm">Tomar pedido</h2>
                </div>
                <button onClick={() => setScreen('cart')}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: `${waiter.color}22`, border: `1px solid ${waiter.color}44`, color: waiter.color }}>
                  <ShoppingCart size={13} />
                  {waiterCart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-black"
                      style={{ background: waiter.color, fontSize: '9px' }}>
                      {waiterCart.reduce((s, i) => s + i.qty, 0)}
                    </span>
                  )}
                  ${cartTotal.toLocaleString()}
                </button>
              </div>

              {/* Info banner */}
              <div className="mx-4 mt-2 flex items-center gap-2 p-2.5 rounded-xl flex-shrink-0"
                style={{ background: `${waiter.color}0d`, border: `1px solid ${waiter.color}22` }}>
                <Tag size={11} style={{ color: waiter.color, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: waiter.color }}>
                  Cada ítem se puede asignar a un comensal o dividir entre toda la mesa
                </p>
              </div>

              {/* Categories */}
              <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: activeCategory === cat ? `${waiter.color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeCategory === cat ? `${waiter.color}55` : '#1e1e2e'}`,
                      color: activeCategory === cat ? waiter.color : '#8888aa',
                    }}>
                    {CATEGORY_ICONS[cat]}{cat}
                  </button>
                ))}
              </div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
                {filteredItems.map(item => {
                  const inCart = waiterCart.filter(c => c.menuItemId === item.id)
                  const totalQty = inCart.reduce((s, c) => s + c.qty, 0)
                  return (
                    <div key={item.id} className="rounded-2xl overflow-hidden"
                      style={{ background: '#141420', border: '1px solid #1e1e2e' }}>
                      <div className="flex gap-3 p-3">
                        <div className="relative flex-shrink-0">
                          <img src={item.image} alt={item.name} className="rounded-xl object-cover"
                            style={{ width: 72, height: 72 }} />
                          <div className="absolute bottom-1 left-1">
                            <DestBadge dest={item.destination} small />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                              {item.popular && <Star size={10} className="text-warning fill-warning flex-shrink-0" />}
                            </div>
                            <span className="font-black text-white text-xs flex-shrink-0">${item.price.toLocaleString()}</span>
                          </div>
                          <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: '#6666aa' }}>
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {totalQty > 0 && (
                              <div className="flex items-center gap-1 text-xs font-semibold"
                                style={{ color: waiter.color }}>
                                <Check size={10} />
                                {totalQty} en pedido
                              </div>
                            )}
                            <button
                              onClick={() => setAssignItem(item)}
                              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold"
                              style={{
                                background: `${waiter.color}18`,
                                border: `1px solid ${waiter.color}44`,
                                color: waiter.color
                              }}>
                              <Plus size={11} /> Agregar
                            </button>
                          </div>
                          {/* Show assignments */}
                          {inCart.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {inCart.map((c, ci) => (
                                <div key={ci} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg"
                                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <span style={{ color: '#8888aa' }}>
                                    {c.qty}× {c.assignedTo === 'all'
                                      ? '÷ toda la mesa'
                                      : `→ ${session.diners.find(d => d.id === c.assignedTo)?.name ?? 'comensal'}`
                                    }
                                  </span>
                                  <button onClick={() => setWaiterCart(prev => prev.filter((_, i) => i !== waiterCart.indexOf(c)))}
                                    className="text-error opacity-60 hover:opacity-100">
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {waiterCart.length > 0 && (
                <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#1e1e2e' }}>
                  <button onClick={() => setScreen('cart')}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${waiter.color}, ${waiter.color}cc)`, boxShadow: `0 4px 20px ${waiter.color}44` }}>
                    <ShoppingCart size={15} />
                    Ver pedido · ${cartTotal.toLocaleString()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── WAITER CART SCREEN ── */}
          {screen === 'cart' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid #1e1e2e' }}>
                <button onClick={() => setScreen('menu')}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: waiter.color }}>
                  <ChevronRight size={14} className="rotate-180" /> Menú
                </button>
                <h2 className="font-black text-white text-sm">Pedido del mozo</h2>
                <div className="w-16" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {waiterCart.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList size={28} className="mx-auto mb-3" style={{ color: '#3a3a52' }} />
                    <p className="text-sm" style={{ color: '#8888aa' }}>No hay ítems en el pedido</p>
                    <button onClick={() => setScreen('menu')} className="mt-2 text-xs font-semibold" style={{ color: waiter.color }}>
                      Ir al menú →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Distribution summary */}
                    <div className="p-3 rounded-xl"
                      style={{ background: `${waiter.color}0a`, border: `1px solid ${waiter.color}22` }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag size={11} style={{ color: waiter.color }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: waiter.color }}>
                          Distribución del pedido
                        </span>
                      </div>
                      {waiterCart.map((item, idx) => {
                        const assignedDiner = session.diners.find(d => d.id === item.assignedTo)
                        const splitPrice = item.assignedTo === 'all' && session.diners.length > 0
                          ? Math.round(item.price / session.diners.length)
                          : item.price
                        return (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b last:border-0"
                            style={{ borderColor: `${waiter.color}22` }}>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-gastro-text">{item.qty}× {item.name}</span>
                                <DestBadge dest={item.destination} small />
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#8888aa' }}>
                                {item.assignedTo === 'all'
                                  ? `÷ ${session.diners.length || '?'} comensales = $${splitPrice.toLocaleString()} c/u`
                                  : `→ ${assignedDiner?.name ?? 'comensal'} · $${item.price.toLocaleString()}`
                                }
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gastro-text">${(item.price * item.qty).toLocaleString()}</span>
                              <button onClick={() => setWaiterCart(prev => prev.filter((_, i) => i !== idx))}
                                className="w-5 h-5 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                <X size={9} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
                      <span className="text-sm font-bold text-gastro-text">Total pedido</span>
                      <span className="text-lg font-black" style={{ color: waiter.color }}>${cartTotal.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t space-y-2 flex-shrink-0" style={{ borderColor: '#1e1e2e' }}>
                {waiterCart.length > 0 && (
                  <button onClick={() => setShowConfirm(true)}
                    className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${waiter.color}, ${waiter.color}cc)`,
                      boxShadow: `0 4px 20px ${waiter.color}44`
                    }}>
                    <Send size={15} />
                    Enviar a cocina / barra
                  </button>
                )}
                <button onClick={() => setScreen('menu')}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
                  <Plus size={14} /> Agregar más ítems
                </button>
              </div>
            </div>
          )}

          {/* Assign modal */}
          {assignItem && (
            <WaiterAssignModal
              item={assignItem}
              diners={session.diners}
              onConfirm={(assignedTo) => handleAssignConfirm(assignItem, assignedTo)}
              onCancel={() => setAssignItem(null)}
            />
          )}

          {/* Confirm send modal */}
          {showConfirm && (
            <ConfirmSendModal
              items={waiterCart}
              dinerName={waiter.name}
              dinerEmoji={waiter.emoji}
              onConfirm={handleSendConfirmed}
              onCancel={() => setShowConfirm(false)}
              isWaiter
            />
          )}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.25)' }} />
      </div>

      {/* Side info panel */}
      <div className="ml-8 w-64 space-y-4 hidden xl:block">
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>Flujo del mozo</p>
          {[
            { step: '1', label: 'Tagea QR de la mesa', desc: 'Queda asociado automáticamente', done: true },
            { step: '2', label: 'Ve la orden activa', desc: 'Comensales, rondas, totales', done: true },
            { step: '3', label: 'Registra pedido', desc: 'Asigna a comensal o divide', done: screen !== 'overview' },
            { step: '4', label: 'Confirma y envía', desc: 'Cocina/barra según ítem', done: false },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{
                  background: s.done ? `${waiter.color}22` : 'rgba(255,255,255,0.06)',
                  color: s.done ? waiter.color : '#6666aa',
                  border: `1px solid ${s.done ? `${waiter.color}44` : '#2a2a3d'}`,
                }}>
                {s.done ? '✓' : s.step}
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: s.done ? '#e8e8f0' : '#8888aa' }}>{s.label}</div>
                <div className="text-xs" style={{ color: '#6666aa' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>Asignación de ítems</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(245,158,11,0.2)' }}>
                <Users size={9} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <span className="text-xs text-white font-semibold">÷ Mesa</span>
                <p className="text-xs" style={{ color: '#6666aa' }}>Se divide entre todos los comensales activos</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(56,189,248,0.2)' }}>
                <User size={9} style={{ color: '#38bdf8' }} />
              </div>
              <div>
                <span className="text-xs text-white font-semibold">→ Comensal</span>
                <p className="text-xs" style={{ color: '#6666aa' }}>Cargo individual a una persona específica</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Customer Phone Kiosk ─────────────────────────────────────────────────────

function PhoneKiosk({
  session, currentDinerId, onJoin, onAddItem, onRemoveItem,
  onSendRound, onRegisterPayment, onClose,
}: {
  session: TableSession
  currentDinerId: string | null
  onJoin: (name: string) => void
  onAddItem: (dinerId: string, item: MenuItem, shared: boolean, sharedWith: string[]) => void
  onRemoveItem: (dinerId: string, itemId: string) => void
  onSendRound: (dinerId: string) => void
  onRegisterPayment: (dinerIds: string[], method: string) => void
  onClose: () => void
}) {
  const [screen, setScreen] = useState<'join' | 'menu' | 'cart' | 'payment'>('join')
  const [joinName, setJoinName] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showConfirm, setShowConfirm] = useState(false)
  const [shareItem, setShareItem] = useState<MenuItem | null>(null)
  const [payStep, setPayStep] = useState<'split' | 'method' | 'processing' | 'done'>('split')
  const [splitMode, setSplitMode] = useState<'individual' | 'equal' | 'custom'>('individual')
  const [selectedPayers, setSelectedPayers] = useState<string[]>([])
  const [sentFeedback, setSentFeedback] = useState(false)

  const currentDiner = session.diners.find(d => d.id === currentDinerId)
  const myCart = currentDiner?.cart ?? []
  const myRounds = currentDiner?.rounds ?? []
  const myCartTotal = myCart.reduce((s, i) => {
    const base = i.price * i.qty
    return s + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
  }, 0)
  const myAllTimeTotal = myRounds.reduce((s, r) =>
    s + r.items.reduce((ss, i) => {
      const base = i.price * i.qty
      if (i.addedByWaiter && i.assignedTo === 'all') return ss + Math.round(base / Math.max(session.diners.length, 1))
      return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
    }, 0), 0) + myCartTotal

  const sessionTotal = session.diners.reduce((s, d) => {
    const cartT = d.cart.reduce((ss, i) => {
      const base = i.price * i.qty
      return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
    }, 0)
    const roundT = d.rounds.reduce((ss, r) => ss + r.items.reduce((sss, i) => {
      const base = i.price * i.qty
      if (i.addedByWaiter && i.assignedTo === 'all') return sss + Math.round(base / Math.max(session.diners.length, 1))
      return sss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
    }, 0), 0)
    return s + cartT + roundT
  }, 0)

  const unpaidDiners = session.diners.filter(d => !d.paid)
  const equalSplit = unpaidDiners.length > 0 ? Math.round(sessionTotal / unpaidDiners.length) : 0
  const filteredItems = MENU_ITEMS.filter(i => activeCategory === 'Todos' || i.category === activeCategory)

  useEffect(() => {
    if (currentDinerId && screen === 'join') setScreen('menu')
  }, [currentDinerId, screen])

  const handleSendConfirmed = () => {
    setShowConfirm(false)
    onSendRound(currentDinerId!)
    setSentFeedback(true)
    setTimeout(() => setSentFeedback(false), 2500)
    setScreen('menu')
  }

  const [time, setTime] = useState(nowTime())
  useEffect(() => {
    const t = setInterval(() => setTime(nowTime()), 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>

      <button onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 z-10"
        style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#8888aa' }}>
        <X size={18} />
      </button>

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-semibold" style={{ color: '#8888aa' }}>
          Vista del cliente · {session.tableLabel}
        </span>
      </div>

      {/* Phone Frame */}
      <div className="relative flex-shrink-0"
        style={{
          width: 375, height: 780, borderRadius: 48,
          background: '#0a0a12', border: '10px solid #1e1e2e',
          boxShadow: '0 0 0 1px #2a2a3d, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          style={{ width: 120, height: 32, background: '#1e1e2e', borderRadius: '0 0 20px 20px' }} />

        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-2" style={{ height: 44 }}>
          <span className="text-xs font-bold text-white">{time}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} className="text-white" />
            <div className="flex gap-0.5">
              {[3, 4, 5, 6].map(h => <div key={h} className="w-1 rounded-sm bg-white" style={{ height: h }} />)}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ paddingTop: 44 }}>

          {/* JOIN */}
          {screen === 'join' && (
            <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#0d0d18' }}>
              <div className="relative overflow-hidden flex-shrink-0"
                style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d1a2e 100%)', paddingTop: 24, paddingBottom: 32 }}>
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #9E7FFF 0%, transparent 50%), radial-gradient(circle at 70% 40%, #38bdf8 0%, transparent 50%)' }} />
                <div className="relative text-center px-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)', boxShadow: '0 8px 32px rgba(158,127,255,0.5)' }}>
                    <QrCode size={28} className="text-white" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-1">{session.tableLabel}</h2>
                  <p className="text-sm" style={{ color: '#a0a0c0' }}>{session.zone} · Osteria Moderna</p>
                  {session.waiters.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <BadgeCheck size={11} style={{ color: '#f59e0b' }} />
                      <span className="text-xs" style={{ color: '#f59e0b' }}>
                        Mozo {session.waiters[0].name} asignado
                      </span>
                    </div>
                  )}
                  {session.diners.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-xs" style={{ color: '#7dd3fc' }}>
                        {session.diners.length} {session.diners.length === 1 ? 'persona' : 'personas'} en la mesa
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-5 space-y-4">
                {session.diners.length === 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-2xl"
                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <AlertCircle size={13} className="text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs" style={{ color: '#7dd3fc' }}>
                      Sos el primero. La sesión se abre automáticamente al unirte.
                    </p>
                  </div>
                )}
                {session.diners.length > 0 && (
                  <div className="flex -space-x-2 justify-center">
                    {session.diners.slice(0, 6).map(d => (
                      <div key={d.id} className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                        style={{ background: '#1e1e2e', border: '2px solid #0d0d18' }}>
                        {d.emoji}
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#8888aa' }}>
                    ¿Cómo te llamás?
                  </label>
                  <input
                    value={joinName}
                    onChange={e => setJoinName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && joinName.trim() && onJoin(joinName.trim())}
                    placeholder="Tu nombre..."
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2a3d' }}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => joinName.trim() && onJoin(joinName.trim())}
                  disabled={!joinName.trim()}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.4)' }}>
                  <UserPlus size={16} />
                  {session.diners.length === 0 ? 'Abrir mesa y ordenar' : 'Unirme a la mesa'}
                </button>
                <p className="text-xs text-center" style={{ color: '#6666aa' }}>
                  Podés ordenar, pagar tu parte y ver el resumen
                </p>
              </div>
            </div>
          )}

          {/* MENU */}
          {screen === 'menu' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ background: '#0d0d18', borderBottom: '1px solid #1e1e2e' }}>
                <div>
                  <div className="font-black text-white text-sm">{session.tableLabel}</div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8888aa' }}>
                    <span>{currentDiner?.emoji} {currentDiner?.name}</span>
                    {session.waiters.length > 0 && (
                      <span className="flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                        · <BadgeCheck size={9} /> {session.waiters[0].name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {myRounds.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                      <CheckCircle size={10} />
                      {myRounds.length} enviado{myRounds.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <button onClick={() => setScreen('cart')}
                    className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                    <ShoppingCart size={13} />
                    {myCart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-black"
                        style={{ background: '#9E7FFF', fontSize: '9px' }}>
                        {myCart.reduce((s, i) => s + i.qty, 0)}
                      </span>
                    )}
                    ${myCartTotal.toLocaleString()}
                  </button>
                </div>
              </div>

              {sentFeedback && (
                <div className="mx-4 mt-2 flex items-center gap-2 p-3 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle size={13} className="text-success" />
                  <span className="text-xs font-semibold text-success">¡Pedido enviado! Podés seguir agregando</span>
                </div>
              )}

              <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: activeCategory === cat ? 'rgba(158,127,255,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeCategory === cat ? 'rgba(158,127,255,0.5)' : '#1e1e2e'}`,
                      color: activeCategory === cat ? '#9E7FFF' : '#8888aa',
                    }}>
                    {CATEGORY_ICONS[cat]}{cat}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
                {filteredItems.map(item => {
                  const inCart = myCart.find(c => c.menuItemId === item.id)
                  return (
                    <div key={item.id} className="rounded-2xl overflow-hidden"
                      style={{ background: '#141420', border: '1px solid #1e1e2e' }}>
                      <div className="flex gap-3 p-3">
                        <div className="relative flex-shrink-0">
                          <img src={item.image} alt={item.name} className="rounded-xl object-cover"
                            style={{ width: 72, height: 72 }} />
                          <div className="absolute bottom-1 left-1">
                            <DestBadge dest={item.destination} small />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                              {item.popular && <Star size={10} className="text-warning fill-warning flex-shrink-0" />}
                            </div>
                            <span className="font-black text-white text-xs flex-shrink-0">${item.price.toLocaleString()}</span>
                          </div>
                          <p className="text-xs leading-relaxed line-clamp-2 mb-1.5" style={{ color: '#6666aa' }}>
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {item.shareable && (
                                <button onClick={() => setShareItem(item)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-semibold"
                                  style={{ background: 'rgba(244,114,182,0.12)', color: '#f472b6', fontSize: '10px' }}>
                                  <Share2 size={9} /> Compartir
                                </button>
                              )}
                            </div>
                            {inCart ? (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => onRemoveItem(currentDinerId!, item.id)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                  <Minus size={11} />
                                </button>
                                <span className="text-xs font-black text-white w-4 text-center">{inCart.qty}</span>
                                <button onClick={() => onAddItem(currentDinerId!, item, false, [])}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(158,127,255,0.2)', color: '#9E7FFF' }}>
                                  <Plus size={11} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => currentDinerId && onAddItem(currentDinerId, item, false, [])}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold"
                                style={{ background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                                <Plus size={11} /> Agregar
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
                <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#1e1e2e' }}>
                  <button onClick={() => setScreen('cart')}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.35)' }}>
                    <ShoppingCart size={15} />
                    Ver pedido · ${myCartTotal.toLocaleString()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CART */}
          {screen === 'cart' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid #1e1e2e' }}>
                <button onClick={() => setScreen('menu')}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: '#9E7FFF' }}>
                  <ChevronRight size={14} className="rotate-180" /> Menú
                </button>
                <h2 className="font-black text-white text-sm">Mi pedido</h2>
                <div className="w-16" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {myCart.length === 0 && myRounds.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={28} className="mx-auto mb-3" style={{ color: '#3a3a52' }} />
                    <p className="text-sm" style={{ color: '#8888aa' }}>Tu carrito está vacío</p>
                    <button onClick={() => setScreen('menu')} className="mt-2 text-xs font-semibold" style={{ color: '#9E7FFF' }}>
                      Ver menú →
                    </button>
                  </div>
                ) : (
                  <>
                    {myRounds.map((round, ri) => (
                      <div key={round.id}>
                        <div className="flex items-center gap-2 mb-2">
                          {round.addedByWaiter
                            ? <BadgeCheck size={12} style={{ color: '#f59e0b' }} />
                            : <CheckCircle size={12} className="text-success" />
                          }
                          <span className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: round.addedByWaiter ? '#f59e0b' : '#10b981' }}>
                            {round.addedByWaiter ? 'Mozo' : `Ronda ${ri + 1}`} · {round.sentAt}
                          </span>
                          <DestBadge dest={round.destination === 'both' ? 'kitchen' : round.destination} small />
                        </div>
                        {round.items.map(item => {
                          const isShared = item.shared && item.sharedWith
                          const isWaiterAll = item.addedByWaiter && item.assignedTo === 'all'
                          const splitCount = isShared ? item.sharedWith!.length + 1 : isWaiterAll ? session.diners.length : 1
                          const myPrice = splitCount > 0 ? Math.round(item.price * item.qty / splitCount) : item.price * item.qty
                          return (
                            <div key={item.menuItemId} className="flex items-center justify-between py-1.5 pl-5"
                              style={{ borderBottom: '1px solid #1e1e2e' }}>
                              <div>
                                <span className="text-xs text-gastro-text">{item.qty}× {item.name}</span>
                                {isShared && <span className="text-xs ml-1" style={{ color: '#f472b6' }}>÷{splitCount}</span>}
                                {isWaiterAll && <span className="text-xs ml-1" style={{ color: '#f59e0b' }}>÷mesa</span>}
                              </div>
                              <span className="text-xs font-semibold text-gastro-text">${myPrice.toLocaleString()}</span>
                            </div>
                          )
                        })}
                      </div>
                    ))}

                    {myCart.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={12} style={{ color: '#f59e0b' }} />
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                            Pendiente de envío
                          </span>
                        </div>
                        {myCart.map(item => {
                          const isShared = item.shared && item.sharedWith
                          const splitCount = isShared ? item.sharedWith!.length + 1 : 1
                          const myPrice = Math.round(item.price * item.qty / splitCount)
                          return (
                            <div key={item.menuItemId} className="flex items-center gap-3 p-3 rounded-xl mb-2"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e2e' }}>
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs font-semibold text-white">{item.name}</span>
                                  <DestBadge dest={item.destination} small />
                                  {isShared && (
                                    <span className="text-xs px-1 py-0.5 rounded"
                                      style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6', fontSize: '9px' }}>
                                      ÷{splitCount}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs" style={{ color: '#8888aa' }}>${myPrice.toLocaleString()} tu parte</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => onRemoveItem(currentDinerId!, item.menuItemId)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs font-black text-white w-4 text-center">{item.qty}</span>
                                <button onClick={() => {
                                  const mi = MENU_ITEMS.find(m => m.id === item.menuItemId)
                                  if (mi && currentDinerId) onAddItem(currentDinerId, mi, item.shared ?? false, item.sharedWith ?? [])
                                }}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Mesa summary */}
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e2e' }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>Resumen mesa</p>
                      {session.diners.map(d => {
                        const dCartT = d.cart.reduce((s, i) => {
                          const base = i.price * i.qty
                          return s + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
                        }, 0)
                        const dRoundT = d.rounds.reduce((s, r) => s + r.items.reduce((ss, i) => {
                          const base = i.price * i.qty
                          if (i.addedByWaiter && i.assignedTo === 'all') return ss + Math.round(base / Math.max(session.diners.length, 1))
                          return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
                        }, 0), 0)
                        const dTotal = dCartT + dRoundT
                        return (
                          <div key={d.id} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{d.emoji}</span>
                              <span className="text-xs" style={{ color: d.id === currentDinerId ? '#9E7FFF' : '#8888aa' }}>
                                {d.name}{d.id === currentDinerId ? ' (vos)' : ''}
                              </span>
                              {d.paid && <CheckCircle size={10} className="text-success" />}
                            </div>
                            <span className="text-xs font-bold text-white">${dTotal.toLocaleString()}</span>
                          </div>
                        )
                      })}
                      <div className="border-t mt-2 pt-2 flex items-center justify-between" style={{ borderColor: '#1e1e2e' }}>
                        <span className="text-xs font-bold text-white">Total mesa</span>
                        <span className="text-sm font-black" style={{ color: '#9E7FFF' }}>${sessionTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t space-y-2 flex-shrink-0" style={{ borderColor: '#1e1e2e' }}>
                {myCart.length > 0 && (
                  <button onClick={() => setShowConfirm(true)}
                    className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                    <Send size={15} />
                    Enviar a cocina / barra
                  </button>
                )}
                {myCart.length === 0 && (
                  <button onClick={() => setScreen('menu')}
                    className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'rgba(158,127,255,0.12)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }}>
                    <Plus size={14} /> Pedir más cosas
                  </button>
                )}
                {(myRounds.length > 0 || myCart.length > 0) && (
                  <button onClick={() => { setScreen('payment'); setPayStep('split') }}
                    className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.25)', color: '#9E7FFF' }}>
                    <CreditCard size={14} /> Pagar mi cuenta
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {screen === 'payment' && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d0d18' }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid #1e1e2e' }}>
                <button onClick={() => { setScreen('cart'); setPayStep('split') }}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: '#9E7FFF' }}>
                  <ChevronRight size={14} className="rotate-180" /> Volver
                </button>
                <h2 className="font-black text-white text-sm">Pagar cuenta</h2>
                <div className="w-16" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-4 rounded-2xl text-center"
                  style={{ background: 'linear-gradient(135deg, rgba(158,127,255,0.12), rgba(56,189,248,0.08))', border: '1px solid rgba(158,127,255,0.2)' }}>
                  <div className="text-xs mb-1" style={{ color: '#8888aa' }}>Total de la mesa</div>
                  <div className="text-3xl font-black text-white">${sessionTotal.toLocaleString()}</div>
                  <div className="text-xs mt-1" style={{ color: '#8888aa' }}>{session.diners.length} comensales</div>
                </div>

                {payStep === 'split' && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>¿Cómo querés pagar?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'individual', label: 'Solo yo', icon: User },
                          { id: 'equal', label: 'Partes iguales', icon: SplitSquareHorizontal },
                          { id: 'custom', label: 'Elegir', icon: Users },
                        ].map(({ id, label, icon: Icon }) => (
                          <button key={id}
                            onClick={() => { setSplitMode(id as typeof splitMode); setSelectedPayers([]) }}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all"
                            style={{
                              background: splitMode === id ? 'rgba(158,127,255,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${splitMode === id ? 'rgba(158,127,255,0.4)' : '#1e1e2e'}`,
                              color: splitMode === id ? '#9E7FFF' : '#8888aa',
                            }}>
                            <Icon size={15} />
                            <span className="text-center leading-tight">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {splitMode === 'individual' && (
                      <div className="flex items-center justify-between p-3 rounded-xl font-bold"
                        style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.2)' }}>
                        <span className="text-sm text-white">Total a pagar</span>
                        <span className="text-lg" style={{ color: '#9E7FFF' }}>${myAllTimeTotal.toLocaleString()}</span>
                      </div>
                    )}
                    {splitMode === 'equal' && (
                      <div className="p-3 rounded-xl text-xs"
                        style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
                        ${sessionTotal.toLocaleString()} ÷ {unpaidDiners.length} = <strong>${equalSplit.toLocaleString()} c/u</strong>
                      </div>
                    )}
                    {splitMode === 'custom' && (
                      <div className="space-y-2">
                        {session.diners.filter(d => !d.paid).map(d => {
                          const isSelected = selectedPayers.includes(d.id)
                          return (
                            <button key={d.id}
                              onClick={() => setSelectedPayers(prev => isSelected ? prev.filter(id => id !== d.id) : [...prev, d.id])}
                              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                              style={{
                                background: isSelected ? 'rgba(158,127,255,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isSelected ? 'rgba(158,127,255,0.4)' : '#1e1e2e'}`,
                              }}>
                              <div className="w-4 h-4 rounded flex items-center justify-center"
                                style={{ background: isSelected ? '#9E7FFF' : 'rgba(255,255,255,0.08)' }}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                              <span>{d.emoji}</span>
                              <span className="text-sm font-semibold text-white flex-1 text-left">{d.name}</span>
                              {d.id === currentDinerId && <span className="text-xs" style={{ color: '#9E7FFF' }}>(vos)</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => setPayStep('method')}
                      disabled={splitMode === 'custom' && selectedPayers.length === 0}
                      className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c3aed)', boxShadow: '0 4px 20px rgba(158,127,255,0.3)' }}>
                      <CreditCard size={15} /> Continuar al pago
                    </button>
                  </>
                )}

                {payStep === 'method' && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>Método de pago</p>
                    <button onClick={() => setPayStep('processing')}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl"
                      style={{ background: 'rgba(0,100,200,0.15)', border: '1px solid rgba(0,100,200,0.4)', color: '#60a5fa' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
                        style={{ background: 'linear-gradient(135deg, #0064c8, #003c96)' }}>W+</div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm">WebpayPlus</div>
                        <div className="text-xs opacity-70">Débito / crédito / prepago</div>
                      </div>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => {
                        onRegisterPayment(
                          splitMode === 'individual' ? [currentDinerId!]
                            : splitMode === 'equal' ? unpaidDiners.map(d => d.id)
                            : selectedPayers, 'caja')
                        setPayStep('done')
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1e1e2e', color: '#8888aa' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <Receipt size={15} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm text-white">Pagar en caja</div>
                        <div className="text-xs">Efectivo o tarjeta al mozo</div>
                      </div>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {payStep === 'processing' && (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse"
                      style={{ background: 'rgba(158,127,255,0.15)', border: '2px solid rgba(158,127,255,0.3)' }}>
                      <CreditCard size={28} style={{ color: '#9E7FFF' }} />
                    </div>
                    <p className="font-bold text-white mb-2">Procesando pago...</p>
                    <p className="text-xs mb-6" style={{ color: '#8888aa' }}>Redirigiendo a WebpayPlus</p>
                    <button
                      onClick={() => {
                        onRegisterPayment(
                          splitMode === 'individual' ? [currentDinerId!]
                            : splitMode === 'equal' ? unpaidDiners.map(d => d.id)
                            : selectedPayers, 'webpay')
                        setPayStep('done')
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                      ✓ Simular pago exitoso
                    </button>
                  </div>
                )}

                {payStep === 'done' && (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.35)' }}>
                      <CheckCircle size={32} className="text-success" />
                    </div>
                    <p className="font-black text-2xl text-white mb-2">¡Pago registrado!</p>
                    <p className="text-sm mb-1" style={{ color: '#8888aa' }}>Tu boleta fue enviada por email</p>
                    <button onClick={onClose}
                      className="mt-4 px-8 py-3 rounded-2xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showConfirm && screen === 'cart' && currentDiner && (
            <ConfirmSendModal
              items={myCart}
              dinerName={currentDiner.name}
              dinerEmoji={currentDiner.emoji}
              onConfirm={handleSendConfirmed}
              onCancel={() => setShowConfirm(false)}
            />
          )}

          {shareItem && currentDinerId && (
            <ShareModal
              item={shareItem}
              diners={session.diners}
              currentDinerId={currentDinerId}
              onConfirm={(sharedWith) => {
                onAddItem(currentDinerId, shareItem, true, sharedWith)
                setShareItem(null)
              }}
              onCancel={() => setShareItem(null)}
            />
          )}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.25)' }} />
      </div>

      {/* Side info panel */}
      <div className="ml-8 w-64 space-y-4 hidden xl:block">
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>Flujo del cliente</p>
          {[
            { step: '1', label: 'Escanea QR', desc: 'Sesión se abre automáticamente', done: true },
            { step: '2', label: 'Ingresa nombre', desc: 'Se une a la mesa', done: !!currentDinerId },
            { step: '3', label: 'Elige del menú', desc: 'Cocina o barra según ítem', done: (currentDiner?.cart.length ?? 0) > 0 || (currentDiner?.rounds.length ?? 0) > 0 },
            { step: '4', label: 'Confirma y envía', desc: 'Validación antes de enviar', done: (currentDiner?.rounds.length ?? 0) > 0 },
            { step: '5', label: 'Paga su parte', desc: 'Individual, igual o custom', done: currentDiner?.paid ?? false },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{
                  background: s.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: s.done ? '#10b981' : '#6666aa',
                  border: `1px solid ${s.done ? 'rgba(16,185,129,0.4)' : '#2a2a3d'}`,
                }}>
                {s.done ? '✓' : s.step}
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: s.done ? '#e8e8f0' : '#8888aa' }}>{s.label}</div>
                <div className="text-xs" style={{ color: '#6666aa' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main GastroOrder ─────────────────────────────────────────────────────────

export default function GastroOrder() {
  const [sessions, setSessions] = useState<TableSession[]>([
    {
      id: 's1', tableNumber: 'M2', tableLabel: 'Mesa 2', zone: 'Salón',
      status: 'ordering', tableCapacity: 2, openedAt: '20:15', openedByFirstScan: true,
      waiters: [MOCK_WAITERS[0]],
      diners: [
        {
          id: 'd1', name: 'Martina', emoji: '👩', paid: false, joinedAt: '20:15',
          cart: [],
          rounds: [{
            id: 'r1', sentAt: '20:18', destination: 'both',
            items: [
              { menuItemId: 'm4', name: 'Risotto de Hongos', price: 3200, qty: 1, destination: 'kitchen' },
              { menuItemId: 'm10', name: 'Limonada Artesanal', price: 850, qty: 1, destination: 'bar' },
            ]
          }]
        },
        {
          id: 'd2', name: 'Lucas', emoji: '👨', paid: false, joinedAt: '20:16',
          cart: [
            { menuItemId: 'm5', name: 'Lomo a la Pimienta', price: 4800, qty: 1, destination: 'kitchen' },
            { menuItemId: 'm9b', name: 'Vino Tinto Botella', price: 4800, qty: 1, destination: 'bar', shared: true, sharedWith: ['d1', 'd3'] },
          ],
          rounds: []
        },
        {
          id: 'd3', name: 'Sofía', emoji: '👱', paid: false, joinedAt: '20:22',
          cart: [],
          rounds: [
            {
              id: 'r2', sentAt: '20:25', destination: 'bar',
              items: [{ menuItemId: 'm10', name: 'Limonada Artesanal', price: 850, qty: 1, destination: 'bar' }]
            },
            {
              id: 'r3', sentAt: '20:28', destination: 'kitchen', addedByWaiter: true, waiterId: 'w1',
              items: [
                { menuItemId: 'm3', name: 'Tabla de Embutidos', price: 3400, qty: 1, destination: 'kitchen', addedByWaiter: true, assignedTo: 'all' },
                { menuItemId: 'm8', name: 'Agua Mineral', price: 450, qty: 2, destination: 'bar', addedByWaiter: true, assignedTo: 'd2' },
              ]
            }
          ]
        },
      ]
    },
    {
      id: 's2', tableNumber: 'M4', tableLabel: 'Mesa 4', zone: 'Terraza',
      status: 'sent', tableCapacity: 4, openedAt: '20:30', sentAt: '20:35', openedByFirstScan: true,
      waiters: [],
      diners: [
        {
          id: 'd4', name: 'Ana', emoji: '🧕', paid: false, joinedAt: '20:30',
          cart: [],
          rounds: [{ id: 'r4', sentAt: '20:35', destination: 'kitchen', items: [{ menuItemId: 'm1', name: 'Burrata con Tomates', price: 1850, qty: 1, destination: 'kitchen' }] }]
        },
        {
          id: 'd5', name: 'Pedro', emoji: '🧔', paid: false, joinedAt: '20:31',
          cart: [],
          rounds: [{ id: 'r5', sentAt: '20:35', destination: 'kitchen', items: [{ menuItemId: 'm6', name: 'Pasta Carbonara', price: 2900, qty: 1, destination: 'kitchen' }] }]
        },
      ]
    },
  ])

  const [activeView, setActiveView] = useState<'sessions' | 'qr'>('sessions')
  const [kioskSession, setKioskSession] = useState<TableSession | null>(null)
  const [kioskDinerId, setKioskDinerId] = useState<string | null>(null)
  const [kioskMode, setKioskMode] = useState<'customer' | 'waiter'>('customer')
  const [kioskWaiter, setKioskWaiter] = useState<Waiter | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [showWaiterSelect, setShowWaiterSelect] = useState(false)
  const [pendingWaiterTable, setPendingWaiterTable] = useState<TableConfig | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const handleQRScan = (table: TableConfig) => {
    const existing = sessions.find(s => s.tableNumber === table.number && s.status !== 'closed')
    if (existing) {
      setKioskSession(existing)
      setKioskDinerId(null)
      setKioskMode('customer')
    } else {
      const newSession = createAutoSession(table)
      setSessions(prev => [...prev, newSession])
      setKioskSession(newSession)
      setKioskDinerId(null)
      setKioskMode('customer')
    }
  }

  const handleWaiterQRScan = (table: TableConfig) => {
    setPendingWaiterTable(table)
    setShowWaiterSelect(true)
  }

  const handleWaiterSelect = (waiter: Waiter) => {
    setShowWaiterSelect(false)
    if (!pendingWaiterTable) return
    const table = pendingWaiterTable
    setPendingWaiterTable(null)

    const existing = sessions.find(s => s.tableNumber === table.number && s.status !== 'closed')
    let targetSession: TableSession

    if (existing) {
      // Associate waiter if not already
      const alreadyAssigned = existing.waiters.some(w => w.id === waiter.id)
      if (!alreadyAssigned) {
        setSessions(prev => prev.map(s =>
          s.id === existing.id ? { ...s, waiters: [...s.waiters, waiter] } : s
        ))
        targetSession = { ...existing, waiters: [...existing.waiters, waiter] }
      } else {
        targetSession = existing
      }
    } else {
      const newSession: TableSession = { ...createAutoSession(table), waiters: [waiter] }
      setSessions(prev => [...prev, newSession])
      targetSession = newSession
    }

    setKioskSession(targetSession)
    setKioskWaiter(waiter)
    setKioskMode('waiter')
  }

  const handleJoin = (sessionId: string, name: string) => {
    const emoji = DINER_EMOJIS[Math.floor(Math.random() * DINER_EMOJIS.length)]
    const newDiner: Diner = { id: uid(), name, emoji, cart: [], rounds: [], paid: false, joinedAt: nowTime() }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, diners: [...s.diners, newDiner] } : s))
    setKioskDinerId(newDiner.id)
    setKioskSession(prev => prev ? { ...prev, diners: [...prev.diners, newDiner] } : prev)
  }

  const handleAddItem = (sessionId: string, dinerId: string, item: MenuItem, shared: boolean, sharedWith: string[]) => {
    const updater = (s: TableSession): TableSession => ({
      ...s,
      diners: s.diners.map(d => {
        if (d.id !== dinerId) return d
        const existing = d.cart.find(c => c.menuItemId === item.id)
        if (existing) return { ...d, cart: d.cart.map(c => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c) }
        return {
          ...d, cart: [...d.cart, {
            menuItemId: item.id, name: item.name, price: item.price, qty: 1,
            destination: item.destination, shared, sharedWith: shared ? sharedWith : undefined
          }]
        }
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

  const handleSendRound = (sessionId: string, dinerId: string) => {
    const updater = (s: TableSession): TableSession => {
      const diner = s.diners.find(d => d.id === dinerId)
      if (!diner || diner.cart.length === 0) return s
      const hasKitchen = diner.cart.some(i => i.destination === 'kitchen')
      const hasBar = diner.cart.some(i => i.destination === 'bar')
      const dest: OrderRound['destination'] = hasKitchen && hasBar ? 'both' : hasKitchen ? 'kitchen' : 'bar'
      const newRound: OrderRound = { id: uid(), items: [...diner.cart], sentAt: nowTime(), destination: dest }
      return {
        ...s, status: 'sent',
        diners: s.diners.map(d => d.id === dinerId ? { ...d, cart: [], rounds: [...d.rounds, newRound] } : d)
      }
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s))
    setKioskSession(prev => prev?.id === sessionId ? updater(prev) : prev)
  }

  // Waiter sends a round: distribute 'all' items across all diners
  const handleSendWaiterRound = (sessionId: string, items: CartItem[], waiterId: string) => {
    const updater = (s: TableSession): TableSession => {
      if (items.length === 0) return s
      const hasKitchen = items.some(i => i.destination === 'kitchen')
      const hasBar = items.some(i => i.destination === 'bar')
      const dest: OrderRound['destination'] = hasKitchen && hasBar ? 'both' : hasKitchen ? 'kitchen' : 'bar'
      const newRound: OrderRound = {
        id: uid(), items: [...items], sentAt: nowTime(),
        destination: dest, addedByWaiter: true, waiterId,
      }

      // Distribute: 'all' items go to first diner (or create a shared round on all diners)
      // Strategy: add the round to the first diner, mark as waiter round
      // Individual assignments go to the specific diner
      let updatedDiners = [...s.diners]

      // Items assigned to specific diners
      const individualItems = items.filter(i => i.assignedTo !== 'all')
      const sharedItems = items.filter(i => i.assignedTo === 'all')

      // Add shared round to all diners (each gets a copy with their split)
      if (sharedItems.length > 0 && updatedDiners.length > 0) {
        updatedDiners = updatedDiners.map(d => ({
          ...d,
          rounds: [...d.rounds, {
            id: uid(), items: sharedItems, sentAt: nowTime(),
            destination: dest, addedByWaiter: true, waiterId,
          }]
        }))
      } else if (sharedItems.length > 0) {
        // No diners yet — add to a "pending" pool (simplified: add to session-level)
        // For now, just mark as sent without diner assignment
      }

      // Add individual items to specific diners
      individualItems.forEach(item => {
        const targetDiner = updatedDiners.find(d => d.id === item.assignedTo)
        if (targetDiner) {
          updatedDiners = updatedDiners.map(d =>
            d.id === item.assignedTo
              ? {
                  ...d, rounds: [...d.rounds, {
                    id: uid(), items: [item], sentAt: nowTime(),
                    destination: item.destination, addedByWaiter: true, waiterId,
                  }]
                }
              : d
          )
        }
      })

      return { ...s, status: 'sent', diners: updatedDiners }
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s))
    setKioskSession(prev => prev?.id === sessionId ? updater(prev) : prev)
  }

  const handleRegisterPayment = (sessionId: string, dinerIds: string[], method: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const updatedDiners = s.diners.map(d =>
        dinerIds.includes(d.id) ? { ...d, paid: true, paymentMethod: method } : d
      )
      const allPaid = updatedDiners.every(d => d.paid)
      return { ...s, diners: updatedDiners, status: allPaid ? 'closed' : 'paying' }
    }))
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
    if (kioskSession?.id === sessionId) { setKioskSession(null); setKioskDinerId(null) }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const activeSessions = sessions.filter(s => s.status !== 'closed')
  const totalDiners = activeSessions.reduce((s, sess) => s + sess.diners.length, 0)
  const totalRevenue = activeSessions.reduce((s, sess) =>
    s + sess.diners.reduce((ss, d) => {
      const cartT = d.cart.reduce((sss, i) => {
        const base = i.price * i.qty
        return sss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
      }, 0)
      const roundT = d.rounds.reduce((sss, r) => sss + r.items.reduce((ssss, i) => {
        const base = i.price * i.qty
        if (i.addedByWaiter && i.assignedTo === 'all') return ssss + Math.round(base / Math.max(sess.diners.length, 1))
        return ssss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
      }, 0), 0)
      return ss + cartT + roundT
    }, 0), 0)

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
          { label: 'En cocina/barra', value: activeSessions.filter(s => s.status === 'sent').length, color: '#10b981', icon: UtensilsCrossed },
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { id: 'sessions', label: 'Sesiones activas' },
            { id: 'qr', label: 'QR por mesa' },
          ].map(v => (
            <button key={v.id}
              onClick={() => setActiveView(v.id as typeof activeView)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeView === v.id
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)', color: '#9E7FFF' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
              {v.label}
            </button>
          ))}
        </div>
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
                Las sesiones se abren automáticamente cuando un comensal escanea el QR
              </p>
              <button onClick={() => setActiveView('qr')} className="btn-primary text-sm px-4 py-2">
                <QrCode size={15} /> Ver QR por mesa
              </button>
            </div>
          )}

          {activeSessions.map(session => {
            const cfg = STATUS_CFG[session.status]
            const sessionTotal = session.diners.reduce((s, d) => {
              const cartT = d.cart.reduce((ss, i) => {
                const base = i.price * i.qty
                return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
              }, 0)
              const roundT = d.rounds.reduce((ss, r) => ss + r.items.reduce((sss, i) => {
                const base = i.price * i.qty
                if (i.addedByWaiter && i.assignedTo === 'all') return sss + Math.round(base / Math.max(session.diners.length, 1))
                return sss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
              }, 0), 0)
              return s + cartT + roundT
            }, 0)
            const isExpanded = expandedSession === session.id
            const overCapacity = session.diners.length > session.tableCapacity

            return (
              <div key={session.id} className="card-gastro">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                      style={{ background: 'rgba(158,127,255,0.15)', color: '#9E7FFF' }}>
                      {session.tableNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-bold text-gastro-text">{session.tableLabel}</div>
                        {session.openedByFirstScan && (
                          <span className="text-xs px-1.5 py-0.5 rounded-lg"
                            style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px' }}>
                            Auto-QR
                          </span>
                        )}
                        {session.waiters.map(w => (
                          <span key={w.id} className="text-xs px-1.5 py-0.5 rounded-lg flex items-center gap-1"
                            style={{ background: `${w.color}15`, color: w.color, fontSize: '10px' }}>
                            {w.emoji} {w.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gastro-subtle">{session.zone} · Abierta {session.openedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
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
                    const cartT = diner.cart.reduce((s, i) => {
                      const base = i.price * i.qty
                      return s + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
                    }, 0)
                    const roundT = diner.rounds.reduce((s, r) => s + r.items.reduce((ss, i) => {
                      const base = i.price * i.qty
                      if (i.addedByWaiter && i.assignedTo === 'all') return ss + Math.round(base / Math.max(session.diners.length, 1))
                      return ss + (i.shared && i.sharedWith ? Math.round(base / (i.sharedWith.length + 1)) : base)
                    }, 0), 0)
                    const dTotal = cartT + roundT
                    return (
                      <button key={diner.id}
                        className="p-3 rounded-xl text-left transition-all hover:bg-white/5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{diner.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gastro-text truncate">{diner.name}</div>
                            <div className="text-xs" style={{ color: '#8888aa' }}>
                              {diner.rounds.length} ronda{diner.rounds.length !== 1 ? 's' : ''}
                              {diner.cart.length > 0 && <span className="text-warning"> +{diner.cart.length} pend.</span>}
                            </div>
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
                  <div className="mb-4 p-4 rounded-xl space-y-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8888aa' }}>
                      Detalle por comensal
                    </p>
                    {session.diners.map(diner => (
                      <div key={diner.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>{diner.emoji}</span>
                          <span className="text-sm font-bold text-gastro-text">{diner.name}</span>
                          {diner.paid && (
                            <span className="text-xs px-1.5 py-0.5 rounded-lg text-success"
                              style={{ background: 'rgba(16,185,129,0.12)' }}>
                              ✓ {diner.paymentMethod === 'webpay' ? 'WebpayPlus' : 'Caja'}
                            </span>
                          )}
                        </div>
                        {diner.rounds.map((round, ri) => (
                          <div key={round.id} className="pl-6 mb-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              {round.addedByWaiter
                                ? <BadgeCheck size={10} style={{ color: '#f59e0b' }} />
                                : <CheckCircle size={10} className="text-success" />
                              }
                              <span className="text-xs font-semibold"
                                style={{ color: round.addedByWaiter ? '#f59e0b' : '#10b981' }}>
                                {round.addedByWaiter ? 'Mozo' : `Ronda ${ri + 1}`} · {round.sentAt}
                              </span>
                              <DestBadge dest={round.destination === 'both' ? 'kitchen' : round.destination} small />
                            </div>
                            {round.items.map(item => (
                              <div key={item.menuItemId} className="flex items-center justify-between text-xs py-0.5">
                                <span style={{ color: '#8888aa' }}>
                                  {item.qty}× {item.name}
                                  {item.shared && <span style={{ color: '#f472b6' }}> (compartido)</span>}
                                  {item.addedByWaiter && item.assignedTo === 'all' && <span style={{ color: '#f59e0b' }}> ÷mesa</span>}
                                </span>
                                <span className="font-semibold text-gastro-text">
                                  ${(item.addedByWaiter && item.assignedTo === 'all'
                                    ? Math.round(item.price * item.qty / Math.max(session.diners.length, 1))
                                    : item.shared && item.sharedWith
                                      ? Math.round(item.price * item.qty / (item.sharedWith.length + 1))
                                      : item.price * item.qty
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                        {diner.cart.length > 0 && (
                          <div className="pl-6">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock size={10} style={{ color: '#f59e0b' }} />
                              <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Pendiente</span>
                            </div>
                            {diner.cart.map(item => (
                              <div key={item.menuItemId} className="flex items-center justify-between text-xs py-0.5">
                                <span style={{ color: '#8888aa' }}>{item.qty}× {item.name}</span>
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
                    {session.diners.some(d => d.paid) && (
                      <span className="text-xs px-1.5 py-0.5 rounded-lg text-success"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                        {session.diners.filter(d => d.paid).length} pagaron
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setKioskSession(session); setKioskDinerId(null); setKioskMode('customer') }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                      <Smartphone size={13} /> Cliente
                    </button>
                    <button
                      onClick={() => handleWaiterQRScan(MOCK_TABLES.find(t => t.number === session.tableNumber) ?? MOCK_TABLES[0])}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                      <BadgeCheck size={13} /> Mozo
                    </button>
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
                    <p className="text-xs text-gastro-subtle">{table.zone} · cap. {table.capacity}</p>
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
                  <div className="p-3 rounded-xl mb-3 space-y-1.5"
                    style={{ background: 'rgba(158,127,255,0.06)', border: '1px solid rgba(158,127,255,0.15)' }}>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Comensales</span>
                      <span className="font-bold text-gastro-text">
                        {dinerCountLabel(activeSession.diners.length, table.capacity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Mozos</span>
                      <span className="font-bold text-gastro-text">
                        {activeSession.waiters.length > 0
                          ? activeSession.waiters.map(w => `${w.emoji} ${w.name}`).join(', ')
                          : 'Sin asignar'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#8888aa' }}>Estado</span>
                      <span className="font-semibold" style={{ color: STATUS_CFG[activeSession.status].color }}>
                        {STATUS_CFG[activeSession.status].label}
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                    <Smartphone size={13} />
                    {activeSession ? 'Kiosco cliente' : 'Simular scan'}
                  </button>
                  <button
                    onClick={() => handleWaiterQRScan(table)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                    <BadgeCheck size={13} /> Mozo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Waiter selector modal */}
      {showWaiterSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-80 rounded-3xl overflow-hidden"
            style={{ background: '#141420', border: '1px solid #2a2a3d', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div className="p-5 border-b" style={{ borderColor: '#2a2a3d' }}>
              <div className="flex items-center gap-2 mb-1">
                <BadgeCheck size={16} style={{ color: '#f59e0b' }} />
                <h3 className="font-black text-gastro-text">Identificación de mozo</h3>
              </div>
              <p className="text-xs" style={{ color: '#8888aa' }}>
                {pendingWaiterTable?.label} · Seleccioná tu perfil para asociarte a la mesa
              </p>
            </div>
            <div className="p-4 space-y-2">
              {MOCK_WAITERS.map(w => (
                <button key={w.id}
                  onClick={() => handleWaiterSelect(w)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{ background: `${w.color}0d`, border: `1px solid ${w.color}33` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${w.color}18` }}>
                    {w.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gastro-text">{w.name}</div>
                    <div className="text-xs" style={{ color: w.color }}>Mozo · Osteria Moderna</div>
                  </div>
                  <ArrowRight size={16} style={{ color: w.color }} />
                </button>
              ))}
            </div>
            <div className="p-4 border-t" style={{ borderColor: '#2a2a3d' }}>
              <button onClick={() => { setShowWaiterSelect(false); setPendingWaiterTable(null) }}
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', color: '#8888aa' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Phone Kiosk */}
      {kioskSession && kioskMode === 'customer' && (
        <PhoneKiosk
          session={kioskSession}
          currentDinerId={kioskDinerId}
          onJoin={name => handleJoin(kioskSession.id, name)}
          onAddItem={(dinerId, item, shared, sharedWith) => handleAddItem(kioskSession.id, dinerId, item, shared, sharedWith)}
          onRemoveItem={(dinerId, itemId) => handleRemoveItem(kioskSession.id, dinerId, itemId)}
          onSendRound={dinerId => handleSendRound(kioskSession.id, dinerId)}
          onRegisterPayment={(dinerIds, method) => handleRegisterPayment(kioskSession.id, dinerIds, method)}
          onClose={() => { setKioskSession(null); setKioskDinerId(null) }}
        />
      )}

      {/* Waiter Phone Kiosk */}
      {kioskSession && kioskMode === 'waiter' && kioskWaiter && (
        <WaiterPhoneKiosk
          session={kioskSession}
          waiter={kioskWaiter}
          onAddWaiterItem={(item, assignedTo, qty) => {}}
          onSendWaiterRound={(items) => handleSendWaiterRound(kioskSession.id, items, kioskWaiter.id)}
          onClose={() => { setKioskSession(null); setKioskWaiter(null) }}
        />
      )}
    </div>
  )
}
