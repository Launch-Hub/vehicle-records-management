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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import type { Procedure, ProcedureStepProps, VehicleRecord } from '@/lib/types/tables.type'
import api from '@/lib/axios'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { REGISTRATION_TYPES } from '@/constants/mock-data'
import type { PaginationProps } from '@/lib/types/props'

// Debounce Hook
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

interface ProcedureFormProps {
  initialData?: Procedure
  isCopying?: boolean
  hideBulkId?: boolean
  onSubmit: (data: Omit<Procedure, '_id'>) => void
  onCancel?: () => void
}

export default function ProcedureForm({
  initialData,
  isCopying = false,
  hideBulkId = false,
  onSubmit,
  onCancel,
}: ProcedureFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Omit<Procedure, '_id'>>({
    defaultValues: initialData || {
      recordId: '',
      bulkId: undefined,
      registrationType: '',
      steps: [],
      status: 'draft',
    },
  })

  const [steps, setSteps] = useState<ProcedureStepProps[]>(initialData?.steps || [])
  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([])
  const [openRecordSelect, setOpenRecordSelect] = useState(false)
  const [recordPagination, setRecordPagination] = useState<PaginationProps>({
    pageIndex: 0,
    pageSize: 50,
  })
  const [totalRecords, setTotalRecords] = useState(0)
  const [recordSearch, setRecordSearch] = useState('')
  const [isFetchingRecords, setIsFetchingRecords] = useState(false)

  const debouncedRecordSearch = useDebounce(recordSearch, 500)

  const fetchRecords = async (searchQuery: string, page: number) => {
    setIsFetchingRecords(true)
    try {
      const res = await api.get('/records', {
        params: { search: searchQuery, pageIndex: page, pageSize: recordPagination.pageSize },
      })
      if (res.data.items) {
        setVehicleRecords((prev) => (page === 0 ? res.data.items : [...prev, ...res.data.items]))
        setTotalRecords(res.data.total)
        setRecordPagination((prev) => ({ ...prev, pageIndex: page }))
      }
    } catch (error) {
      console.error('Failed to fetch vehicle records', error)
    } finally {
      setIsFetchingRecords(false)
    }
  }

  useEffect(() => {
    fetchRecords(debouncedRecordSearch, 0)
  }, [debouncedRecordSearch])

  const handleLoadMoreRecords = () => {
    if (!isFetchingRecords && vehicleRecords.length < totalRecords) {
      fetchRecords(debouncedRecordSearch, recordPagination.pageIndex + 1)
    }
  }

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setSteps(initialData.steps || [])
    }
  }, [initialData, reset])

  const handleFormSubmit = (data: Omit<Procedure, '_id'>) => {
    const finalSteps = initialData ? steps : []
    onSubmit({ ...data, steps: finalSteps })
  }

  const addStep = () => {
    const newStep: ProcedureStepProps = {
      order: steps.length + 1,
      step: steps.length + 1,
      title: '',
      action: '',
      note: '',
      attachments: [],
      isCompleted: false,
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: keyof ProcedureStepProps, value: any) => {
    const updatedSteps = [...steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setSteps(updatedSteps)
  }

  const statusOptions = [
    { value: 'draft', label: 'Nháp' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'rejected', label: 'Đã từ chối' },
    { value: 'cancelled', label: 'Đã huỷ' },
    { value: 'archived', label: 'Đã lưu trữ' },
  ]

  const isEditing = !!initialData?._id

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="recordId" className="required">
            Hồ sơ
          </Label>
          <Popover open={openRecordSelect} onOpenChange={setOpenRecordSelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRecordSelect}
                className="w-full justify-between"
              >
                {watch('recordId')
                  ? vehicleRecords.find((r) => r._id === watch('recordId'))?.plateNumber
                  : 'Chọn hồ sơ...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Tìm kiếm biển số..."
                  onValueChange={setRecordSearch}
                />
                <CommandEmpty>Không tìm thấy hồ sơ.</CommandEmpty>
                <CommandGroup>
                  {vehicleRecords.map((record) => (
                    <CommandItem
                      key={record._id}
                      value={record._id}
                      onSelect={(currentValue) => {
                        setValue('recordId', currentValue === watch('recordId') ? '' : currentValue)
                        setOpenRecordSelect(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          watch('recordId') === record._id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {record.plateNumber} - {record.registrant}
                    </CommandItem>
                  ))}
                  {vehicleRecords.length < totalRecords && (
                    <CommandItem
                      onSelect={handleLoadMoreRecords}
                      className="justify-center text-center cursor-pointer"
                    >
                      {isFetchingRecords ? 'Đang tải...' : 'Tải thêm'}
                    </CommandItem>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {!hideBulkId && (
          <div className="space-y-2">
            <Label htmlFor="bulkId">Lô (tùy chọn)</Label>
            <Input id="bulkId" {...register('bulkId')} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="registrationType" className="required">
            Loại đăng ký
          </Label>
          <Select
            value={watch('registrationType')}
            onValueChange={(value) => setValue('registrationType', value as any)}
          >
            <SelectTrigger id="registrationType" className="w-full">
              <SelectValue placeholder="Chọn loại đăng ký" />
            </SelectTrigger>
            <SelectContent>
              {REGISTRATION_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as any)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Các bước thủ tục</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm bước
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Bước {step.step}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={step.isCompleted ? 'default' : 'secondary'}>
                          {step.isCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Tiêu đề</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="Nhập tiêu đề bước"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hành động</Label>
                      <Input
                        value={step.action}
                        onChange={(e) => updateStep(index, 'action', e.target.value)}
                        placeholder="Nhập hành động"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ghi chú</Label>
                      <Textarea
                        value={step.note || ''}
                        onChange={(e) => updateStep(index, 'note', e.target.value)}
                        placeholder="Nhập ghi chú"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
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
