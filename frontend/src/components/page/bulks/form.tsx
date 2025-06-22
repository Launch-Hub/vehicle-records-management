import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Bulk } from '@/lib/types/tables.type'
import { BulkFormSchema } from '@/lib/types/schemas.type'
import http from '@/lib/axios'
import { format } from 'date-fns'
import { z } from 'zod'

type BulkFormData = z.infer<typeof BulkFormSchema>

interface BulkFormProps {
  initialData?: Bulk
  isCopying?: boolean
  onSubmit: (data: Partial<Bulk>) => void
  onCancel: () => void
}

export default function BulkForm({ initialData, isCopying, onSubmit, onCancel }: BulkFormProps) {
  const form = useForm<BulkFormData>({
    resolver: zodResolver(BulkFormSchema),
    defaultValues: {
      code: '',
      name: '',
      initSize: 0,
      currentSize: 0,
      note: '',
    },
  })

  useEffect(() => {
    if (!initialData) {
      // Generate default code for new bulks
      const generateDefaultFields = async () => {
        try {
          const { data } = await http.get('/bulks/count/today')
          const now = new Date()
          const codeDate = format(now, 'yyyyMMdd')
          const nameDate = format(now, 'dd/MM/yyyy')
          const dailyIndex = data.count + 1

          form.setValue('code', `${codeDate}-${dailyIndex}`)
          form.setValue('name', `Lô ${dailyIndex} ngày ${nameDate}`)
        } catch (error) {
          console.error('Failed to fetch todays bulk count:', error)
          // Fallback to a random code or let user input manually
          const now = new Date()
          const codeDate = format(now, 'yyyyMMdd')
          const nameDate = format(now, 'dd/MM/yyyy')
          form.setValue('code', `${codeDate}-1`)
          form.setValue('name', `Lô 1 ngày ${nameDate}`)
        }
      }
      generateDefaultFields()
    }
  }, [initialData, form])

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: isCopying ? '' : initialData.code,
        name: isCopying ? '' : initialData.name,
        initSize: initialData.initSize || 0,
        currentSize: initialData.currentSize || 0,
        note: initialData.note || '',
      })
    }
  }, [initialData, isCopying, form])

  const handleFormSubmit = form.handleSubmit((data: BulkFormData) => {
    onSubmit(data)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin lô</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="required">
                Mã lô
              </Label>
              <Input
                id="code"
                {...form.register('code')}
                placeholder="Nhập mã lô"
                className={form.formState.errors.code ? 'border-red-500' : ''}
              />
              {form.formState.errors.code && <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Tên lô
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Nhập tên lô"
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              {...form.register('note')}
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
