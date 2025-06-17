import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash } from 'lucide-react'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { DICTIONARY } from '@/constants/dictionary'
import { PLATE_COLORS } from '@/constants/general'
import { Card, CardContent } from '@/components/ui/card'

interface RecordFormProps {
  initialData?: VehicleRecord
  isCopying?: boolean
  onSubmit: (action: 'create' | 'update' | 'copy', data: Omit<VehicleRecord, '_id'>) => void
  onCancel?: () => void
}

export function RecordForm({
  initialData,
  isCopying = false,
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Omit<VehicleRecord, '_id'>>({
    defaultValues: initialData || {
      plateNumber: '',
      color: '',
      identificationNumber: '',
      engineNumber: '',
      registrant: '',
      phone: '',
      email: '',
      address: '',
      issuer: '',
      note: '',
      status: 'new',
    },
  })

  const values = watch()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  useEffect(() => {
    console.log(values.plateNumber)
  }, [values.plateNumber])

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: Omit<VehicleRecord, '_id'>) => {
    const uploadedUrls: string[] = []

    for (const file of pendingFiles) {
      const formData = new FormData()
      const timestamp = Date.now()
      const ext = file.name.slice(file.name.lastIndexOf('.'))
      const base = file.name.replace(/\.[^/.]+$/, '')
      formData.append('file', file, `${base}-${timestamp}${ext}`)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      if (res.ok) {
        uploadedUrls.push(result.url)
      } else {
        console.error('Upload error:', result.message)
      }
    }

    data.attachmentUrls = [...(data.attachmentUrls || []), ...uploadedUrls]

    const action: 'create' | 'update' | 'copy' = isCopying
      ? 'copy'
      : initialData
      ? 'update'
      : 'create'

    onSubmit(action, data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex gap-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="required">
              {DICTIONARY['plateNumber']}
            </Label>
            <Input id="plateNumber" {...register('plateNumber', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificationNumber" className="required">
              {DICTIONARY['identificationNumber']}
            </Label>
            <Input
              id="identificationNumber"
              {...register('identificationNumber', { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="engineNumber" className="required">
              {DICTIONARY['engineNumber']}
            </Label>
            <Input id="engineNumber" {...register('engineNumber', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color" className="required">
              {DICTIONARY['color']}
            </Label>
            <Select value={watch('color')} onValueChange={(value) => setValue('color', value)}>
              <SelectTrigger id="color" className="w-full">
                <SelectValue placeholder="Chọn màu" />
              </SelectTrigger>
              <SelectContent>
                {PLATE_COLORS.map((c) => (
                  <SelectItem value={c.label} style={{ backgroundColor: c.color }}>
                    <span>{c.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrant" className="required">
              {DICTIONARY['registrant']}
            </Label>
            <Input id="registrant" {...register('registrant', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{DICTIONARY['phone']}</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{DICTIONARY['email']}</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="col-span-4 space-y-2">
            <Label htmlFor="address">{DICTIONARY['address']}</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="col-span-4 space-y-2">
            <Label>{DICTIONARY['archiveLocation']}</Label>
            <div className="grid grid-cols-5 gap-2">
              <Input
                placeholder="Kho"
                {...register('archiveLocation.storage', { required: true })}
              />
              <Input
                placeholder="Phòng"
                {...register('archiveLocation.room', { required: true })}
              />
              <Input placeholder="Dãy" {...register('archiveLocation.row', { required: true })} />
              <Input placeholder="Kệ" {...register('archiveLocation.shelf', { required: true })} />
              <Input
                placeholder="Tầng"
                {...register('archiveLocation.level', { required: true })}
              />
            </div>
          </div>
          {/* <div className="col-span-2 space-y-2">
          <Label htmlFor="registryCategory" className="required">
            {DICTIONARY['registryCategory']}
          </Label>
          <Input id="registryCategory" {...register('registryCategory', { required: true })} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="attachmentUrls">{DICTIONARY['attachmentUrls']}</Label>
          <Input
            id="attachmentUrls"
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              setPendingFiles((prev) => [...prev, ...files])
            }}
          />
          <div className="mt-2 space-y-1">
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                {file.name}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="note">{DICTIONARY['note']}</Label>
          <Textarea id="note" {...register('note')} />
        </div> */}
        </div>
        <div>
          <Card>
            <CardContent>{values.plateNumber}</CardContent>
          </Card>
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
