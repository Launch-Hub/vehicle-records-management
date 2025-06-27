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
  const lastPathname = useRef(pathname)

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
      if (ROUTES.find((e) => pathname.includes(e.path))?.auth !== true) {
        setAuthResolved(true)
        return
      }
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
      const { accessToken, user: refreshedUser } = res.data

      if (!accessToken) throw 'No access token'
      setUser(refreshedUser || _user)
      storeTokens(accessToken, refreshToken, refreshedUser || _user)
    } catch (err) {
      console.error('Session refresh failed', err)
      logout()
    } finally {
      setAuthResolved(true)
    }
  }, [logout, pathname])

  useEffect(() => {
    // On first load, always attempt to refresh session
    const _user = getUserLocal()
    if (_user && _user.id) {
      setUser(_user)
      refreshSession().then(() => {
        // If on login page and authenticated, redirect to dashboard
        const loginRoute = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'
        const dashboardRoute = ROUTES.find((e) => e.enPath === '/dashboard')?.path || '/dashboard'
        if (window.location.pathname === loginRoute && _user) {
          navigate(dashboardRoute)
        }
      })
    } else {
      setAuthResolved(true)
      // If route requires auth, redirect to login
      if (ROUTES.find((e) => pathname.includes(e.path))?.auth === true) {
        logout()
      }
    }
    hasRefreshed.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Only refresh session on pathname change if user is already logged in
    // and pathname has actually changed
    const _user = getUserLocal()
    if (_user && hasRefreshed.current && lastPathname.current !== pathname) {
      lastPathname.current = pathname
      refreshSession()
    }
  }, [pathname, refreshSession])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authResolved, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
