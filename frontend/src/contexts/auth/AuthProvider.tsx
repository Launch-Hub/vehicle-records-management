import { useEffect, useState } from 'react'
import { type User } from '@/lib/types'
import { useNavigate } from 'react-router-dom'
import { getAccessToken, storeTokens, updateLastActive } from '@/lib/auth'
import { AuthContext } from './auth-context'

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
    const token = getAccessToken()
    const userStr = sessionStorage.getItem('user')
    if (token && userStr) {
      setUser(JSON.parse(userStr))
      updateLastActive()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
