import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { l } from './_'
import * as XLSX from 'xlsx'

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

export const processImage = (file: File, callback: (base64: string) => void) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, ...).')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Hình ảnh phải nhỏ hơn 2MB.')
    return
  }

  const img = new Image()
  const reader = new FileReader()
  reader.onload = (e) => {
    img.src = e.target?.result as string
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const maxSize = 1000

      // Calculate crop dimensions to maintain aspect ratio
      let width = img.width
      let height = img.height
      let offsetX = 0
      let offsetY = 0

      if (width > height) {
        width = height
        offsetX = (img.width - width) / 2
      } else if (height > width) {
        height = width
        offsetY = (img.height - height) / 2
      }

      // Set canvas size to 1000x1000
      canvas.width = maxSize
      canvas.height = maxSize

      // Resize and crop to center
      ctx.drawImage(img, offsetX, offsetY, width, height, 0, 0, maxSize, maxSize)

      // Convert to base64 (JPEG for smaller size)
      const base64String = canvas.toDataURL('image/jpeg', 0.8)
      callback(base64String)
    }
  }
  reader.readAsDataURL(file)
}

export function exportToExcel({
  data,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
  headerRows = [], // array of arrays, each sub-array is a row
  footerRows = [], // array of arrays, each sub-array is a row
}: {
  data: any[],
  filename?: string,
  sheetName?: string,
  headerRows?: any[][],
  footerRows?: any[][],
}) {
  // Convert data to worksheet and then to 2D array
  const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false })
  const mainRows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
  const wsData = [
    ...headerRows,
    ...mainRows,
    ...footerRows,
  ]
  const wsFinal = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsFinal, sheetName)
  XLSX.writeFile(wb, filename)
}
