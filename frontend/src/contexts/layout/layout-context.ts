import { createContext } from 'react'

export interface LayoutContextProps {
  title: string
  setTitle: (title: string) => void
}

export const LayoutContext = createContext<LayoutContextProps | undefined>(undefined)
