import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { actionTypeService } from '@/lib/services/action-types'
import { procedureService } from '@/lib/services/procedures'
import { recordService } from '@/lib/services/records'
import type { Procedure, ActionType, VehicleRecord } from '@/lib/types/tables.type'

interface ProceedDialogProps {
  open: boolean
  onClose: () => void
  procedure: Procedure
  onSuccess?: () => void
}

export default function ProceedDialog({ open, onClose, procedure, onSuccess }: ProceedDialogProps) {
  const [actionTypes, setActionTypes] = useState<ActionType[]>([])
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch action types for the next step
  useEffect(() => {
    if (!open) return
    const fetch = async () => {
      try {
        setError(null)
        setActionTypes([])
        setSelectedAction('')
        const res = await actionTypeService.getList({ step: (procedure as any).currentStep + 1 })
        setActionTypes(res.items)
      } catch (e) {
        setError('Không thể tải loại hành động cho bước tiếp theo.')
      }
    }
    fetch()
  }, [open, procedure])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAction) return
    setLoading(true)
    setError(null)
    try {
      const action = actionTypes.find(a => a._id === selectedAction)
      if (!action) throw new Error('Không tìm thấy hành động đã chọn.')
      let newStatus = procedure.status
      let updateRecord = false
      // Step logic
      if (procedure.currentStep === 1 && action.toStep === 2) {
        newStatus = 'processing'
      }
      if (action.toStep === 6) {
        newStatus = 'completed'
        updateRecord = true
      }
      if (action.toStep === 0) {
        newStatus = 'cancelled'
        updateRecord = true
      }
      // Update procedure
      await procedureService.update(procedure._id, {
        currentStep: action.toStep,
        status: newStatus,
      })
      // Update record if needed
      if (updateRecord && procedure.recordId) {
        await recordService.update(procedure.recordId, { status: 'idle' })
      }
      if (onSuccess) onSuccess()
      onClose()
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra khi xử lý bước tiếp theo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xử lý bước tiếp theo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Chọn hành động cho bước tiếp theo</label>
            <Select value={selectedAction} onValueChange={setSelectedAction} disabled={loading || actionTypes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hành động..." />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map(action => (
                  <SelectItem key={action._id} value={action._id}>
                    {action.name} (Bước {action.toStep})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Huỷ</Button>
            <Button type="submit" disabled={!selectedAction || loading}>
              {loading ? <span className="animate-spin mr-2">⏳</span> : null}
              Xác nhận
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}