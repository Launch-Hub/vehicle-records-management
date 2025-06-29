import { useEffect } from 'react'
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
  type QrcodeSuccessCallback,
  type QrcodeErrorCallback,
} from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './scanner.css' // Assuming you have this file for custom scanner styles

interface CameraScannerProps {
  onScanSuccess: (result: string) => void
  onScanError: (error: string | Error) => void
  onClose: () => void
}

const cameraScannerConfig = {
  fps: 24,
  qrbox: { width: 250, height: 250 },
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
  formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.AZTEC,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.MAXICODE,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.PDF_417,
    Html5QrcodeSupportedFormats.RSS_14,
    Html5QrcodeSupportedFormats.RSS_EXPANDED,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
  ],
}

export default function CameraScanner({ onScanSuccess, onScanError, onClose }: CameraScannerProps) {
  const qrcodeRegionId = 'html5qr-code-full-region-mobile'

  useEffect(() => {
    const qrCodeRegion = document.getElementById(qrcodeRegionId)
    if (!qrCodeRegion) {
      onScanError(`Camera scanner UI element (id: "${qrcodeRegionId}") not found.`)
      onClose()
      return
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      cameraScannerConfig,
      false // verbose
    )

    const successCallback: QrcodeSuccessCallback = (decodedText, decodedResult) => {
      onScanSuccess(decodedText)
    }

    const errorCallback: QrcodeErrorCallback = (errorMessage) => {
      if (typeof errorMessage === 'string') {
        if (
          errorMessage.toLowerCase().includes('permission denied') ||
          errorMessage.toLowerCase().includes('notallowederror')
        ) {
          onScanError('Camera permission denied. Please allow camera access.')
          onClose()
        } else if (
          !errorMessage.toLowerCase().includes('qr code parse error') &&
          !errorMessage.toLowerCase().includes('not found')
        ) {
          console.warn(`Camera scan error: ${errorMessage}`)
        }
      }
    }

    html5QrcodeScanner.render(successCallback, errorCallback)

    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error('Failed to clear html5QrcodeScanner: ', error)
      })
    }
  }, [onScanError, onScanSuccess, onClose])

  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black">
      <Card className="w-[90%] max-w-md m-4">
        <CardHeader>
          <CardTitle>Scan Code with Camera</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id={qrcodeRegionId}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{ minHeight: '250px' }}
          ></div>
          <Button onClick={onClose} variant="destructive" className="w-full mt-4">
            Huỷ bỏ
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
