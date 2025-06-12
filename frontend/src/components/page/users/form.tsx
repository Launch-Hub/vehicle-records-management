import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DICTIONARY } from '@/constants/dictionary'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@/lib/types/tables.type'

export type UserFormValues = Omit<User, '_id'> & {
  roles: string
}

interface UserFormProps {
  initialData?: User
  isCopying?: boolean
  onSubmit: (data: Omit<User, '_id'>) => void
  onCancel?: () => void
}

export default function UserForm({
  initialData,
  isCopying = false,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<UserFormValues>({
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      avatar: '',
      roles: 'nhân viên',
      permissions: {},
      status: 'active',
    },
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleFormSubmit = (formData: UserFormValues) => {
    const action: 'create' | 'update' | 'copy' = isCopying
      ? 'copy'
      : initialData
      ? 'update'
      : 'create'

    const roles = formData.roles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)

    const data: Omit<User, '_id'> = {
      ...formData,
      username: formData.username || formData.email,
      roles,
    }

    onSubmit(data)
  }

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        roles: Array.isArray(initialData.roles)
          ? initialData.roles.join(', ')
          : (initialData.roles as string),
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
              {...register('password', {
                required: !!initialData && !isCopying ? false : true,
              })}
              className="pr-10"
              disabled={!!initialData && !isCopying}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              disabled={!!initialData && !isCopying}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="roles">{DICTIONARY['roles']}</Label>
          <Input id="roles" placeholder="admin, nhân viên" {...register('roles')} />
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

      <div className="mt-8 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Huỷ bỏ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {initialData && !isCopying ? 'Lưu thay đổi' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}
