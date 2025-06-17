// src/components/page/records/RecordDialog.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DialogProps } from '@/lib/types/props'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { RecordForm } from './form'

export function RecordDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
}: DialogProps<VehicleRecord>) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}</DialogTitle>
        </DialogHeader>
        <RecordForm
          initialData={initialData}
          isCopying={isCopying}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
