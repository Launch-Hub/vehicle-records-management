import { createContext } from 'react'
import { type User } from '@/lib/types'

export interface LayoutContextProps {
  title: string
  setTitle: (title: string) => void
}

export const LayoutContext = createContext<LayoutContextProps | undefined>(undefined)
