import { useState } from 'react'
import { MENU_CATEGORIES, MENU_PRODUCTS } from '../data/mockData'
import {
  BookOpen, Plus, Search, Filter, Globe, Smartphone, UtensilsCrossed,
  Bike, ShoppingBag, Eye, EyeOff, Edit, MoreHorizontal, TrendingUp,
  AlertTriangle, Check, ChevronDown, Layers, Zap
} from 'lucide-react'

const CHANNELS = [
  { id: 'salon', label: 'Salón', icon: UtensilsCrossed, color: '#9E7FFF' },
  { id: 'qr', label: 'QR Mesa', icon: Smartphone, color: '#38bdf8' },
  { id: 'web', label: 'Web', icon: Globe, color: '#10b981' },
  { id: 'delivery', label: 'Delivery', icon: Bike, color: '#f59e0b' },
  { id: 'uberEats', label: 'Uber Eats', icon: Bike, color: '#f59e0b' },
  { id: 'rappi', label: 'Rappi', icon: ShoppingBag, color: '#f472b6' },
]

export default function GastroMenu() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'products' | 'channels' | 'categories'>('products')

  const filteredProducts = MENU_PRODUCTS.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || MENU_CATEGORIES.find(c => c.id === activeCategory)?.name === p.category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Productos activos', value: '84', color: '#9E7FFF', icon: BookOpen },
          { label: 'Categorías', value: '8', color: '#38bdf8', icon: Layers },
          { label: 'Canales activos', value: '6', color: '#10b981', icon: Globe },
          { label: 'Margen promedio', value: '72%', color: '#f59e0b', icon: TrendingUp },
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
            { id: 'products', label: 'Productos' },
            { id: 'channels', label: 'Control de canales' },
            { id: 'categories', label: 'Categorías' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id ? { background: 'rgba(158,127,255,0.15)', border: '1px solid rgba(158,127,255,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {/* Products view */}
      {activeView === 'products' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories sidebar */}
          <div className="card-gastro h-fit">
            <h3 className="font-bold text-gastro-text mb-4 text-sm">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${!activeCategory ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                style={!activeCategory ? { background: 'rgba(158,127,255,0.12)' } : {}}>
                <span>Todos</span>
                <span className="text-xs font-bold">{MENU_PRODUCTS.length}</span>
              </button>
              {MENU_CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${activeCategory === cat.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={activeCategory === cat.id ? { background: 'rgba(158,127,255,0.12)' } : {}}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold">{cat.products}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="input-gastro pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="card-gastro p-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gastro-text text-sm">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gastro-subtle">{product.category}</span>
                            {product.tags.map(tag => (
                              <span key={tag} className="badge badge-blue text-xs">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-gastro-text">${product.price.toLocaleString()}</div>
                          <div className="text-xs text-gastro-subtle">Costo: ${product.cost.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        {/* Channel indicators */}
                        <div className="flex gap-1.5">
                          {CHANNELS.map(ch => {
                            const active = product.channels[ch.id as keyof typeof product.channels]
                            return (
                              <div key={ch.id}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                                title={ch.label}
                                style={{
                                  background: active ? `${ch.color}20` : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${active ? ch.color + '50' : '#2a2a3d'}`,
                                }}>
                                {active
                                  ? <Check size={10} style={{ color: ch.color }} />
                                  : <EyeOff size={10} className="text-gastro-muted" />
                                }
                              </div>
                            )
                          })}
                        </div>

                        {/* Margin */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <div className="text-xs text-gastro-subtle">Margen:</div>
                          <div className="text-xs font-bold" style={{ color: product.margin > 70 ? '#10b981' : '#f59e0b' }}>
                            {product.margin}%
                          </div>
                        </div>

                        {/* Stock */}
                        <div className={`badge text-xs ${product.stock === 'available' ? 'badge-success' : product.stock === 'low' ? 'badge-warning' : 'badge-error'}`}>
                          {product.stock === 'available' ? 'Disponible' : product.stock === 'low' ? 'Stock bajo' : 'Sin stock'}
                        </div>

                        <button className="text-gastro-subtle hover:text-gastro-text transition-colors">
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Channels view */}
      {activeView === 'channels' && (
        <div className="card-gastro">
          <div className="mb-6">
            <h3 className="font-bold text-gastro-text mb-1">Control de canales por producto</h3>
            <p className="text-xs text-gastro-subtle">Activa o desactiva cada producto en cada canal de venta de forma independiente</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3d' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Producto</th>
                  {CHANNELS.map(ch => {
                    const Icon = ch.icon
                    return (
                      <th key={ch.id} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Icon size={14} style={{ color: ch.color }} />
                          <span className="text-xs font-semibold text-gastro-subtle">{ch.label}</span>
                        </div>
                      </th>
                    )
                  })}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gastro-subtle uppercase tracking-wider">Precio</th>
                </tr>
              </thead>
              <tbody>
                {MENU_PRODUCTS.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(42,42,61,0.5)' }}
                    className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-gastro-text">{product.name}</div>
                          <div className="text-xs text-gastro-subtle">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    {CHANNELS.map(ch => {
                      const active = product.channels[ch.id as keyof typeof product.channels]
                      return (
                        <td key={ch.id} className="px-4 py-3 text-center">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all hover:scale-110"
                            style={{
                              background: active ? `${ch.color}20` : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${active ? ch.color + '50' : '#2a2a3d'}`,
                            }}>
                            {active
                              ? <Eye size={13} style={{ color: ch.color }} />
                              : <EyeOff size={13} className="text-gastro-muted" />
                            }
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-gastro-text">${product.price.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories view */}
      {activeView === 'categories' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MENU_CATEGORIES.map(cat => (
            <div key={cat.id} className="card-gastro">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gastro-text mb-1">{cat.name}</h3>
              <p className="text-sm text-gastro-subtle mb-4">{cat.products} productos</p>
              <div className="flex items-center justify-between">
                <div className={`badge ${cat.active ? 'badge-success' : 'badge-error'}`}>
                  {cat.active ? 'Activa' : 'Inactiva'}
                </div>
                <button className="text-gastro-subtle hover:text-gastro-text transition-colors">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="card-gastro border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary-400/50 transition-colors min-h-[140px]"
            style={{ borderStyle: 'dashed' }}>
            <Plus size={24} className="text-gastro-muted" />
            <span className="text-sm text-gastro-subtle">Nueva categoría</span>
          </div>
        </div>
      )}
    </div>
  )
}
