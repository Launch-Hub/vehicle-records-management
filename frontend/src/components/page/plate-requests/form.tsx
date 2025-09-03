import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { PlateRequest } from '@/lib/types/tables.type'
import { generateBulkName } from '@/lib/utils'
import { PLATE_COLORS } from '@/constants/general'
import { useAuth } from '@/contexts/auth'

const plateRequestSchema = z
  .object({
    bulk: z.string().min(1, 'Lô yêu cầu là bắt buộc'),
    color: z.string().min(1, 'Màu biển số là bắt buộc'),
    vehicleType: z.string().min(1, 'Loại xe là bắt buộc'),
    letter: z.string().min(1, 'Chữ cái là bắt buộc'),
    rangeFrom: z.string().min(1, 'Số bắt đầu là bắt buộc'),
    rangeTo: z.string().min(1, 'Số kết thúc là bắt buộc'),
    excludedNumbers: z.string().optional(),
    createdBy: z.string().min(1, 'Người yêu cầu là bắt buộc'),
    updatedBy: z.string().optional(),
    // New fields from updated model
    total: z.number().min(0, 'Tổng số biển phải là số dương').optional(),
    remaining: z.number().min(0, 'Số biển còn lại phải là số dương').optional(),
    receivedAt: z.date().optional(),
    receivedBy: z.string().optional(),
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

const colors = PLATE_COLORS.map((color) => ({
  value: color.label,
  label: color.label,
}))

export default function PlateRequestForm({
  onSubmit,
  initialData,
  isCopying,
}: PlateRequestFormProps) {
  const { user } = useAuth()
  const form = useForm<PlateRequestFormData>({
    resolver: zodResolver(plateRequestSchema),
    defaultValues: {
      bulk: generateBulkName(),
      color: '',
      vehicleType: '',
      letter: '',
      rangeFrom: '',
      rangeTo: '',
      excludedNumbers: '',
      createdBy: '',
      updatedBy: '',
      total: 0,
      remaining: 0,
      receivedAt: undefined,
      receivedBy: '',
    },
  })

  const watchedValues = form.watch()

  // Calculate preview of numbers to be generated
  const previewNumbers = useMemo(() => {
    const from = parseInt(watchedValues.rangeFrom || '0')
    const to = parseInt(watchedValues.rangeTo || '0')

    if (isNaN(from) || isNaN(to) || from < 0 || to < 0 || from > to) {
      return { total: 0, excluded: 0, toGenerate: 0 }
    }

    // Parse excluded numbers
    const excludedSet = new Set<number>()
    if (watchedValues.excludedNumbers && watchedValues.excludedNumbers.trim()) {
      const excludedParts = watchedValues.excludedNumbers.split(',').map((part) => part.trim())

      for (const part of excludedParts) {
        if (part.includes('-')) {
          // Handle range like "100-150"
          const [start, end] = part.split('-').map((num) => parseInt(num.trim()))
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) {
              if (i >= from && i <= to) {
                excludedSet.add(i)
              }
            }
          }
        } else {
          // Handle single number
          const num = parseInt(part)
          if (!isNaN(num) && num >= from && num <= to) {
            excludedSet.add(num)
          }
        }
      }
    }

    const total = to - from + 1
    const excluded = excludedSet.size
    const toGenerate = total - excluded

    return { total, excluded, toGenerate }
  }, [watchedValues.rangeFrom, watchedValues.rangeTo, watchedValues.excludedNumbers])

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      // Auto-generate bulk name for new creation
      form.setValue('bulk', generateBulkName())
      // Set createdBy to current user
      form.setValue('createdBy', user!._id)
    }
  }, [initialData, form, user])

  const handleSubmit = (data: PlateRequestFormData) => {
    try {
      if (initialData) {
        // For editing existing records, use the original single record format
        const action = isCopying ? 'copy' : 'update'
        onSubmit(action, {
          ...data,
          rangeFrom: parseInt(data.rangeFrom), // Use rangeFrom as suffixNumber for single records
          rangeTo: parseInt(data.rangeTo),
        } as Omit<PlateRequest, '_id'>)
      } else {
        // For new records, use bulk creation
        onSubmit('create', {
          bulk: data.bulk,
          color: data.color,
          vehicleType: data.vehicleType,
          letter: data.letter,
          rangeFrom: parseInt(data.rangeFrom),
          rangeTo: parseInt(data.rangeTo),
          excludedNumbers: data.excludedNumbers,
          createdBy: data.createdBy || user?.name || user?.email || 'Unknown',
          updatedBy: data.updatedBy,
          total: data.total,
          remaining: data.remaining,
          receivedAt: data.receivedAt,
          receivedBy: data.receivedBy,
        })
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  const isCreating = !initialData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin yêu cầu dập biển số</CardTitle>
        <CardDescription>
          {isCopying
            ? 'Sao chép yêu cầu dập biển số mới'
            : isCreating
            ? 'Tạo yêu cầu dập biển số hàng loạt theo khoảng số'
            : 'Chỉnh sửa yêu cầu dập biển số'}
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
                  <FormItem className="col-span-2">
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
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn màu biển số" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại xe" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Nhập chữ cái" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rangeFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Nhập số bắt đầu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rangeTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số kết thúc</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Nhập số kết thúc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excludedNumbers"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Số loại trừ (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập số cần loại trừ, phân cách bằng dấu phẩy. Ví dụ: 15, 20, 100-150"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" variant="default">
                {isCopying ? 'Sao chép' : isCreating ? 'Tạo yêu cầu' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Preview Section */}
        {isCreating && previewNumbers.toGenerate > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Xem trước</h4>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Tổng số trong khoảng:</span>
                <Badge variant="secondary">{previewNumbers.total}</Badge>
              </div>
              {previewNumbers.excluded > 0 && (
                <div className="flex items-center gap-2">
                  <span>Số loại trừ:</span>
                  <Badge variant="destructive">{previewNumbers.excluded}</Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>Sẽ tạo:</span>
                <Badge variant="default">{previewNumbers.toGenerate}</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
