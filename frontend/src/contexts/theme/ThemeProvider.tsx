import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from '@/contexts/theme/theme-conext'
import { DEFAULT_THEME } from '@/constants/env'

interface ThemeProviderProps {
  children: ReactNode
  storageKey: string
}
type Palette = 'default' | 'blue' | 'green' | 'orange' | 'violet'

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  storageKey = 'app-theme',
  children,
}) => {
  const defaultTheme: Theme = DEFAULT_THEME as Theme
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })
  const [palette, setPalette] = useState<Palette>('green')

  const applyTheme = (currentTheme: Theme) => {
    const root = document.documentElement
    const effectiveTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(storageKey, theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, storageKey])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
