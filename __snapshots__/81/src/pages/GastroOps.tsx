import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ClipboardList, CheckCircle, Circle, Clock, AlertTriangle,
  Thermometer, Shield, Plus, ChevronRight, X, Save, Filter,
  Search, Calendar, Users, FileText, TrendingUp, Bell,
  Sun, Moon, ChefHat, Sparkles, History, Eye, Edit3,
  CheckSquare, Square, ArrowRight, MapPin, Star, Zap,
  AlertCircle, RotateCcw, Download, BarChart3, Target,
  type LucideIcon,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChecklistCategory = 'apertura' | 'cierre' | 'cocina' | 'limpieza' | 'haccp' | 'seguridad'
type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
type ChecklistFrequency = 'daily' | 'shift' | 'weekly' | 'monthly' | 'event'
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
type IncidentStatus = 'open' | 'investigating' | 'resolved'

interface ChecklistItem {
  id: string
  label: string
  description?: string
  required: boolean
  checked: boolean
  checkedAt?: string
  checkedBy?: string
  note?: string
}

interface ChecklistRun {
  id: string
  templateId: string
  name: string
  category: ChecklistCategory
  frequency: ChecklistFrequency
  status: ChecklistStatus
  assignedTo: string
  assignedAvatar: string
  dueTime: string
  startedAt?: string
  completedAt?: string
  progress: number
  totalItems: number
  completedItems: number
  zone?: string
  items: ChecklistItem[]
  priority: 'normal' | 'high' | 'critical'
}

interface ChecklistTemplate {
  id: string
  name: string
  category: ChecklistCategory
  frequency: ChecklistFrequency
  itemCount: number
  estimatedMinutes: number
  lastUsed: string
  completionRate: number
  active: boolean
  zones: string[]
}

interface TemperatureLog {
  id: string
  equipment: string
  zone: string
  targetMin: number
  targetMax: number
  reading: number
  unit: '°C'
  recordedAt: string
  recordedBy: string
  status: 'ok' | 'warning' | 'critical'
  note?: string
}

interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  category: string
  zone: string
  reportedBy: string
  reportedAt: string
  resolvedAt?: string
  assignedTo?: string
  actions: string[]
}

// ─── Config ─────────────────���─────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  apertura:  { label: 'Apertura',   icon: Sun,         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  cierre:    { label: 'Cierre',     icon: Moon,        color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  cocina:    { label: 'Cocina',     icon: ChefHat,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  limpieza:  { label: 'Limpieza',   icon: Sparkles,    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  haccp:     { label: 'HACCP',      icon: Thermometer, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  seguridad: { label: 'Seguridad',  icon: Shield,      color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
}

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pendiente',    color: '#8899BB', bg: 'rgba(136,153,187,0.12)' },
  in_progress: { label: 'En curso',     color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  completed:   { label: 'Completado',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  overdue:     { label: 'Vencido',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  skipped:     { label: 'Omitido',      color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string; bg: string }> = {
  low:      { label: 'Baja',     color: '#8899BB', bg: 'rgba(136,153,187,0.12)' },
  medium:   { label: 'Media',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:     { label: 'Alta',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  critical: { label: 'Crítica',  color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
}

const COMPLIANCE_WEEK = [
  { day: 'Lun', rate: 94, completed: 17, total: 18 },
  { day: 'Mar', rate: 100, completed: 18, total: 18 },
  { day: 'Mié', rate: 89, completed: 16, total: 18 },
  { day: 'Jue', rate: 96, completed: 17, total: 18 },
  { day: 'Vie', rate: 83, completed: 15, total: 18 },
  { day: 'Sáb', rate: 78, completed: 14, total: 18 },
  { day: 'Hoy', rate: 72, completed: 13, total: 18 },
]

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_RUNS: ChecklistRun[] = [
  {
    id: 'run-1', templateId: 'tpl-1', name: 'Apertura — Turno mediodía',
    category: 'apertura', frequency: 'shift', status: 'in_progress',
    assignedTo: 'Valentina Castro', assignedAvatar: 'VC', dueTime: '11:30',
    startedAt: '11:15', progress: 65, totalItems: 12, completedItems: 8,
    zone: 'General', priority: 'high',
    items: [
      { id: 'i1', label: 'Encender luces y aire acondicionado', required: true, checked: true, checkedAt: '11:16', checkedBy: 'Valentina C.' },
      { id: 'i2', label: 'Verificar limpieza del salón', required: true, checked: true, checkedAt: '11:18', checkedBy: 'Valentina C.' },
      { id: 'i3', label: 'Revisar reservas del turno', required: true, checked: true, checkedAt: '11:20', checkedBy: 'Valentina C.' },
      { id: 'i4', label: 'Comprobar caja registradora', required: true, checked: true, checkedAt: '11:22', checkedBy: 'Valentina C.' },
      { id: 'i5', label: 'Verificar stock de servilletas y cubiertos', required: true, checked: true, checkedAt: '11:24', checkedBy: 'Valentina C.' },
      { id: 'i6', label: 'Encender sistema POS y KDS', required: true, checked: true, checkedAt: '11:25', checkedBy: 'Valentina C.' },
      { id: 'i7', label: 'Briefing al equipo de salón', required: true, checked: true, checkedAt: '11:28', checkedBy: 'Valentina C.' },
      { id: 'i8', label: 'Verificar carta del día y especiales', required: true, checked: true, checkedAt: '11:30', checkedBy: 'Valentina C.' },
      { id: 'i9', label: 'Revisar mesas asignadas en GastroLayout', required: true, checked: false },
      { id: 'i10', label: 'Confirmar disponibilidad de terraza', required: false, checked: false },
      { id: 'i11', label: 'Verificar música ambiente', required: false, checked: false },
      { id: 'i12', label: 'Foto de verificación del salón', required: false, checked: false },
    ],
  },
  {
    id: 'run-2', templateId: 'tpl-2', name: 'Preparación cocina — Servicio',
    category: 'cocina', frequency: 'shift', status: 'pending',
    assignedTo: 'Carlos Méndez', assignedAvatar: 'CM', dueTime: '11:45',
    progress: 0, totalItems: 15, completedItems: 0,
    zone: 'Cocina', priority: 'critical',
    items: [
      { id: 'k1', label: 'Verificar mise en place completa', required: true, checked: false },
      { id: 'k2', label: 'Temperatura cámara fría (0–4°C)', required: true, checked: false },
      { id: 'k3', label: 'Temperatura congelador (-18°C)', required: true, checked: false },
      { id: 'k4', label: 'Revisar cadena de frío de proteínas', required: true, checked: false },
      { id: 'k5', label: 'Verificar fechas de vencimiento', required: true, checked: false },
      { id: 'k6', label: 'Encender planchas y hornos', required: true, checked: false },
      { id: 'k7', label: 'Stock de salsas madre y bases', required: true, checked: false },
      { id: 'k8', label: 'Briefing con brigada de cocina', required: true, checked: false },
      { id: 'k9', label: 'Verificar KDS y tickets pendientes', required: true, checked: false },
      { id: 'k10', label: 'Control de alérgenos del día', required: true, checked: false },
      { id: 'k11', label: 'Limpieza de superficies de trabajo', required: true, checked: false },
      { id: 'k12', label: 'Verificar guantes y EPP', required: true, checked: false },
      { id: 'k13', label: 'Calibrar balanza de porcionado', required: false, checked: false },
      { id: 'k14', label: 'Revisar pedidos especiales del turno', required: true, checked: false },
      { id: 'k15', label: 'Foto de mise en place', required: false, checked: false },
    ],
  },
  {
    id: 'run-3', templateId: 'tpl-3', name: 'Control HACCP — Temperaturas',
    category: 'haccp', frequency: 'daily', status: 'overdue',
    assignedTo: 'Luis Paredes', assignedAvatar: 'LP', dueTime: '10:00',
    progress: 40, totalItems: 10, completedItems: 4,
    zone: 'Cocina', priority: 'critical',
    items: [
      { id: 'h1', label: 'Cámara fría principal', required: true, checked: true, checkedAt: '09:45', checkedBy: 'Luis P.' },
      { id: 'h2', label: 'Cámara fría secundaria', required: true, checked: true, checkedAt: '09:46', checkedBy: 'Luis P.' },
      { id: 'h3', label: 'Congelador carnes', required: true, checked: true, checkedAt: '09:47', checkedBy: 'Luis P.' },
      { id: 'h4', label: 'Congelador pescados', required: true, checked: true, checkedAt: '09:48', checkedBy: 'Luis P.' },
      { id: 'h5', label: 'Vitrina de postres', required: true, checked: false },
      { id: 'h6', label: 'Baño maría sopas', required: true, checked: false },
      { id: 'h7', label: 'Freidora — aceite', required: true, checked: false },
      { id: 'h8', label: 'Barra — hielera', required: true, checked: false },
      { id: 'h9', label: 'Recepción de mercadería (si aplica)', required: false, checked: false },
      { id: 'h10', label: 'Registro en planilla digital', required: true, checked: false },
    ],
  },
  {
    id: 'run-4', templateId: 'tpl-4', name: 'Limpieza profunda — Baños',
    category: 'limpieza', frequency: 'daily', status: 'completed',
    assignedTo: 'María González', assignedAvatar: 'MG', dueTime: '09:00',
    startedAt: '08:30', completedAt: '08:55', progress: 100, totalItems: 8, completedItems: 8,
    zone: 'Baños', priority: 'normal',
    items: [
      { id: 'l1', label: 'Desinfectar inodoros y urinarios', required: true, checked: true, checkedAt: '08:35', checkedBy: 'María G.' },
      { id: 'l2', label: 'Limpiar espejos y lavamanos', required: true, checked: true, checkedAt: '08:38', checkedBy: 'María G.' },
      { id: 'l3', label: 'Reponer papel higiénico y jabón', required: true, checked: true, checkedAt: '08:40', checkedBy: 'María G.' },
      { id: 'l4', label: 'Verificar secador de manos', required: true, checked: true, checkedAt: '08:42', checkedBy: 'María G.' },
      { id: 'l5', label: 'Limpiar pisos con desinfectante', required: true, checked: true, checkedAt: '08:48', checkedBy: 'María G.' },
      { id: 'l6', label: 'Revisar dispensers de aroma', required: false, checked: true, checkedAt: '08:50', checkedBy: 'María G.' },
      { id: 'l7', label: 'Verificar iluminación', required: true, checked: true, checkedAt: '08:52', checkedBy: 'María G.' },
      { id: 'l8', label: 'Foto de verificación', required: false, checked: true, checkedAt: '08:55', checkedBy: 'María G.' },
    ],
  },
  {
    id: 'run-5', templateId: 'tpl-5', name: 'Cierre — Turno noche',
    category: 'cierre', frequency: 'shift', status: 'pending',
    assignedTo: 'Diego Fuentes', assignedAvatar: 'DF', dueTime: '01:00',
    progress: 0, totalItems: 14, completedItems: 0,
    zone: 'General', priority: 'high',
    items: [
      { id: 'c1', label: 'Cierre de caja y arqueo', required: true, checked: false },
      { id: 'c2', label: 'Apagar equipos de cocina', required: true, checked: false },
      { id: 'c3', label: 'Guardar alimentos en cámaras', required: true, checked: false },
      { id: 'c4', label: 'Etiquetar sobrantes del turno', required: true, checked: false },
      { id: 'c5', label: 'Limpieza de cocina post-servicio', required: true, checked: false },
      { id: 'c6', label: 'Apagar luces del salón', required: true, checked: false },
      { id: 'c7', label: 'Verificar cierre de terraza', required: true, checked: false },
      { id: 'c8', label: 'Activar alarma de seguridad', required: true, checked: false },
      { id: 'c9', label: 'Registrar incidencias del turno', required: true, checked: false },
      { id: 'c10', label: 'Handover al turno siguiente', required: true, checked: false },
      { id: 'c11', label: 'Verificar cierre de barra', required: true, checked: false },
      { id: 'c12', label: 'Conteo de inventario rápido', required: false, checked: false },
      { id: 'c13', label: 'Backup de sistema POS', required: true, checked: false },
      { id: 'c14', label: 'Foto de cierre del local', required: false, checked: false },
    ],
  },
  {
    id: 'run-6', templateId: 'tpl-6', name: 'Seguridad e incendios — Semanal',
    category: 'seguridad', frequency: 'weekly', status: 'pending',
    assignedTo: 'Sofía Herrera', assignedAvatar: 'SH', dueTime: '18:00',
    progress: 0, totalItems: 9, completedItems: 0,
    zone: 'General', priority: 'normal',
    items: [
      { id: 's1', label: 'Verificar extintores (presión y fecha)', required: true, checked: false },
      { id: 's2', label: 'Probar alarmas de humo', required: true, checked: false },
      { id: 's3', label: 'Revisar salidas de emergencia', required: true, checked: false },
      { id: 's4', label: 'Verificar botiquín de primeros auxilios', required: true, checked: false },
      { id: 's5', label: 'Inspeccionar detectores de gas', required: true, checked: false },
      { id: 's6', label: 'Revisar señalética de evacuación', required: true, checked: false },
      { id: 's7', label: 'Probar iluminación de emergencia', required: true, checked: false },
      { id: 's8', label: 'Verificar matafuegos de cocina', required: true, checked: false },
      { id: 's9', label: 'Registrar en libro de seguridad', required: true, checked: false },
    ],
  },
]

const TEMPLATES: ChecklistTemplate[] = [
  { id: 'tpl-1', name: 'Apertura — Turno mediodía', category: 'apertura', frequency: 'shift', itemCount: 12, estimatedMinutes: 25, lastUsed: 'Hoy 11:15', completionRate: 96, active: true, zones: ['Salón', 'Terraza'] },
  { id: 'tpl-2', name: 'Preparación cocina — Servicio', category: 'cocina', frequency: 'shift', itemCount: 15, estimatedMinutes: 35, lastUsed: 'Ayer 11:30', completionRate: 91, active: true, zones: ['Cocina'] },
  { id: 'tpl-3', name: 'Control HACCP — Temperaturas', category: 'haccp', frequency: 'daily', itemCount: 10, estimatedMinutes: 15, lastUsed: 'Hoy 09:45', completionRate: 88, active: true, zones: ['Cocina', 'Barra'] },
  { id: 'tpl-4', name: 'Limpieza profunda — Baños', category: 'limpieza', frequency: 'daily', itemCount: 8, estimatedMinutes: 20, lastUsed: 'Hoy 08:30', completionRate: 100, active: true, zones: ['Baños'] },
  { id: 'tpl-5', name: 'Cierre — Turno noche', category: 'cierre', frequency: 'shift', itemCount: 14, estimatedMinutes: 40, lastUsed: 'Ayer 00:45', completionRate: 94, active: true, zones: ['General'] },
  { id: 'tpl-6', name: 'Seguridad e incendios — Semanal', category: 'seguridad', frequency: 'weekly', itemCount: 9, estimatedMinutes: 30, lastUsed: 'Hace 5 días', completionRate: 100, active: true, zones: ['General'] },
  { id: 'tpl-7', name: 'Limpieza barra — Cierre', category: 'limpieza', frequency: 'shift', itemCount: 7, estimatedMinutes: 15, lastUsed: 'Ayer 01:10', completionRate: 97, active: true, zones: ['Barra'] },
  { id: 'tpl-8', name: 'Recepción de mercadería', category: 'haccp', frequency: 'event', itemCount: 11, estimatedMinutes: 20, lastUsed: 'Hace 2 días', completionRate: 100, active: false, zones: ['Depósito'] },
]

const TEMPERATURE_LOGS: TemperatureLog[] = [
  { id: 't1', equipment: 'Cámara fría principal', zone: 'Cocina', targetMin: 0, targetMax: 4, reading: 2.1, unit: '°C', recordedAt: '09:45', recordedBy: 'Luis P.', status: 'ok' },
  { id: 't2', equipment: 'Cámara fría secundaria', zone: 'Cocina', targetMin: 0, targetMax: 4, reading: 3.8, unit: '°C', recordedAt: '09:46', recordedBy: 'Luis P.', status: 'ok' },
  { id: 't3', equipment: 'Congelador carnes', zone: 'Cocina', targetMin: -22, targetMax: -18, reading: -19.2, unit: '°C', recordedAt: '09:47', recordedBy: 'Luis P.', status: 'ok' },
  { id: 't4', equipment: 'Congelador pescados', zone: 'Cocina', targetMin: -22, targetMax: -18, reading: -17.5, unit: '°C', recordedAt: '09:48', recordedBy: 'Luis P.', status: 'warning', note: 'Temperatura ligeramente alta — revisar compresor' },
  { id: 't5', equipment: 'Vitrina postres', zone: 'Salón', targetMin: 2, targetMax: 6, reading: 4.2, unit: '°C', recordedAt: '10:15', recordedBy: 'Ana R.', status: 'ok' },
  { id: 't6', equipment: 'Hielera barra', zone: 'Barra', targetMin: -2, targetMax: 2, reading: 1.8, unit: '°C', recordedAt: '10:20', recordedBy: 'Nicolás P.', status: 'ok' },
  { id: 't7', equipment: 'Baño maría sopas', zone: 'Cocina', targetMin: 65, targetMax: 85, reading: 72.5, unit: '°C', recordedAt: '12:00', recordedBy: 'Luis P.', status: 'ok' },
  { id: 't8', equipment: 'Freidora — aceite', zone: 'Cocina', targetMin: 160, targetMax: 180, reading: 185, unit: '°C', recordedAt: '12:30', recordedBy: 'Pedro V.', status: 'critical', note: 'Aceite sobre temperatura — cambiar inmediatamente' },
]

const INCIDENTS: Incident[] = [
  {
    id: 'inc-1', title: 'Corte menor en dedo — cocina',
    description: 'El cocinero Pedro V. sufrió un corte leve al filetear. Se aplicó primeros auxilios y guantes nuevos.',
    severity: 'medium', status: 'resolved', category: 'Accidente laboral', zone: 'Cocina',
    reportedBy: 'Carlos Méndez', reportedAt: 'Ayer 20:15', resolvedAt: 'Ayer 20:30',
    assignedTo: 'Sofía Herrera', actions: ['Primeros auxilios aplicados', 'Registro en libro de accidentes', 'Revisión de técnica de corte'],
  },
  {
    id: 'inc-2', title: 'Temperatura congelador pescados elevada',
    description: 'El congelador de pescados registró -17.5°C, fuera del rango óptimo. Posible falla en compresor.',
    severity: 'high', status: 'investigating', category: 'HACCP', zone: 'Cocina',
    reportedBy: 'Luis Paredes', reportedAt: 'Hoy 09:48',
    assignedTo: 'Carlos Méndez', actions: ['Transferir stock a congelador backup', 'Contactar servicio técnico'],
  },
  {
    id: 'inc-3', title: 'Cliente reportó alimento frío',
    description: 'Mesa 7 reportó que el plato principal llegó frío. Se reemplazó el plato y se ofreció postre de cortesía.',
    severity: 'low', status: 'resolved', category: 'Servicio', zone: 'Salón',
    reportedBy: 'Valentina Castro', reportedAt: 'Ayer 21:40', resolvedAt: 'Ayer 21:55',
    assignedTo: 'Valentina Castro', actions: ['Plato reemplazado', 'Postre de cortesía', 'Revisión tiempos KDS'],
  },
  {
    id: 'inc-4', title: 'Fuga de agua en baño damas',
    description: 'Se detectó fuga en el lavamanos del baño de damas. Se colocó señalética y se aisló el sector.',
    severity: 'medium', status: 'open', category: 'Mantenimiento', zone: 'Baños',
    reportedBy: 'María González', reportedAt: 'Hoy 08:20',
    assignedTo: 'Mantenimiento externo', actions: ['Señalética colocada', 'Plomero contactado'],
  },
]

const HISTORY = [
  { id: 'h1', name: 'Apertura — Turno mediodía', category: 'apertura' as ChecklistCategory, completedBy: 'Valentina Castro', completedAt: 'Ayer 11:32', duration: '22 min', score: 100, items: '12/12' },
  { id: 'h2', name: 'Control HACCP — Temperaturas', category: 'haccp' as ChecklistCategory, completedBy: 'Luis Paredes', completedAt: 'Ayer 10:05', duration: '18 min', score: 100, items: '10/10' },
  { id: 'h3', name: 'Cierre — Turno noche', category: 'cierre' as ChecklistCategory, completedBy: 'Diego Fuentes', completedAt: 'Ayer 00:52', duration: '38 min', score: 93, items: '13/14' },
  { id: 'h4', name: 'Preparación cocina — Servicio', category: 'cocina' as ChecklistCategory, completedBy: 'Carlos Méndez', completedAt: 'Ayer 11:48', duration: '42 min', score: 87, items: '13/15' },
  { id: 'h5', name: 'Limpieza profunda — Baños', category: 'limpieza' as ChecklistCategory, completedBy: 'María González', completedAt: 'Ayer 08:58', duration: '28 min', score: 100, items: '8/8' },
  { id: 'h6', name: 'Seguridad e incendios — Semanal', category: 'seguridad' as ChecklistCategory, completedBy: 'Sofía Herrera', completedAt: '12 Jul 18:15', duration: '32 min', score: 100, items: '9/9' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recalcRun(run: ChecklistRun): ChecklistRun {
  const completedItems = run.items.filter(i => i.checked).length
  const totalItems = run.items.length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  let status = run.status
  if (progress === 100) status = 'completed'
  else if (progress > 0 && status === 'pending') status = 'in_progress'
  return { ...run, completedItems, totalItems, progress, status }
}

function formatTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function formatDueTime(minutesFromNow = 30) {
  const due = new Date(Date.now() + minutesFromNow * 60_000)
  return `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`
}

function createRunFromTemplate(tpl: ChecklistTemplate): ChecklistRun {
  const seed = INITIAL_RUNS.find(r => r.templateId === tpl.id)
  const items: ChecklistItem[] = seed
    ? seed.items.map(item => ({
        ...item,
        id: `${item.id}-${Date.now()}`,
        checked: false,
        checkedAt: undefined,
        checkedBy: undefined,
      }))
    : Array.from({ length: tpl.itemCount }, (_, i) => ({
        id: `${tpl.id}-item-${i}`,
        label: `Ítem ${i + 1} — ${tpl.name}`,
        required: i < Math.ceil(tpl.itemCount * 0.75),
        checked: false,
      }))

  return {
    id: `run-${Date.now()}`,
    templateId: tpl.id,
    name: tpl.name,
    category: tpl.category,
    frequency: tpl.frequency,
    status: 'pending',
    assignedTo: 'Usuario actual',
    assignedAvatar: 'UA',
    dueTime: formatDueTime(tpl.estimatedMinutes),
    progress: 0,
    totalItems: items.length,
    completedItems: 0,
    zone: tpl.zones[0],
    items,
    priority: tpl.category === 'haccp' || tpl.category === 'cocina' ? 'critical' : tpl.category === 'apertura' ? 'high' : 'normal',
  }
}

function computeTempStatus(reading: number, min: number, max: number): TemperatureLog['status'] {
  if (reading < min || reading > max) {
    const margin = (max - min) * 0.15 || 1
    if (reading < min - margin || reading > max + margin) return 'critical'
    return 'warning'
  }
  return 'ok'
}

// ─── New Checklist Modal ──────────────────────────────────────────────────────

function NewChecklistModal({
  templates, onClose, onStart,
}: {
  templates: ChecklistTemplate[]
  onClose: () => void
  onStart: (tpl: ChecklistTemplate) => void
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1A2540' }}>
          <div>
            <h2 className="text-lg font-black text-gastro-text">Nuevo checklist</h2>
            <p className="text-xs text-gastro-subtle mt-1">Elegí una plantilla para iniciar el turno</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gastro-subtle"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {templates.filter(t => t.active).map(tpl => {
            const cat = CATEGORY_CONFIG[tpl.category]
            const CatIcon = cat.icon
            return (
              <button key={tpl.id} onClick={() => onStart(tpl)}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                  <CatIcon size={18} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gastro-text text-sm">{tpl.name}</div>
                  <div className="text-xs text-gastro-subtle mt-0.5">{tpl.itemCount} ítems · ~{tpl.estimatedMinutes} min</div>
                </div>
                <ChevronRight size={16} className="text-gastro-subtle" />
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── New Temperature Modal ────────────────────────────────────────────────────

function NewTemperatureModal({
  onClose, onSave,
}: {
  onClose: () => void
  onSave: (log: Omit<TemperatureLog, 'id' | 'recordedAt' | 'recordedBy' | 'status'>) => void
}) {
  const [form, setForm] = useState({
    equipment: '',
    zone: 'Cocina',
    targetMin: '0',
    targetMax: '4',
    reading: '',
    note: '',
  })

  const handleSave = () => {
    const reading = parseFloat(form.reading)
    const targetMin = parseFloat(form.targetMin)
    const targetMax = parseFloat(form.targetMax)
    if (!form.equipment.trim() || isNaN(reading) || isNaN(targetMin) || isNaN(targetMax)) return
    onSave({
      equipment: form.equipment.trim(),
      zone: form.zone,
      targetMin,
      targetMax,
      reading,
      unit: '°C',
      note: form.note.trim() || undefined,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1A2540' }}>
          <h2 className="text-lg font-black text-gastro-text">Nueva lectura</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gastro-subtle"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Equipo</label>
            <input value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}
              placeholder="Ej: Cámara fría principal" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Zona</label>
            <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              {['Cocina', 'Salón', 'Barra', 'Depósito', 'Baños'].map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gastro-subtle">Mín (°C)</label>
              <input type="number" value={form.targetMin} onChange={e => setForm(f => ({ ...f, targetMin: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gastro-subtle">Máx (°C)</label>
              <input type="number" value={form.targetMax} onChange={e => setForm(f => ({ ...f, targetMax: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gastro-subtle">Lectura</label>
              <input type="number" step="0.1" value={form.reading} onChange={e => setForm(f => ({ ...f, reading: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Nota (opcional)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }} />
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: '#1A2540' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gastro-subtle"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' }}>Cancelar</button>
          <button onClick={handleSave} className="btn-primary text-sm px-4 py-2"><Save size={15} /> Guardar lectura</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── New Incident Modal ───────────────────────────────────────────────────────

function NewIncidentModal({
  onClose, onSave,
}: {
  onClose: () => void
  onSave: (incident: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'actions'>) => void
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    category: 'Servicio',
    zone: 'Salón',
  })

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) return
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      category: form.category,
      zone: form.zone,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1A2540' }}>
          <h2 className="text-lg font-black text-gastro-text">Reportar incidencia</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gastro-subtle"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Título</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}
              placeholder="Resumen breve del incidente" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text resize-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gastro-subtle">Severidad</label>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as IncidentSeverity }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                {(Object.keys(SEVERITY_CONFIG) as IncidentSeverity[]).map(s => (
                  <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gastro-subtle">Zona</label>
              <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                {['Salón', 'Cocina', 'Barra', 'Baños', 'Depósito', 'Terraza'].map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gastro-subtle">Categoría</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              {['Servicio', 'HACCP', 'Mantenimiento', 'Accidente laboral', 'Seguridad'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: '#1A2540' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gastro-subtle"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' }}>Cancelar</button>
          <button onClick={handleSave} className="btn-primary text-sm px-4 py-2"><AlertTriangle size={15} /> Reportar</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

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
      <button onClick={onClose} className="ml-2 text-gastro-subtle hover:text-gastro-text"><X size={14} /></button>
    </div>,
    document.body
  )
}

// ─── Checklist Detail Modal ───────────────────────────────────────────────────

function ChecklistModal({
  run, onClose, onToggleItem, onComplete,
}: {
  run: ChecklistRun
  onClose: () => void
  onToggleItem: (runId: string, itemId: string) => void
  onComplete: (runId: string) => void
}) {
  const cat = CATEGORY_CONFIG[run.category]
  const CatIcon = cat.icon
  const requiredPending = run.items.filter(i => i.required && !i.checked).length
  const canComplete = requiredPending === 0

  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: '#0F1628', border: '1px solid #1A2540' }}>
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: '#1A2540' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                <CatIcon size={22} style={{ color: cat.color }} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gastro-text">{run.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: STATUS_CONFIG[run.status].bg, color: STATUS_CONFIG[run.status].color }}>
                    {STATUS_CONFIG[run.status].label}
                  </span>
                  {run.zone && (
                    <span className="text-xs text-gastro-subtle flex items-center gap-1">
                      <MapPin size={11} /> {run.zone}
                    </span>
                  )}
                  <span className="text-xs text-gastro-subtle flex items-center gap-1">
                    <Clock size={11} /> Vence {run.dueTime}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gastro-subtle"><X size={18} /></button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gastro-subtle">{run.completedItems} de {run.totalItems} ítems</span>
              <span className="text-xs font-bold" style={{ color: run.progress === 100 ? '#10b981' : '#2563EB' }}>{run.progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${run.progress}%`,
                  background: run.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #2563EB, #3B82F6)',
                }} />
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}>
              {run.assignedAvatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-gastro-text">{run.assignedTo}</div>
              <div className="text-xs text-gastro-subtle">Responsable del checklist</div>
            </div>
            {run.startedAt && (
              <div className="ml-auto text-right">
                <div className="text-xs text-gastro-subtle">Iniciado</div>
                <div className="text-sm font-semibold text-gastro-text">{run.startedAt}</div>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {run.items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onToggleItem(run.id, item.id)}
              className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:bg-white/[0.03]"
              style={{
                background: item.checked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${item.checked ? 'rgba(16,185,129,0.2)' : '#1A2540'}`,
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.checked
                  ? <CheckSquare size={20} style={{ color: '#10b981' }} />
                  : <Square size={20} style={{ color: '#8899BB' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${item.checked ? 'text-gastro-subtle line-through' : 'text-gastro-text'}`}>
                    {idx + 1}. {item.label}
                  </span>
                  {item.required && !item.checked && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>Requerido</span>
                  )}
                </div>
                {item.description && <p className="text-xs text-gastro-subtle mt-0.5">{item.description}</p>}
                {item.checked && item.checkedAt && (
                  <p className="text-xs mt-1" style={{ color: '#10b981' }}>
                    ✓ {item.checkedBy} — {item.checkedAt}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex-shrink-0 flex items-center justify-between gap-4" style={{ borderColor: '#1A2540' }}>
          <div>
            {requiredPending > 0 && (
              <p className="text-xs text-gastro-subtle">
                <AlertTriangle size={12} className="inline mr-1" style={{ color: '#f59e0b' }} />
                {requiredPending} ítem{requiredPending > 1 ? 's' : ''} requerido{requiredPending > 1 ? 's' : ''} pendiente{requiredPending > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gastro-subtle hover:text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2540' }}>
              Cerrar
            </button>
            {run.status !== 'completed' && (
              <button
                onClick={() => canComplete && onComplete(run.id)}
                disabled={!canComplete}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle size={15} /> Completar checklist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GastroOps() {
  const [activeTab, setActiveTab] = useState<'today' | 'templates' | 'temperatures' | 'incidents' | 'history'>('today')
  const [runs, setRuns] = useState<ChecklistRun[]>(INITIAL_RUNS)
  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLog[]>(TEMPERATURE_LOGS)
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS)
  const [selectedRun, setSelectedRun] = useState<ChecklistRun | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ChecklistCategory | 'all'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showNewChecklist, setShowNewChecklist] = useState(false)
  const [showNewTemperature, setShowNewTemperature] = useState(false)
  const [showNewIncident, setShowNewIncident] = useState(false)

  const pendingRuns = runs.filter(r => r.status === 'pending' || r.status === 'in_progress')
  const overdueRuns = runs.filter(r => r.status === 'overdue')
  const completedToday = runs.filter(r => r.status === 'completed').length
  const avgCompliance = Math.round(COMPLIANCE_WEEK.reduce((s, d) => s + d.rate, 0) / COMPLIANCE_WEEK.length)
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length
  const tempAlerts = temperatureLogs.filter(t => t.status !== 'ok').length

  const filteredRuns = runs.filter(r => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggleItem = (runId: string, itemId: string) => {
    setRuns(prev => prev.map(run => {
      if (run.id !== runId) return run
      const updatedItems = run.items.map(item => {
        if (item.id !== itemId) return item
        const nowChecked = !item.checked
        return {
          ...item,
          checked: nowChecked,
          checkedAt: nowChecked ? formatTime() : undefined,
          checkedBy: nowChecked ? 'Usuario actual' : undefined,
        }
      })
      const updated = recalcRun({ ...run, items: updatedItems, startedAt: run.startedAt || formatTime() })
      if (selectedRun?.id === runId) setSelectedRun(updated)
      return updated
    }))
  }

  const handleComplete = (runId: string) => {
    setRuns(prev => prev.map(run => {
      if (run.id !== runId) return run
      const updated = { ...run, status: 'completed' as ChecklistStatus, progress: 100, completedAt: formatTime() }
      return updated
    }))
    setSelectedRun(null)
    showToast('Checklist completado correctamente')
  }

  const handleStartTemplate = (tpl: ChecklistTemplate) => {
    const newRun = createRunFromTemplate(tpl)
    setRuns(prev => [newRun, ...prev])
    setSelectedRun(newRun)
    setShowNewChecklist(false)
    setActiveTab('today')
    showToast(`Checklist "${tpl.name}" iniciado`)
  }

  const handleAddTemperature = (data: Omit<TemperatureLog, 'id' | 'recordedAt' | 'recordedBy' | 'status'>) => {
    const status = computeTempStatus(data.reading, data.targetMin, data.targetMax)
    const newLog: TemperatureLog = {
      ...data,
      id: `t-${Date.now()}`,
      recordedAt: formatTime(),
      recordedBy: 'Usuario actual',
      status,
    }
    setTemperatureLogs(prev => [newLog, ...prev])
    setShowNewTemperature(false)
    showToast(status === 'ok' ? 'Lectura registrada' : 'Lectura registrada — fuera de rango', status === 'ok' ? 'success' : 'error')
  }

  const handleAddIncident = (data: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'actions'>) => {
    const newIncident: Incident = {
      ...data,
      id: `inc-${Date.now()}`,
      reportedBy: 'Usuario actual',
      reportedAt: `Hoy ${formatTime()}`,
      status: 'open',
      actions: ['Incidencia registrada — pendiente de acción'],
    }
    setIncidents(prev => [newIncident, ...prev])
    setShowNewIncident(false)
    setActiveTab('incidents')
    showToast('Incidencia reportada correctamente')
  }

  const currentRun = selectedRun ? runs.find(r => r.id === selectedRun.id) || selectedRun : null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(59,130,246,0.06) 50%, rgba(16,185,129,0.04) 100%)',
          border: '1px solid rgba(37,99,235,0.25)',
        }}>
        <div className="absolute top-0 right-0 w-72 h-72 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
            <ClipboardList size={26} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroOps</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)' }}>
                Operaciones
              </span>
              {overdueRuns.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-lg font-bold animate-pulse"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  ⚠️ {overdueRuns.length} checklist{overdueRuns.length > 1 ? 's' : ''} vencido{overdueRuns.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-gastro-subtle">
              Checklists operativos, control HACCP, registros de temperatura e incidencias — todo en un solo lugar
            </p>
          </div>
          <button onClick={() => setShowNewChecklist(true)} className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            <Plus size={15} /> Nuevo checklist
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pendientes hoy', value: pendingRuns.length, color: '#2563EB', icon: Clock },
          { label: 'Completados', value: completedToday, color: '#10b981', icon: CheckCircle },
          { label: 'Vencidos', value: overdueRuns.length, color: '#ef4444', icon: AlertTriangle },
          { label: 'Cumplimiento', value: `${avgCompliance}%`, color: '#f59e0b', icon: Target },
          { label: 'Incidencias abiertas', value: openIncidents, color: '#60A5FA', icon: Bell },
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

      {/* Overdue alert */}
      {overdueRuns.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={18} className="text-error flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-error">Checklists vencidos: </span>
            <span className="text-sm text-gastro-subtle">
              {overdueRuns.map(r => r.name).join(' · ')} — Requieren atención inmediata.
            </span>
          </div>
          <button
            onClick={() => { setSelectedRun(overdueRuns[0]); }}
            className="btn-primary text-xs px-3 py-2 flex-shrink-0"
          >
            Resolver ahora <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'today', label: 'Checklists de hoy', icon: ClipboardList },
            { id: 'templates', label: 'Plantillas', icon: FileText },
            { id: 'temperatures', label: 'Temperaturas', icon: Thermometer, badge: tempAlerts > 0 ? tempAlerts : undefined },
            { id: 'incidents', label: 'Incidencias', icon: AlertTriangle, badge: openIncidents > 0 ? openIncidents : undefined },
            { id: 'history', label: 'Historial', icon: History },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'text-primary-400' : 'text-gastro-subtle hover:text-gastro-text'}`}
                style={activeTab === tab.id ? { background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                <Icon size={14} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Today Tab ── */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gastro-subtle" />
                <input
                  type="text"
                  placeholder="Buscar checklist..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-gastro-text placeholder-gastro-subtle"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === 'all' ? 'text-primary-400' : 'text-gastro-subtle'}`}
                  style={categoryFilter === 'all' ? { background: 'rgba(37,99,235,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
                  Todos
                </button>
                {(Object.keys(CATEGORY_CONFIG) as ChecklistCategory[]).map(cat => (
                  <button key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === cat ? 'text-primary-400' : 'text-gastro-subtle'}`}
                    style={categoryFilter === cat ? { background: `${CATEGORY_CONFIG[cat].color}18`, color: CATEGORY_CONFIG[cat].color } : { background: 'rgba(255,255,255,0.03)' }}>
                    {CATEGORY_CONFIG[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Runs */}
            <div className="space-y-3">
              {filteredRuns.map(run => {
                const cat = CATEGORY_CONFIG[run.category]
                const CatIcon = cat.icon
                const st = STATUS_CONFIG[run.status]
                return (
                  <div key={run.id} className="card-gastro p-5 cursor-pointer group"
                    onClick={() => setSelectedRun(run)}
                    style={run.status === 'overdue' ? { borderColor: 'rgba(239,68,68,0.3)' } : undefined}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                        <CatIcon size={20} style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gastro-text group-hover:text-primary-400 transition-colors">{run.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          {run.priority === 'critical' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>Crítico</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gastro-subtle flex-wrap">
                          <span className="flex items-center gap-1"><Users size={11} /> {run.assignedTo}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> Vence {run.dueTime}</span>
                          {run.zone && <span className="flex items-center gap-1"><MapPin size={11} /> {run.zone}</span>}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gastro-subtle">{run.completedItems}/{run.totalItems} ítems</span>
                            <span className="text-xs font-bold" style={{ color: run.progress === 100 ? '#10b981' : '#2563EB' }}>{run.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{
                                width: `${run.progress}%`,
                                background: run.status === 'overdue' ? '#ef4444' : run.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #2563EB, #3B82F6)',
                              }} />
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gastro-subtle group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar: compliance + quick actions */}
          <div className="space-y-4">
            {/* Compliance chart */}
            <div className="card-gastro p-5">
              <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#2563EB' }} />
                Cumplimiento semanal
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={COMPLIANCE_WEEK} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#0F1628', border: '1px solid #1A2540', borderRadius: 12, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, 'Cumplimiento']}
                  />
                  <Bar dataKey="rate" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 rounded-xl text-center" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <div className="text-2xl font-black" style={{ color: '#2563EB' }}>{avgCompliance}%</div>
                <div className="text-xs text-gastro-subtle">Promedio semanal</div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="card-gastro p-5">
              <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
                <Zap size={16} style={{ color: '#f59e0b' }} />
                Acciones rápidas
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Registrar temperatura', icon: Thermometer, color: '#2563EB', action: () => setShowNewTemperature(true) },
                  { label: 'Reportar incidencia', icon: AlertTriangle, color: '#ef4444', action: () => setShowNewIncident(true) },
                  { label: 'Ver plantillas', icon: FileText, color: '#3B82F6', action: () => setActiveTab('templates') },
                  { label: 'Exportar reporte HACCP', icon: Download, color: '#10b981', action: () => showToast('Reporte HACCP generado') },
                ].map(action => {
                  const Icon = action.icon
                  return (
                    <button key={action.label} onClick={action.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2540' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}18` }}>
                        <Icon size={15} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-semibold text-gastro-text">{action.label}</span>
                      <ChevronRight size={14} className="ml-auto text-gastro-subtle" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Shift handover */}
            <div className="card-gastro p-5">
              <h3 className="font-bold text-gastro-text mb-3 flex items-center gap-2">
                <ArrowRight size={16} style={{ color: '#60A5FA' }} />
                Handover turno
              </h3>
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                <p className="text-gastro-subtle text-xs mb-2">Última nota — Turno noche (Diego F.)</p>
                <p className="text-gastro-text text-sm leading-relaxed">
                  Stock de vinos Carmenère bajo (6 botellas). Evento privado mañana 13hs — 45 pax, menú ejecutivo confirmado. Congelador pescados requiere revisión técnica.
                </p>
              </div>
              <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-gastro-subtle hover:text-gastro-text transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
                <Edit3 size={12} className="inline mr-1" /> Agregar nota de turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Templates Tab ── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">{TEMPLATES.filter(t => t.active).length} plantillas activas · {TEMPLATES.length} total</p>
            <button className="btn-primary text-sm px-4 py-2"><Plus size={15} /> Nueva plantilla</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TEMPLATES.map(tpl => {
              const cat = CATEGORY_CONFIG[tpl.category]
              const CatIcon = cat.icon
              return (
                <div key={tpl.id} className="card-gastro p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                      <CatIcon size={18} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gastro-text text-sm">{tpl.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                        <span className="text-[10px] text-gastro-subtle">{tpl.frequency === 'daily' ? 'Diario' : tpl.frequency === 'shift' ? 'Por turno' : tpl.frequency === 'weekly' ? 'Semanal' : 'Evento'}</span>
                        {!tpl.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold" style={{ background: 'rgba(107,114,128,0.12)', color: '#6b7280' }}>Inactiva</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Ítems', value: tpl.itemCount },
                      { label: 'Minutos', value: tpl.estimatedMinutes },
                      { label: 'Cumplimiento', value: `${tpl.completionRate}%` },
                    ].map(s => (
                      <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-sm font-black text-gastro-text">{s.value}</div>
                        <div className="text-[10px] text-gastro-subtle">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gastro-subtle">Último uso: {tpl.lastUsed}</span>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gastro-subtle" title="Editar"><Edit3 size={14} /></button>
                      <button
                        onClick={() => handleStartTemplate(tpl)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)' }}>
                        Iniciar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Temperatures Tab ── */}
      {activeTab === 'temperatures' && (
        <div className="space-y-4">
          {tempAlerts > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Thermometer size={18} style={{ color: '#ef4444' }} />
              <span className="text-sm text-gastro-subtle">
                <strong className="text-error">{tempAlerts} lectura{tempAlerts > 1 ? 's' : ''} fuera de rango</strong> — Revisar equipos afectados.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">Registro HACCP del día — {temperatureLogs.length} lecturas</p>
            <button onClick={() => setShowNewTemperature(true)} className="btn-primary text-sm px-4 py-2"><Plus size={15} /> Nueva lectura</button>
          </div>

          <div className="card-gastro overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1A2540' }}>
                    {['Equipo', 'Zona', 'Lectura', 'Rango objetivo', 'Estado', 'Registrado', 'Por'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gastro-subtle uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {temperatureLogs.map(log => {
                    const statusCfg = {
                      ok: { label: 'OK', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                      warning: { label: 'Alerta', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                      critical: { label: 'Crítico', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
                    }[log.status]
                    const outOfRange = log.reading < log.targetMin || log.reading > log.targetMax
                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #1A2540' }}>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gastro-text">{log.equipment}</div>
                          {log.note && <div className="text-xs text-gastro-subtle mt-0.5">{log.note}</div>}
                        </td>
                        <td className="px-5 py-4 text-gastro-subtle">{log.zone}</td>
                        <td className="px-5 py-4">
                          <span className="font-black text-lg" style={{ color: outOfRange ? statusCfg.color : '#10b981' }}>
                            {log.reading}{log.unit}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gastro-subtle text-xs">{log.targetMin} a {log.targetMax}{log.unit}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gastro-subtle">{log.recordedAt}</td>
                        <td className="px-5 py-4 text-gastro-subtle">{log.recordedBy}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Temperature trend */}
          <div className="card-gastro p-5">
            <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#2563EB' }} />
              Tendencia — Cámara fría principal (7 días)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={[
                { day: 'Lun', temp: 2.0 }, { day: 'Mar', temp: 2.3 }, { day: 'Mié', temp: 1.8 },
                { day: 'Jue', temp: 2.5 }, { day: 'Vie', temp: 2.1 }, { day: 'Sáb', temp: 1.9 }, { day: 'Hoy', temp: 2.1 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} unit="°C" />
                <Tooltip contentStyle={{ background: '#0F1628', border: '1px solid #1A2540', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="temp" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} name="Temperatura" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Incidents Tab ── */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">{openIncidents} incidencia{openIncidents !== 1 ? 's' : ''} abierta{openIncidents !== 1 ? 's' : ''} · {incidents.length} total</p>
            <button onClick={() => setShowNewIncident(true)} className="btn-primary text-sm px-4 py-2"><Plus size={15} /> Reportar incidencia</button>
          </div>
          <div className="space-y-3">
            {incidents.map(inc => {
              const sev = SEVERITY_CONFIG[inc.severity]
              const statusLabel = { open: 'Abierta', investigating: 'En investigación', resolved: 'Resuelta' }[inc.status]
              const statusColor = { open: '#ef4444', investigating: '#f59e0b', resolved: '#10b981' }[inc.status]
              return (
                <div key={inc.id} className="card-gastro p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: sev.bg }}>
                      <AlertTriangle size={18} style={{ color: sev.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gastro-text">{inc.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={{ background: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
                      </div>
                      <p className="text-sm text-gastro-subtle mb-3">{inc.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gastro-subtle flex-wrap mb-3">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {inc.zone}</span>
                        <span className="flex items-center gap-1"><FileText size={11} /> {inc.category}</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {inc.reportedBy}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {inc.reportedAt}</span>
                      </div>
                      {inc.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {inc.actions.map((action, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2540', color: '#8899BB' }}>
                              {inc.status === 'resolved' ? '✓' : '→'} {action}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-gastro-subtle flex-shrink-0" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gastro-subtle">Historial de checklists completados</p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gastro-subtle hover:text-gastro-text"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540' }}>
              <Download size={14} /> Exportar auditoría
            </button>
          </div>
          <div className="card-gastro overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1A2540' }}>
                    {['Checklist', 'Categoría', 'Completado por', 'Fecha', 'Duración', 'Ítems', 'Score'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gastro-subtle uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map(h => {
                    const cat = CATEGORY_CONFIG[h.category]
                    return (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" style={{ borderBottom: '1px solid #1A2540' }}>
                        <td className="px-5 py-4 font-semibold text-gastro-text">{h.name}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                        </td>
                        <td className="px-5 py-4 text-gastro-subtle">{h.completedBy}</td>
                        <td className="px-5 py-4 text-gastro-subtle">{h.completedAt}</td>
                        <td className="px-5 py-4 text-gastro-subtle">{h.duration}</td>
                        <td className="px-5 py-4 text-gastro-subtle">{h.items}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black" style={{ color: h.score >= 95 ? '#10b981' : h.score >= 80 ? '#f59e0b' : '#ef4444' }}>{h.score}%</span>
                            {h.score === 100 && <Star size={12} style={{ color: '#f59e0b' }} />}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {currentRun && (
        <ChecklistModal
          run={currentRun}
          onClose={() => setSelectedRun(null)}
          onToggleItem={handleToggleItem}
          onComplete={handleComplete}
        />
      )}

      {showNewChecklist && (
        <NewChecklistModal
          templates={TEMPLATES}
          onClose={() => setShowNewChecklist(false)}
          onStart={handleStartTemplate}
        />
      )}

      {showNewTemperature && (
        <NewTemperatureModal
          onClose={() => setShowNewTemperature(false)}
          onSave={handleAddTemperature}
        />
      )}

      {showNewIncident && (
        <NewIncidentModal
          onClose={() => setShowNewIncident(false)}
          onSave={handleAddIncident}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
