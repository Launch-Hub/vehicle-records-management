import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DialogProps } from '@/lib/types/props'
import type { VehicleRecord } from '@/lib/types/tables.type'
import VehicleRecordForm from './form'

export function VehicleRecordDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
}: DialogProps<VehicleRecord>) {
  const defaultAction = initialData || isCopying ? 'create' : 'update'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}</DialogTitle>
        </DialogHeader>
        <VehicleRecordForm
          initialData={initialData}
          isCopying={isCopying}
          onSubmit={(data) => onSubmit(defaultAction, data)}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
