import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { getLabel } from '@/constants/dictionary'
import { PLATE_COLORS } from '@/constants/general'

interface RecordFormProps {
  initialData?: VehicleRecord
  isCopying?: boolean
  onSubmit: (data: Omit<VehicleRecord, '_id'>) => void
  onCancel?: () => void
}

export default function VehicleRecordForm({
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
      archiveAt: {
        storage: 'default',
        room: '',
        row: '',
        shelf: '',
        level: '',
      },
    },
  })

  const values = watch()

  const handleFormSubmit = async (data: Omit<VehicleRecord, '_id'>) => {
    onSubmit(data)
  }

  const renderPlate = () => {
    const splitPlateNumber = (plate: string) => {
      if (plate.includes('-')) {
        return plate
          .split('-')
          .map((e, i) =>
            i == 0 && e.length === 4
              ? e.slice(0, e.length - 2) + '-' + e.slice(e.length - 2)
              : i == 1 && e.length === 5
              ? e.slice(0, e.length - 2) + '.' + e.slice(e.length - 2)
              : e
          )
      } else {
        const match = plate.match(/^(.*?)(\d+)$/)
        if (match) {
          return [match[1], match[2].slice(0, 2) + '.' + match[2].slice(2)]
        } else {
          // If the format is unexpected, return the original
          return [plate]
        }
      }
    }
    const plateParts = splitPlateNumber(values.plateNumber!)

    return (
      <div
        className="w-full aspect-video border-4 border-black/70 p-2 rounded-xl flex flex-col gap-1 items-center text-4xl font-extrabold family-biensoxe"
        style={{
          backgroundColor: PLATE_COLORS.find((e) => e.label === values.color)?.color,
        }}
      >
        <div className="text-black/90">{plateParts[0]}</div>
        <div className="text-black/90 mb-1">{plateParts[1]}</div>
      </div>
    )
  }

  // useEffect(() => {
  //   console.log(values.plateNumber)
  //   const match = values.plateNumber.match('^[0-9]{2,2}[A-Z]{1,2}[0-9]{4,5}$')
  //   if (match) setPlateView(values.plateNumber)
  // }, [values.plateNumber])

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const isEditing = initialData && !isCopying

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex gap-16">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="required">
              {getLabel('plateNumber')}
            </Label>
            <Input id="plateNumber" {...register('plateNumber', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificationNumber" className="required">
              {getLabel('identificationNumber')}
            </Label>
            <Input
              id="identificationNumber"
              {...register('identificationNumber', { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="engineNumber" className="required">
              {getLabel('engineNumber')}
            </Label>
            <Input id="engineNumber" {...register('engineNumber', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color" className="required">
              {getLabel('color')}
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
              {getLabel('registrant')}
            </Label>
            <Input id="registrant" {...register('registrant', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{getLabel('phone')}</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{getLabel('email')}</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{getLabel('address')}</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="col-span-4 space-y-2">
            <Label>{getLabel('archiveAt')}</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="Kho" {...register('archiveAt.storage')} hidden />
              <Input placeholder="Phòng" {...register('archiveAt.room')} />
              <Input placeholder="Dãy" {...register('archiveAt.row')} />
              <Input placeholder="Kệ" {...register('archiveAt.shelf')} />
              <Input placeholder="Tầng" {...register('archiveAt.level')} />
            </div>
          </div>
        </div>
        {values.plateNumber && <div className="w-1/6 lg:pt-6">{renderPlate()}</div>}
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
