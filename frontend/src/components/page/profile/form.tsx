import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CameraIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getLabel } from '@/constants/dictionary'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/lib/types/tables.type'
import { processImage } from '@/lib/utils'

interface ProfileFormProps {
  initialData?: User
  isSelfEdit?: boolean
  onSubmit: (data: Omit<User, '_id'>) => void
  onCancel?: () => void
}

export default function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<Omit<User, '_id'>>({
    defaultValues: initialData,
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

  const isEditing = initialData

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
          <Label htmlFor="name">{getLabel('name', 'users')}</Label>
          <Input id="name" {...register('name')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="required">
            {getLabel('username', 'users')}
          </Label>
          <Input id="username" {...register('username')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="required">
            {getLabel('passwordHash', 'users')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: false,
              })}
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
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="required">
            {getLabel('email', 'users')}
          </Label>
          <Input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="required">
            {getLabel('phone', 'users')}
          </Label>
          <Input id="phone" type="phone" {...register('phone', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedUnit" className="required">
            {getLabel('assignedUnit', 'users')}
          </Label>
          <Input id="assignedUnit" {...register('assignedUnit')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceNumber" className="required">
            {getLabel('serviceNumber', 'users')}
          </Label>
          <Input id="serviceNumber" {...register('serviceNumber')} />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Huỷ bỏ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          Lưu
        </Button>
      </div>
    </form>
  )
}
