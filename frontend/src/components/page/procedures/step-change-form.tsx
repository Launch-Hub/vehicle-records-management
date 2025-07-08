import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadService } from '@/lib/services/upload'
import type { Procedure, ProcedureStep } from '@/lib/types/tables.type'

interface ProcedureStepChangeFormProps {
  procedure: Procedure
  onSubmit: (data: Procedure) => void
  onCancel?: () => void
}

export default function ProcedureStepChangeForm({
  procedure,
  onSubmit,
  onCancel,
}: ProcedureStepChangeFormProps) {
  const [selectedStep, setSelectedStep] = useState<number>(procedure.currentStep)
  const [note, setNote] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const res = await uploadService.uploadImage(file)
      setAttachments((prev) => [...prev, res.file.storedName])
    } catch (error) {
      // handle error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newStep: ProcedureStep = {
      order: procedure.steps.length + 1,
      step: selectedStep,
      title: `Chuyển sang bước ${selectedStep}`,
      action: '',
      note,
      attachments,
      isCompleted: false,
    }
    onSubmit({
      ...procedure,
      steps: [...procedure.steps, newStep],
      currentStep: selectedStep,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chuyển bước thủ tục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="step">Chọn bước mới</Label>
              <Select
                value={String(selectedStep)}
                onValueChange={(v) => setSelectedStep(Number(v))}
              >
                <SelectTrigger id="step" className="w-full">
                  <SelectValue placeholder="Chọn bước" />
                </SelectTrigger>
                <SelectContent>
                  {procedure.steps.map((s, idx) => (
                    <SelectItem key={idx} value={String(s.step)}>
                      Bước {s.step}: {s.title || `Bước ${s.step}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho lần chuyển bước..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachments">Đính kèm file</Label>
              <Input
                id="attachments"
                type="file"
                accept="image/*"
                onChange={handleAttachmentChange}
                disabled={isUploading}
              />
              {attachments.length > 0 && (
                <ul className="mt-2 text-xs">
                  {attachments.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Huỷ bỏ
              </Button>
            )}
            <Button type="submit" disabled={isUploading}>
              Chuyển bước
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
