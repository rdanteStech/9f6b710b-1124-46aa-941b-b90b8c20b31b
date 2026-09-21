export type RecipeLabStatus = 'draft' | 'testing' | 'approved' | 'published' | 'archived'

export interface RecipeIngredient {
  inventoryItemId: number
  name: string
  quantity: number
  unit: string
}

export interface RecipeVersion {
  id: string
  version: string
  createdAt: string
  author: string
  notes?: string
  ingredients: RecipeIngredient[]
  steps: string[]
  yield: number
  prepMinutes: number
  cookMinutes: number
  suggestedPrice: number
}

export interface RecipeLabEntry {
  id: string
  name: string
  category: string
  status: RecipeLabStatus
  image: string
  tags: string[]
  linkedProductId?: number
  currentVersionId: string
  versions: RecipeVersion[]
  createdAt: string
  updatedAt: string
  chef: string
  objective?: string
}

export const RECIPE_LAB_STATUS: Record<RecipeLabStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: '#8899BB', bg: 'rgba(136,153,187,0.12)' },
  testing: { label: 'En prueba', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  approved: { label: 'Aprobada', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  published: { label: 'En carta', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  archived: { label: 'Archivada', color: '#8899BB', bg: 'rgba(136,153,187,0.08)' },
}

export const RECIPE_LAB_ENTRIES: RecipeLabEntry[] = [
  {
    id: 'rl-001',
    name: 'Risotto de Hongos Porcini',
    category: 'Pastas',
    status: 'published',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400',
    tags: ['vegetariano', 'sin gluten'],
    linkedProductId: 1,
    currentVersionId: 'v3',
    chef: 'Carlos Mendoza',
    createdAt: '2025-11-12',
    updatedAt: '2026-01-08',
    objective: 'Receta base de carta — mantener margen >65%',
    versions: [
      {
        id: 'v3',
        version: '3.0',
        createdAt: '2026-01-08',
        author: 'Carlos Mendoza',
        notes: 'Reducción de mantequilla — mismo sabor, -8% costo',
        yield: 1,
        prepMinutes: 15,
        cookMinutes: 22,
        suggestedPrice: 21000,
        ingredients: [
          { inventoryItemId: 6, name: 'Hongos Porcini', quantity: 0.08, unit: 'kg' },
          { inventoryItemId: 3, name: 'Queso Parmesano', quantity: 0.04, unit: 'kg' },
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.12, unit: 'lt' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.02, unit: 'lt' },
          { inventoryItemId: 7, name: 'Vino Tinto Malbec', quantity: 0.08, unit: 'bt' },
        ],
        steps: [
          'Calentar caldo vegetal y mantener a fuego bajo.',
          'Sofreír cebolla en aceite de oliva hasta transparente.',
          'Agregar arroz arborio y tostar 2 minutos.',
          'Deglasar con vino Malbec hasta evaporar.',
          'Incorporar caldo cucharón a cucharón, removiendo.',
          'A los 18 min agregar hongos rehidratados picados.',
          'Finalizar con parmesano, crema y manteca fría.',
        ],
      },
      {
        id: 'v2',
        version: '2.1',
        createdAt: '2025-12-03',
        author: 'Valentina Cruz',
        notes: 'Versión anterior con más mantequilla',
        yield: 1,
        prepMinutes: 15,
        cookMinutes: 22,
        suggestedPrice: 20500,
        ingredients: [
          { inventoryItemId: 6, name: 'Hongos Porcini', quantity: 0.08, unit: 'kg' },
          { inventoryItemId: 3, name: 'Queso Parmesano', quantity: 0.05, unit: 'kg' },
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.15, unit: 'lt' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.025, unit: 'lt' },
        ],
        steps: ['Procedimiento similar a v3.0 con mayor cantidad de grasa.'],
      },
    ],
  },
  {
    id: 'rl-002',
    name: 'Ravioli de Ricotta y Espinaca',
    category: 'Pastas',
    status: 'testing',
    image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400',
    tags: ['vegetariano'],
    currentVersionId: 'v1',
    chef: 'Valentina Cruz',
    createdAt: '2026-02-18',
    updatedAt: '2026-03-10',
    objective: 'Nueva pasta fresca para menú de invierno — target margen 70%',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        createdAt: '2026-03-10',
        author: 'Valentina Cruz',
        notes: 'Primera prueba en servicio de almuerzo — feedback positivo',
        yield: 2,
        prepMinutes: 45,
        cookMinutes: 8,
        suggestedPrice: 18500,
        ingredients: [
          { inventoryItemId: 2, name: 'Harina 000', quantity: 0.15, unit: 'kg' },
          { inventoryItemId: 3, name: 'Queso Parmesano', quantity: 0.03, unit: 'kg' },
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.05, unit: 'lt' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.015, unit: 'lt' },
        ],
        steps: [
          'Preparar masa de harina 000 con huevos.',
          'Blanquear espinaca y escurrir bien.',
          'Mezclar ricotta, espinaca, parmesano y nuez moscada.',
          'Estirar masa y rellenar raviolis de 4 cm.',
          'Cocinar 3-4 min en agua con sal.',
          'Saltear en mantequilla con salvia.',
        ],
      },
    ],
  },
  {
    id: 'rl-003',
    name: 'Tarta de Chocolate Amargo 70%',
    category: 'Postres',
    status: 'draft',
    image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?w=400',
    tags: ['vegetariano', 'nuevo'],
    currentVersionId: 'v1',
    chef: 'Valentina Cruz',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-12',
    objective: 'Postre premium para carta de vinos — pareo con Malbec',
    versions: [
      {
        id: 'v1',
        version: '0.9',
        createdAt: '2026-03-12',
        author: 'Valentina Cruz',
        notes: 'Borrador inicial — pendiente definir ganache',
        yield: 8,
        prepMinutes: 30,
        cookMinutes: 35,
        suggestedPrice: 12000,
        ingredients: [
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.4, unit: 'lt' },
          { inventoryItemId: 2, name: 'Harina 000', quantity: 0.08, unit: 'kg' },
        ],
        steps: [
          'Derretir chocolate 70% a baño maría.',
          'Preparar base de galleta y hornear 12 min.',
          'Montar ganache con crema caliente.',
          'Refrigerar mínimo 4 horas antes de servir.',
        ],
      },
    ],
  },
  {
    id: 'rl-004',
    name: 'Ceviche Clásico Reformulado',
    category: 'Entradas',
    status: 'approved',
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400',
    tags: ['sin gluten', 'mariscos'],
    linkedProductId: 5,
    currentVersionId: 'v2',
    chef: 'Carlos Mendoza',
    createdAt: '2026-01-20',
    updatedAt: '2026-03-08',
    objective: 'Mejorar margen del Ceviche Clásico sin perder frescura',
    versions: [
      {
        id: 'v2',
        version: '2.0',
        createdAt: '2026-03-08',
        author: 'Carlos Mendoza',
        notes: 'Aprobada por gerencia — lista para publicar',
        yield: 1,
        prepMinutes: 20,
        cookMinutes: 0,
        suggestedPrice: 16500,
        ingredients: [
          { inventoryItemId: 4, name: 'Tomates Cherry', quantity: 0.06, unit: 'kg' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.01, unit: 'lt' },
        ],
        steps: [
          'Cortar pescado blanco en cubos de 1.5 cm.',
          'Marinar en limón por 12 min (no más).',
          'Incorporar cebolla morada en juliana fina.',
          'Agregar tomates cherry partidos y cilantro.',
          'Emplatar con camote y cancha serrana.',
        ],
      },
    ],
  },
  {
    id: 'rl-006',
    name: 'Lomo a la Pimienta Verde',
    category: 'Carnes',
    status: 'published',
    image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?w=400',
    tags: ['sin gluten'],
    linkedProductId: 2,
    currentVersionId: 'v1',
    chef: 'Carlos Mendoza',
    createdAt: '2025-09-10',
    updatedAt: '2026-02-20',
    versions: [
      {
        id: 'v1',
        version: '1.2',
        createdAt: '2026-02-20',
        author: 'Carlos Mendoza',
        yield: 1,
        prepMinutes: 15,
        cookMinutes: 18,
        suggestedPrice: 36000,
        ingredients: [
          { inventoryItemId: 1, name: 'Lomo de res', quantity: 0.28, unit: 'kg' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.02, unit: 'lt' },
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.08, unit: 'lt' },
        ],
        steps: [
          'Sellar lomo en sartén caliente 2 min por lado.',
          'Preparar salsa de pimienta verde con crema y caldo.',
          'Terminar cocción del lomo en horno 8 min.',
          'Emplatar con salsa y guarnición de papas.',
        ],
      },
    ],
  },
  {
    id: 'rl-007',
    name: 'Tiramisú Artesanal',
    category: 'Postres',
    status: 'published',
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?w=400',
    tags: ['vegetariano'],
    linkedProductId: 4,
    currentVersionId: 'v1',
    chef: 'Valentina Cruz',
    createdAt: '2025-08-01',
    updatedAt: '2025-12-15',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        createdAt: '2025-12-15',
        author: 'Valentina Cruz',
        yield: 6,
        prepMinutes: 40,
        cookMinutes: 0,
        suggestedPrice: 9000,
        ingredients: [
          { inventoryItemId: 8, name: 'Crema de leche', quantity: 0.25, unit: 'lt' },
          { inventoryItemId: 3, name: 'Queso Parmesano', quantity: 0.02, unit: 'kg' },
        ],
        steps: [
          'Preparar crema de mascarpone con yema y azúcar.',
          'Montar bizcochos en café expreso frío.',
          'Alternar capas de crema y bizcocho.',
          'Refrigerar 6 horas y espolvorear cacao.',
        ],
      },
    ],
  },
  {
    id: 'rl-008',
    name: 'Pizza Margherita Artesanal',
    category: 'Pizzas',
    status: 'published',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?w=400',
    tags: ['vegetariano'],
    linkedProductId: 6,
    currentVersionId: 'v1',
    chef: 'Valentina Cruz',
    createdAt: '2025-07-20',
    updatedAt: '2026-01-05',
    versions: [
      {
        id: 'v1',
        version: '2.0',
        createdAt: '2026-01-05',
        author: 'Valentina Cruz',
        yield: 1,
        prepMinutes: 20,
        cookMinutes: 12,
        suggestedPrice: 18000,
        ingredients: [
          { inventoryItemId: 2, name: 'Harina 000', quantity: 0.18, unit: 'kg' },
          { inventoryItemId: 4, name: 'Tomates Cherry', quantity: 0.1, unit: 'kg' },
          { inventoryItemId: 3, name: 'Queso Parmesano', quantity: 0.04, unit: 'kg' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.015, unit: 'lt' },
        ],
        steps: [
          'Fermentar masa 24 h.',
          'Estirar base fina y condimentar con tomate.',
          'Agregar mozzarella y parmesano.',
          'Hornear a 280°C durante 10-12 min.',
        ],
      },
    ],
  },
  {
    id: 'rl-005',
    name: 'Burrata con Pesto de Albahaca',
    category: 'Entradas',
    status: 'published',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
    tags: ['vegetariano'],
    linkedProductId: 3,
    currentVersionId: 'v1',
    chef: 'Carlos Mendoza',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-15',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        createdAt: '2025-10-15',
        author: 'Carlos Mendoza',
        yield: 1,
        prepMinutes: 10,
        cookMinutes: 0,
        suggestedPrice: 14000,
        ingredients: [
          { inventoryItemId: 4, name: 'Tomates Cherry', quantity: 0.12, unit: 'kg' },
          { inventoryItemId: 5, name: 'Aceite de Oliva EV', quantity: 0.025, unit: 'lt' },
        ],
        steps: [
          'Disponer burrata entera en plato.',
          'Rodear con tomates cherry confitados.',
          'Añadir pesto casero y reducción balsámica.',
          'Finalizar con aceite de oliva y pimienta negra.',
        ],
      },
    ],
  },
]

export function computeRecipeCost(
  ingredients: RecipeIngredient[],
  inventoryCosts: Map<number, number>,
  yieldPortions: number,
): number {
  const total = ingredients.reduce((sum, ing) => {
    const unitCost = inventoryCosts.get(ing.inventoryItemId) ?? 0
    return sum + unitCost * ing.quantity
  }, 0)
  return Math.round(total / Math.max(yieldPortions, 1))
}

export function computeMargin(cost: number, price: number): number {
  if (price <= 0) return 0
  return Math.round(((price - cost) / price) * 100)
}

export function getRecipeForProduct(productId: number): RecipeLabEntry | undefined {
  return RECIPE_LAB_ENTRIES.find(e => e.linkedProductId === productId)
}

export function getPublishedRecipes(): RecipeLabEntry[] {
  return RECIPE_LAB_ENTRIES.filter(e => e.status === 'published')
}
