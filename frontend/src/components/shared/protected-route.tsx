import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import Forbidden from '../pages/_handlers/forbidden'

interface ProtectedRouteProps {
  title?: string
  resource: string
  children: JSX.Element
}

export const ProtectedRoute = ({ title, resource, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const canRead = user?.permissions?.[resource]?.read
  if (!canRead)
    return (
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted px-4">
        <Forbidden />
      </div>
    )

  return children
}
