import { useState, useMemo } from 'react'
import {
  UtensilsCrossed, ShoppingBag, Truck, Search, Plus, Minus, Trash2,
  Send, Users, MapPin, CreditCard, Banknote, Smartphone, CheckCircle2,
  MessageSquare, Monitor,
} from 'lucide-react'
import { MENU_PRODUCTS, MENU_CATEGORIES, TABLES_DATA, type LiveOrder, type OrderLineItem } from '../data/mockData'
import { useServe, nextOrderId } from '../context/ServeContext'
import { useAuth } from '../context/AuthContext'

type PosMode = 'salon' | 'takeaway' | 'delivery'

interface CartLine {
  productId: number
  name: string
  price: number
  category: string
  qty: number
  mods: string
}

const POS_MODES: { id: PosMode; label: string; icon: typeof UtensilsCrossed; channel: LiveOrder['channel']; tableLabel: string }[] = [
  { id: 'salon', label: 'Mesa', icon: UtensilsCrossed, channel: 'salon', tableLabel: 'Mesa' },
  { id: 'takeaway', label: 'Take Away', icon: ShoppingBag, channel: 'takeaway', tableLabel: 'Take Away' },
  { id: 'delivery', label: 'Delivery', icon: Truck, channel: 'delivery', tableLabel: 'Delivery' },
]

const PAYMENT_METHODS = [
  { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
  { id: 'Mercado Pago', label: 'Mercado Pago', icon: Smartphone },
]

const STATION_BY_CATEGORY: Record<string, string> = {
  Entradas: 'Fría',
  Pastas: 'Caliente',
  Carnes: 'Parrilla',
  Pizzas: 'Horno',
  Postres: 'Pastelería',
  Bebidas: 'Barra',
  Pescados: 'Parrilla',
}

function stationForCategory(category: string): string {
  return STATION_BY_CATEGORY[category] ?? 'Caliente'
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-AR')}`
}

interface PosPanelProps {
  initialTable?: string
  onOrderCreated?: (order: LiveOrder) => void
}

export default function PosPanel({ initialTable, onOrderCreated }: PosPanelProps) {
  const { user } = useAuth()
  const { orders, addOrder } = useServe()

  const parsedTable = initialTable?.replace(/^Mesa\s*/i, '') ?? ''
  const initialMode: PosMode = initialTable?.toLowerCase().includes('take') ? 'takeaway'
    : initialTable?.toLowerCase().includes('delivery') ? 'delivery'
    : 'salon'

  const [mode, setMode] = useState<PosMode>(initialMode)
  const [selectedTable, setSelectedTable] = useState(parsedTable || '5')
  const [guests, setGuests] = useState(2)
  const [customerName, setCustomerName] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return MENU_PRODUCTS.filter(p => {
      const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      const available = p.stock !== 'out'
      return matchCat && matchSearch && available
    })
  }, [categoryFilter, search])

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0)
  const tax = Math.round(subtotal * 0.21)
  const total = subtotal + tax

  const selectedTableData = TABLES_DATA.find(t => t.number === selectedTable)
  const waiterName = user?.name.split(' ').map((n, i) => i === 0 ? n : `${n[0]}.`).join(' ') ?? 'Staff'

  const addToCart = (product: typeof MENU_PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(l => l.productId === product.id && !l.mods)
      if (existing) {
        return prev.map(l => l.productId === product.id && !l.mods ? { ...l, qty: l.qty + 1 } : l)
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        qty: 1,
        mods: '',
      }]
    })
  }

  const updateQty = (index: number, delta: number) => {
    setCart(prev => prev.map((line, i) => {
      if (i !== index) return line
      const qty = Math.max(1, line.qty + delta)
      return { ...line, qty }
    }))
  }

  const removeLine = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const updateMods = (index: number, mods: string) => {
    setCart(prev => prev.map((line, i) => i === index ? { ...line, mods } : line))
  }

  const clearCart = () => {
    setCart([])
    setOrderNotes('')
    setCustomerName('')
  }

  const submitOrder = () => {
    if (cart.length === 0) return
    if (mode === 'salon' && !selectedTable) return
    if ((mode === 'takeaway' || mode === 'delivery') && !customerName.trim()) return

    const now = new Date()
    const createdAt = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const modeCfg = POS_MODES.find(m => m.id === mode)!
    const tableLabel = mode === 'salon'
      ? `Mesa ${selectedTable}`
      : modeCfg.tableLabel

    const lineItems: OrderLineItem[] = cart.map(line => ({
      name: line.name,
      qty: line.qty,
      price: line.price,
      category: line.category,
      mods: line.mods ? [line.mods] : [],
      status: 'pending',
      station: stationForCategory(line.category),
    }))

    const notesParts = [
      orderNotes.trim(),
      mode !== 'salon' && customerName.trim() ? `Cliente: ${customerName.trim()}` : '',
    ].filter(Boolean)

    const order: LiveOrder = {
      id: nextOrderId(orders),
      table: tableLabel,
      channel: modeCfg.channel,
      zone: mode === 'salon' ? (selectedTableData?.zone ?? 'Salón') : mode === 'takeaway' ? 'Mostrador' : 'Delivery',
      items: cart.reduce((n, l) => n + l.qty, 0),
      guests: mode === 'salon' ? guests : 1,
      status: 'pending',
      time: '0 min',
      waiter: waiterName,
      createdAt,
      lineItems,
      subtotal,
      tax,
      tip: 0,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      notes: notesParts.length ? notesParts.join(' · ') : undefined,
      timeline: [
        { time: createdAt, event: `Pedido cargado desde POS web`, actor: waiterName },
        { time: createdAt, event: 'Enviado a cocina', actor: 'KDS' },
      ],
    }

    addOrder(order)
    clearCart()
    setToast(`Pedido ${order.id} enviado a cocina`)
    onOrderCreated?.(order)
    setTimeout(() => setToast(null), 4000)
  }

  const canSubmit = cart.length > 0
    && (mode === 'salon' ? !!selectedTable : !!customerName.trim())

  return (
    <div className="space-y-4">
      {toast && (
        <div className="flex items-center gap-3 p-4 rounded-xl animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          <span className="text-sm font-semibold text-gastro-text">{toast}</span>
          <span className="text-xs text-gastro-subtle ml-auto">Visible en Pedidos y KDS</span>
        </div>
      )}

      <div className="grid xl:grid-cols-[280px_1fr_320px] gap-4 min-h-[620px]">
        {/* Order setup */}
        <div className="card-gastro p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={16} className="text-primary-400" />
            <h3 className="font-bold text-gastro-text text-sm">Nueva comanda</h3>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {POS_MODES.map(m => {
              const Icon = m.icon
              const active = mode === m.id
              return (
                <button key={m.id} type="button" onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all ${active ? 'text-primary-400' : 'text-gastro-subtle'}`}
                  style={active
                    ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                  <Icon size={16} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {mode === 'salon' ? (
            <>
              <div>
                <label className="text-xs text-gastro-muted mb-2 block">Seleccionar mesa</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {TABLES_DATA.map(table => {
                    const active = selectedTable === table.number
                    const occupied = table.status === 'occupied'
                    return (
                      <button key={table.id} type="button"
                        onClick={() => {
                          setSelectedTable(table.number)
                          setGuests(table.capacity <= 4 ? table.capacity : 4)
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${active ? 'text-primary-400' : occupied ? 'text-warning' : 'text-gastro-subtle'}`}
                        style={{
                          background: active ? 'rgba(37,99,235,0.2)' : occupied ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? 'rgba(37,99,235,0.4)' : occupied ? 'rgba(245,158,11,0.25)' : '#1A2540'}`,
                        }}>
                        {table.number}
                      </button>
                    )
                  })}
                </div>
                {selectedTableData && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gastro-subtle">
                    <MapPin size={12} />
                    {selectedTableData.zone} · {selectedTableData.capacity} pax
                    {selectedTableData.status === 'occupied' && (
                      <span className="text-warning font-semibold">· Ocupada</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gastro-muted mb-2 block flex items-center gap-1">
                  <Users size={12} /> Comensales
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gastro-subtle hover:text-gastro-text"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' }}>
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-black text-gastro-text w-8 text-center">{guests}</span>
                  <button type="button" onClick={() => setGuests(g => g + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gastro-subtle hover:text-gastro-text"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs text-gastro-muted mb-2 block">
                Nombre del cliente {mode === 'delivery' ? '· dirección en notas' : ''}
              </label>
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={mode === 'takeaway' ? 'Ej. Diego Torres' : 'Ej. María López'}
                className="input-gastro w-full text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gastro-muted mb-2 block">Método de pago</label>
            <div className="space-y-1.5">
              {PAYMENT_METHODS.map(pm => {
                const Icon = pm.icon
                const active = paymentMethod === pm.id
                return (
                  <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active ? 'text-primary-400' : 'text-gastro-subtle'}`}
                    style={active
                      ? { background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }
                      : { background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}>
                    <Icon size={14} />
                    {pm.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: '#1A2540' }}>
            <div className="text-xs text-gastro-muted">Mozo</div>
            <div className="text-sm font-semibold text-gastro-text">{waiterName}</div>
          </div>
        </div>

        {/* Product catalog */}
        <div className="card-gastro p-4 flex flex-col min-h-0">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="input-gastro pl-9 py-2 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-4">
            <button type="button" onClick={() => setCategoryFilter('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === 'Todos' ? 'text-primary-400' : 'text-gastro-subtle'}`}
              style={categoryFilter === 'Todos' ? { background: 'rgba(37,99,235,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
              Todos
            </button>
            {MENU_CATEGORIES.filter(c => c.active).map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategoryFilter(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === cat.name ? 'text-primary-400' : 'text-gastro-subtle'}`}
                style={categoryFilter === cat.name ? { background: 'rgba(37,99,235,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 pr-1">
            {filteredProducts.map(product => (
              <button key={product.id} type="button" onClick={() => addToCart(product)}
                className="rounded-xl overflow-hidden text-left transition-all hover:scale-[1.02] group"
                style={{ background: '#0A0F1A', border: '1px solid #1A2540' }}>
                <div className="relative h-24 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.stock === 'low' && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(245,158,11,0.9)', color: '#fff' }}>
                      Stock bajo
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-gastro-text line-clamp-2 mb-1">{product.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-primary-400">{formatMoney(product.price)}</span>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(37,99,235,0.2)' }}>
                      <Plus size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="card-gastro p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gastro-text text-sm">Comanda actual</h3>
            {cart.length > 0 && (
              <button type="button" onClick={clearCart} className="text-xs text-gastro-muted hover:text-error transition-colors">
                Vaciar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[200px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ShoppingBag size={32} className="text-gastro-muted mb-3 opacity-40" />
                <p className="text-sm text-gastro-subtle">Agregá productos desde la carta</p>
                <p className="text-xs text-gastro-muted mt-1">Seleccioná mesa o tipo de pedido</p>
              </div>
            ) : (
              cart.map((line, index) => (
                <div key={`${line.productId}-${index}`} className="rounded-xl p-3" style={{ background: '#0A0F1A' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gastro-text line-clamp-2">{line.name}</div>
                      <div className="text-xs text-gastro-muted mt-0.5">{formatMoney(line.price)} c/u</div>
                    </div>
                    <button type="button" onClick={() => removeLine(index)} className="text-gastro-muted hover:text-error p-0.5">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => updateQty(index, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-gastro-subtle"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-black text-gastro-text w-5 text-center">{line.qty}</span>
                      <button type="button" onClick={() => updateQty(index, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-gastro-subtle"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-primary-400">{formatMoney(line.price * line.qty)}</span>
                  </div>
                  <input
                    value={line.mods}
                    onChange={e => updateMods(index, e.target.value)}
                    placeholder="Modificadores (ej. sin sal)"
                    className="input-gastro w-full text-xs mt-2 py-1.5"
                  />
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-3 border-t" style={{ borderColor: '#1A2540' }}>
            <div className="relative">
              <MessageSquare size={12} className="absolute left-3 top-2.5 text-gastro-muted" />
              <input
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="Notas del pedido..."
                className="input-gastro w-full text-xs pl-8 py-2"
              />
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gastro-subtle">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gastro-subtle">
                <span>IVA 21%</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between font-black text-gastro-text text-sm pt-1">
                <span>Total</span>
                <span className="text-primary-400">{formatMoney(total)}</span>
              </div>
            </div>

            <button type="button" onClick={submitOrder} disabled={!canSubmit}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2 ${canSubmit ? 'btn-primary' : 'opacity-40 cursor-not-allowed'}`}
              style={!canSubmit ? { background: 'rgba(37,99,235,0.2)' } : undefined}>
              <Send size={16} />
              Enviar a cocina
            </button>

            {!canSubmit && cart.length > 0 && mode !== 'salon' && !customerName.trim() && (
              <p className="text-[10px] text-warning text-center">Ingresá el nombre del cliente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
