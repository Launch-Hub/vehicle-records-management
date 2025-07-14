import { useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

interface QRPrintGridItem {
  url: string
  label?: string
}

interface QRPrintGridProps {
  items: QRPrintGridItem[]
  title?: string
  onPrintComplete?: () => void
}

const MAX_COLS = 4
const MAX_ROWS = 6
const MAX_PER_PAGE = MAX_COLS * MAX_ROWS

export default function QRPrintGrid({
  items,
  title = 'Danh sách mã QR',
  onPrintComplete,
}: QRPrintGridProps) {
  // Refs for all canvases
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  useEffect(() => {
    const handlePrint = () => {
      // Get data URLs for all canvases
      const dataUrls = canvasRefs.current.map((canvas) =>
        canvas ? canvas.toDataURL('image/png') : ''
      )
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        // Calculate grid
        const count = items.length
        const cols = Math.min(MAX_COLS, Math.ceil(Math.sqrt(count)))
        const rows = Math.min(MAX_ROWS, Math.ceil(count / cols))
        // QR size: fit to A4 width (210mm - margins), e.g. 180mm/cols px (1mm ~ 3.78px)
        const pageWidthPx = 180 * 3.78 // ~680px
        const qrSize = Math.floor(pageWidthPx / cols) - 24 // 24px for padding
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                @media print, screen {
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                  .qr-grid {
                    display: grid;
                    grid-template-columns: repeat(${cols}, 1fr);
                    grid-template-rows: repeat(${rows}, auto);
                    gap: 24px;
                    justify-items: center;
                    align-items: center;
                    width: 100vw;
                    max-width: 100vw;
                    padding: 0 16px 16px 16px;
                  }
                  .qr-cell {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    word-break: break-all;
                  }
                  .qr-img {
                    width: ${qrSize}px;
                    height: ${qrSize}px;
                  }
                  .qr-label {
                    margin-top: 8px;
                    font-size: 12px;
                    color: #444;
                    text-align: center;
                    max-width: ${qrSize + 20}px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="qr-grid">
                ${dataUrls
                  .map(
                    (url, i) => `
                  <div class="qr-cell">
                    <img src="${url}" class="qr-img" alt="QR Code" />
                    ${items[i].label ? `<div class="qr-label">${items[i].label}</div>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
    // Wait for QR codes to render
    const timer = setTimeout(handlePrint, 300)
    return () => {
      clearTimeout(timer)
      if (onPrintComplete) onPrintComplete()
    }
  }, [items, title, onPrintComplete])

  // Render all QR codes off-screen
  return (
    <div style={{ display: 'none' }}>
      {items.map((item, i) => (
        <QRCodeCanvas
          key={i}
          value={item.url}
          size={256}
          level="H"
          includeMargin
          bgColor="#ffffff"
          fgColor="#000000"
          ref={(el) => {
            canvasRefs.current[i] = el
          }}
        />
      ))}
    </div>
  )
}
