import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { JSX } from 'react'
import type { Permission } from '@/lib/types'

interface ProtectedRouteProps {
  resource: string
  children: JSX.Element
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />

  return children

  // return <h1>403 Forbidden: Insufficient permissions</h1>
  return <Navigate to="/" />
}
