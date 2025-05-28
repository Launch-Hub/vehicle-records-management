import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function switchTheme(themeName: string) {
  const themeLink = document.getElementById('themeStylesheet') as HTMLLinkElement | null
  if (themeLink) {
    themeLink.href = `/styles/themes/${themeName}.css` // root-relative for Vite
  }
}

export const scrollToTop = () => {
  return scrollTo({ top: 0, behavior: 'smooth' })
}
