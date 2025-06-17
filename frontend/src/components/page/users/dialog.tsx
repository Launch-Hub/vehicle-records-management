import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DialogProps } from '@/lib/types/props'
import type { User } from '@/lib/types/tables.type'
import UserForm from './form'

export default function UserDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
  isSelfEdit = false,
}: DialogProps<User>) {
  const defaultAction = initialData || isCopying ? 'create' : 'update'

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa thông tin' : 'Tạo người dùng mới'}</DialogTitle>
        </DialogHeader>
        <UserForm
          initialData={initialData}
          isCopying={isCopying}
          isSelfEdit={isSelfEdit}
          onSubmit={(data) => onSubmit(defaultAction, data)}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
