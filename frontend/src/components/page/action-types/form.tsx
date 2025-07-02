import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { actionTypeService } from '@/lib/services/action-types'
import { ActionTypeFormSchema, type ActionTypeFormValues } from '@/lib/types/schemas.type'
import { useLoader } from '@/contexts/loader'
import { STEP_TABS } from '@/constants/general'

interface ActionTypeFormProps {
  initialData?: any
  onSubmit: (data: ActionTypeFormValues) => void
  onCancel?: () => void
}

export default function ActionTypeForm({ initialData, onSubmit, onCancel }: ActionTypeFormProps) {
  const form = useForm<ActionTypeFormValues>({
    resolver: zodResolver(ActionTypeFormSchema),
    defaultValues: {
      name: '',
      step: 1,
      toStep: 2,
      order: 1,
      ...initialData,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const loader = useLoader()

  useEffect(() => {
    if (id && id !== 'new') {
      setIsEditing(true)
      fetchActionType()
    }
  }, [id])

  const fetchActionType = async () => {
    if (!id || id === 'new') return

    loader.show()
    try {
      const data = await actionTypeService.getOne(id)
      form.reset({
        name: data.name,
        step: data.step,
        toStep: data.toStep,
        order: data.order,
      })
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      navigate(-1)
    } finally {
      loader.hide()
    }
  }

  const handleFormSubmit = async (formData: ActionTypeFormValues) => {
    setIsLoading(true)
    try {
      onSubmit(formData)
    } catch (error: any) {
      console.error(error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-2 space-y-2">
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Thứ tự</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Nhập thứ tự"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6 space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Hạng mục</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập hạng mục" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="step"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Bước</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn bước" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STEP_TABS.map((tab) => (
                        <SelectItem key={tab.value} value={tab.value.toString()}>
                          {tab.value} - {tab.label}
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
              name="toStep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bước tiếp theo</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn bước tiếp theo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STEP_TABS.map((tab) => (
                        <SelectItem key={tab.value} value={tab.value.toString()}>
                          {tab.value} - {tab.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
