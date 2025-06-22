import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CameraIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getLabel, getPermissionLabel } from '@/constants/dictionary'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { UserFormSchema, type UserFormValues } from '@/lib/types/schemas.type'

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
  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      phone: '',
      assignedUnit: '',
      serviceNumber: '',
      password: '',
      avatar: '',
      permissions: ROLES.find((e) => e.name === 'default')?.permissions || {},
      status: 'active',
      ...initialData,
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null)

  const handleAvatarChange = (file: File) => {
    processImage(file, (base64) => {
      setAvatarPreview(base64)
      form.setValue('avatar', base64)
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleAvatarChange(file)
  }

  const handleFormSubmit = (formData: UserFormValues) => {
    onSubmit(formData)
  }

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      setAvatarPreview(initialData.avatar || null)
    }
  }, [initialData, form])

  const isEditing = initialData && !isCopying

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  form.setValue('avatar', '')
                }}
              >
                Xoá
              </Button>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{getLabel('username')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{getLabel('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{getLabel('phone')}</FormLabel>
                  <FormControl>
                    <Input type="phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLabel('status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <span className="text-success">Hoạt động</span>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <span className="text-destructive">Ngưng hoạt động</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="assignedUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{getLabel('assignedUnit')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="serviceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{getLabel('serviceNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Permissions Section */}
        <div className="space-y-4">
          <Label>Quyền truy cập</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(form.watch('permissions') || {})
              .filter(([module]) => !$generalPerms.includes(module))
              .map(([module, perms]) => (
                <div key={module} className="space-y-2 p-4 rounded-lg bg-muted">
                  <Label className="capitalize text-secondary font-semibold">
                    {getPermissionLabel(module) || module}
                  </Label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(perms)
                      .filter(([p]) => p !== '_id')
                      .map(([perm, value]) => (
                        <div key={perm} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module}-${perm}`}
                            checked={!!value}
                            onCheckedChange={(checked) => {
                              form.setValue(
                                `permissions.${module}.${perm as 'read' | 'write' | 'delete'}`,
                                !!checked
                              )
                            }}
                          />
                          <label
                            htmlFor={`${module}-${perm}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {getPermissionLabel(perm) ||
                              perm.charAt(0).toUpperCase() + perm.slice(1)}
                          </label>
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
