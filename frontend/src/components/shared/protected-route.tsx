import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import { ROUTES } from '@/routes'
import Forbidden from '../page/handler/forbidden'

interface ProtectedRouteProps {
  title?: string
  resource: string
  children: ReactNode
}

export const ProtectedRoute = ({ resource, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authResolved } = useAuth()
  const loginUrl = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'

  if (!authResolved) {
    // Render nothing or a spinner while auth is loading
    return (
      <div className="my-auto p-8 text-center text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }
  // debugger
  // console.count('ProtectedRoute render')
  if (!isAuthenticated) return <Navigate to={loginUrl} replace />

  const canRead = user?.permissions?.[resource]?.read
  if (canRead) return children

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted px-4">
      <Forbidden />
    </div>
  )
}
