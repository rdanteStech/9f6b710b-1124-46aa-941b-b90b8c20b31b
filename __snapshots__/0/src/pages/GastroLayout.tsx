import { useState } from 'react'
import { TABLES_DATA } from '../data/mockData'
import { LayoutGrid, Plus, Save, Eye, Settings, Move, Maximize2 } from 'lucide-react'

const ZONES_CONFIG = [
  { id: 'salon', name: 'Salón Principal', color: '#9E7FFF', tables: TABLES_DATA.filter(t => t.zone === 'Salón') },
  { id: 'terraza', name: 'Terraza', color: '#38bdf8', tables: TABLES_DATA.filter(t => t.zone === 'Terraza') },
  { id: 'vip', name: 'VIP', color: '#f472b6', tables: TABLES_DATA.filter(t => t.zone === 'VIP') },
  { id: 'barra', name: 'Barra', color: '#f59e0b', tables: TABLES_DATA.filter(t => t.zone === 'Barra') },
]

const TABLE_STATUS_COLORS = {
  available: '#10b981',
  occupied: '#9E7FFF',
  reserved: '#f59e0b',
  cleaning: '#38bdf8',
}

export default function GastroLayout() {
  const [selectedZone, setSelectedZone] = useState('salon')
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  const activeZone = ZONES_CONFIG.find(z => z.id === selectedZone)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Diseño de espacios</h2>
          <p className="section-subtitle">Gestiona la distribución de mesas, zonas y capacidades</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm px-4 py-2"><Eye size={15} /> Vista cliente</button>
          <button className="btn-primary text-sm px-4 py-2"><Save size={15} /> Guardar layout</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Zones sidebar */}
        <div className="space-y-4">
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-4 text-sm">Zonas</h3>
            <div className="space-y-2">
              {ZONES_CONFIG.map(zone => (
                <button key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all ${selectedZone === zone.id ? 'text-gastro-text' : 'text-gastro-subtle hover:text-gastro-text'}`}
                  style={selectedZone === zone.id ? { background: `${zone.color}15`, border: `1px solid ${zone.color}40` } : { background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: zone.color }} />
                    <span className="font-semibold">{zone.name}</span>
                  </div>
                  <span className="text-xs text-gastro-subtle">{zone.tables.length} mesas</span>
                </button>
              ))}
              <button className="w-full flex items-center gap-2 p-3 rounded-xl text-sm text-gastro-subtle hover:text-gastro-text transition-all"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3d' }}>
                <Plus size={14} /> Nueva zona
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-3 text-sm">Resumen</h3>
            <div className="space-y-2">
              {Object.entries(TABLE_STATUS_COLORS).map(([status, color]) => {
                const count = TABLES_DATA.filter(t => t.status === status).length
                const labels = { available: 'Disponibles', occupied: 'Ocupadas', reserved: 'Reservadas', cleaning: 'Limpieza' }
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-gastro-subtle">{labels[status as keyof typeof labels]}</span>
                    </div>
                    <span className="text-xs font-bold text-gastro-text">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tools */}
          <div className="card-gastro">
            <h3 className="font-bold text-gastro-text mb-3 text-sm">Herramientas</h3>
            <div className="space-y-2">
              {[
                { icon: Move, label: 'Mover mesa' },
                { icon: Plus, label: 'Agregar mesa' },
                { icon: Maximize2, label: 'Redimensionar' },
                { icon: Settings, label: 'Configurar zona' },
              ].map(tool => {
                const Icon = tool.icon
                return (
                  <button key={tool.label}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gastro-subtle hover:text-gastro-text hover:bg-white/5 transition-all">
                    <Icon size={14} />
                    {tool.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Floor plan */}
        <div className="lg:col-span-3 card-gastro">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: activeZone?.color }} />
              <h3 className="font-bold text-gastro-text">{activeZone?.name}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gastro-subtle">
              <Move size={13} />
              Arrastra las mesas para reorganizar
            </div>
          </div>

          {/* Grid floor plan */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d', minHeight: '400px' }}>
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(158,127,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(158,127,255,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />

            {/* Tables */}
            <div className="relative p-6 grid grid-cols-6 gap-4 content-start min-h-[400px]">
              {activeZone?.tables.map((table, i) => {
                const color = TABLE_STATUS_COLORS[table.status as keyof typeof TABLE_STATUS_COLORS]
                const isSelected = selectedTable === table.id
                return (
                  <div key={table.id}
                    onClick={() => setSelectedTable(isSelected ? null : table.id)}
                    className="cursor-pointer transition-all duration-200 hover:scale-110"
                    style={{ gridColumn: `${(i % 5) + 1}`, gridRow: `${Math.floor(i / 5) + 1}` }}>
                    <div className={`rounded-xl p-3 text-center transition-all ${isSelected ? 'scale-110' : ''}`}
                      style={{
                        background: `${color}18`,
                        border: `2px solid ${isSelected ? color : color + '60'}`,
                        boxShadow: isSelected ? `0 0 20px ${color}40` : 'none',
                      }}>
                      <div className="text-lg font-black" style={{ color }}>{table.number}</div>
                      <div className="text-xs" style={{ color: color + 'aa' }}>{table.capacity}p</div>
                    </div>
                  </div>
                )
              })}

              {/* Add table button */}
              <div className="cursor-pointer transition-all hover:scale-105">
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed #2a2a3d' }}>
                  <Plus size={20} className="text-gastro-muted mx-auto" />
                  <div className="text-xs text-gastro-muted mt-1">Agregar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected table info */}
          {selectedTable && (
            <div className="mt-4 p-4 rounded-xl animate-slide-down"
              style={{ background: 'rgba(158,127,255,0.08)', border: '1px solid rgba(158,127,255,0.2)' }}>
              {(() => {
                const table = TABLES_DATA.find(t => t.id === selectedTable)
                if (!table) return null
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gastro-text">Mesa {table.number}</span>
                      <span className="text-gastro-subtle text-sm ml-2">· {table.capacity} personas · {table.zone}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs px-3 py-2"><Settings size={12} /> Configurar</button>
                      <button className="btn-primary text-xs px-3 py-2">Ver pedido</button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
