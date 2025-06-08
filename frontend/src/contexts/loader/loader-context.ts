import { createContext } from 'react'

interface LoaderContextProps {
  show: (type: string) => void
  hide: (type: string) => void
  isLoading: boolean
  isFetching: boolean
}

export const LoaderContext = createContext<LoaderContextProps | undefined>(undefined)
