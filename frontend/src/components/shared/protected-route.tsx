import { useEffect, type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import Forbidden from '../page/handler/forbidden'
import { useLayout } from '@/contexts/layout'

interface ProtectedRouteProps {
  title?: string
  resource: string
  children: JSX.Element
}

export const ProtectedRoute = ({ title, resource, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth()
  const { setTitle } = useLayout()

  useEffect(() => {
    setTitle(title ?? '')
  }, [title, setTitle])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const canRead = user?.permissions?.[resource]?.read
  if (canRead) return children

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted px-4">
      <Forbidden />
    </div>
  )
}
