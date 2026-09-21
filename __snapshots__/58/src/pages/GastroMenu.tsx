import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MENU_CATEGORIES, MENU_PRODUCTS } from '../data/mockData'
import { useStock } from '../context/StockContext'
import {
  RECIPE_LAB_ENTRIES,
  RECIPE_LAB_STATUS,
  computeRecipeCost,
  computeMargin,
  type RecipeLabEntry,
  type RecipeLabStatus,
  type RecipeIngredient,
  type RecipeVersion,
} from '../data/recipeLab'
import {
  BookOpen, Plus, Search, Globe, Smartphone, UtensilsCrossed,
  Bike, ShoppingBag, Eye, EyeOff, Edit, TrendingUp,
  Check, Layers, FlaskConical, Clock, ChefHat, DollarSign,
  GitBranch, Sparkles, X, ChevronRight, Package, AlertTriangle,
  Copy, Rocket, Beaker, Scale, Timer, Users, ArrowRight, CheckCircle2,
} from 'lucide-react'

const CHANNELS = [
  { id: 'salon', label: 'Salón', icon: UtensilsCrossed, color: '#2563EB' },
  { id: 'qr', label: 'QR Mesa', icon: Smartphone, color: '#3B82F6' },
  { id: 'web', label: 'Web', icon: Globe, color: '#10b981' },
  { id: 'delivery', label: 'Delivery', icon: Bike, color: '#f59e0b' },
  { id: 'uberEats', label: 'Uber Eats', icon: Bike, color: '#f59e0b' },
  { id: 'rappi', label: 'Rappi', icon: ShoppingBag, color: '#60A5FA' },
]

type ViewId = 'products' | 'channels' | 'categories' | 'lab'

function getCurrentVersion(entry: RecipeLabEntry): RecipeVersion {
  return entry.versions.find(v => v.id === entry.currentVersionId) ?? entry.versions[0]
}

function RecipeLabDetailModal({
  entry,
  inventoryCosts,
  stockItems,
  onClose,
  onPublish,
  onDuplicate,
}: {
  entry: RecipeLabEntry
  inventoryCosts: Map<number, number>
  stockItems: ReturnType<typeof useStock>['items']
  onClose: () => void
  onPublish: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const [selectedVersionId, setSelectedVersionId] = useState(entry.currentVersionId)
  const [simulatedPrice, setSimulatedPrice] = useState<number | null>(null)

  const version = entry.versions.find(v => v.id === selectedVersionId) ?? entry.versions[0]
  const costPerPortion = computeRecipeCost(version.ingredients, inventoryCosts, version.yield)
  const price = simulatedPrice ?? version.suggestedPrice
  const margin = computeMargin(costPerPortion, price)
  const st = RECIPE_LAB_STATUS[entry.status]

  const ingredientDetails = version.ingredients.map(ing => {
    const stock = stockItems.find(i => i.id === ing.inventoryItemId)
    const unitCost = inventoryCosts.get(ing.inventoryItemId) ?? 0
    const lineCost = unitCost * ing.quantity
    const stockOk = stock ? stock.stock >= ing.quantity : false
    return { ...ing, unitCost, lineCost, stock, stockOk }
  })

  const totalIngredientCost = ingredientDetails.reduce((s, i) => s + i.lineCost, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
      role="dialog"
      aria-labelledby="recipe-lab-modal-title">
      <div className="rounded-2xl w-full max-w-3xl shadow-2xl animate-slide-down max-h-[92dvh] overflow-hidden flex flex-col"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b flex items-start gap-4" style={{ borderColor: '#1A2540' }}>
          <img src={entry.image} alt={entry.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: st.bg, color: st.color }}>{st.label}</span>
              <span className="text-xs text-gastro-subtle">{entry.category}</span>
              {entry.linkedProductId && (
                <span className="text-xs font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 size={11} /> En carta
                </span>
              )}
            </div>
            <h2 id="recipe-lab-modal-title" className="text-lg font-black text-gastro-text">{entry.name}</h2>
            <p className="text-xs text-gastro-subtle mt-1">{entry.chef} · v{version.version} · {entry.updatedAt}</p>
            {entry.objective && (
              <p className="text-xs text-primary-400 mt-2 flex items-start gap-1.5">
                <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
                {entry.objective}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gastro-subtle hover:text-gastro-text p-1">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Costo/porción', value: `$${costPerPortion.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
              { label: 'Precio sugerido', value: `$${price.toLocaleString()}`, icon: TrendingUp, color: '#2563EB' },
              { label: 'Margen', value: `${margin}%`, icon: Scale, color: margin >= 70 ? '#10b981' : '#f59e0b' },
              { label: 'Tiempo total', value: `${version.prepMinutes + version.cookMinutes} min`, icon: Timer, color: '#3B82F6' },
            ].map(kpi => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                  <Icon size={14} style={{ color: kpi.color }} className="mb-1.5" />
                  <div className="text-lg font-black text-gastro-text">{kpi.value}</div>
                  <div className="text-[10px] text-gastro-subtle uppercase tracking-wide">{kpi.label}</div>
                </div>
              )
            })}
          </div>

          {/* Price simulator */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gastro-text flex items-center gap-2">
                <Beaker size={15} className="text-primary-400" /> Simulador de precio
              </span>
              <span className="text-xs font-bold" style={{ color: margin >= 70 ? '#10b981' : margin >= 60 ? '#f59e0b' : '#ef4444' }}>
                Margen: {margin}%
              </span>
            </div>
            <input
              type="range"
              min={Math.round(costPerPortion * 1.2)}
              max={Math.round(costPerPortion * 4)}
              step={500}
              value={price}
              onChange={e => setSimulatedPrice(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gastro-subtle mt-1">
              <span>${Math.round(costPerPortion * 1.2).toLocaleString()}</span>
              <span className="font-bold text-gastro-text">${price.toLocaleString()}</span>
              <span>${Math.round(costPerPortion * 4).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Ingredients */}
            <div>
              <h3 className="text-sm font-bold text-gastro-text mb-3 flex items-center gap-2">
                <Package size={14} className="text-primary-400" /> Ingredientes
                <span className="text-xs font-normal text-gastro-subtle">· {version.yield} porción{version.yield > 1 ? 'es' : ''}</span>
              </h3>
              <div className="space-y-2">
                {ingredientDetails.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gastro-text">{ing.name}</div>
                      <div className="text-gastro-subtle">{ing.quantity} {ing.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gastro-text">${Math.round(ing.lineCost).toLocaleString()}</div>
                      {ing.stock && (
                        <div className={`flex items-center gap-1 justify-end ${ing.stockOk ? 'text-success' : 'text-warning'}`}>
                          {!ing.stockOk && <AlertTriangle size={10} />}
                          <span>{ing.stock.stock} {ing.stock.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t text-sm" style={{ borderColor: '#1A2540' }}>
                <span className="text-gastro-subtle">Costo total lote</span>
                <span className="font-black text-gastro-text">${Math.round(totalIngredientCost).toLocaleString()}</span>
              </div>
              <Link to="/stock" className="inline-flex items-center gap-1 text-xs text-primary-400 hover:underline mt-2">
                Ver insumos en GastroStock <ArrowRight size={11} />
              </Link>
            </div>

            {/* Steps + versions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gastro-text mb-3 flex items-center gap-2">
                  <ChefHat size={14} className="text-primary-400" /> Procedimiento
                </h3>
                <ol className="space-y-2">
                  {version.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}>
                        {idx + 1}
                      </span>
                      <span className="text-gastro-subtle leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex gap-4 mt-3 text-xs text-gastro-subtle">
                  <span className="flex items-center gap-1"><Clock size={11} /> Prep: {version.prepMinutes} min</span>
                  <span className="flex items-center gap-1"><Flame size={11} /> Cocción: {version.cookMinutes} min</span>
                </div>
              </div>

              {entry.versions.length > 1 && (
                <div>
                  <h3 className="text-sm font-bold text-gastro-text mb-3 flex items-center gap-2">
                    <GitBranch size={14} className="text-primary-400" /> Versiones
                  </h3>
                  <div className="space-y-1.5">
                    {entry.versions.map(v => (
                      <button key={v.id} onClick={() => { setSelectedVersionId(v.id); setSimulatedPrice(null) }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${selectedVersionId === v.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                        style={selectedVersionId === v.id
                          ? { background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)' }
                          : { background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">v{v.version}</span>
                          <span>${v.suggestedPrice.toLocaleString()}</span>
                        </div>
                        {v.notes && <p className="mt-1 opacity-80">{v.notes}</p>}
                        <p className="mt-0.5 text-gastro-muted">{v.author} · {v.createdAt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <span key={tag} className="badge badge-blue text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t flex flex-wrap gap-2" style={{ borderColor: '#1A2540' }}>
          <button onClick={onClose} className="btn-secondary text-sm py-2.5 px-4">Cerrar</button>
          <button onClick={() => onDuplicate(entry.id)} className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-1.5">
            <Copy size={14} /> Duplicar
          </button>
          {(entry.status === 'approved' || entry.status === 'testing') && (
            <button onClick={() => onPublish(entry.id)} className="btn-primary text-sm py-2.5 px-4 flex items-center gap-1.5 ml-auto">
              <Rocket size={14} /> Publicar en carta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Flame({ size, ...props }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function NewRecipeModal({
  stockItems,
  categories,
  onClose,
  onSave,
}: {
  stockItems: ReturnType<typeof useStock>['items']
  categories: typeof MENU_CATEGORIES
  onClose: () => void
  onSave: (entry: RecipeLabEntry) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0]?.name ?? '')
  const [objective, setObjective] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [steps, setSteps] = useState([''])
  const [suggestedPrice, setSuggestedPrice] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [qty, setQty] = useState('')

  const addIngredient = () => {
    const item = stockItems.find(i => i.id === Number(selectedItemId))
    const quantity = parseFloat(qty)
    if (!item || isNaN(quantity) || quantity <= 0) return
    setIngredients(prev => [...prev, {
      inventoryItemId: item.id,
      name: item.name,
      quantity,
      unit: item.unit,
    }])
    setSelectedItemId('')
    setQty('')
  }

  const handleSave = () => {
    if (!name.trim()) return
    const price = parseFloat(suggestedPrice) || 0
    const versionId = `v-${Date.now()}`
    const entry: RecipeLabEntry = {
      id: `rl-${Date.now()}`,
      name: name.trim(),
      category,
      status: 'draft',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
      tags: ['nuevo'],
      currentVersionId: versionId,
      chef: 'Usuario actual',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      objective: objective.trim() || undefined,
      versions: [{
        id: versionId,
        version: '0.1',
        createdAt: new Date().toISOString().slice(0, 10),
        author: 'Usuario actual',
        yield: 1,
        prepMinutes: 0,
        cookMinutes: 0,
        suggestedPrice: price,
        ingredients,
        steps: steps.filter(s => s.trim()),
      }],
    }
    onSave(entry)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-down max-h-[90dvh] overflow-y-auto"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gastro-text flex items-center gap-2">
            <FlaskConical size={18} className="text-primary-400" /> Nuevo experimento
          </h2>
          <button onClick={onClose} className="text-gastro-subtle hover:text-gastro-text"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Nombre de la receta</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-gastro" placeholder="Ej: Ravioles de cordero" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-gastro">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Precio objetivo ($)</label>
              <input type="number" value={suggestedPrice} onChange={e => setSuggestedPrice(e.target.value)} className="input-gastro" placeholder="18000" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Objetivo del experimento</label>
            <input value={objective} onChange={e => setObjective(e.target.value)} className="input-gastro" placeholder="Ej: Postre de temporada con margen >75%" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Ingredientes (desde GastroStock)</label>
            <div className="flex gap-2 mb-2">
              <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="input-gastro flex-1 text-sm">
                <option value="">Seleccionar insumo...</option>
                {stockItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name} (${i.cost.toLocaleString()}/{i.unit})</option>
                ))}
              </select>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="input-gastro w-20 text-sm" placeholder="Cant." step="0.01" />
              <button type="button" onClick={addIngredient} className="btn-primary px-3 py-2 text-sm"><Plus size={14} /></button>
            </div>
            {ingredients.length > 0 && (
              <div className="space-y-1">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-gastro-text">{ing.name} — {ing.quantity} {ing.unit}</span>
                    <button onClick={() => setIngredients(prev => prev.filter((_, i) => i !== idx))} className="text-error"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Pasos (opcional)</label>
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <span className="text-xs text-gastro-muted pt-2.5 w-4">{idx + 1}.</span>
                <input value={step} onChange={e => {
                  const next = [...steps]
                  next[idx] = e.target.value
                  setSteps(next)
                }} className="input-gastro flex-1 text-sm" placeholder="Describe el paso..." />
              </div>
            ))}
            <button type="button" onClick={() => setSteps(prev => [...prev, ''])} className="text-xs text-primary-400 hover:underline">
              + Agregar paso
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm py-2.5">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim()} className="btn-primary flex-1 justify-center text-sm py-2.5 disabled:opacity-50">
            Crear borrador
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GastroMenu() {
  const { items: stockItems } = useStock()
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<ViewId>('products')
  const [labEntries, setLabEntries] = useState<RecipeLabEntry[]>(RECIPE_LAB_ENTRIES)
  const [labFilter, setLabFilter] = useState<RecipeLabStatus | 'all'>('all')
  const [labSearch, setLabSearch] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeLabEntry | null>(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const inventoryCosts = useMemo(() => {
    const map = new Map<number, number>()
    stockItems.forEach(i => map.set(i.id, i.cost))
    return map
  }, [stockItems])

  const filteredProducts = MENU_PRODUCTS.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || MENU_CATEGORIES.find(c => c.id === activeCategory)?.name === p.category
    return matchesSearch && matchesCategory
  })

  const filteredLab = useMemo(() => {
    return labEntries.filter(e => {
      const matchSearch = !labSearch || e.name.toLowerCase().includes(labSearch.toLowerCase())
      const matchFilter = labFilter === 'all' || e.status === labFilter
      return matchSearch && matchFilter
    })
  }, [labEntries, labSearch, labFilter])

  const labStats = useMemo(() => {
    const drafts = labEntries.filter(e => e.status === 'draft').length
    const testing = labEntries.filter(e => e.status === 'testing').length
    const ready = labEntries.filter(e => e.status === 'approved').length
    const margins = labEntries.map(e => {
      const v = getCurrentVersion(e)
      const cost = computeRecipeCost(v.ingredients, inventoryCosts, v.yield)
      return computeMargin(cost, v.suggestedPrice)
    })
    const avgMargin = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0
    return { drafts, testing, ready, avgMargin, total: labEntries.length }
  }, [labEntries, inventoryCosts])

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handlePublish = (id: string) => {
    setLabEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'published' as RecipeLabStatus, updatedAt: new Date().toISOString().slice(0, 10) } : e
    ))
    setSelectedRecipe(null)
    showToastMsg('Receta publicada en la carta')
  }

  const handleDuplicate = (id: string) => {
    const original = labEntries.find(e => e.id === id)
    if (!original) return
    const versionId = `v-${Date.now()}`
    const copy: RecipeLabEntry = {
      ...original,
      id: `rl-${Date.now()}`,
      name: `${original.name} (copia)`,
      status: 'draft',
      linkedProductId: undefined,
      currentVersionId: versionId,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      versions: original.versions.map(v => ({ ...v, id: versionId, version: '0.1', createdAt: new Date().toISOString().slice(0, 10) })),
    }
    setLabEntries(prev => [copy, ...prev])
    showToastMsg('Experimento duplicado como borrador')
  }

  const handleNewRecipe = (entry: RecipeLabEntry) => {
    setLabEntries(prev => [entry, ...prev])
    setShowNewRecipe(false)
    showToastMsg('Nuevo experimento creado')
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center gap-3 p-4 rounded-xl animate-slide-down"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          <span className="text-sm font-semibold text-success">{toast}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(activeView === 'lab' ? [
          { label: 'Experimentos', value: labStats.total.toString(), color: '#2563EB', icon: FlaskConical },
          { label: 'En prueba', value: labStats.testing.toString(), color: '#f59e0b', icon: Beaker },
          { label: 'Listas para carta', value: labStats.ready.toString(), color: '#10b981', icon: Rocket },
          { label: 'Margen promedio', value: `${labStats.avgMargin}%`, color: '#3B82F6', icon: TrendingUp },
        ] : [
          { label: 'Productos activos', value: '84', color: '#2563EB', icon: BookOpen },
          { label: 'Categorías', value: '8', color: '#3B82F6', icon: Layers },
          { label: 'Canales activos', value: '6', color: '#10b981', icon: Globe },
          { label: 'Margen promedio', value: '72%', color: '#f59e0b', icon: TrendingUp },
        ]).map(stat => {
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'products', label: 'Productos' },
            { id: 'lab', label: 'Laboratorio de Recetas', badge: labStats.drafts + labStats.testing > 0 ? labStats.drafts + labStats.testing : undefined },
            { id: 'channels', label: 'Control de canales' },
            { id: 'categories', label: 'Categorías' },
          ].map(view => (
            <button key={view.id}
              onClick={() => setActiveView(view.id as ViewId)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === view.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
              style={activeView === view.id ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              {view.label}
              {'badge' in view && view.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: '#f59e0b' }}>
                  {view.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        {activeView === 'lab' ? (
          <button onClick={() => setShowNewRecipe(true)} className="btn-primary text-sm px-4 py-2">
            <Plus size={15} /> Nuevo experimento
          </button>
        ) : (
          <button className="btn-primary text-sm px-4 py-2">
            <Plus size={15} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Products view */}
      {activeView === 'products' && (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="card-gastro h-fit">
            <h3 className="font-bold text-gastro-text mb-4 text-sm">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${!activeCategory ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                style={!activeCategory ? { background: 'rgba(37,99,235,0.12)' } : {}}>
                <span>Todos</span>
                <span className="text-xs font-bold">{MENU_PRODUCTS.length}</span>
              </button>
              {MENU_CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${activeCategory === cat.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={activeCategory === cat.id ? { background: 'rgba(37,99,235,0.12)' } : {}}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold">{cat.products}</span>
                </button>
              ))}
            </div>
          </div>

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
                        <div className="flex gap-1.5">
                          {CHANNELS.map(ch => {
                            const active = product.channels[ch.id as keyof typeof product.channels]
                            return (
                              <div key={ch.id}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                                title={ch.label}
                                style={{
                                  background: active ? `${ch.color}20` : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${active ? ch.color + '50' : '#1A2540'}`,
                                }}>
                                {active
                                  ? <Check size={10} style={{ color: ch.color }} />
                                  : <EyeOff size={10} className="text-gastro-muted" />
                                }
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <div className="text-xs text-gastro-subtle">Margen:</div>
                          <div className="text-xs font-bold" style={{ color: product.margin > 70 ? '#10b981' : '#f59e0b' }}>
                            {product.margin}%
                          </div>
                        </div>

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

      {/* Recipe Lab */}
      {activeView === 'lab' && (
        <div className="space-y-4">
          {/* Lab intro banner */}
          <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
              <FlaskConical size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gastro-text text-sm">Laboratorio de Recetas</div>
              <div className="text-xs text-gastro-subtle mt-1">
                Diseñá, probá y optimizá recetas con costos en tiempo real desde GastroStock.
                Simulá precios, compará versiones y publicá directo en la carta.
              </div>
            </div>
            <Link to="/stock" className="btn-secondary text-xs px-3 py-2 flex-shrink-0">
              <Package size={13} /> Ver insumos
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={labSearch}
                onChange={e => setLabSearch(e.target.value)}
                placeholder="Buscar receta o chef..."
                className="input-gastro pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {([
                ['all', 'Todas'],
                ['draft', 'Borradores'],
                ['testing', 'En prueba'],
                ['approved', 'Aprobadas'],
                ['published', 'En carta'],
              ] as const).map(([id, label]) => (
                <button key={id} onClick={() => setLabFilter(id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${labFilter === id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={labFilter === id
                    ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLab.map(entry => {
              const version = getCurrentVersion(entry)
              const cost = computeRecipeCost(version.ingredients, inventoryCosts, version.yield)
              const margin = computeMargin(cost, version.suggestedPrice)
              const st = RECIPE_LAB_STATUS[entry.status]
              const lowStock = version.ingredients.some(ing => {
                const stock = stockItems.find(i => i.id === ing.inventoryItemId)
                return stock && stock.stock < ing.quantity
              })

              return (
                <div key={entry.id}
                  className="card-gastro overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedRecipe(entry)}>
                  <div className="relative h-36 overflow-hidden">
                    <img src={entry.image} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,22,40,0.95) 0%, transparent 60%)' }} />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    {lowStock && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                        <AlertTriangle size={10} /> Stock
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-black text-gastro-text text-sm leading-tight">{entry.name}</h4>
                      <p className="text-[10px] text-gastro-subtle mt-0.5">{entry.category} · v{version.version}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-black text-gastro-text">${cost.toLocaleString()}</div>
                        <div className="text-[10px] text-gastro-subtle">Costo</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-gastro-text">${version.suggestedPrice.toLocaleString()}</div>
                        <div className="text-[10px] text-gastro-subtle">Precio</div>
                      </div>
                      <div>
                        <div className="text-sm font-black" style={{ color: margin >= 70 ? '#10b981' : '#f59e0b' }}>{margin}%</div>
                        <div className="text-[10px] text-gastro-subtle">Margen</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gastro-subtle">
                      <span className="flex items-center gap-1"><Users size={11} /> {entry.chef}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {version.prepMinutes + version.cookMinutes} min</span>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="badge badge-blue text-[10px]">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#1A2540' }}>
                      <span className="text-xs text-gastro-subtle">{version.ingredients.length} ingredientes</span>
                      <span className="text-xs font-semibold text-primary-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Abrir <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredLab.length === 0 && (
            <div className="card-gastro text-center py-12">
              <FlaskConical size={32} className="mx-auto text-gastro-muted mb-3" />
              <p className="text-gastro-subtle text-sm">No hay recetas con esos filtros.</p>
              <button onClick={() => setShowNewRecipe(true)} className="btn-primary text-sm mt-4 mx-auto">
                <Plus size={14} /> Crear experimento
              </button>
            </div>
          )}
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
                <tr style={{ borderBottom: '1px solid #1A2540' }}>
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
                              border: `1px solid ${active ? ch.color + '50' : '#1A2540'}`,
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

      {/* Modals */}
      {selectedRecipe && (
        <RecipeLabDetailModal
          entry={labEntries.find(e => e.id === selectedRecipe.id) ?? selectedRecipe}
          inventoryCosts={inventoryCosts}
          stockItems={stockItems}
          onClose={() => setSelectedRecipe(null)}
          onPublish={handlePublish}
          onDuplicate={handleDuplicate}
        />
      )}

      {showNewRecipe && (
        <NewRecipeModal
          stockItems={stockItems}
          categories={MENU_CATEGORIES}
          onClose={() => setShowNewRecipe(false)}
          onSave={handleNewRecipe}
        />
      )}
    </div>
  )
}
