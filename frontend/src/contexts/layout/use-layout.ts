import { useContext } from 'react'
import { LayoutContext } from './layout-context'

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within LayoutProvider')
  return context
}
