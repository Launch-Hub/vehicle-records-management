import { useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

interface QRPrintProps {
  url: string
  title?: string
  onPrintComplete?: () => void
}

export default function QRPrint({ url, title = 'Mã QR xem lịch sử hồ sơ', onPrintComplete }: QRPrintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handlePrint = () => {
      // Find the canvas and get its data URL
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        const printWindow = window.open('', '_blank')
        if (printWindow) {
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
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      background: white;
                    }
                    .qr-container {
                      text-align: center;
                      padding: 20px;
                    }
                    .qr-code {
                      margin: 0 auto;
                    }
                    .qr-url {
                      margin-top: 10px;
                      font-size: 12px;
                      word-break: break-all;
                      color: #666;
                    }
                    .qr-title {
                      margin-bottom: 20px;
                      font-size: 18px;
                      font-weight: bold;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="qr-container">
                  <div class="qr-title">${title}</div>
                  <div class="qr-code">
                    <img src="${dataUrl}" width="300" height="300" alt="QR Code" />
                  </div>
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
    }

    // Wait for QR code to render, then print
    const timer = setTimeout(handlePrint, 200)
    return () => {
      clearTimeout(timer)
      if (onPrintComplete) onPrintComplete()
    }
  }, [url, title, onPrintComplete])

  // Render QRCodeCanvas with a ref to the canvas
  return (
    <div style={{ display: 'none' }}>
      <QRCodeCanvas
        value={url}
        size={300}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor="#000000"
        ref={canvasRef}
      />
    </div>
  )
} 