import { type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import Forbidden from '../page/handler/forbidden'
import { ROUTES } from '@/routes'

interface ProtectedRouteProps {
  title?: string
  resource: string
  children: JSX.Element
}

export const ProtectedRoute = ({ resource, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authResolved } = useAuth()
  const loginUrl = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'
  console.count('ProtectedRoute render')

  if (!authResolved) {
    // Render nothing or a spinner while auth is loading
    return (
      <div className="my-auto p-8 text-center text-muted-foreground">Đang kiểm tra phiên đăng nhập...</div>
    )
  }
  // debugger
  if (!isAuthenticated) return <Navigate to={loginUrl} replace />

  const canRead = user?.permissions?.[resource]?.read
  if (canRead) return children

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted px-4">
      <Forbidden />
    </div>
  )
}
