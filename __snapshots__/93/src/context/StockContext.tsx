import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { INVENTORY_ITEMS } from '../data/mockData'
import {
  PURCHASE_INVOICES,
  getMatchedLines,
  type PurchaseInvoice,
  type InvoiceStatus,
} from '../data/purchaseInvoices'

export type InventoryItem = (typeof INVENTORY_ITEMS)[number]

export interface StockAdjustment {
  id: string
  invoiceId: string
  invoiceNumber: string
  supplierName: string
  itemId: number
  itemName: string
  quantity: number
  unit: string
  previousStock: number
  newStock: number
  appliedAt: string
}

interface StockContextValue {
  items: InventoryItem[]
  invoices: PurchaseInvoice[]
  pendingInvoices: PurchaseInvoice[]
  recentAdjustments: StockAdjustment[]
  addItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void
  approveInvoice: (invoiceId: string) => boolean
  rejectInvoice: (invoiceId: string) => void
}

const StockContext = createContext<StockContextValue | null>(null)

function computeStatus(stock: number, minStock: number): InventoryItem['status'] {
  if (stock < minStock) return 'critical'
  if (stock < minStock * 1.5) return 'low'
  return 'ok'
}

function formatAppliedAt(): string {
  const now = new Date()
  return `Hoy ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export function StockProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([...INVENTORY_ITEMS])
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([...PURCHASE_INVOICES])
  const [recentAdjustments, setRecentAdjustments] = useState<StockAdjustment[]>([])

  const pendingInvoices = invoices.filter(i => i.status === 'recognized')

  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'status'>) => {
    setItems(prev => {
      const newItem: InventoryItem = {
        ...item,
        id: Math.max(0, ...prev.map(i => i.id)) + 1,
        status: computeStatus(item.stock, item.minStock),
      }
      return [...prev, newItem]
    })
  }, [])

  const approveInvoice = useCallback((invoiceId: string): boolean => {
    const invoice = invoices.find(i => i.id === invoiceId)
    if (!invoice || invoice.status !== 'recognized') return false

    const matchedLines = getMatchedLines(invoice)
    if (matchedLines.length === 0) return false

    const appliedAt = formatAppliedAt()

    setItems(prev => {
      const adjustments: StockAdjustment[] = []
      const updated = prev.map(item => {
        const line = matchedLines.find(l => l.inventoryItemId === item.id)
        if (!line) return item

        const newStock = Math.round((item.stock + line.quantity) * 10) / 10
        adjustments.push({
          id: `adj-${invoiceId}-${item.id}`,
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          itemId: item.id,
          itemName: item.name,
          quantity: line.quantity,
          unit: line.unit,
          previousStock: item.stock,
          newStock,
          appliedAt,
        })

        return {
          ...item,
          stock: newStock,
          cost: line.unitPrice,
          status: computeStatus(newStock, item.minStock),
        }
      })

      setRecentAdjustments(prevAdj => [...adjustments, ...prevAdj].slice(0, 20))

      setInvoices(prevInv =>
        prevInv.map(inv =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: 'applied' as InvoiceStatus,
                appliedAt,
                lines: inv.lines.map(line => {
                  const adj = adjustments.find(a => a.itemId === line.inventoryItemId)
                  if (!adj) return line
                  return {
                    ...line,
                    currentStock: adj.previousStock,
                    projectedStock: adj.newStock,
                  }
                }),
              }
            : inv,
        ),
      )

      return updated
    })

    return true
  }, [invoices])

  const rejectInvoice = useCallback((invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId ? { ...inv, status: 'rejected' as InvoiceStatus } : inv,
      ),
    )
  }, [])

  return (
    <StockContext.Provider
      value={{
        items,
        invoices,
        pendingInvoices,
        recentAdjustments,
        addItem,
        approveInvoice,
        rejectInvoice,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock must be used within StockProvider')
  return ctx
}
