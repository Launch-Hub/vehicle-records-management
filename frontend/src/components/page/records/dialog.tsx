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
import type { VehicleRecord } from '@/lib/types/tables.type'
import { DICTIONARY } from '@/constants/dictionary'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Trash } from 'lucide-react'

export function RecordDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isCopying = false,
}: DialogProps<VehicleRecord>) {
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
      issuer: '',
      phone: '',
      email: '',
      address: '',
      registryCategory: '',
      attachmentUrls: [],
      archiveLocation: {
        storage: '',
        room: '',
        row: '',
        shelf: '',
        level: '',
      },
      description: '',
      note: '',
      status: 'new',
    },
  })
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const handleClose = () => {
    setPendingFiles([])
    reset()
    onClose()
  }

  const handleFormSubmit = async (data: Omit<VehicleRecord, '_id'>) => {
    // Upload files and get URLs
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

    // Merge uploaded URLs with existing (if any)
    data.attachmentUrls = [...(data.attachmentUrls || []), ...uploadedUrls]

    onSubmit(initialData ? 'update' : 'create', data)
    handleClose()
  }

  useEffect(() => {}, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-2xl max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plateNumber" className="required">
                {DICTIONARY['plateNumber']}
              </Label>
              <Input id="plateNumber" {...register('plateNumber', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="issuer" className="required">
                {DICTIONARY['issuer']}
              </Label>
              <Input id="issuer" {...register('issuer', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{DICTIONARY['phone']}</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{DICTIONARY['email']}</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="address">{DICTIONARY['address']}</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="registryCategory" className="required">
                {DICTIONARY['registryCategory']}
              </Label>
              <Input id="registryCategory" {...register('registryCategory', { required: true })} />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
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
                <Input
                  placeholder="Kệ"
                  {...register('archiveLocation.shelf', { required: true })}
                />
                <Input
                  placeholder="Tầng"
                  {...register('archiveLocation.level', { required: true })}
                />
              </div>
            </div>
            {/* <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="description">{DICTIONARY['description']}</Label>
              <Input id="description" {...register('description')} />
            </div> */}
            <div className="col-span-2 flex flex-col gap-2">
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
                      onClick={() => {
                        setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
                      }}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="note">{DICTIONARY['note']}</Label>
              <Textarea id="note" {...register('note')} />
            </div>

            {/* new by default */}
            {/* <div className="col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Đang xử lí</SelectItem>
                  <SelectItem value="pending">Tạm hoãn</SelectItem>
                  <SelectItem value="denied">Bị từ chối</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
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
