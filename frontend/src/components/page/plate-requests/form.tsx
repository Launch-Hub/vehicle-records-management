import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PlateRequest } from '@/lib/types/tables.type'

const plateRequestSchema = z.object({
  bulk: z.string().min(1, 'Lô yêu cầu là bắt buộc'),
  color: z.string().min(1, 'Màu biển số là bắt buộc'),
  vehicleType: z.string().min(1, 'Loại xe là bắt buộc'),
  letter: z.string().min(1, 'Chữ cái là bắt buộc'),
  suffixNumber: z.string().min(1, 'Số hiệu biển số là bắt buộc'),
  createdBy: z.string().min(1, 'Người yêu cầu là bắt buộc'),
  updatedBy: z.string().optional(),
})

type PlateRequestFormData = z.infer<typeof plateRequestSchema>

interface PlateRequestFormProps {
  onSubmit: (action: 'create' | 'update' | 'copy', data: Omit<PlateRequest, '_id'>) => void
  initialData?: PlateRequest
  isCopying?: boolean
}

const vehicleTypes = [
  { value: 'Ô tô', label: 'Ô tô' },
  { value: 'Xe máy', label: 'Xe máy' },
  { value: 'Xe tải', label: 'Xe tải' },
  { value: 'Xe khách', label: 'Xe khách' },
]

const colors = [
  { value: 'Xanh', label: 'Xanh' },
  { value: 'Trắng', label: 'Trắng' },
  { value: 'Vàng', label: 'Vàng' },
  { value: 'Đỏ', label: 'Đỏ' },
  { value: 'Đen', label: 'Đen' },
]

const letters = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: 'H', label: 'H' },
  { value: 'I', label: 'I' },
  { value: 'J', label: 'J' },
  { value: 'K', label: 'K' },
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'N', label: 'N' },
  { value: 'O', label: 'O' },
  { value: 'P', label: 'P' },
  { value: 'Q', label: 'Q' },
  { value: 'R', label: 'R' },
  { value: 'S', label: 'S' },
  { value: 'T', label: 'T' },
  { value: 'U', label: 'U' },
  { value: 'V', label: 'V' },
  { value: 'W', label: 'W' },
  { value: 'X', label: 'X' },
  { value: 'Y', label: 'Y' },
  { value: 'Z', label: 'Z' },
]

export default function PlateRequestForm({ onSubmit, initialData, isCopying }: PlateRequestFormProps) {
  const form = useForm<PlateRequestFormData>({
    resolver: zodResolver(plateRequestSchema),
    defaultValues: {
      bulk: '',
      color: '',
      vehicleType: '',
      letter: '',
      suffixNumber: '',
      createdBy: '',
      updatedBy: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        bulk: initialData.bulk || '',
        color: initialData.color || '',
        vehicleType: initialData.vehicleType || '',
        letter: initialData.letter || '',
        suffixNumber: initialData.suffixNumber || '',
        createdBy: initialData.createdBy || '',
        updatedBy: initialData.updatedBy || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: PlateRequestFormData) => {
    const action = isCopying ? 'copy' : initialData ? 'update' : 'create'
    onSubmit(action, data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin yêu cầu dập biển số</CardTitle>
        <CardDescription>
          {isCopying ? 'Sao chép yêu cầu dập biển số mới' : 'Nhập thông tin yêu cầu dập biển số'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bulk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lô yêu cầu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập lô yêu cầu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu biển số</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn màu biển số" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại xe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại xe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chữ cái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chữ cái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {letters.map((letter) => (
                          <SelectItem key={letter.value} value={letter.value}>
                            {letter.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suffixNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hiệu biển số</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số hiệu biển số" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người yêu cầu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên người yêu cầu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="updatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người nhận biển số</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên người nhận biển số" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" variant="default">
                {isCopying ? 'Sao chép' : initialData ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 