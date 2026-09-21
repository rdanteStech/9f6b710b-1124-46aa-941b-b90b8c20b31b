import { useState } from 'react'
import {
  GraduationCap, BookOpen, Play, CheckCircle, Clock, Star,
  Award, TrendingUp, Users, Lock, ChevronRight, Search,
  Filter, Zap, Brain, ChefHat, Wine, UtensilsCrossed,
  BarChart3, Shield, Flame, Trophy, Target, Sparkles,
  PlayCircle, FileText, Download, Heart, Share2, Bookmark,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
type CourseCategory = 'cocina' | 'servicio' | 'gestion' | 'bar' | 'pasteleria' | 'higiene'
type CourseStatus = 'available' | 'enrolled' | 'completed' | 'locked'

interface Course {
  id: string
  title: string
  instructor: string
  instructorRole: string
  instructorEmoji: string
  category: CourseCategory
  level: CourseLevel
  duration: string
  lessons: number
  students: number
  rating: number
  reviews: number
  status: CourseStatus
  progress?: number
  thumbnail: string
  description: string
  tags: string[]
  certificate: boolean
  isPro: boolean
  isNew?: boolean
}

interface Certification {
  id: string
  name: string
  issuer: string
  icon: string
  color: string
  description: string
  requirements: string[]
  enrolled: number
  duration: string
  isPro: boolean
  earned?: boolean
  earnedDate?: string
}

interface LearningPath {
  id: string
  name: string
  description: string
  color: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  courses: number
  duration: string
  level: CourseLevel
  enrolled: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: 'c1', title: 'Gestión de Cocina Profesional', instructor: 'Chef Martín Acosta',
    instructorRole: 'Executive Chef · 12 años exp.', instructorEmoji: '👨‍🍳',
    category: 'cocina', level: 'advanced', duration: '8h 30min', lessons: 24, students: 1284,
    rating: 4.9, reviews: 312, status: 'enrolled', progress: 65,
    thumbnail: 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?w=600',
    description: 'Domina la gestión integral de una cocina profesional: brigadas, mise en place, control de costos y liderazgo.',
    tags: ['Brigadas', 'Mise en place', 'Costos', 'Liderazgo'], certificate: true, isPro: false,
  },
  {
    id: 'c2', title: 'Servicio de Sala de Alto Nivel', instructor: 'Valentina Cruz',
    instructorRole: 'Maître · 9 años exp.', instructorEmoji: '👩‍🍳',
    category: 'servicio', level: 'intermediate', duration: '5h 45min', lessons: 18, students: 892,
    rating: 4.8, reviews: 198, status: 'available', progress: 0,
    thumbnail: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?w=600',
    description: 'Técnicas de servicio francés, inglés y americano. Protocolo, atención al cliente y manejo de situaciones difíciles.',
    tags: ['Protocolo', 'Atención al cliente', 'Servicio francés'], certificate: true, isPro: false,
  },
  {
    id: 'c3', title: 'Mixología Clásica y Contemporánea', instructor: 'Roberto Silva',
    instructorRole: 'Head Bartender · 6 años exp.', instructorEmoji: '🧑‍🍳',
    category: 'bar', level: 'intermediate', duration: '6h 20min', lessons: 20, students: 654,
    rating: 4.7, reviews: 145, status: 'completed', progress: 100,
    thumbnail: 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?w=600',
    description: 'Desde los clásicos IBA hasta la mixología molecular. Técnicas, ingredientes y presentación de cócteles.',
    tags: ['Cócteles clásicos', 'Mixología molecular', 'Destilados'], certificate: true, isPro: false,
  },
  {
    id: 'c4', title: 'Pastelería Francesa Avanzada', instructor: 'Ana Rodríguez',
    instructorRole: 'Pastry Chef · 8 años exp.', instructorEmoji: '👩‍🍳',
    category: 'pasteleria', level: 'advanced', duration: '10h 15min', lessons: 32, students: 2140,
    rating: 4.9, reviews: 487, status: 'available', progress: 0,
    thumbnail: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=600',
    description: 'Croissants, éclairs, macarons y entremets. Técnicas de la pastelería francesa con enfoque en precisión y presentación.',
    tags: ['Croissants', 'Macarons', 'Entremets', 'Chocolate'], certificate: true, isPro: true, isNew: true,
  },
  {
    id: 'c5', title: 'Control de Costos y Rentabilidad', instructor: 'Diego Ramírez',
    instructorRole: 'Restaurant Manager · 10 años exp.', instructorEmoji: '👨‍💼',
    category: 'gestion', level: 'intermediate', duration: '4h 30min', lessons: 14, students: 428,
    rating: 4.6, reviews: 89, status: 'enrolled', progress: 30,
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600',
    description: 'Escandallo, food cost, beverage cost y análisis de rentabilidad por plato. Herramientas para maximizar márgenes.',
    tags: ['Food cost', 'Escandallo', 'Rentabilidad', 'KPIs'], certificate: true, isPro: false,
  },
  {
    id: 'c6', title: 'HACCP y Seguridad Alimentaria', instructor: 'Dra. Laura Méndez',
    instructorRole: 'Consultora HACCP · 15 años exp.', instructorEmoji: '👩‍🔬',
    category: 'higiene', level: 'beginner', duration: '3h 00min', lessons: 10, students: 3210,
    rating: 4.8, reviews: 621, status: 'completed', progress: 100,
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=600',
    description: 'Principios HACCP, puntos críticos de control, temperatura, contaminación cruzada y normativa vigente.',
    tags: ['HACCP', 'BPM', 'Temperatura', 'Normativa'], certificate: true, isPro: false,
  },
  {
    id: 'c7', title: 'Sommelier: Vinos del Mundo', instructor: 'Carlos Vega',
    instructorRole: 'Sommelier Certificado · 11 años exp.', instructorEmoji: '🍷',
    category: 'bar', level: 'advanced', duration: '12h 00min', lessons: 36, students: 312,
    rating: 4.9, reviews: 78, status: 'locked', progress: 0,
    thumbnail: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?w=600',
    description: 'Cepas, regiones, maridaje y servicio del vino. Preparación para certificación internacional de sommelier.',
    tags: ['Cepas', 'Maridaje', 'Regiones', 'Cata'], certificate: true, isPro: true,
  },
  {
    id: 'c8', title: 'Liderazgo de Equipos Gastronómicos', instructor: 'Camila Torres',
    instructorRole: 'HR Manager · 7 años exp.', instructorEmoji: '👩‍💼',
    category: 'gestion', level: 'intermediate', duration: '5h 00min', lessons: 16, students: 567,
    rating: 4.7, reviews: 134, status: 'available', progress: 0,
    thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?w=600',
    description: 'Gestión de equipos bajo presión, comunicación efectiva, motivación y resolución de conflictos en gastronomía.',
    tags: ['Liderazgo', 'Comunicación', 'Motivación', 'Conflictos'], certificate: false, isPro: false, isNew: true,
  },
]

const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert1', name: 'Chef Profesional Certificado', issuer: 'GastroAcademy · FEHGRA',
    icon: '👨‍🍳', color: '#f59e0b',
    description: 'Certificación reconocida a nivel nacional que acredita competencias en cocina profesional.',
    requirements: ['Gestión de Cocina Profesional', 'HACCP y Seguridad Alimentaria', 'Control de Costos'],
    enrolled: 284, duration: '3 meses', isPro: false, earned: false,
  },
  {
    id: 'cert2', name: 'Sommelier Certificado', issuer: 'GastroAcademy · ASA',
    icon: '🍷', color: '#0066FF',
    description: 'Certificación internacional en vinos, maridaje y servicio. Reconocida por la Asociación de Sommeliers.',
    requirements: ['Sommelier: Vinos del Mundo', 'Servicio de Sala de Alto Nivel'],
    enrolled: 98, duration: '4 meses', isPro: true, earned: false,
  },
  {
    id: 'cert3', name: 'Seguridad Alimentaria HACCP', issuer: 'GastroAcademy · ANMAT',
    icon: '🛡️', color: '#10b981',
    description: 'Certificación oficial en buenas prácticas de manufactura y sistema HACCP.',
    requirements: ['HACCP y Seguridad Alimentaria'],
    enrolled: 1240, duration: '2 semanas', isPro: false, earned: true, earnedDate: 'Marzo 2025',
  },
  {
    id: 'cert4', name: 'Bartender & Mixólogo Profesional', issuer: 'GastroAcademy · AIBA',
    icon: '🍸', color: '#3399FF',
    description: 'Certificación en mixología clásica y contemporánea. Reconocida por la Asociación Internacional de Bartenders.',
    requirements: ['Mixología Clásica y Contemporánea'],
    enrolled: 312, duration: '6 semanas', isPro: false, earned: true, earnedDate: 'Enero 2025',
  },
]

const LEARNING_PATHS: LearningPath[] = [
  { id: 'lp1', name: 'Chef Ejecutivo', description: 'De cocinero a líder de cocina', color: '#f59e0b', icon: ChefHat, courses: 6, duration: '28h', level: 'advanced', enrolled: 412 },
  { id: 'lp2', name: 'Maître & Sommelier', description: 'Excelencia en sala y vinos', color: '#0066FF', icon: Wine, courses: 4, duration: '22h', level: 'intermediate', enrolled: 198 },
  { id: 'lp3', name: 'Gerente de Restaurante', description: 'Gestión integral del negocio', color: '#3399FF', icon: BarChart3, courses: 5, duration: '18h', level: 'intermediate', enrolled: 287 },
  { id: 'lp4', name: 'Pastelero Profesional', description: 'Arte y técnica en pastelería', color: '#00B4FF', icon: Sparkles, courses: 5, duration: '32h', level: 'advanced', enrolled: 156 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_CFG: Record<CourseLevel, { label: string; color: string; bg: string }> = {
  beginner:     { label: 'Inicial',       color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  intermediate: { label: 'Intermedio',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  advanced:     { label: 'Avanzado',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
}

const CAT_CFG: Record<CourseCategory, { label: string; color: string; emoji: string }> = {
  cocina:     { label: 'Cocina',          color: '#f59e0b', emoji: '🍳' },
  servicio:   { label: 'Servicio',        color: '#3399FF', emoji: '🍽️' },
  gestion:    { label: 'Gestión',         color: '#0066FF', emoji: '📊' },
  bar:        { label: 'Bar & Bebidas',   color: '#00B4FF', emoji: '🍸' },
  pasteleria: { label: 'Pastelería',      color: '#00B4FF', emoji: '🧁' },
  higiene:    { label: 'Higiene & HACCP', color: '#10b981', emoji: '🛡️' },
}

const STATUS_CFG: Record<CourseStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Disponible',  color: '#8899BB', bg: 'rgba(136,136,170,0.1)' },
  enrolled:  { label: 'En curso',    color: '#0066FF', bg: 'rgba(0,102,255,0.12)' },
  completed: { label: 'Completado',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  locked:    { label: 'Bloqueado',   color: '#6666aa', bg: 'rgba(100,100,170,0.08)' },
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (id: string) => void }) {
  const lvl = LEVEL_CFG[course.level]
  const cat = CAT_CFG[course.category]
  const st = STATUS_CFG[course.status]
  const isLocked = course.status === 'locked'

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 group"
      style={{
        background: '#0F1628',
        border: `1px solid ${course.status === 'enrolled' ? 'rgba(0,102,255,0.3)' : course.status === 'completed' ? 'rgba(16,185,129,0.25)' : '#1A2540'}`,
        opacity: isLocked ? 0.7 : 1,
      }}>
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src={course.thumbnail} alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ filter: isLocked ? 'grayscale(0.6) brightness(0.5)' : 'brightness(0.75)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.8) 0%, transparent 60%)' }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: lvl.bg, color: lvl.color, backdropFilter: 'blur(4px)' }}>
            {lvl.label}
          </span>
          {course.isNew && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.85)', color: '#fff' }}>
              NUEVO
            </span>
          )}
          {course.isPro && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
              style={{ background: 'rgba(0,102,255,0.85)', color: '#fff' }}>
              <Zap size={9} /> PRO
            </span>
          )}
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: st.bg, color: st.color, backdropFilter: 'blur(4px)', border: `1px solid ${st.color}33` }}>
            {st.label}
          </span>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
              <Lock size={20} style={{ color: '#0066FF' }} />
            </div>
          </div>
        )}

        {/* Play button */}
        {!isLocked && course.status !== 'available' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,102,255,0.9)', backdropFilter: 'blur(4px)' }}>
              <Play size={18} className="text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Progress bar */}
        {course.status === 'enrolled' && course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full transition-all" style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg, #0066FF, #00B4FF)' }} />
          </div>
        )}

        {/* Completed checkmark */}
        {course.status === 'completed' && (
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#10b981' }}>
            <CheckCircle size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">{cat.emoji}</span>
          <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
          {course.certificate && (
            <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
              <Award size={10} /> Certificado
            </span>
          )}
        </div>

        <h4 className="font-bold text-gastro-text text-sm leading-tight mb-2 line-clamp-2">{course.title}</h4>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{course.instructorEmoji}</span>
          <div>
            <div className="text-xs font-semibold text-gastro-text">{course.instructor}</div>
            <div className="text-xs text-gastro-subtle">{course.instructorRole}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gastro-subtle mb-3">
          <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen size={10} /> {course.lessons} lecciones</span>
          <span className="flex items-center gap-1"><Users size={10} /> {course.students.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} style={{ color: s <= Math.round(course.rating) ? '#f59e0b' : '#3a3a5a', fill: s <= Math.round(course.rating) ? '#f59e0b' : 'none' }} />
            ))}
          </div>
          <span className="text-xs font-bold text-gastro-text">{course.rating}</span>
          <span className="text-xs text-gastro-subtle">({course.reviews})</span>
        </div>

        {/* Progress info */}
        {course.status === 'enrolled' && course.progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gastro-subtle">Progreso</span>
              <span className="text-xs font-bold" style={{ color: '#0066FF' }}>{course.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg, #0066FF, #00B4FF)' }} />
            </div>
          </div>
        )}

        {/* CTA */}
        {course.status === 'available' && (
          <button onClick={() => onEnroll(course.id)}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.3)', color: '#0066FF' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,102,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,102,255,0.12)' }}>
            Inscribirme al curso
          </button>
        )}
        {course.status === 'enrolled' && (
          <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,180,255,0.15))', border: '1px solid rgba(0,102,255,0.4)', color: '#0066FF' }}>
            <Play size={12} /> Continuar curso
          </button>
        )}
        {course.status === 'completed' && (
          <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
            <Download size={12} /> Descargar certificado
          </button>
        )}
        {course.status === 'locked' && (
          <button className="w-full py-2.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.15)', color: '#6666aa' }}>
            <Lock size={12} className="inline mr-1.5" /> Requiere Plan Pro
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main GastroAcademy ───────────────────────────────────────────────────────

export default function GastroAcademy() {
  const [activeTab, setActiveTab] = useState<'courses' | 'paths' | 'certifications' | 'my_learning'>('courses')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | CourseCategory>('all')
  const [filterLevel, setFilterLevel] = useState<'all' | CourseLevel>('all')
  const [courses, setCourses] = useState<Course[]>(COURSES)

  const handleEnroll = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'enrolled', progress: 0 } : c))
  }

  const filteredCourses = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    if (filterCategory !== 'all' && c.category !== filterCategory) return false
    if (filterLevel !== 'all' && c.level !== filterLevel) return false
    return true
  })

  const enrolledCourses = courses.filter(c => c.status === 'enrolled')
  const completedCourses = courses.filter(c => c.status === 'completed')
  const totalHoursLearned = completedCourses.reduce((s, c) => {
    const h = parseFloat(c.duration.split('h')[0])
    return s + h
  }, 0)
  const earnedCerts = CERTIFICATIONS.filter(c => c.earned).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(0,102,255,0.06) 50%, rgba(51,153,255,0.04) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}>
        <div className="absolute top-0 right-0 w-72 h-72 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #00B4FF)', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
            <GraduationCap size={26} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-black text-gastro-text">GastroAcademy</h2>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                🎓 Formación profesional
              </span>
            </div>
            <p className="text-sm text-gastro-subtle">
              Cursos, certificaciones y rutas de aprendizaje para equipos gastronómicos de alto rendimiento
            </p>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-6 text-center flex-shrink-0">
            {[
              { value: '120+', label: 'Cursos' },
              { value: '18', label: 'Certificaciones' },
              { value: '24.000+', label: 'Estudiantes' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black" style={{ color: '#f59e0b' }}>{s.value}</div>
                <div className="text-xs text-gastro-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My progress stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cursos en curso', value: enrolledCourses.length, color: '#0066FF', icon: BookOpen },
          { label: 'Cursos completados', value: completedCourses.length, color: '#10b981', icon: CheckCircle },
          { label: 'Horas aprendidas', value: `${totalHoursLearned}h`, color: '#3399FF', icon: Clock },
          { label: 'Certificados obtenidos', value: earnedCerts, color: '#f59e0b', icon: Award },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-gastro-text">{stat.value}</div>
                  <div className="text-xs text-gastro-subtle leading-tight">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'courses',        label: 'Catálogo de cursos',    count: courses.length },
          { id: 'my_learning',    label: 'Mi aprendizaje',        count: enrolledCourses.length + completedCourses.length },
          { id: 'paths',          label: 'Rutas de aprendizaje',  count: LEARNING_PATHS.length },
          { id: 'certifications', label: 'Certificaciones',       count: CERTIFICATIONS.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
              style={{ background: activeTab === tab.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: activeTab === tab.id ? '#f59e0b' : '#6666aa' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── COURSES TAB ── */}
      {activeTab === 'courses' && (
        <div className="space-y-5">
          {/* Search + filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gastro-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar cursos, instructores, temas..."
                className="input-gastro pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'cocina', 'servicio', 'gestion', 'bar', 'pasteleria', 'higiene'] as const).map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={filterCategory === cat
                    ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                  {cat === 'all' ? 'Todos' : CAT_CFG[cat].emoji + ' ' + CAT_CFG[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Level filter */}
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(lvl => (
              <button key={lvl} onClick={() => setFilterLevel(lvl)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={filterLevel === lvl
                  ? { background: lvl === 'all' ? 'rgba(255,255,255,0.1)' : LEVEL_CFG[lvl as CourseLevel].bg, color: lvl === 'all' ? '#fff' : LEVEL_CFG[lvl as CourseLevel].color, border: '1px solid rgba(255,255,255,0.2)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2540', color: '#8899BB' }}>
                {lvl === 'all' ? 'Todos los niveles' : LEVEL_CFG[lvl as CourseLevel].label}
              </button>
            ))}
          </div>

          {/* Course grid */}
          {filteredCourses.length === 0 ? (
            <div className="card-gastro text-center py-16">
              <BookOpen size={32} className="mx-auto mb-3" style={{ color: '#4A5A7A' }} />
              <p className="text-gastro-subtle">No se encontraron cursos con esos filtros</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MY LEARNING TAB ── */}
      {activeTab === 'my_learning' && (
        <div className="space-y-6">
          {/* In progress */}
          {enrolledCourses.length > 0 && (
            <div>
              <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
                <Play size={16} style={{ color: '#0066FF' }} /> En curso ({enrolledCourses.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map(course => (
                  <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedCourses.length > 0 && (
            <div>
              <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
                <CheckCircle size={16} style={{ color: '#10b981' }} /> Completados ({completedCourses.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCourses.map(course => (
                  <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
                ))}
              </div>
            </div>
          )}

          {enrolledCourses.length === 0 && completedCourses.length === 0 && (
            <div className="card-gastro text-center py-16">
              <GraduationCap size={40} className="mx-auto mb-4" style={{ color: '#4A5A7A' }} />
              <h3 className="font-bold text-gastro-text mb-2">Todavía no empezaste ningún curso</h3>
              <p className="text-gastro-subtle text-sm mb-4">Explorá el catálogo y comenzá tu formación profesional</p>
              <button onClick={() => setActiveTab('courses')}
                className="btn-primary text-sm px-6 py-2.5">
                Ver catálogo de cursos
              </button>
            </div>
          )}

          {/* Learning streak */}
          {(enrolledCourses.length > 0 || completedCourses.length > 0) && (
            <div className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,180,255,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #00B4FF)' }}>
                  <Flame size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-gastro-text">Racha de aprendizaje</div>
                  <div className="text-xs text-gastro-subtle">Seguí aprendiendo para mantener tu racha</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black" style={{ color: '#f59e0b' }}>7 días</div>
                  <div className="text-xs text-gastro-subtle">racha actual</div>
                </div>
              </div>
              <div className="flex gap-2">
                {['L','M','X','J','V','S','D'].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-8 rounded-lg flex items-center justify-center"
                      style={{ background: i < 7 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i < 7 ? 'rgba(245,158,11,0.4)' : '#1A2540'}` }}>
                      {i < 7 && <CheckCircle size={12} style={{ color: '#f59e0b' }} />}
                    </div>
                    <span className="text-xs" style={{ color: '#6666aa' }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LEARNING PATHS TAB ── */}
      {activeTab === 'paths' && (
        <div className="space-y-4">
          <p className="text-sm text-gastro-subtle">
            Las rutas de aprendizaje combinan cursos seleccionados por expertos para llevarte de cero a profesional en cada especialidad.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {LEARNING_PATHS.map(path => {
              const Icon = path.icon
              const lvl = LEVEL_CFG[path.level]
              return (
                <div key={path.id} className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
                  style={{ background: '#0F1628', border: `1px solid ${path.color}22` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${path.color}55` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${path.color}22` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${path.color}18`, border: `1px solid ${path.color}33` }}>
                      <Icon size={24} style={{ color: path.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gastro-text">{path.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                          style={{ background: lvl.bg, color: lvl.color }}>
                          {lvl.label}
                        </span>
                      </div>
                      <p className="text-xs text-gastro-subtle">{path.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gastro-subtle mb-4">
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {path.courses} cursos</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {path.duration} totales</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {path.enrolled} inscriptos</span>
                  </div>

                  {/* Course dots */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {Array.from({ length: path.courses }).map((_, i) => (
                      <div key={i} className="flex-1 h-1.5 rounded-full"
                        style={{ background: i === 0 ? path.color : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>

                  <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    style={{ background: `${path.color}12`, border: `1px solid ${path.color}33`, color: path.color }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${path.color}22` }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${path.color}12` }}>
                    <Target size={13} /> Comenzar ruta
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CERTIFICATIONS TAB ── */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <p className="text-sm text-gastro-subtle">
            Certificaciones reconocidas por organismos nacionales e internacionales del sector gastronómico.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {CERTIFICATIONS.map(cert => (
              <div key={cert.id} className="rounded-2xl p-5 transition-all"
                style={{
                  background: cert.earned ? `${cert.color}08` : '#0F1628',
                  border: `1px solid ${cert.earned ? cert.color + '44' : '#1A2540'}`,
                }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}33` }}>
                    {cert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-gastro-text text-sm">{cert.name}</h4>
                      {cert.earned && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                          <Trophy size={10} /> Obtenido
                        </span>
                      )}
                      {cert.isPro && !cert.earned && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(0,102,255,0.15)', color: '#0066FF' }}>
                          <Zap size={10} /> PRO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gastro-subtle mb-1">{cert.issuer}</div>
                    {cert.earned && cert.earnedDate && (
                      <div className="text-xs font-semibold" style={{ color: '#10b981' }}>
                        ✓ Obtenido en {cert.earnedDate}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gastro-subtle leading-relaxed mb-4">{cert.description}</p>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gastro-text mb-2">Cursos requeridos:</div>
                  <div className="space-y-1.5">
                    {cert.requirements.map(req => {
                      const course = courses.find(c => c.title === req)
                      const isDone = course?.status === 'completed'
                      return (
                        <div key={req} className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0`}
                            style={{ background: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)' }}>
                            {isDone
                              ? <CheckCircle size={10} style={{ color: '#10b981' }} />
                              : <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4A5A7A' }} />
                            }
                          </div>
                          <span style={{ color: isDone ? '#10b981' : '#8899BB', textDecoration: isDone ? 'none' : 'none' }}>
                            {req}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gastro-subtle mb-4">
                  <span className="flex items-center gap-1"><Clock size={10} /> {cert.duration}</span>
                  <span className="flex items-center gap-1"><Users size={10} /> {cert.enrolled} inscriptos</span>
                </div>

                {cert.earned ? (
                  <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                    <Download size={12} /> Descargar certificado PDF
                  </button>
                ) : (
                  <button className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: `${cert.color}12`, border: `1px solid ${cert.color}33`, color: cert.color }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${cert.color}22` }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${cert.color}12` }}>
                    <ChevronRight size={12} /> Ver requisitos y comenzar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Earned certificates showcase */}
          {CERTIFICATIONS.filter(c => c.earned).length > 0 && (
            <div className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(16,185,129,0.04))', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 className="font-bold text-gastro-text mb-4 flex items-center gap-2">
                <Trophy size={16} style={{ color: '#f59e0b' }} /> Mis certificados obtenidos
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {CERTIFICATIONS.filter(c => c.earned).map(cert => (
                  <div key={cert.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: `${cert.color}0a`, border: `1px solid ${cert.color}22` }}>
                    <span className="text-2xl">{cert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gastro-text truncate">{cert.name}</div>
                      <div className="text-xs text-gastro-subtle">{cert.issuer}</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: cert.color }}>{cert.earnedDate}</div>
                    </div>
                    <Award size={18} style={{ color: cert.color, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
