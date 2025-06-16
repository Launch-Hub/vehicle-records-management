import { useEffect, useRef, useState, type ReactNode } from 'react'
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
    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = response.data
      setUser(user)
      storeTokens(accessToken, refreshToken, user)
      navigate(redirectPath)
      setAuthResolved(true)
    } catch (error: any) {
      throw error // rethrow if upstream needs to catch
    }
  }

  const logout = () => {
    clearSession()
    setUser(null)
    const loginUrl = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'
    navigate(loginUrl)
  }

  const refreshSession = async () => {
    const refreshToken = getRefreshToken()
    const lastActive = getLastActive()
    const _user = getUserLocal()

    // If no token or inactive too long, logout
    if (!refreshToken || !lastActive || isNaN(lastActive) || !_user) {
      if (ROUTES.find((e) => pathname.includes(e.path))?.auth !== true) return
      // toast.error('Thông tin người dùng không đúng!')
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
  }

  useEffect(() => {
    if (!hasRefreshed.current) {
      refreshSession()
      hasRefreshed.current = true
    }
  }, [])

  useEffect(() => {
    // console.count('path is changed, update last active')
    const _user = getUserLocal()
    if (_user) refreshSession()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authResolved }}>
      {children}
    </AuthContext.Provider>
  )
}
