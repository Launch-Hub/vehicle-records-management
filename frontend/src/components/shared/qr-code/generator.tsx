// src/pages/QrGenerator.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeCanvas } from 'qrcode.react'

export default function QrGenerator() {
  const [text, setText] = useState('https://example.com')
  const [input, setInput] = useState(text)

  const generateQr = () => {
    setText(input)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter text or URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={generateQr} className="w-full">
            Generate QR Code
          </Button>
          <div className="flex justify-center pt-4">
            <QRCodeCanvas
              value={text}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
