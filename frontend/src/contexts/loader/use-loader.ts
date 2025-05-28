import { useContext } from 'react'
import { LoaderContext } from './loader-context'

export function useLoader() {
  const context = useContext(LoaderContext)
  if (!context) throw new Error('useLoader must be used within LoaderProvider')
  return context
}
