import { useState } from 'react'
import {
  Truck, Search, Filter, Plus, Star, MapPin, Phone, Mail, Clock,
  Package, ShoppingCart, CheckCircle, AlertTriangle, TrendingDown,
  FileText, Calendar, ChevronRight, RefreshCw, ExternalLink, X,
  Leaf, Beef, Wine, Wheat, Box, Zap, ArrowUpRight, Timer, Shield
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SupplierCategory = 'carnes' | 'lacteos' | 'verduras' | 'bebidas' | 'secos' | 'gourmet'
type SupplierStatus = 'active' | 'paused' | 'pending'
type OrderStatus = 'pending' | 'confirmed' | 'transit' | 'delivered' | 'cancelled'
type ContractStatus = 'active' | 'expiring' | 'expired'

interface Supplier {
  id: string
  name: string
  category: SupplierCategory
  rating: number
  reviews: number
  location: string
  deliveryTime: string
  minOrder: number
  status: SupplierStatus
  products: number
  onTimeRate: number
  isPreferred?: boolean
  isVerified?: boolean
  contact: { phone: string; email: string }
  image: string
}

interface MarketplaceProduct {
  id: string
  name: string
  supplier: string
  supplierId: string
  category: SupplierCategory
  unit: string
  price: number
  previousPrice?: number
  stock: 'available' | 'low' | 'out'
  image: string
  isOrganic?: boolean
  isBestPrice?: boolean
}

interface SupplyOrder {
  id: string
  supplier: string
  items: number
  total: number
  status: OrderStatus
  date: string
  eta?: string
  tracking?: string
}

interface Contract {
  id: string
  supplier: string
  type: string
  startDate: string
  endDate: string
  value: number
  status: ContractStatus
  discount: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CATEGORY_META: Record<SupplierCategory, { label: string; icon: typeof Beef; color: string }> = {
  carnes: { label: 'Carnes', icon: Beef, color: '#ef4444' },
  lacteos: { label: 'Lácteos', icon: Package, color: '#38bdf8' },
  verduras: { label: 'Verduras', icon: Leaf, color: '#10b981' },
  bebidas: { label: 'Bebidas', icon: Wine, color: '#9E7FFF' },
  secos: { label: 'Secos & Harinas', icon: Wheat, color: '#f59e0b' },
  gourmet: { label: 'Gourmet', icon: Box, color: '#f472b6' },
}

const SUPPLIERS: Supplier[] = [
  {
    id: 's1', name: 'Carnes Premium SA', category: 'carnes', rating: 4.9, reviews: 128,
    location: 'Mataderos, CABA', deliveryTime: '24-48 h', minOrder: 50000, status: 'active',
    products: 42, onTimeRate: 97, isPreferred: true, isVerified: true,
    contact: { phone: '+54 11 4567-8900', email: 'ventas@carnespremium.com.ar' },
    image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?w=400',
  },
  {
    id: 's2', name: 'Molinos del Sur', category: 'secos', rating: 4.7, reviews: 84,
    location: 'Avellaneda, BA', deliveryTime: '48-72 h', minOrder: 15000, status: 'active',
    products: 68, onTimeRate: 94, isVerified: true,
    contact: { phone: '+54 11 4200-1234', email: 'pedidos@molinosdelsur.com' },
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=400',
  },
  {
    id: 's3', name: 'Verduras Frescas', category: 'verduras', rating: 4.8, reviews: 156,
    location: 'Mercado Central', deliveryTime: 'Mismo día', minOrder: 8000, status: 'active',
    products: 120, onTimeRate: 99, isPreferred: true, isVerified: true,
    contact: { phone: '+54 11 4600-5678', email: 'info@verdurasfrescas.com.ar' },
    image: 'https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?w=400',
  },
  {
    id: 's4', name: 'Lácteos Artesanos', category: 'lacteos', rating: 4.6, reviews: 62,
    location: 'Tandil, BA', deliveryTime: '72 h', minOrder: 20000, status: 'active',
    products: 35, onTimeRate: 91, isVerified: true,
    contact: { phone: '+54 2293 456789', email: 'ventas@lacteosartesanos.com' },
    image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?w=400',
  },
  {
    id: 's5', name: 'Importadora Gourmet', category: 'gourmet', rating: 4.5, reviews: 41,
    location: 'Microcentro, CABA', deliveryTime: '3-5 días', minOrder: 30000, status: 'active',
    products: 210, onTimeRate: 88,
    contact: { phone: '+54 11 4321-9876', email: 'compras@importadoragourmet.com' },
    image: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?w=400',
  },
  {
    id: 's6', name: 'Bodega Mendoza', category: 'bebidas', rating: 4.9, reviews: 93,
    location: 'Mendoza', deliveryTime: '5-7 días', minOrder: 40000, status: 'active',
    products: 78, onTimeRate: 96, isPreferred: true, isVerified: true,
    contact: { phone: '+54 261 456-7890', email: 'mayorista@bodegamendoza.com' },
    image: 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?w=400',
  },
  {
    id: 's7', name: 'Distribuidora Norte', category: 'secos', rating: 4.2, reviews: 28,
    location: 'San Isidro, BA', deliveryTime: '48 h', minOrder: 12000, status: 'paused',
    products: 55, onTimeRate: 82,
    contact: { phone: '+54 11 4700-1111', email: 'ventas@distnorte.com.ar' },
    image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=400',
  },
]

const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  { id: 'p1', name: 'Lomo de res premium', supplier: 'Carnes Premium SA', supplierId: 's1', category: 'carnes', unit: 'kg', price: 28000, previousPrice: 29500, stock: 'available', image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?w=200', isBestPrice: true },
  { id: 'p2', name: 'Harina 000 orgánica', supplier: 'Molinos del Sur', supplierId: 's2', category: 'secos', unit: 'kg', price: 1200, stock: 'available', image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=200', isOrganic: true },
  { id: 'p3', name: 'Tomates Cherry', supplier: 'Verduras Frescas', supplierId: 's3', category: 'verduras', unit: 'kg', price: 3500, stock: 'available', image: 'https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?w=200', isBestPrice: true },
  { id: 'p4', name: 'Queso Parmesano 24 meses', supplier: 'Lácteos Artesanos', supplierId: 's4', category: 'lacteos', unit: 'kg', price: 18000, previousPrice: 19200, stock: 'low', image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?w=200' },
  { id: 'p5', name: 'Aceite de Oliva EV', supplier: 'Importadora Gourmet', supplierId: 's5', category: 'gourmet', unit: 'lt', price: 12000, stock: 'available', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?w=200' },
  { id: 'p6', name: 'Hongos Porcini secos', supplier: 'Importadora Gourmet', supplierId: 's5', category: 'gourmet', unit: 'kg', price: 45000, stock: 'available', image: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?w=200' },
  { id: 'p7', name: 'Malbec Reserva 2022', supplier: 'Bodega Mendoza', supplierId: 's6', category: 'bebidas', unit: 'bt', price: 8500, stock: 'available', image: 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?w=200', isBestPrice: true },
  { id: 'p8', name: 'Crema de leche 35%', supplier: 'Lácteos Artesanos', supplierId: 's4', category: 'lacteos', unit: 'lt', price: 2800, stock: 'available', image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=200' },
  { id: 'p9', name: 'Harina 000', supplier: 'Distribuidora Norte', supplierId: 's7', category: 'secos', unit: 'kg', price: 980, stock: 'out', image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?w=200' },
]

const SUPPLY_ORDERS: SupplyOrder[] = [
  { id: 'PO-0142', supplier: 'Molinos del Sur', items: 3, total: 48000, status: 'pending', date: 'Hoy 14:30' },
  { id: 'PO-0141', supplier: 'Carnes Premium SA', items: 5, total: 280000, status: 'transit', date: 'Ayer', eta: 'Hoy 18:00', tracking: 'TRK-8847291' },
  { id: 'PO-0140', supplier: 'Importadora Gourmet', items: 2, total: 95000, status: 'delivered', date: 'Hace 3 días' },
  { id: 'PO-0139', supplier: 'Verduras Frescas', items: 8, total: 42000, status: 'confirmed', date: 'Hace 4 días', eta: 'Mañana 07:00' },
  { id: 'PO-0138', supplier: 'Bodega Mendoza', items: 12, total: 102000, status: 'delivered', date: 'Hace 1 semana' },
]

const CONTRACTS: Contract[] = [
  { id: 'CT-001', supplier: 'Carnes Premium SA', type: 'Suministro mensual', startDate: '01 Ene 2025', endDate: '31 Dic 2025', value: 3360000, status: 'active', discount: 8 },
  { id: 'CT-002', supplier: 'Verduras Frescas', type: 'Entrega diaria', startDate: '15 Mar 2025', endDate: '14 Mar 2026', value: 960000, status: 'active', discount: 5 },
  { id: 'CT-003', supplier: 'Bodega Mendoza', type: 'Exclusividad bebidas', startDate: '01 Jun 2024', endDate: '31 May 2025', value: 1224000, status: 'expiring', discount: 12 },
  { id: 'CT-004', supplier: 'Molinos del Sur', type: 'Volumen trimestral', startDate: '01 Oct 2024', endDate: '31 Dic 2024', value: 180000, status: 'expired', discount: 6 },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function GastroSupply() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'marketplace' | 'orders' | 'contracts'>('suppliers')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'all'>('all')
  const [cartCount, setCartCount] = useState(0)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [orderModal, setOrderModal] = useState<MarketplaceProduct | null>(null)

  const activeSuppliers = SUPPLIERS.filter(s => s.status === 'active').length
  const pendingOrders = SUPPLY_ORDERS.filter(o => o.status === 'pending' || o.status === 'confirmed').length
  const expiringContracts = CONTRACTS.filter(c => c.status === 'expiring').length

  const filteredSuppliers = SUPPLIERS.filter(s => {
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchSearch && matchCategory
  })

  const filteredProducts = MARKETPLACE_PRODUCTS.filter(p => {
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  const orderStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; cls: string }> = {
      pending: { label: 'Pendiente', cls: 'badge-warning' },
      confirmed: { label: 'Confirmado', cls: 'badge-blue' },
      transit: { label: 'En tránsito', cls: 'badge-blue' },
      delivered: { label: 'Entregado', cls: 'badge-success' },
      cancelled: { label: 'Cancelado', cls: 'badge-error' },
    }
    const s = map[status]
    return <span className={`badge text-xs ${s.cls}`}>{s.label}</span>
  }

  const contractStatusBadge = (status: ContractStatus) => {
    const map: Record<ContractStatus, { label: string; cls: string }> = {
      active: { label: 'Vigente', cls: 'badge-success' },
      expiring: { label: 'Por vencer', cls: 'badge-warning' },
      expired: { label: 'Vencido', cls: 'badge-error' },
    }
    const s = map[status]
    return <span className={`badge text-xs ${s.cls}`}>{s.label}</span>
  }

  const addToCart = () => {
    setCartCount(c => c + 1)
    setOrderModal(null)
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(56,189,248,0.06) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #38bdf8)', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }}>
              <Truck size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gastro-text mb-1">GastroSupply</h2>
              <p className="text-sm text-gastro-subtle">Marketplace de proveedores. Compara precios, gestiona contratos y optimiza tu cadena de suministro.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
            {[
              { value: `${activeSuppliers}`, label: 'Proveedores activos' },
              { value: '$142K', label: 'Ahorro mensual' },
              { value: '96.2%', label: 'Entregas a tiempo' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl font-black" style={{ color: '#10b981' }}>{stat.value}</div>
                <div className="text-xs text-gastro-subtle">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Proveedores', value: SUPPLIERS.length, color: '#10b981', icon: Truck },
          { label: 'Pedidos activos', value: pendingOrders, color: '#38bdf8', icon: ShoppingCart },
          { label: 'Contratos vigentes', value: CONTRACTS.filter(c => c.status === 'active').length, color: '#9E7FFF', icon: FileText },
          { label: 'Por vencer', value: expiringContracts, color: '#f59e0b', icon: AlertTriangle },
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

      {/* Alert for expiring contracts */}
      {expiringContracts > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <AlertTriangle size={18} className="text-warning flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-warning">Contrato por vencer: </span>
            <span className="text-sm text-gastro-subtle">
              Bodega Mendoza — exclusividad bebidas vence el 31 May 2025. Renueva para mantener el 12% de descuento.
            </span>
          </div>
          <button className="btn-primary text-xs px-3 py-2 flex-shrink-0 cursor-pointer">
            <RefreshCw size={13} /> Renovar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            ['suppliers', 'Proveedores', Truck],
            ['marketplace', 'Marketplace', ShoppingCart],
            ['orders', 'Pedidos', Package],
            ['contracts', 'Contratos', FileText],
          ] as const).map(([id, label, Icon]) => (
            <button key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${activeTab === id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeTab === id
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {activeTab === 'marketplace' && cartCount > 0 && (
            <button className="btn-secondary text-sm px-4 py-2 cursor-pointer relative">
              <ShoppingCart size={15} />
              Carrito
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: '#10b981' }}>
                {cartCount}
              </span>
            </button>
          )}
          <button className="btn-primary text-sm px-4 py-2 cursor-pointer">
            <Plus size={15} /> {activeTab === 'suppliers' ? 'Nuevo proveedor' : activeTab === 'orders' ? 'Nuevo pedido' : activeTab === 'contracts' ? 'Nuevo contrato' : 'Explorar catálogo'}
          </button>
        </div>
      </div>

      {/* ── Suppliers ── */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar proveedor o ubicación..."
                className="input-gastro pl-10"
                aria-label="Buscar proveedor"
              />
            </div>
            <button className="btn-secondary text-sm px-4 py-2 cursor-pointer"><Filter size={14} /> Filtros</button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${categoryFilter === 'all' ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={categoryFilter === 'all'
                ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              Todos
            </button>
            {(Object.entries(CATEGORY_META) as [SupplierCategory, typeof CATEGORY_META[SupplierCategory]][]).map(([key, meta]) => {
              const Icon = meta.icon
              return (
                <button key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${categoryFilter === key ? '' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={categoryFilter === key
                    ? { background: `${meta.color}18`, border: `1px solid ${meta.color}44`, color: meta.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
                  <Icon size={12} /> {meta.label}
                </button>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSuppliers.map(supplier => {
              const catMeta = CATEGORY_META[supplier.category]
              const CatIcon = catMeta.icon
              return (
                <div key={supplier.id} className="card-gastro group">
                  <div className="relative h-28 rounded-xl overflow-hidden mb-4">
                    <img src={supplier.image} alt={supplier.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm">{supplier.name}</h4>
                          {supplier.isVerified && <Shield size={13} className="text-success" />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-white/70" />
                          <span className="text-xs text-white/70">{supplier.location}</span>
                        </div>
                      </div>
                      {supplier.isPreferred && (
                        <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.25)', color: '#10b981' }}>Preferido</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <CatIcon size={13} style={{ color: catMeta.color }} />
                      <span className="text-xs text-gastro-subtle">{catMeta.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="text-xs font-bold text-gastro-text">{supplier.rating}</span>
                      <span className="text-xs text-gastro-subtle">({supplier.reviews})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <div className="text-gastro-subtle">Entrega</div>
                      <div className="font-semibold text-gastro-text flex items-center gap-1 mt-0.5">
                        <Timer size={11} /> {supplier.deliveryTime}
                      </div>
                    </div>
                    <div>
                      <div className="text-gastro-subtle">Pedido mín.</div>
                      <div className="font-semibold text-gastro-text mt-0.5">${supplier.minOrder.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gastro-subtle">Productos</div>
                      <div className="font-semibold text-gastro-text mt-0.5">{supplier.products}</div>
                    </div>
                    <div>
                      <div className="text-gastro-subtle">Puntualidad</div>
                      <div className="font-semibold mt-0.5" style={{ color: supplier.onTimeRate >= 95 ? '#10b981' : supplier.onTimeRate >= 85 ? '#f59e0b' : '#ef4444' }}>
                        {supplier.onTimeRate}%
                      </div>
                    </div>
                  </div>

                  <div className={`badge text-xs mb-4 ${supplier.status === 'active' ? 'badge-success' : supplier.status === 'paused' ? 'badge-warning' : ''}`}>
                    {supplier.status === 'active' ? 'Activo' : supplier.status === 'paused' ? 'Pausado' : 'Pendiente'}
                  </div>

                  <div className="flex gap-2 pt-3 border-t" style={{ borderColor: '#2a2a3d' }}>
                    <button
                      onClick={() => setSelectedSupplier(supplier)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-primary-400 transition-all hover:text-white cursor-pointer"
                      style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.25)' }}
                      aria-label={`Ver perfil de ${supplier.name}`}>
                      Ver catálogo <ChevronRight size={12} />
                    </button>
                    <button
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gastro-subtle hover:text-gastro-text transition-all hover:bg-white/5 cursor-pointer"
                      style={{ border: '1px solid #2a2a3d' }}
                      aria-label={`Contactar a ${supplier.name}`}>
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="card-gastro text-center py-12">
              <Truck size={32} className="mx-auto text-gastro-muted mb-3" />
              <p className="text-gastro-subtle text-sm">No se encontraron proveedores con esos filtros.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Marketplace ── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar producto o proveedor..."
                className="input-gastro pl-10"
                aria-label="Buscar producto"
              />
            </div>
            <button className="btn-secondary text-sm px-4 py-2 cursor-pointer"><Filter size={14} /> Comparar precios</button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const catMeta = CATEGORY_META[product.category]
              const savings = product.previousPrice ? product.previousPrice - product.price : 0
              return (
                <div key={product.id} className="card-gastro group">
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {product.isBestPrice && (
                        <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.85)', color: 'white' }}>Mejor precio</span>
                      )}
                      {product.isOrganic && (
                        <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.85)', color: 'white' }}>Orgánico</span>
                      )}
                    </div>
                    {product.stock === 'out' && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,10,15,0.7)' }}>
                        <span className="badge badge-error text-xs">Sin stock</span>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-gastro-text text-sm mb-1 line-clamp-2">{product.name}</h4>
                  <div className="text-xs text-gastro-subtle mb-2">{product.supplier}</div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-black text-gastro-text">${product.price.toLocaleString()}</span>
                    <span className="text-xs text-gastro-subtle">/ {product.unit}</span>
                    {product.previousPrice && (
                      <span className="text-xs text-gastro-muted line-through">${product.previousPrice.toLocaleString()}</span>
                    )}
                  </div>

                  {savings > 0 && (
                    <div className="flex items-center gap-1 text-xs text-success mb-3">
                      <TrendingDown size={11} /> Ahorrás ${savings.toLocaleString()} vs. precio anterior
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="module-chip text-xs" style={{ color: catMeta.color }}>{catMeta.label}</span>
                    {product.stock === 'low' && <span className="badge badge-warning text-xs">Stock bajo</span>}
                  </div>

                  <button
                    onClick={() => product.stock !== 'out' && setOrderModal(product)}
                    disabled={product.stock === 'out'}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: product.stock !== 'out' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${product.stock !== 'out' ? 'rgba(16,185,129,0.3)' : '#2a2a3d'}`,
                      color: product.stock !== 'out' ? '#10b981' : '#8888aa',
                    }}
                    aria-label={`Agregar ${product.name} al carrito`}>
                    <ShoppingCart size={13} /> Agregar al pedido
                  </button>
                </div>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="card-gastro text-center py-12">
              <ShoppingCart size={32} className="mx-auto text-gastro-muted mb-3" />
              <p className="text-gastro-subtle text-sm">No se encontraron productos con esos filtros.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Orders ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Desktop table */}
          <div className="card-gastro overflow-hidden p-0 hidden md:block">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#2a2a3d' }}>
              <span className="text-sm font-bold text-gastro-text">Historial de pedidos a proveedores</span>
              <button className="flex items-center gap-1.5 text-xs text-gastro-subtle hover:text-gastro-text transition-colors cursor-pointer">
                <RefreshCw size={12} /> Actualizar
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gastro-subtle uppercase tracking-wider" style={{ borderBottom: '1px solid #2a2a3d' }}>
                  <th className="text-left px-4 py-3 font-semibold">Pedido</th>
                  <th className="text-left px-4 py-3 font-semibold">Proveedor</th>
                  <th className="text-left px-4 py-3 font-semibold">Items</th>
                  <th className="text-left px-4 py-3 font-semibold">Total</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold">ETA</th>
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {SUPPLY_ORDERS.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #2a2a3d' }}>
                    <td className="px-4 py-3 font-bold text-primary-400 text-xs">{order.id}</td>
                    <td className="px-4 py-3 font-semibold text-gastro-text text-xs">{order.supplier}</td>
                    <td className="px-4 py-3 text-gastro-subtle text-xs">{order.items}</td>
                    <td className="px-4 py-3 font-bold text-gastro-text text-xs">${order.total.toLocaleString()}</td>
                    <td className="px-4 py-3">{orderStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-xs text-gastro-subtle">{order.eta || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gastro-subtle">{order.date}</td>
                    <td className="px-4 py-3">
                      {order.tracking && (
                        <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 cursor-pointer">
                          Rastrear <ExternalLink size={10} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {SUPPLY_ORDERS.map(order => (
              <div key={order.id} className="card-gastro">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-bold text-primary-400 text-sm">{order.id}</div>
                    <div className="font-semibold text-gastro-text text-sm mt-0.5">{order.supplier}</div>
                  </div>
                  {orderStatusBadge(order.status)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-gastro-subtle">Items:</span> <span className="text-gastro-text font-semibold">{order.items}</span></div>
                  <div><span className="text-gastro-subtle">Total:</span> <span className="text-gastro-text font-semibold">${order.total.toLocaleString()}</span></div>
                  <div><span className="text-gastro-subtle">Fecha:</span> <span className="text-gastro-text">{order.date}</span></div>
                  <div><span className="text-gastro-subtle">ETA:</span> <span className="text-gastro-text">{order.eta || '—'}</span></div>
                </div>
                {order.tracking && (
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-primary-400 cursor-pointer"
                    style={{ background: 'rgba(158,127,255,0.1)', border: '1px solid rgba(158,127,255,0.25)' }}>
                    Rastrear envío <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contracts ── */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {CONTRACTS.map(contract => (
            <div key={contract.id} className="card-gastro">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: contract.status === 'active' ? 'rgba(16,185,129,0.12)' : contract.status === 'expiring' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                  }}>
                  <FileText size={20} style={{
                    color: contract.status === 'active' ? '#10b981' : contract.status === 'expiring' ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-gastro-text">{contract.supplier}</h4>
                    {contractStatusBadge(contract.status)}
                    <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                      -{contract.discount}% descuento
                    </span>
                  </div>
                  <div className="text-sm text-gastro-subtle">{contract.type}</div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gastro-subtle">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {contract.startDate} — {contract.endDate}</span>
                    <span className="font-semibold text-gastro-text">${contract.value.toLocaleString()} / año</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="btn-secondary text-xs px-3 py-2 cursor-pointer">Ver detalle</button>
                  {contract.status === 'expiring' && (
                    <button className="btn-primary text-xs px-3 py-2 cursor-pointer">
                      <RefreshCw size={12} /> Renovar
                    </button>
                  )}
                  {contract.status === 'expired' && (
                    <button className="btn-primary text-xs px-3 py-2 cursor-pointer">
                      <Plus size={12} /> Reactivar
                    </button>
                  )}
                </div>
              </div>
              {contract.status === 'expiring' && (
                <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                  <Clock size={13} /> Vence en 14 días — renueva antes del 31 May para mantener condiciones
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supplier detail modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          role="dialog"
          aria-labelledby="supplier-modal-title">
          <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-down max-h-[90dvh] overflow-y-auto"
            style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 id="supplier-modal-title" className="font-bold text-gastro-text">{selectedSupplier.name}</h3>
              <button onClick={() => setSelectedSupplier(null)} className="text-gastro-muted hover:text-gastro-text cursor-pointer p-2" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="relative h-40 rounded-xl overflow-hidden mb-5">
              <img src={selectedSupplier.image} alt={selectedSupplier.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 50%)' }} />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Star size={14} className="text-warning fill-warning" />
                <span className="font-bold text-white">{selectedSupplier.rating}</span>
                <span className="text-xs text-white/70">({selectedSupplier.reviews} reseñas)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
              <div className="flex items-center gap-2 text-gastro-subtle">
                <MapPin size={14} className="text-gastro-muted flex-shrink-0" />
                {selectedSupplier.location}
              </div>
              <div className="flex items-center gap-2 text-gastro-subtle">
                <Timer size={14} className="text-gastro-muted flex-shrink-0" />
                {selectedSupplier.deliveryTime}
              </div>
              <div className="flex items-center gap-2 text-gastro-subtle">
                <Phone size={14} className="text-gastro-muted flex-shrink-0" />
                {selectedSupplier.contact.phone}
              </div>
              <div className="flex items-center gap-2 text-gastro-subtle">
                <Mail size={14} className="text-gastro-muted flex-shrink-0" />
                {selectedSupplier.contact.email}
              </div>
            </div>

            <div className="p-4 rounded-xl mb-5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gastro-subtle">Puntualidad de entregas</span>
                <span className="font-bold text-success">{selectedSupplier.onTimeRate}%</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${selectedSupplier.onTimeRate}%`, background: '#10b981' }} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedSupplier(null)} className="btn-secondary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                Cerrar
              </button>
              <button
                onClick={() => { setActiveTab('marketplace'); setSelectedSupplier(null) }}
                className="btn-primary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                <ShoppingCart size={15} /> Ver catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to order modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          role="dialog"
          aria-labelledby="order-modal-title">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-down"
            style={{ background: '#1a1a26', border: '1px solid #2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 id="order-modal-title" className="font-bold text-gastro-text">Agregar al pedido</h3>
              <button onClick={() => setOrderModal(null)} className="text-gastro-muted hover:text-gastro-text cursor-pointer" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl mb-5"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <img src={orderModal.image} alt={orderModal.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div>
                <div className="font-semibold text-gastro-text text-sm">{orderModal.name}</div>
                <div className="text-xs text-gastro-subtle">{orderModal.supplier}</div>
                <div className="font-black text-success mt-1">${orderModal.price.toLocaleString()} / {orderModal.unit}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="order-quantity" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  Cantidad ({orderModal.unit}) *
                </label>
                <input id="order-quantity" type="number" defaultValue={1} min={1} className="input-gastro text-sm" />
              </div>
              <div>
                <label htmlFor="order-notes" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  Notas (opcional)
                </label>
                <input id="order-notes" type="text" placeholder="Ej: entrega antes de las 10:00" className="input-gastro text-sm" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOrderModal(null)} className="btn-secondary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                Cancelar
              </button>
              <button onClick={addToCart} className="btn-primary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                <Zap size={15} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
