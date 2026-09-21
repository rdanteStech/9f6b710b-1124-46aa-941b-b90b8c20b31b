import { useState } from 'react'
import { createPortal } from 'react-dom'
import { STAFF_DATA } from '../data/mockData'
import {
  Users, Clock, Star, Plus, Calendar, Award,
  Briefcase, ChevronDown, ChevronRight, Building2, Crown, ChefHat,
  UtensilsCrossed, Wine, Settings, Edit3,
  UserPlus, Layers, X, Save, Trash2, GripVertical,
  AlertCircle, CheckCircle
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrgNode {
  id: string
  name: string
  role: string
  department: string
  avatar: string
  color: string
  status: 'active' | 'vacation' | 'off'
  reports?: OrgNode[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIFTS = [
  { day: 'Lun', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.'] },
  { day: 'Mar', staff: ['Carlos M.', 'Valentina C.', 'Ana R.', 'Roberto S.'] },
  { day: 'Mié', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.'] },
  { day: 'Jue', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'Roberto S.'] },
  { day: 'Vie', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.', 'Roberto S.'] },
  { day: 'Sáb', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.', 'Ana R.', 'Roberto S.'] },
  { day: 'Dom', staff: ['Carlos M.', 'Valentina C.', 'Luis P.', 'María G.'] },
]

const JOB_LISTINGS = [
  { id: 1, role: 'Sous Chef', type: 'Full-time', applicants: 12, status: 'active', posted: 'Hace 3 días' },
  { id: 2, role: 'Mozo/Moza', type: 'Part-time', applicants: 28, status: 'active', posted: 'Hace 1 semana' },
  { id: 3, role: 'Bartender', type: 'Full-time', applicants: 8, status: 'reviewing', posted: 'Hace 2 semanas' },
]

const DEPARTMENTS = ['Dirección', 'Gerencia', 'Cocina', 'Salón', 'Barra']
const DEPT_COLORS: Record<string, string> = {
  'Dirección': '#9E7FFF',
  'Gerencia': '#38bdf8',
  'Cocina': '#f59e0b',
  'Salón': '#f472b6',
  'Barra': '#10b981',
}

const STATUS_CONFIG = {
  active: { label: 'Activo', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  vacation: { label: 'Vacaciones', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  off: { label: 'Libre', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

const INITIAL_ORG: OrgNode = {
  id: '1', name: 'Martín Rodríguez', role: 'Dueño / Director General',
  department: 'Dirección', avatar: 'MR', color: '#9E7FFF', status: 'active',
  reports: [
    {
      id: '2', name: 'Sofía Herrera', role: 'Gerente General',
      department: 'Gerencia', avatar: 'SH', color: '#38bdf8', status: 'active',
      reports: [
        {
          id: '3', name: 'Carlos Méndez', role: 'Chef Ejecutivo',
          department: 'Cocina', avatar: 'CM', color: '#f59e0b', status: 'active',
          reports: [
            {
              id: '6', name: 'Luis Paredes', role: 'Sous Chef',
              department: 'Cocina', avatar: 'LP', color: '#f59e0b', status: 'active',
              reports: [
                { id: '10', name: 'Ana Ríos', role: 'Cocinero/a', department: 'Cocina', avatar: 'AR', color: '#f59e0b', status: 'active' },
                { id: '11', name: 'Pedro Vega', role: 'Cocinero/a', department: 'Cocina', avatar: 'PV', color: '#f59e0b', status: 'off' },
                { id: '12', name: 'Lucía Mora', role: 'Pastelera', department: 'Cocina', avatar: 'LM', color: '#f59e0b', status: 'active' },
              ]
            },
          ]
        },
        {
          id: '4', name: 'Valentina Castro', role: 'Jefa de Salón',
          department: 'Salón', avatar: 'VC', color: '#f472b6', status: 'active',
          reports: [
            { id: '7', name: 'María González', role: 'Moza Senior', department: 'Salón', avatar: 'MG', color: '#f472b6', status: 'active' },
            { id: '8', name: 'Roberto Sosa', role: 'Mozo', department: 'Salón', avatar: 'RS', color: '#f472b6', status: 'vacation' },
            { id: '9', name: 'Camila Torres', role: 'Moza', department: 'Salón', avatar: 'CT', color: '#f472b6', status: 'active' },
          ]
        },
        {
          id: '5', name: 'Diego Fuentes', role: 'Jefe de Barra',
          department: 'Barra', avatar: 'DF', color: '#10b981', status: 'active',
          reports: [
            { id: '13', name: 'Nicolás Paz', role: 'Bartender', department: 'Barra', avatar: 'NP', color: '#10b981', status: 'active' },
            { id: '14', name: 'Florencia Gil', role: 'Barista', department: 'Barra', avatar: 'FG', color: '#10b981', status: 'active' },
          ]
        },
      ]
    }
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function countNodes(node: OrgNode): number {
  return 1 + (node.reports?.reduce((acc, r) => acc + countNodes(r), 0) ?? 0)
}

function flattenNodes(node: OrgNode): OrgNode[] {
  return [node, ...(node.reports?.flatMap(flattenNodes) ?? [])]
}

function updateNodeInTree(tree: OrgNode, id: string, updater: (n: OrgNode) => OrgNode): OrgNode {
  if (tree.id === id) return updater(tree)
  return { ...tree, reports: tree.reports?.map(r => updateNodeInTree(r, id, updater)) }
}

function addNodeToParent(tree: OrgNode, parentId: string, newNode: OrgNode): OrgNode {
  if (tree.id === parentId) {
    return { ...tree, reports: [...(tree.reports ?? []), newNode] }
  }
  return { ...tree, reports: tree.reports?.map(r => addNodeToParent(r, parentId, newNode)) }
}

function removeNodeFromTree(tree: OrgNode, id: string): OrgNode | null {
  if (tree.id === id) return null
  return {
    ...tree,
    reports: tree.reports
      ?.map(r => removeNodeFromTree(r, id))
      .filter(Boolean) as OrgNode[]
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-in"
      style={{
        background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {type === 'success'
        ? <CheckCircle size={16} style={{ color: '#10b981' }} />
        : <AlertCircle size={16} style={{ color: '#ef4444' }} />
      }
      <span className="text-sm font-semibold text-gastro-text">{message}</span>
      <button onClick={onClose} className="ml-2 text-gastro-subtle hover:text-gastro-text">
        <X size={14} />
      </button>
    </div>,
    document.body
  )
}

// ─── Edit Node Modal ──────────────────────────────────────────────────────────
function EditNodeModal({
  node,
  onSave,
  onDelete,
  onClose,
  isRoot,
}: {
  node: OrgNode
  onSave: (updated: OrgNode) => void
  onDelete: () => void
  onClose: () => void
  isRoot: boolean
}) {
  const [form, setForm] = useState({ ...node })

  const handleDeptChange = (dept: string) => {
    setForm(f => ({ ...f, department: dept, color: DEPT_COLORS[dept] ?? f.color }))
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, avatar: getInitials(name) || f.avatar }))
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 space-y-5"
        style={{ background: '#1a1a26', border: '1px solid #2a2a3d', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(158,127,255,0.15)' }}>
              <Edit3 size={16} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-gastro-text">Editar posición</h3>
              <p className="text-xs text-gastro-subtle">Modificá los datos del nodo</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-gastro-subtle">
            <X size={16} />
          </button>
        </div>

        {/* Preview avatar */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black text-white"
            style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}99)` }}
          >
            {form.avatar}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Nombre completo</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gastro-text outline-none focus:ring-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d', focusRingColor: '#9E7FFF' }}
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Nombre y apellido"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Cargo / Rol</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gastro-text outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Ej: Chef Ejecutivo"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Departamento</label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => handleDeptChange(dept)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={form.department === dept
                    ? { background: `${DEPT_COLORS[dept]}20`, border: `1px solid ${DEPT_COLORS[dept]}60`, color: DEPT_COLORS[dept] }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                  }
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Estado</label>
            <div className="flex gap-2">
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG['active']][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, status: key as OrgNode['status'] }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={form.status === key
                    ? { background: val.bg, border: `1px solid ${val.color}60`, color: val.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                  }
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          {!isRoot && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gastro-subtle hover:text-gastro-text transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c5ce0)' }}
          >
            <Save size={14} /> Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Add Position Modal ───────────────────────────────────────────────────────
function AddPositionModal({
  allNodes,
  onAdd,
  onClose,
}: {
  allNodes: OrgNode[]
  onAdd: (parentId: string, node: OrgNode) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: 'Cocina',
    status: 'active' as OrgNode['status'],
    parentId: allNodes[0]?.id ?? '',
  })

  const handleDeptChange = (dept: string) => setForm(f => ({ ...f, department: dept }))

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) return
    const color = DEPT_COLORS[form.department] ?? '#9E7FFF'
    const newNode: OrgNode = {
      id: Date.now().toString(),
      name: form.name.trim(),
      role: form.role.trim(),
      department: form.department,
      avatar: getInitials(form.name),
      color,
      status: form.status,
      reports: [],
    }
    onAdd(form.parentId, newNode)
  }

  const isValid = form.name.trim().length > 0 && form.role.trim().length > 0

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 space-y-5"
        style={{ background: '#1a1a26', border: '1px solid #2a2a3d', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(158,127,255,0.15)' }}>
              <UserPlus size={16} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-gastro-text">Agregar posición</h3>
              <p className="text-xs text-gastro-subtle">Nueva persona en el organigrama</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-gastro-subtle">
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${DEPT_COLORS[form.department]}, ${DEPT_COLORS[form.department]}99)` }}
          >
            {form.name ? getInitials(form.name) : '?'}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Nombre completo *</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gastro-text outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Juan García"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Cargo / Rol *</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gastro-text outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a3d' }}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Ej: Cocinero/a"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Departamento</label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => handleDeptChange(dept)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={form.department === dept
                    ? { background: `${DEPT_COLORS[dept]}20`, border: `1px solid ${DEPT_COLORS[dept]}60`, color: DEPT_COLORS[dept] }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                  }
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Reporta a</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gastro-text outline-none"
              style={{ background: '#1e1e2e', border: '1px solid #2a2a3d' }}
              value={form.parentId}
              onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
            >
              {allNodes.map(n => (
                <option key={n.id} value={n.id} style={{ background: '#1a1a26' }}>
                  {n.name} — {n.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle uppercase tracking-wider mb-1.5 block">Estado inicial</label>
            <div className="flex gap-2">
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG['active']][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, status: key as OrgNode['status'] }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={form.status === key
                    ? { background: val.bg, border: `1px solid ${val.color}60`, color: val.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                  }
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gastro-subtle hover:text-gastro-text transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: isValid ? 'linear-gradient(135deg, #9E7FFF, #7c5ce0)' : 'rgba(158,127,255,0.2)',
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={14} /> Agregar al organigrama
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Edit Structure Panel ─────────────────────────────────────────────────────
function EditStructurePanel({
  orgData,
  onUpdate,
  onClose,
}: {
  orgData: OrgNode
  onUpdate: (updated: OrgNode) => void
  onClose: () => void
}) {
  const allNodes = flattenNodes(orgData)

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
        style={{ background: '#1a1a26', border: '1px solid #2a2a3d', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 pb-2" style={{ background: '#1a1a26' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(158,127,255,0.15)' }}>
              <Settings size={16} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-gastro-text">Editar estructura</h3>
              <p className="text-xs text-gastro-subtle">{allNodes.length} posiciones en el organigrama</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-gastro-subtle">
            <X size={16} />
          </button>
        </div>

        {/* Node list */}
        <div className="space-y-2">
          {allNodes.map(node => {
            const status = STATUS_CONFIG[node.status]
            return (
              <NodeEditRow
                key={node.id}
                node={node}
                isRoot={node.id === orgData.id}
                onSave={updated => {
                  onUpdate(updateNodeInTree(orgData, node.id, () => updated))
                }}
                onDelete={() => {
                  const updated = removeNodeFromTree(orgData, node.id)
                  if (updated) onUpdate(updated)
                }}
              />
            )
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c5ce0)' }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Node Edit Row (inside Edit Structure Panel) ──────────────────────────────
function NodeEditRow({
  node,
  isRoot,
  onSave,
  onDelete,
}: {
  node: OrgNode
  isRoot: boolean
  onSave: (updated: OrgNode) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: node.name, role: node.role, department: node.department, status: node.status })
  const status = STATUS_CONFIG[node.status]

  const handleSave = () => {
    const color = DEPT_COLORS[form.department] ?? node.color
    onSave({ ...node, ...form, color, avatar: getInitials(form.name) || node.avatar })
    setEditing(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ border: '1px solid #2a2a3d', background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 p-3">
        <GripVertical size={14} className="text-gastro-subtle flex-shrink-0" />
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${node.color}, ${node.color}99)` }}
        >
          {node.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gastro-text text-sm truncate">{node.name}</div>
          <div className="text-xs truncate" style={{ color: node.color }}>{node.role}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: status.color }} />
          <span className="text-xs text-gastro-subtle hidden sm:block">{status.label}</span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
          style={editing
            ? { background: 'rgba(158,127,255,0.2)', color: '#9E7FFF' }
            : { background: 'rgba(255,255,255,0.04)', color: '#6b7280' }
          }
        >
          <Edit3 size={12} />
        </button>
        {!isRoot && (
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: '#2a2a3d' }}>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <input
              className="px-3 py-2 rounded-xl text-xs text-gastro-text outline-none col-span-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #3a3a4d' }}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre"
            />
            <input
              className="px-3 py-2 rounded-xl text-xs text-gastro-text outline-none col-span-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #3a3a4d' }}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Cargo"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setForm(f => ({ ...f, department: dept }))}
                className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                style={form.department === dept
                  ? { background: `${DEPT_COLORS[dept]}20`, border: `1px solid ${DEPT_COLORS[dept]}50`, color: DEPT_COLORS[dept] }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                }
              >
                {dept}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG['active']][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setForm(f => ({ ...f, status: key as OrgNode['status'] }))}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={form.status === key
                  ? { background: val.bg, border: `1px solid ${val.color}50`, color: val.color }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d', color: '#6b7280' }
                }
              >
                {val.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-gastro-subtle"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3d' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #9E7FFF, #7c5ce0)' }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── OrgCard Component ────────────────────────────────────────────────────────
function OrgCard({
  node,
  depth = 0,
  onEditNode,
}: {
  node: OrgNode
  depth?: number
  onEditNode: (node: OrgNode) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasReports = node.reports && node.reports.length > 0
  const status = STATUS_CONFIG[node.status]
  const isRoot = depth === 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div
          className="rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-105"
          style={{
            background: isRoot
              ? `linear-gradient(135deg, rgba(158,127,255,0.18), rgba(56,189,248,0.10))`
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isRoot ? 'rgba(158,127,255,0.4)' : '#2a2a3d'}`,
            minWidth: isRoot ? '200px' : '160px',
            boxShadow: isRoot ? '0 0 24px rgba(158,127,255,0.15)' : 'none',
          }}
          onClick={() => hasReports && setExpanded(!expanded)}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white relative"
              style={{ background: `linear-gradient(135deg, ${node.color}, ${node.color}99)` }}
            >
              {node.avatar}
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                style={{ background: status.color, borderColor: '#171717' }}
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-gastro-text text-xs leading-tight">{node.name}</div>
              <div className="text-xs mt-0.5" style={{ color: node.color }}>{node.role}</div>
              <div
                className="text-xs mt-1.5 px-2 py-0.5 rounded-full inline-block"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </div>
            </div>
          </div>
          {hasReports && (
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
              style={{ background: node.color, border: '2px solid #171717' }}
            >
              {expanded ? <ChevronDown size={12} className="text-white" /> : <ChevronRight size={12} className="text-white" />}
            </div>
          )}
        </div>

        {/* Hover edit button */}
        <button
          className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(158,127,255,0.2)' }}
          onClick={e => { e.stopPropagation(); onEditNode(node) }}
        >
          <Edit3 size={10} className="text-primary-400" />
        </button>
      </div>

      {hasReports && expanded && (
        <div className="flex flex-col items-center mt-6">
          <div className="w-px h-6" style={{ background: '#2a2a3d' }} />
          <div className="flex items-start gap-0">
            {node.reports!.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center relative">
                <div
                  className="h-px"
                  style={{
                    background: '#2a2a3d',
                    width: node.reports!.length === 1 ? '0px' : '100%',
                    position: 'absolute',
                    top: 0,
                    left: idx === 0 ? '50%' : 0,
                    right: idx === node.reports!.length - 1 ? '50%' : 0,
                  }}
                />
                <div className="w-px h-6" style={{ background: '#2a2a3d' }} />
                <div className="px-3">
                  <OrgCard node={child} depth={depth + 1} onEditNode={onEditNode} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Department Legend ────────────────────────────────────────────────────────
function DeptLegend({ orgData }: { orgData: OrgNode }) {
  const allNodes = flattenNodes(orgData)
  const depts = [
    { name: 'Dirección', color: '#9E7FFF', icon: Crown },
    { name: 'Gerencia', color: '#38bdf8', icon: Building2 },
    { name: 'Cocina', color: '#f59e0b', icon: ChefHat },
    { name: 'Salón', color: '#f472b6', icon: UtensilsCrossed },
    { name: 'Barra', color: '#10b981', icon: Wine },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {depts.map(d => {
        const Icon = d.icon
        const count = allNodes.filter(n => n.department === d.name).length
        if (count === 0) return null
        return (
          <div
            key={d.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: `${d.color}12`, border: `1px solid ${d.color}30`, color: d.color }}
          >
            <Icon size={12} />
            {d.name}
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-black"
              style={{ background: d.color, fontSize: '9px' }}
            >
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GastroTalent() {
  const [activeView, setActiveView] = useState<'team' | 'shifts' | 'recruitment' | 'organigrama'>('team')
  const [orgData, setOrgData] = useState<OrgNode>(INITIAL_ORG)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editingNode, setEditingNode] = useState<OrgNode | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const allNodes = flattenNodes(orgData)
  const totalCount = allNodes.length

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddNode = (parentId: string, newNode: OrgNode) => {
    setOrgData(prev => addNodeToParent(prev, parentId, newNode))
    setShowAddModal(false)
    showToast(`${newNode.name} agregado al organigrama`)
  }

  const handleEditNode = (updated: OrgNode) => {
    setOrgData(prev => updateNodeInTree(prev, updated.id, () => updated))
    setEditingNode(null)
    showToast('Posición actualizada correctamente')
  }

  const handleDeleteNode = (id: string) => {
    const node = allNodes.find(n => n.id === id)
    const updated = removeNodeFromTree(orgData, id)
    if (updated) {
      setOrgData(updated)
      setEditingNode(null)
      showToast(`${node?.name ?? 'Posición'} eliminado del organigrama`)
    }
  }

  const deptStats = [
    { dept: 'Dirección', color: '#9E7FFF', icon: Crown },
    { dept: 'Gerencia', color: '#38bdf8', icon: Building2 },
    { dept: 'Cocina', color: '#f59e0b', icon: ChefHat },
    { dept: 'Salón', color: '#f472b6', icon: UtensilsCrossed },
    { dept: 'Barra', color: '#10b981', icon: Wine },
  ].map(d => ({ ...d, count: allNodes.filter(n => n.department === d.dept).length }))
    .filter(d => d.count > 0)

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modals */}
      {showAddModal && (
        <AddPositionModal
          allNodes={allNodes}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showEditPanel && (
        <EditStructurePanel
          orgData={orgData}
          onUpdate={updated => { setOrgData(updated); showToast('Estructura actualizada') }}
          onClose={() => setShowEditPanel(false)}
        />
      )}
      {editingNode && (
        <EditNodeModal
          node={editingNode}
          isRoot={editingNode.id === orgData.id}
          onSave={handleEditNode}
          onDelete={() => handleDeleteNode(editingNode.id)}
          onClose={() => setEditingNode(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Personal activo', value: STAFF_DATA.filter(s => s.status === 'active').length, color: '#10b981', icon: Users },
          { label: 'Horas esta semana', value: '284', color: '#9E7FFF', icon: Clock },
          { label: 'Satisfacción promedio', value: '4.7', color: '#f59e0b', icon: Star },
          { label: 'Vacantes abiertas', value: JOB_LISTINGS.length, color: '#38bdf8', icon: Briefcase },
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
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'team', label: 'Equipo' },
            { id: 'shifts', label: 'Turnos' },
            { id: 'recruitment', label: 'Reclutamiento' },
            { id: 'organigrama', label: 'Organigrama' },
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
        <button className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Agregar empleado
        </button>
      </div>

      {/* ── Team ── */}
      {activeView === 'team' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAFF_DATA.map(member => (
            <div key={member.id} className="card-gastro">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #9E7FFF, #38bdf8)' }}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gastro-text text-sm">{member.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
                  </div>
                  <div className="text-xs text-gastro-subtle mb-2">{member.role}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-warning fill-warning" />
                      <span className="text-xs font-bold text-gastro-text">{member.rating}</span>
                    </div>
                    <div className="text-xs text-gastro-subtle">{member.shift}</div>
                  </div>
                  <div className="mt-2">
                    <span className={`badge text-xs ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {member.status === 'active' ? 'En turno' : 'Descanso'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Shifts ── */}
      {activeView === 'shifts' && (
        <div className="card-gastro">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gastro-text">Turnos de la semana</h3>
            <button className="btn-secondary text-xs px-3 py-2"><Calendar size={13} /> Ver mes completo</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {SHIFTS.map(shift => (
              <div key={shift.day} className="text-center">
                <div className="text-xs font-bold text-gastro-subtle mb-2">{shift.day}</div>
                <div className="space-y-1">
                  {shift.staff.map(name => (
                    <div key={name} className="text-xs px-2 py-1 rounded-lg truncate"
                      style={{ background: 'rgba(158,127,255,0.1)', color: '#9E7FFF', border: '1px solid rgba(158,127,255,0.2)' }}>
                      {name.split(' ')[0]}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gastro-subtle mt-2">{shift.staff.length} personas</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recruitment ── */}
      {activeView === 'recruitment' && (
        <div className="space-y-4">
          <div className="card-gastro">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gastro-text">Vacantes activas</h3>
              <button className="btn-primary text-sm px-4 py-2"><Plus size={14} /> Publicar vacante</button>
            </div>
            <div className="space-y-3">
              {JOB_LISTINGS.map(job => (
                <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a3d' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(158,127,255,0.12)' }}>
                    <Briefcase size={18} className="text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gastro-text">{job.role}</div>
                    <div className="text-xs text-gastro-subtle">{job.type} · Publicado {job.posted}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-gastro-text">{job.applicants}</div>
                    <div className="text-xs text-gastro-subtle">postulantes</div>
                  </div>
                  <div className={`badge text-xs ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {job.status === 'active' ? 'Activa' : 'En revisión'}
                  </div>
                  <button className="btn-secondary text-xs px-3 py-2">Ver postulantes</button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(158,127,255,0.06) 100%)', border: '1px solid rgba(244,114,182,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(244,114,182,0.15)' }}>
                <Award size={22} className="text-accent-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gastro-text mb-1">GastroNetwork — Red Profesional</h4>
                <p className="text-sm text-gastro-subtle">Accede a la red de más de 12.000 profesionales gastronómicos verificados. Matching inteligente por habilidades, experiencia y disponibilidad.</p>
              </div>
              <button className="btn-primary text-sm px-4 py-2 flex-shrink-0">Explorar red</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Organigrama ── */}
      {activeView === 'organigrama' && (
        <div className="space-y-4">
          <div className="card-gastro">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(158,127,255,0.15)' }}>
                    <Layers size={16} className="text-primary-400" />
                  </div>
                  <h3 className="font-bold text-gastro-text">Organigrama del Restaurante</h3>
                </div>
                <p className="text-sm text-gastro-subtle ml-11">
                  Estructura jerárquica del equipo · {totalCount} {totalCount === 1 ? 'persona' : 'personas'} en {deptStats.length} departamentos
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs px-3 py-2"
                  onClick={() => setShowEditPanel(true)}
                >
                  <Settings size={13} /> Editar estructura
                </button>
                <button
                  className="btn-primary text-xs px-3 py-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus size={13} /> Agregar posición
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2a2a3d' }}>
              <div className="text-xs text-gastro-subtle mb-2 font-semibold uppercase tracking-wider">Departamentos</div>
              <DeptLegend orgData={orgData} />
            </div>

            <div className="mt-3 flex gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-gastro-subtle">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
                  {val.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card-gastro overflow-auto" style={{ minHeight: '520px' }}>
            <div className="flex justify-center py-6" style={{ minWidth: '900px' }}>
              <OrgCard node={orgData} depth={0} onEditNode={setEditingNode} />
            </div>
          </div>

          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${deptStats.length}, minmax(0, 1fr))` }}>
            {deptStats.map(d => {
              const Icon = d.icon
              return (
                <div
                  key={d.dept}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: `${d.color}08`, border: `1px solid ${d.color}25` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${d.color}18` }}>
                    <Icon size={18} style={{ color: d.color }} />
                  </div>
                  <div className="text-2xl font-black" style={{ color: d.color }}>{d.count}</div>
                  <div className="text-xs text-gastro-subtle mt-0.5">{d.dept}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
