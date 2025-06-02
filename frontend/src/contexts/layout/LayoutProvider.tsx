import { useState } from 'react'
import { LayoutContext } from './layout-context'

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState('')

  return <LayoutContext.Provider value={{ title, setTitle }}>{children}</LayoutContext.Provider>
}
