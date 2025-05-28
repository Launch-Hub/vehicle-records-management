import { createContext } from 'react'

interface LoaderContextProps {
  show: () => void
  hide: () => void
  isLoading: boolean
}

export const LoaderContext = createContext<LoaderContextProps | undefined>(undefined)
