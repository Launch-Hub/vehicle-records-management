import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CameraIcon, EyeIcon, EyeOffIcon, UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DICTIONARY, getLabel, getPermissionLabel } from '@/constants/dictionary'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/lib/types/tables.type'
import { $generalPerms, ROLES } from '@/constants/general'
import { processImage } from '@/lib/utils'

interface UserFormProps {
  initialData?: User
  isCopying?: boolean
  isSelfEdit?: boolean
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
  } = useForm<Omit<User, '_id'>>({
    defaultValues: {
      username: '',
      email: '',
      name: '',
      phone: '',
      assignedUnit: '',
      serviceNumber: '',
      password: '',
      avatar: '',
      permissions: ROLES.find((e) => e.name === 'default')?.permissions,
      status: 'active',
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null)

  const handleAvatarChange = (file: File) => {
    processImage(file, (base64) => {
      setAvatarPreview(base64)
      setValue('avatar', base64)
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleAvatarChange(file)
  }

  const handleFormSubmit = (formData: Omit<User, '_id'>) => {
    onSubmit({
      ...formData,
      username: formData.username || formData.email,
    })
  }

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setAvatarPreview(initialData.avatar || null)
    }
  }, [initialData, reset])

  const isEditing = initialData && !isCopying

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Avatar Section */}
        <div className="col-span-2 flex flex-col gap-2 justify-center items-center">
          <div className="col-span-2 flex flex-col items-center relative rounded-full overflow-hidden h-30 w-30">
            <Avatar className="w-full h-full border relative">
              <AvatarImage src={avatarPreview || '/images/default-avatar.png'} alt="Avatar" />
              <AvatarFallback>IMG</AvatarFallback>
            </Avatar>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div
              role="button"
              onClick={() => document.getElementById('avatar')?.click()}
              className="absolute bottom-0 w-full h-2/5 flex items-center justify-center bg-foreground/90 cursor-pointer opacity-0 hover:opacity-70 duration-200"
            >
              <CameraIcon className="h-8 w-8 text-accent" />
            </div>
          </div>
          {avatarPreview && (
            <Button
              variant="link"
              className="text-destructive"
              onClick={() => {
                setAvatarPreview(null)
                setValue('avatar', '')
              }}
            >
              Xoá
            </Button>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">{getLabel('name')}</Label>
          <Input id="name" {...register('name')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="required">
            {getLabel('username')}
          </Label>
          <Input id="username" {...register('username')} />
        </div>
        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="password" className="required">
              {getLabel('password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
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
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="required">
            {getLabel('email')}
          </Label>
          <Input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="required">
            {getLabel('phone')}
          </Label>
          <Input id="phone" type="phone" {...register('phone', { required: true })} />
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status">{getLabel('status')}</Label>
            <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="text-success">Hoạt động</span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="text-destructive">Ngưng hoạt động</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="assignedUnit" className="required">
            {getLabel('assignedUnit')}
          </Label>
          <Input id="assignedUnit" {...register('assignedUnit')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceNumber" className="required">
            {getLabel('serviceNumber')}
          </Label>
          <Input id="serviceNumber" {...register('serviceNumber')} />
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
        <Label>Quyền truy cập</Label>
        {/* <Select
          value={JSON.stringify(watch('permissions'))}
          onValueChange={(value) => {
            const selectedRole = ROLES.find((role) => JSON.stringify(role.permissions) === value)
            if (selectedRole) {
              setValue('permissions', selectedRole.permissions)
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.name} value={JSON.stringify(role.permissions)}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(watch('permissions') || {})
            .filter(([module, perms]) => !$generalPerms.includes(module))
            .map(([module, perms]) => (
              <div key={module} className="space-y-2 p-4 rounded-lg bg-muted">
                <Label className="capitalize text-secondary font-semibold">
                  {getPermissionLabel(module) || module}
                </Label>
                <div className="flex flex-col gap-2">
                  {Object.entries(perms).map(([perm, value]) => (
                    <div key={perm} className="flex items-center gap-2">
                      <Checkbox
                        id={`${module}-${perm}`}
                        checked={value}
                        className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        onCheckedChange={(checked) => {
                          setValue(`permissions.${module}.${perm}` as any, !!checked)
                        }}
                      />
                      <Label htmlFor={`${module}-${perm}`}>
                        {getPermissionLabel(perm) || perm.charAt(0).toUpperCase() + perm.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Huỷ bỏ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}
