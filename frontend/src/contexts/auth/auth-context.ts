import { createContext } from 'react'
import { type User } from '@/lib/types'

export interface AuthContextProps {
  user: User | null
  login: (email: string, password: string, redirectPath: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined)
