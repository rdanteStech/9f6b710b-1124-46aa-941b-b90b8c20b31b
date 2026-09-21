import { useState } from 'react'
import { INVENTORY_ITEMS } from '../data/mockData'
import {
  Package, AlertTriangle, TrendingDown, ShoppingCart, Plus,
  Search, Filter, RefreshCw, X
} from 'lucide-react'

type InventoryItem = typeof INVENTORY_ITEMS[number]
type ItemStatus = InventoryItem['status']

const UNITS = ['kg', 'lt', 'bt', 'un', 'gr', 'ml']
const SUPPLIERS = [...new Set(INVENTORY_ITEMS.map(i => i.supplier))]

function computeStatus(stock: number, minStock: number): ItemStatus {
  if (stock < minStock) return 'critical'
  if (stock < minStock * 1.5) return 'low'
  return 'ok'
}

const EMPTY_FORM = {
  name: '',
  unit: 'kg',
  stock: '',
  minStock: '',
  maxStock: '',
  cost: '',
  supplier: '',
}

const STATUS_CONFIG = {
  ok: { label: 'OK', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  low: { label: 'Stock bajo', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  critical: { label: 'Crítico', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

const RECIPES = [
  { id: 1, name: 'Risotto de Hongos Porcini', cost: 6720, price: 21000, margin: 68, ingredients: 6 },
  { id: 2, name: 'Lomo a la Pimienta Verde', cost: 13680, price: 36000, margin: 62, ingredients: 8 },
  { id: 3, name: 'Burrata con Tomates Cherry', cost: 3640, price: 14000, margin: 74, ingredients: 4 },
  { id: 4, name: 'Tiramisú Artesanal', cost: 1710, price: 9000, margin: 81, ingredients: 7 },
  { id: 5, name: 'Pizza Margherita', cost: 4320, price: 18000, margin: 76, ingredients: 5 },
]

export default function GastroStock() {
  const [activeView, setActiveView] = useState<'inventory' | 'recipes' | 'orders'>('inventory')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([...INVENTORY_ITEMS])
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const criticalItems = items.filter(i => i.status === 'critical').length
  const lowItems = items.filter(i => i.status === 'low').length

  const filteredItems = items.filter(i =>
    !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => setForm(EMPTY_FORM)

  const closeModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleAddItem = () => {
    const name = form.name.trim()
    const stock = parseFloat(form.stock)
    const minStock = parseFloat(form.minStock)
    const maxStock = parseFloat(form.maxStock)
    const cost = parseFloat(form.cost)
    const supplier = form.supplier.trim()

    if (!name || !supplier || isNaN(stock) || isNaN(minStock) || isNaN(maxStock) || isNaN(cost)) return
    if (stock < 0 || minStock <= 0 || maxStock <= minStock || cost < 0) return

    const newItem: InventoryItem = {
      id: Math.max(0, ...items.map(i => i.id)) + 1,
      name,
      unit: form.unit,
      stock,
      minStock,
      maxStock,
      cost,
      supplier,
      status: computeStatus(stock, minStock),
    }

    setItems(prev => [...prev, newItem])
    closeModal()
  }

  const isFormValid =
    form.name.trim().length > 0 &&
    form.supplier.trim().length > 0 &&
    form.stock !== '' && !isNaN(parseFloat(form.stock)) &&
    form.minStock !== '' && !isNaN(parseFloat(form.minStock)) &&
    form.maxStock !== '' && !isNaN(parseFloat(form.maxStock)) &&
    form.cost !== '' && !isNaN(parseFloat(form.cost)) &&
    parseFloat(form.minStock) > 0 &&
    parseFloat(form.maxStock) > parseFloat(form.minStock)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Insumos totales', value: items.length, color: '#2563EB', icon: Package },
          { label: 'Stock crítico', value: criticalItems, color: '#ef4444', icon: AlertTriangle },
          { label: 'Stock bajo', value: lowItems, color: '#f59e0b', icon: TrendingDown },
          { label: 'Órdenes pendientes', value: 2, color: '#3B82F6', icon: ShoppingCart },
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

      {/* Alert banner */}
      {criticalItems > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={18} className="text-error flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-error">Stock crítico detectado: </span>
            <span className="text-sm text-gastro-subtle">
              {items.filter(i => i.status === 'critical').map(i => i.name).join(', ')} — Se recomienda generar orden de compra inmediata.
            </span>
          </div>
          <button className="btn-primary text-xs px-3 py-2 flex-shrink-0">
            <ShoppingCart size={13} /> Generar orden
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'inventory', label: 'Inventario' },
            { id: 'recipes', label: 'Recetas & Costos' },
            { id: 'orders', label: 'Órdenes de compra' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as typeof activeView)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              {view.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Agregar insumo
        </button>
      </div>

      {/* Inventory */}
      {activeView === 'inventory' && (
        <div className="card-gastro">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar insumo..." className="input-gastro pl-10 py-2.5 text-sm" />
            </div>
            <button className="btn-secondary text-sm px-3 py-2.5"><Filter size={14} /> Filtrar</button>
            <button className="btn-secondary text-sm px-3 py-2.5"><RefreshCw size={14} /> Actualizar</button>
          </div>

          <table className="table-gastro">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Stock actual</th>
                <th>Mínimo</th>
                <th>Nivel</th>
                <th>Costo unit.</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
                const pct = Math.min((item.stock / item.maxStock) * 100, 100)
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold text-gastro-text">{item.name}</div>
                      <div className="text-xs text-gastro-subtle">{item.unit}</div>
                    </td>
                    <td>
                      <span className="font-bold text-gastro-text">{item.stock} {item.unit}</span>
                    </td>
                    <td className="text-gastro-subtle">{item.minStock} {item.unit}</td>
                    <td className="w-32">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${pct}%`,
                          background: item.status === 'critical' ? '#ef4444' : item.status === 'low' ? '#f59e0b' : 'linear-gradient(90deg, #2563EB, #3B82F6)'
                        }} />
                      </div>
                      <div className="text-xs text-gastro-subtle mt-0.5">{pct.toFixed(0)}%</div>
                    </td>
                    <td className="font-semibold text-gastro-text">${item.cost.toLocaleString()}</td>
                    <td className="text-gastro-subtle text-xs">{item.supplier}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      {item.status !== 'ok' && (
                        <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
                          <ShoppingCart size={12} /> Pedir
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recipes */}
      {activeView === 'recipes' && (
        <div className="space-y-3">
          {RECIPES.map(recipe => (
            <div key={recipe.id} className="card-gastro p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gastro-text">{recipe.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs text-gastro-subtle">{recipe.ingredients} ingredientes</div>
                    <div className="text-xs text-gastro-subtle">Costo: <span className="text-gastro-text font-semibold">${recipe.cost.toLocaleString()}</span></div>
                    <div className="text-xs text-gastro-subtle">Precio: <span className="text-gastro-text font-semibold">${recipe.price.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: recipe.margin > 70 ? '#10b981' : '#f59e0b' }}>
                    {recipe.margin}%
                  </div>
                  <div className="text-xs text-gastro-subtle">Margen</div>
                </div>
                <div className="ml-6">
                  <div className="w-16 h-16 relative">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A2540" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={recipe.margin > 70 ? '#10b981' : '#f59e0b'}
                        strokeWidth="3"
                        strokeDasharray={`${recipe.margin} ${100 - recipe.margin}`}
                        strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {activeView === 'orders' && (
        <div className="space-y-4">
          <div className="card-gastro">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gastro-text">Órdenes de compra</h3>
              <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Nueva orden</button>
            </div>
            <div className="space-y-3">
              {[
                { id: 'OC-0142', supplier: 'Molinos del Sur', items: 3, total: 48000, status: 'pending', date: 'Hoy 14:30' },
                { id: 'OC-0141', supplier: 'Carnes Premium SA', items: 5, total: 280000, status: 'transit', date: 'Ayer' },
                { id: 'OC-0140', supplier: 'Importadora Gourmet', items: 2, total: 95000, status: 'delivered', date: 'Hace 3 días' },
              ].map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary-400 text-sm">{order.id}</span>
                      <span className="text-sm text-gastro-text">{order.supplier}</span>
                    </div>
                    <div className="text-xs text-gastro-subtle mt-0.5">{order.items} items · {order.date}</div>
                  </div>
                  <div className="font-bold text-gastro-text">${order.total.toLocaleString()}</div>
                  <div className={`badge text-xs ${order.status === 'delivered' ? 'badge-success' : order.status === 'transit' ? 'badge-blue' : 'badge-warning'}`}>
                    {order.status === 'delivered' ? 'Recibida' : order.status === 'transit' ? 'En tránsito' : 'Pendiente'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add item modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          role="dialog"
          aria-labelledby="add-item-modal-title"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-down max-h-[90vh] overflow-y-auto"
            style={{ background: '#0F1628', border: '1px solid #1A2540' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)' }}>
                  <Package size={16} className="text-primary-400" />
                </div>
                <div>
                  <h3 id="add-item-modal-title" className="font-bold text-gastro-text">Agregar insumo</h3>
                  <p className="text-xs text-gastro-subtle">Registrar un nuevo item en inventario</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gastro-muted hover:text-gastro-text cursor-pointer" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="item-name" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  Nombre del insumo *
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Sal marina"
                  className="input-gastro text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-unit" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                    Unidad *
                  </label>
                  <select
                    id="item-unit"
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="input-gastro text-sm"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="item-cost" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                    Costo unitario ($) *
                  </label>
                  <input
                    id="item-cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="0"
                    className="input-gastro text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="item-stock" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                    Stock actual *
                  </label>
                  <input
                    id="item-stock"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className="input-gastro text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="item-min" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                    Stock mínimo *
                  </label>
                  <input
                    id="item-min"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.minStock}
                    onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))}
                    placeholder="0"
                    className="input-gastro text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="item-max" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                    Stock máximo *
                  </label>
                  <input
                    id="item-max"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.maxStock}
                    onChange={e => setForm(f => ({ ...f, maxStock: e.target.value }))}
                    placeholder="0"
                    className="input-gastro text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="item-supplier" className="block text-xs font-semibold text-gastro-subtle mb-2 uppercase tracking-wider">
                  Proveedor *
                </label>
                <input
                  id="item-supplier"
                  type="text"
                  list="suppliers-list"
                  value={form.supplier}
                  onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                  placeholder="Ej: Molinos del Sur"
                  className="input-gastro text-sm"
                />
                <datalist id="suppliers-list">
                  {SUPPLIERS.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-secondary flex-1 justify-center text-sm py-2.5 cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!isFormValid}
                className="btn-primary flex-1 justify-center text-sm py-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={15} /> Agregar insumo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
