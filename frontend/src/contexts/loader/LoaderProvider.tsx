import { GlobalLoader } from '@/components/shared/loader/global-loader'
import { useState, type ReactNode } from 'react'
import { LoaderContext } from './loader-context'

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const show = (type = 'loading') => {
    switch (type) {
      case 'loading':
        setIsLoading(true)
        break
      case 'fetching':
        setIsFetching(true)
    }
  }
  const hide = (type = 'loading') => {
    switch (type) {
      case 'loading':
        setIsLoading(false)
        break
      case 'fetching':
        setIsFetching(false)
    }
  }

  return (
    <LoaderContext.Provider value={{ show, hide, isLoading, isFetching }}>
      {children}
      {isLoading && <GlobalLoader />}
    </LoaderContext.Provider>
  )
}
