import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { LIVE_ORDERS as MOCK_ORDERS, type LiveOrder } from '../data/mockData'

interface ServeContextValue {
  orders: LiveOrder[]
  addOrder: (order: LiveOrder) => void
  updateOrderStatus: (orderId: string, status: LiveOrder['status']) => void
}

const ServeContext = createContext<ServeContextValue | null>(null)

export function ServeProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<LiveOrder[]>(MOCK_ORDERS)

  const addOrder = useCallback((order: LiveOrder) => {
    setOrders(prev => [order, ...prev])
  }, [])

  const updateOrderStatus = useCallback((orderId: string, status: LiveOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }, [])

  const value = useMemo(() => ({ orders, addOrder, updateOrderStatus }), [orders, addOrder, updateOrderStatus])

  return <ServeContext.Provider value={value}>{children}</ServeContext.Provider>
}

export function useServe() {
  const ctx = useContext(ServeContext)
  if (!ctx) throw new Error('useServe must be used within ServeProvider')
  return ctx
}

export function nextOrderId(orders: LiveOrder[]): string {
  const nums = orders
    .map(o => parseInt(o.id.replace('#', ''), 10))
    .filter(n => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 4820) + 1
  return `#${next}`
}
