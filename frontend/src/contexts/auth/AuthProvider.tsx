import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { type User } from '@/lib/types/tables.type'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getLastActive, getRefreshToken, getUserLocal, storeTokens } from '@/lib/auth'
import { AuthContext } from './auth-context'
import { ROUTES } from '@/routes'
import { toast } from 'sonner'
import api from '@/lib/axios'

const INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1000 // 1 day

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const hasRefreshed = useRef(false)

  const login = async (email: string, password: string, redirectPath: string = '/') => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user } = response.data
    setUser(user)
    storeTokens(accessToken, refreshToken, user)
    navigate(redirectPath)
    setAuthResolved(true)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    const loginUrl = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'
    navigate(loginUrl)
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put('/users/profile', data)
    const updatedUser = response.data
    setUser(updatedUser)
    // Update the user data in localStorage as well
    const currentUser = getUserLocal()
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const refreshSession = useCallback(async () => {
    const refreshToken = getRefreshToken()
    const lastActive = getLastActive()
    const _user = getUserLocal()

    // If no token or inactive too long, logout
    if (!refreshToken || !lastActive || isNaN(lastActive) || !_user) {
      if (ROUTES.find((e) => pathname.includes(e.path))?.auth !== true) return
      logout()
      return
    }
    const inactiveDuration = Date.now() - lastActive
    if (inactiveDuration > INACTIVITY_TIMEOUT_MS) {
      toast.warning('Phiên đăng nhập hết hạn!')
      setAuthResolved(true)
      logout()
      return
    }

    try {
      const res = await api.post('/auth/refresh', { refreshToken })
      const { accessToken } = res.data

      if (!accessToken) throw 'No access token'
      setUser(_user)
      storeTokens(accessToken, refreshToken)
    } catch (err) {
      console.error('Session refresh failed', err)
      logout()
    } finally {
      setAuthResolved(true)
    }
  }, [pathname, logout])

  useEffect(() => {
    if (!hasRefreshed.current) {
      refreshSession()
      hasRefreshed.current = true
    }
  }, [refreshSession])

  useEffect(() => {
    // Only refresh session on pathname change if user is already logged in
    const _user = getUserLocal()
    if (_user && hasRefreshed.current) {
      refreshSession()
    }
  }, [pathname, refreshSession])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authResolved, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
