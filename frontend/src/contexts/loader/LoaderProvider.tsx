import { GlobalLoader } from '@/components/shared/global-loader'
import { useState, type ReactNode } from 'react'
import { LoaderContext } from './loader-context'

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const show = () => setIsLoading(true)
  const hide = () => setIsLoading(false)

  return (
    <LoaderContext.Provider value={{ show, hide, isLoading }}>
      {children}
      {isLoading && <GlobalLoader />}
    </LoaderContext.Provider>
  )
}
