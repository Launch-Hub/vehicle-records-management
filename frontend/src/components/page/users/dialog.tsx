import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DialogProps } from '@/lib/types/props'
import { useForm } from 'react-hook-form'
import type { User } from '@/lib/types/tables.type'
import { DICTIONARY } from '@/constants/dictionary'
import { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const defaultData = {
  username: '',
  email: '',
  name: '',
  password: '',
  avatar: '',
  roles: ['nhân viên'],
  permissions: {},
  status: 'active',
}

export function UserDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
}: DialogProps<User>) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Omit<User, '_id'>>({
    defaultValues: initialData || defaultData,
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFormSubmit = (data: Omit<User, '_id'>) => {
    if (!data.username) data.username = data.email
    onSubmit(initialData ? 'update' : 'create', data)
    handleClose()
  }

  useEffect(() => {
    if (!open) return
    reset(initialData || defaultData)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa thông tin' : 'Tạo người dùng mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="avatar">{DICTIONARY['avatar']}</Label>
              <Input id="avatar" {...register('avatar')} />
            </div> */}
            {/* <div className="flex flex-col gap-2">
              <Label htmlFor="username">{DICTIONARY['username']}</Label>
              <Input id="username" {...register('username', { required: true })} />
            </div> */}
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="name">{DICTIONARY['name']}</Label>
              <Input id="name" {...register('name')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="required">
                {DICTIONARY['email']}
              </Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="required">
                {DICTIONARY['password']}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="●●●●●●"
                  {...register('password', { required: true })}
                  className="pr-10"
                  disabled={!!initialData}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  disabled={!!initialData}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="roles">
                {DICTIONARY['roles']} <span hidden>(cách nhau bởi dấu phẩy)</span>
              </Label>
              <Input
                id="roles"
                {...register('roles')}
                placeholder="admin , nhân viên"
                onChange={(e) => e.target.value.split(',').map((role) => role.trim())}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">{DICTIONARY['status']}</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="text-emerald-700">Hoạt động</span>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <span className="text-red-600">Ngưng hoạt động</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Huỷ bỏ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
