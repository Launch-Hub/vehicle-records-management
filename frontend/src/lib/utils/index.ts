import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { l } from './_'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function blockDevTools() {
  l()
  setTimeout(blockDevTools, 50)
}

export function changeTheme(themeName: string) {
  const themeLinks = document.querySelectorAll('.alternate-style')
  if (!themeLinks) return

  themeLinks.forEach((style) => {
    if (themeName === style.getAttribute('title')) {
      style.removeAttribute('disabled')
    } else {
      style.setAttribute('disabled', 'true')
    }
  })
}

export const scrollToTop = () => {
  return scrollTo({ top: 0, behavior: 'smooth' })
}

export const joinPath = (base: string, segment: string) => {
  return base.endsWith('/') ? `${base}${segment}` : `${base}/${segment}`
}

export const backPath = (path: string) => {
  const lastSlashIndex = path.lastIndexOf('/')
  return lastSlashIndex > 0 ? path.slice(0, lastSlashIndex) : ''
}
