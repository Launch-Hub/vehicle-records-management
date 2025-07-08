import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DialogProps } from '@/lib/types/props'
import type { Procedure } from '@/lib/types/tables.type'
import ProcedureForm from './form'
import ProcedureStepChangeForm from './step-change-form'

export default function ProcedureDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
  isChangeStep = false,
}: DialogProps<Procedure>) {
  const defaultAction = initialData || isCopying ? 'create' : 'update'

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa thông tin' : 'Tạo đăng ký mới'}</DialogTitle>
        </DialogHeader>
        {isChangeStep && initialData ? (
          <ProcedureStepChangeForm
            procedure={initialData}
            onSubmit={(data) => onSubmit(defaultAction, data)}
            onCancel={onClose}
          />
        ) : (
          <ProcedureForm
            initialData={initialData}
            isCopying={isCopying}
            onSubmit={(data) => onSubmit(defaultAction, data)}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
