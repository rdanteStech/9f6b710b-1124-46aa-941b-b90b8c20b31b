import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { user, can } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!can(permission)) return <div className="p-4 text-gray-600">You do not have access to this section.</div>
  return <>{children}</>
}
