import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Role } from '../lib/rbac'
import { getPermissionsForRole } from '../lib/rbac'

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  logo: string;
  plan: 'starter' | 'pro' | 'enterprise';
  locations: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  restaurant: Restaurant;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_RESTAURANT: Restaurant = {
  id: 'rest-001',
  name: 'Trattoria Bellavista',
  type: 'Restaurante Italiano',
  logo: 'TB',
  plan: 'pro',
  locations: 3,
}

const MOCK_USER: User = {
  id: '1',
  email: 'admin@trattoriabellavista.cl',
  name: 'Santiago Morales',
  role: 'admin',
  avatar: 'SM',
  restaurant: MOCK_RESTAURANT,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((_email: string, _password: string) => {
    setUser(MOCK_USER)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const can = useCallback(
    (permission: string) => {
      if (!user) return false
      return getPermissionsForRole(user.role).includes(permission)
    },
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
