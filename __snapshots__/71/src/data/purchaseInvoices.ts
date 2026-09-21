export type InvoiceStatus = 'processing' | 'recognized' | 'approved' | 'applied' | 'rejected'
export type LineMatchStatus = 'matched' | 'partial' | 'unmatched'

export interface InvoiceLineItem {
  id: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
  inventoryItemId?: number
  inventoryItemName?: string
  currentStock?: number
  projectedStock?: number
  matchStatus: LineMatchStatus
  matchConfidence?: number
}

export interface PurchaseInvoice {
  id: string
  invoiceNumber: string
  supplierId: string
  supplierName: string
  supplierCuit: string
  issueDate: string
  receivedAt: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  source: 'email' | 'api' | 'portal' | 'manual'
  lines: InvoiceLineItem[]
  appliedAt?: string
  notes?: string
}

export const PURCHASE_INVOICES: PurchaseInvoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'FC-A-00089234',
    supplierId: 's2',
    supplierName: 'Molinos del Sur',
    supplierCuit: '76.712.345-6',
    issueDate: '15 Jul 2025',
    receivedAt: 'Hoy 09:14',
    dueDate: '30 Jul 2025',
    subtotal: 38400,
    tax: 7296,
    total: 45696,
    status: 'recognized',
    source: 'email',
    lines: [
      {
        id: 'l1',
        productName: 'Harina 000',
        quantity: 25,
        unit: 'kg',
        unitPrice: 1200,
        subtotal: 30000,
        inventoryItemId: 2,
        inventoryItemName: 'Harina 000',
        currentStock: 3.2,
        projectedStock: 28.2,
        matchStatus: 'matched',
        matchConfidence: 98,
      },
      {
        id: 'l2',
        productName: 'Harina Integral',
        quantity: 7,
        unit: 'kg',
        unitPrice: 1200,
        subtotal: 8400,
        matchStatus: 'unmatched',
        matchConfidence: 42,
      },
    ],
    notes: 'Factura recibida automáticamente desde ventas@molinosdelsur.com',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FC-A-00045102',
    supplierId: 's1',
    supplierName: 'Carnes Premium SA',
    supplierCuit: '76.501.234-5',
    issueDate: '16 Jul 2025',
    receivedAt: 'Hoy 11:42',
    dueDate: '01 Ago 2025',
    subtotal: 280000,
    tax: 53200,
    total: 333200,
    status: 'recognized',
    source: 'api',
    lines: [
      {
        id: 'l3',
        productName: 'Lomo de res premium',
        quantity: 10,
        unit: 'kg',
        unitPrice: 28000,
        subtotal: 280000,
        inventoryItemId: 1,
        inventoryItemName: 'Lomo de res',
        currentStock: 12.5,
        projectedStock: 22.5,
        matchStatus: 'matched',
        matchConfidence: 96,
      },
    ],
  },
  {
    id: 'inv-003',
    invoiceNumber: 'FC-B-00038901',
    supplierId: 's3',
    supplierName: 'Verduras Frescas',
    supplierCuit: '76.609.876-5',
    issueDate: '14 Jul 2025',
    receivedAt: 'Ayer 07:30',
    dueDate: '29 Jul 2025',
    subtotal: 52500,
    tax: 9975,
    total: 62475,
    status: 'applied',
    source: 'email',
    appliedAt: 'Ayer 08:05',
    lines: [
      {
        id: 'l4',
        productName: 'Tomates Cherry',
        quantity: 15,
        unit: 'kg',
        unitPrice: 3500,
        subtotal: 52500,
        inventoryItemId: 4,
        inventoryItemName: 'Tomates Cherry',
        currentStock: 8.0,
        projectedStock: 23.0,
        matchStatus: 'matched',
        matchConfidence: 99,
      },
    ],
  },
  {
    id: 'inv-004',
    invoiceNumber: 'FC-A-00091200',
    supplierId: 's5',
    supplierName: 'Importadora Gourmet',
    supplierCuit: '76.554.433-2',
    issueDate: '17 Jul 2025',
    receivedAt: 'Hace 5 min',
    dueDate: '02 Ago 2025',
    subtotal: 114000,
    tax: 21660,
    total: 135660,
    status: 'processing',
    source: 'portal',
    lines: [],
    notes: 'OCR en progreso — extrayendo ítems de la factura PDF…',
  },
  {
    id: 'inv-005',
    invoiceNumber: 'FC-C-00021088',
    supplierId: 's4',
    supplierName: 'Lácteos Artesanos',
    supplierCuit: '76.667.788-9',
    issueDate: '16 Jul 2025',
    receivedAt: 'Hoy 08:20',
    dueDate: '31 Jul 2025',
    subtotal: 114400,
    tax: 21736,
    total: 136136,
    status: 'recognized',
    source: 'email',
    lines: [
      {
        id: 'l5',
        productName: 'Queso Parmesano 24 meses',
        quantity: 5,
        unit: 'kg',
        unitPrice: 18000,
        subtotal: 90000,
        inventoryItemId: 3,
        inventoryItemName: 'Queso Parmesano',
        currentStock: 4.8,
        projectedStock: 9.8,
        matchStatus: 'matched',
        matchConfidence: 94,
      },
      {
        id: 'l6',
        productName: 'Crema de leche 35%',
        quantity: 8,
        unit: 'lt',
        unitPrice: 2800,
        subtotal: 22400,
        inventoryItemId: 8,
        inventoryItemName: 'Crema de leche',
        currentStock: 5.5,
        projectedStock: 13.5,
        matchStatus: 'matched',
        matchConfidence: 97,
      },
    ],
  },
  {
    id: 'inv-006',
    invoiceNumber: 'FC-A-00088701',
    supplierId: 's6',
    supplierName: 'Viña Casablanca',
    supplierCuit: '76.445.566-2',
    issueDate: '10 Jul 2025',
    receivedAt: 'Hace 5 días',
    dueDate: '25 Jul 2025',
    subtotal: 102000,
    tax: 19380,
    total: 121380,
    status: 'applied',
    source: 'api',
    appliedAt: 'Hace 5 días',
    lines: [
      {
        id: 'l7',
        productName: 'Carmenère Reserva 2022',
        quantity: 12,
        unit: 'bt',
        unitPrice: 8500,
        subtotal: 102000,
        inventoryItemId: 7,
        inventoryItemName: 'Vino Tinto Carmenère',
        currentStock: 12,
        projectedStock: 24,
        matchStatus: 'matched',
        matchConfidence: 91,
      },
    ],
  },
]

export function getMatchedLines(invoice: PurchaseInvoice): InvoiceLineItem[] {
  return invoice.lines.filter(l => l.matchStatus === 'matched' && l.inventoryItemId != null)
}

export function countPendingInvoices(invoices: PurchaseInvoice[]): number {
  return invoices.filter(i => i.status === 'recognized').length
}
