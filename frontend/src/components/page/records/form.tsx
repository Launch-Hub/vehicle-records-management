import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { VehicleRecordSchema, type VehicleRecordFormValues } from '@/lib/types/schemas.type'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

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
  const form = useForm<VehicleRecordFormValues>({
    resolver: zodResolver(VehicleRecordSchema),
    defaultValues: {
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
      registrationType: '',
      attachmentUrls: [],
      description: '',
      ...initialData,
    },
  })

  const values = form.watch()

  const handleFormSubmit = async (data: VehicleRecordFormValues) => {
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
      form.reset(initialData)
    }
  }, [initialData, form])

  const isEditing = initialData && !isCopying

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex gap-16">
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('plateNumber')}</FormLabel>
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
                name="identificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('identificationNumber')}</FormLabel>
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
                name="engineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('engineNumber')}</FormLabel>
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('color')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATE_COLORS.map((c) => (
                          <SelectItem
                            key={c.label}
                            value={c.label}
                            style={{ backgroundColor: c.color }}
                          >
                            <span>{c.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="registrant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('registrant')}</FormLabel>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLabel('phone')}</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLabel('email')}</FormLabel>
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLabel('address')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4 space-y-2">
              <Label>{getLabel('archiveAt')}</Label>
              <div className="grid grid-cols-4 gap-2">
                <Input placeholder="Kho" {...form.register('archiveAt.storage')} hidden />
                <FormField
                  control={form.control}
                  name="archiveAt.room"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Phòng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="archiveAt.row"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Dãy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="archiveAt.shelf"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Kệ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="archiveAt.level"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Tầng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
