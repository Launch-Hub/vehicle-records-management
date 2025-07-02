import React, { useState, useRef } from 'react'
import { QrCode, Copy } from 'lucide-react'

import { useIsMobile } from '@/lib/hooks/use-mobile'
import BuiltinCameraScanner from './camera-scanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CodeScannerProps {
  key?: string
  onCodeScanned?: (code: string) => void
  onError?: (error: string | Error) => void
}

export default function CodeScanner({
  key = 'code-scanner',
  onCodeScanned,
  onError,
}: CodeScannerProps) {
  // A single state now holds the result from any scan type.
  const [scannedCode, setScannedCode] = useState('')
  const [scannerError, setScannerError] = useState<string | Error | null>(null)
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false)

  const desktopInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleStartCameraScanner = () => {
    setScannerError(null)
    setShowCameraScanner(true)
  }

  const handleStopCameraScanner = () => {
    setShowCameraScanner(false)
  }

  // This function now autofills the input by setting the unified state.
  const handleMobileScanSuccess = (result: string) => {
    setScannedCode(result)
    setScannerError(null)
    setShowCameraScanner(false)
    if (onCodeScanned) {
      onCodeScanned(result)
    }
  }

  const handleMobileScanError = (error: string | Error) => {
    setScannerError(error)
    if (onError) {
      onError(error)
    }
  }

  // Handles manual typing or pasting into the input field.
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScannedCode(event.target.value)
  }

  // Handles submission from a desktop scanner (which emulates 'Enter').
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && scannedCode.trim() !== '') {
      event.preventDefault()
      const finalResult = scannedCode.trim()
      setScannedCode(finalResult)
      setScannerError(null)
      if (onCodeScanned) {
        onCodeScanned(finalResult)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy to clipboard: ', err)
    })
  }

  // The camera scanner now renders as an overlay.
  if (showCameraScanner) {
    return (
      <BuiltinCameraScanner
        onScanSuccess={handleMobileScanSuccess}
        onScanError={handleMobileScanError}
        onClose={handleStopCameraScanner}
      />
    )
  }

  // The main component view.
  return (
    <div key={key}>
      <div className="relative flex items-center">
        <Input
          id="scanner-input"
          type="text"
          ref={desktopInputRef}
          value={scannedCode}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={isMobile ? 'Tap icon to scan...' : 'Scan or input code here...'}
          className="pr-20" // Extra padding for the icons on the right
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
          {scannedCode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(scannedCode)}
              className="h-8 w-8 text-gray-500 hover:text-primary"
              aria-label="Copy code"
            >
              <Copy className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartCameraScanner}
            className="h-8 w-8 text-gray-500 hover:text-primary"
            aria-label="Start Camera Scanner"
          >
            <QrCode className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
