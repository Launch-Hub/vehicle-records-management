import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DialogProps } from '@/lib/types/props'
import type { User } from '@/lib/types/tables.type'
import ProfileForm from './form'
import { useEffect, useState } from 'react'

export default function ProfileDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
  isSelfEdit = false,
}: DialogProps<User>) {
  const defaultAction = initialData || isCopying ? 'create' : 'update'
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (open) {
      setFormKey(prev => prev + 1)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa thông tin' : 'Tạo người dùng mới'}</DialogTitle>
        </DialogHeader>
        <ProfileForm
          key={formKey}
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
