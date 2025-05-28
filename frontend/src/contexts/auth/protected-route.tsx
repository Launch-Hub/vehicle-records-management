import { Navigate } from 'react-router-dom'
import { useAuth } from './auth-context'
import type { JSX } from 'react'

interface ProtectedRouteProps {
  resource: string
  children: JSX.Element
}

export const ProtectedRoute = ({ resource, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const canRead = user?.permissions?.[resource]?.read
  if (!canRead) return <Navigate to="/forbidden" replace />

  return children
}
