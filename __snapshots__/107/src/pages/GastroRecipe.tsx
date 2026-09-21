import { useState, useMemo, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MENU_CATEGORIES } from '../data/mockData'
import { useStock } from '../context/StockContext'
import { formatCurrency } from '../lib/locale'
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
  BookOpen, Plus, Search, TrendingUp, Check, Layers,
  FlaskConical, Clock, ChefHat, DollarSign, GitBranch, Sparkles,
  X, ChevronRight, Package, AlertTriangle, Copy, Rocket, Beaker,
  Scale, Timer, Users, ArrowRight, CheckCircle2, Wand2, Camera, Lightbulb,
} from 'lucide-react'

const AI_SUGGESTIONS = [
  {
    id: 'ai-1',
    title: 'Ceviche con salmón ahumado',
    reason: 'Alto stock de salmón (+18 kg) y margen proyectado 74%',
    category: 'Entradas',
    margin: 74,
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400',
  },
  {
    id: 'ai-2',
    title: 'Risotto de quinoa y hongos',
    reason: 'Tendencia +32% en platos sin gluten en la zona',
    category: 'Pastas',
    margin: 71,
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400',
  },
  {
    id: 'ai-3',
    title: 'Tarta de manzana con helado de canela',
    reason: 'Postre estacional — ingredientes disponibles en GastroStock',
    category: 'Postres',
    margin: 79,
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?w=400',
  },
]

function getCurrentVersion(entry: RecipeLabEntry): RecipeVersion {
  return entry.versions.find(v => v.id === entry.currentVersionId) ?? entry.versions[0]
}

function Flame({ size, ...props }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
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
  const [generatingPhoto, setGeneratingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(entry.image)

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

  const handleGeneratePhoto = () => {
    setGeneratingPhoto(true)
    setTimeout(() => {
      setPhotoUrl('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400')
      setGeneratingPhoto(false)
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
      role="dialog"
      aria-labelledby="recipe-lab-modal-title">
      <div className="rounded-2xl w-full max-w-3xl shadow-2xl animate-slide-down max-h-[92dvh] overflow-hidden flex flex-col"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex items-start gap-4" style={{ borderColor: '#1A2540' }}>
          <div className="relative flex-shrink-0">
            <img src={photoUrl} alt={entry.name} className="w-20 h-20 rounded-xl object-cover" />
            <button
              onClick={handleGeneratePhoto}
              disabled={generatingPhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#2563EB', border: '2px solid #0F1628' }}
              title="Generar foto con IA">
              {generatingPhoto ? <Sparkles size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
            </button>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Costo/porción', value: formatCurrency(costPerPortion), icon: DollarSign, color: '#f59e0b' },
              { label: 'Precio sugerido', value: formatCurrency(price), icon: TrendingUp, color: '#2563EB' },
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
              <span>{formatCurrency(Math.round(costPerPortion * 1.2))}</span>
              <span className="font-bold text-gastro-text">{formatCurrency(price)}</span>
              <span>{formatCurrency(Math.round(costPerPortion * 4))}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
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
                      <div className="font-bold text-gastro-text">{formatCurrency(Math.round(ing.lineCost))}</div>
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
                <span className="font-black text-gastro-text">{formatCurrency(Math.round(totalIngredientCost))}</span>
              </div>
              <Link to="/stock" className="inline-flex items-center gap-1 text-xs text-primary-400 hover:underline mt-2">
                Ver insumos en GastroStock <ArrowRight size={11} />
              </Link>
            </div>

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
                          <span>{formatCurrency(v.suggestedPrice)}</span>
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

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <span key={tag} className="badge badge-blue text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>

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

function NewRecipeModal({
  stockItems,
  categories,
  initialName,
  initialCategory,
  onClose,
  onSave,
}: {
  stockItems: ReturnType<typeof useStock>['items']
  categories: typeof MENU_CATEGORIES
  initialName?: string
  initialCategory?: string
  onClose: () => void
  onSave: (entry: RecipeLabEntry) => void
}) {
  const [name, setName] = useState(initialName ?? '')
  const [category, setCategory] = useState(initialCategory ?? categories[0]?.name ?? '')
  const [objective, setObjective] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [steps, setSteps] = useState([''])
  const [suggestedPrice, setSuggestedPrice] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [qty, setQty] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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

  const handleAiSuggest = () => {
    if (!name.trim()) return
    setAiLoading(true)
    setTimeout(() => {
      const suggestions: RecipeIngredient[] = stockItems.slice(0, 4).map((item, i) => ({
        inventoryItemId: item.id,
        name: item.name,
        quantity: [0.08, 0.12, 0.04, 0.02][i] ?? 0.05,
        unit: item.unit,
      }))
      setIngredients(suggestions)
      setSteps([
        'Preparar mise en place con todos los ingredientes.',
        'Ejecutar técnica principal según estándar del local.',
        'Ajustar sazón y emplatar con guarnición sugerida.',
      ])
      setSuggestedPrice('16500')
      setObjective(`Receta sugerida por GastroBrain para "${name.trim()}"`)
      setAiLoading(false)
    }, 1500)
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
        prepMinutes: 15,
        cookMinutes: 10,
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
      <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-down max-h-[90vh] overflow-y-auto"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gastro-text flex items-center gap-2">
            <FlaskConical size={18} className="text-primary-400" /> Nueva receta
          </h2>
          <button onClick={onClose} className="text-gastro-subtle hover:text-gastro-text"><X size={18} /></button>
        </div>

        <button
          onClick={handleAiSuggest}
          disabled={!name.trim() || aiLoading}
          className="w-full mb-4 p-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(37,99,235,0.3)' }}>
          {aiLoading ? <Sparkles size={16} className="animate-spin text-primary-400" /> : <Wand2 size={16} className="text-primary-400" />}
          {aiLoading ? 'GastroBrain generando receta...' : 'Completar con IA (ingredientes + pasos)'}
        </button>

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
              <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Precio objetivo (CLP)</label>
              <input type="number" value={suggestedPrice} onChange={e => setSuggestedPrice(e.target.value)} className="input-gastro" placeholder="18000" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Objetivo</label>
            <input value={objective} onChange={e => setObjective(e.target.value)} className="input-gastro" placeholder="Ej: Postre de temporada con margen >75%" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gastro-subtle mb-1.5 block">Ingredientes (desde GastroStock)</label>
            <div className="flex gap-2 mb-2">
              <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="input-gastro flex-1 text-sm">
                <option value="">Seleccionar insumo...</option>
                {stockItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({formatCurrency(i.cost)}/{i.unit})</option>
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

export default function GastroRecipe() {
  const { items: stockItems } = useStock()
  const [searchParams, setSearchParams] = useSearchParams()
  const [labEntries, setLabEntries] = useState<RecipeLabEntry[]>(RECIPE_LAB_ENTRIES)
  const [labFilter, setLabFilter] = useState<RecipeLabStatus | 'all'>('all')
  const [labSearch, setLabSearch] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeLabEntry | null>(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)
  const [newRecipePrefill, setNewRecipePrefill] = useState<{ name?: string; category?: string }>({})
  const [toast, setToast] = useState<string | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(true)

  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) {
      const entry = labEntries.find(e => e.id === openId)
      if (entry) setSelectedRecipe(entry)
    }
  }, [searchParams, labEntries])

  const inventoryCosts = useMemo(() => {
    const map = new Map<number, number>()
    stockItems.forEach(i => map.set(i.id, i.cost))
    return map
  }, [stockItems])

  const filteredLab = useMemo(() => {
    const query = labSearch.toLowerCase().trim()
    return labEntries.filter(e => {
      const matchSearch = !query
        || e.name.toLowerCase().includes(query)
        || e.chef.toLowerCase().includes(query)
        || e.category.toLowerCase().includes(query)
      const matchFilter = labFilter === 'all' || e.status === labFilter
      return matchSearch && matchFilter
    })
  }, [labEntries, labSearch, labFilter])

  const labStats = useMemo(() => {
    const testing = labEntries.filter(e => e.status === 'testing').length
    const margins = labEntries.map(e => {
      const v = getCurrentVersion(e)
      const cost = computeRecipeCost(v.ingredients, inventoryCosts, v.yield)
      return computeMargin(cost, v.suggestedPrice)
    })
    const avgMargin = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0
    return { testing, avgMargin, total: labEntries.length }
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
    setSearchParams({})
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
    showToastMsg('Receta duplicada como borrador')
  }

  const handleNewRecipe = (entry: RecipeLabEntry) => {
    setLabEntries(prev => [entry, ...prev])
    setShowNewRecipe(false)
    setNewRecipePrefill({})
    showToastMsg('Nueva receta creada')
  }

  const handleAiSuggestion = (suggestion: typeof AI_SUGGESTIONS[0]) => {
    setNewRecipePrefill({ name: suggestion.title, category: suggestion.category })
    setShowNewRecipe(true)
  }

  const openRecipe = (entry: RecipeLabEntry) => {
    setSelectedRecipe(entry)
    setSearchParams({ open: entry.id })
  }

  const closeRecipe = () => {
    setSelectedRecipe(null)
    setSearchParams({})
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Recetas totales', value: labStats.total.toString(), color: '#2563EB', icon: ChefHat },
          { label: 'En carta', value: labEntries.filter(e => e.status === 'published').length.toString(), color: '#10b981', icon: BookOpen },
          { label: 'En prueba', value: labStats.testing.toString(), color: '#f59e0b', icon: Beaker },
          { label: 'Margen promedio', value: `${labStats.avgMargin}%`, color: '#3B82F6', icon: TrendingUp },
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

      {showAiPanel && (
        <div className="card-gastro p-4"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.04) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gastro-text text-sm flex items-center gap-2">
                  GastroBrain — Sugerencias de recetas
                  <span className="badge badge-blue text-[10px]">AI</span>
                </h3>
                <p className="text-xs text-gastro-subtle mt-0.5">
                  Basado en stock disponible, tendencias de venta y márgenes objetivo
                </p>
              </div>
            </div>
            <button onClick={() => setShowAiPanel(false)} className="text-gastro-muted hover:text-gastro-text">
              <X size={16} />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {AI_SUGGESTIONS.map(s => (
              <div key={s.id} className="rounded-xl p-3 flex gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                <img src={s.image} alt={s.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gastro-text text-sm truncate">{s.title}</div>
                  <div className="text-[10px] text-gastro-subtle mt-0.5 line-clamp-2">{s.reason}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-success">{s.margin}% margen</span>
                    <button
                      onClick={() => handleAiSuggestion(s)}
                      className="text-[10px] font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                      <Lightbulb size={10} /> Crear receta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
          <FlaskConical size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gastro-text text-sm">Laboratorio de recetas</div>
          <div className="text-xs text-gastro-subtle mt-1">
            Ingredientes, costos en tiempo real desde GastroStock, versiones, fotos con IA y publicación en carta.
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/stock" className="btn-secondary text-xs px-3 py-2">
            <Package size={13} /> Insumos
          </Link>
          <Link to="/menu" className="btn-secondary text-xs px-3 py-2">
            <Layers size={13} /> Carta
          </Link>
          <button onClick={() => setShowNewRecipe(true)} className="btn-primary text-xs px-3 py-2">
            <Plus size={13} /> Nueva receta
          </button>
        </div>
      </div>

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
              onClick={() => openRecipe(entry)}>
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
                    <div className="text-sm font-black text-gastro-text">{formatCurrency(cost)}</div>
                    <div className="text-[10px] text-gastro-subtle">Costo</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-gastro-text">{formatCurrency(version.suggestedPrice)}</div>
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
            <Plus size={14} /> Crear receta
          </button>
        </div>
      )}

      {selectedRecipe && (
        <RecipeLabDetailModal
          entry={labEntries.find(e => e.id === selectedRecipe.id) ?? selectedRecipe}
          inventoryCosts={inventoryCosts}
          stockItems={stockItems}
          onClose={closeRecipe}
          onPublish={handlePublish}
          onDuplicate={handleDuplicate}
        />
      )}

      {showNewRecipe && (
        <NewRecipeModal
          stockItems={stockItems}
          categories={MENU_CATEGORIES}
          initialName={newRecipePrefill.name}
          initialCategory={newRecipePrefill.category}
          onClose={() => { setShowNewRecipe(false); setNewRecipePrefill({}) }}
          onSave={handleNewRecipe}
        />
      )}
    </div>
  )
}
