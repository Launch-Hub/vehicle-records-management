import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User } from '@/lib/types'
import { useNavigate } from 'react-router-dom'
import { storeTokens, updateLastActive } from '@/lib/auth'

interface AuthContextProps {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()

    storeTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    updateLastActive()
    navigate('/')
  }

  const logout = () => {
    sessionStorage.clear()
    setUser(null)
    navigate('/login')
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('access_token')
    const userStr = sessionStorage.getItem('user')
    if (saved && userStr) setUser(JSON.parse(userStr))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
