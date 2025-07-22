import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { l } from './_'
import ExcelJS from 'exceljs'

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

export async function exportToExcel({
  data,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
  headerRows = [], // array of arrays, each sub-array is a row
  footerRows = [], // array of arrays, each sub-array is a row
  columns = [],
}: {
  data: any[],
  filename?: string,
  sheetName?: string,
  headerRows?: any[][],
  footerRows?: any[][],
  columns?: { key: string, label: string }[]
}) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // Add header rows
  headerRows.forEach(row => worksheet.addRow(row))

  // Add main data rows
  if (data.length > 0) {
    const keys = columns.map(column => column.key)
    worksheet.addRow(keys)
    data.forEach(item => {
      worksheet.addRow(keys.map(k => item[k] || ''))
    })
  }

  // Add footer rows
  footerRows.forEach(row => worksheet.addRow(row))

  // Write to file (browser)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Beautifies a date for display in the UI.
 * @param date Date object, timestamp, or string parseable by Date
 * @param options Intl.DateTimeFormatOptions for custom formatting
 * @param locale Locale string, defaults to 'vi-VN'
 * @returns Formatted date string
 */
export function beautifyDate(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  locale: string = 'vi-VN'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString(locale, options)
}
