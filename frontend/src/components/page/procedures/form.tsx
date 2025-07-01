import { useEffect, useState, useCallback } from 'react'
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
import { Plus, Trash2, PlusCircle } from 'lucide-react'
import type { Procedure, ProcedureStepProps, VehicleRecord, Bulk } from '@/lib/types/tables.type'
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
import { PLATE_COLORS } from '@/constants/general'
import { getLabel } from '@/constants/dictionary'
import type { PaginationProps } from '@/lib/types/props'
import { useDebounce } from '@/lib/hooks/use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import BulkForm from '@/components/page/bulks/form'

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
      dueDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
      status: 'pending',
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

  // New states for record fields
  const [recordFields, setRecordFields] = useState({
    plateNumber: '',
    color: '',
    identificationNumber: '',
    engineNumber: '',
    registrant: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    vehicleType: 'Xe con',
  })
  const [existingRecord, setExistingRecord] = useState<VehicleRecord | null>(null)
  const [isCreatingRecord, setIsCreatingRecord] = useState(false)

  // Bulk selection states
  const [bulks, setBulks] = useState<Bulk[]>([])
  const [openBulkSelect, setOpenBulkSelect] = useState(false)
  const [bulkSearch, setBulkSearch] = useState('')
  const [isFetchingBulks, setIsFetchingBulks] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)

  const debouncedRecordSearch = useDebounce(recordSearch, 500)
  const debouncedBulkSearch = useDebounce(bulkSearch, 500)

  const fetchRecords = useCallback(
    async (searchQuery: string, page: number) => {
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
    },
    [recordPagination.pageSize]
  )

  const fetchBulks = useCallback(async (searchQuery: string) => {
    setIsFetchingBulks(true)
    try {
      const res = await api.get('/bulks', {
        params: { search: searchQuery, pageIndex: 0, pageSize: 100 },
      })
      if (res.data.items) {
        setBulks(res.data.items)
      }
    } catch (error) {
      console.error('Failed to fetch bulks', error)
    } finally {
      setIsFetchingBulks(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords(debouncedRecordSearch, 0)
  }, [debouncedRecordSearch, fetchRecords])

  useEffect(() => {
    fetchBulks(debouncedBulkSearch)
  }, [debouncedBulkSearch, fetchBulks])

  const handleLoadMoreRecords = () => {
    if (!isFetchingRecords && vehicleRecords.length < totalRecords) {
      fetchRecords(debouncedRecordSearch, recordPagination.pageIndex + 1)
    }
  }

  // Check for existing record when plate number changes
  const handlePlateNumberBlur = async () => {
    const plateNumber = recordFields.plateNumber.trim()
    if (!plateNumber) return

    try {
      const res = await api.get(`/records/search?plateNumber=${encodeURIComponent(plateNumber)}`)
      if (res.data && res.data.length > 0) {
        const record = res.data[0]
        setExistingRecord(record)
        setValue('recordId', record._id)
        // Auto-fill record fields
        setRecordFields({
          plateNumber: record.plateNumber,
          color: record.color,
          identificationNumber: record.identificationNumber,
          engineNumber: record.engineNumber,
          registrant: record.registrant,
          phone: record.phone || '',
          email: record.email || '',
          address: record.address || '',
          note: record.note || '',
          vehicleType: record.vehicleType || 'Xe con',
        })
      } else {
        setExistingRecord(null)
        setValue('recordId', '')
        // Keep the plate number but clear other fields
        setRecordFields((prev) => ({
          ...prev,
          plateNumber: plateNumber,
          color: '',
          identificationNumber: '',
          engineNumber: '',
          registrant: '',
          phone: '',
          email: '',
          address: '',
          note: '',
          vehicleType: 'Xe con',
        }))
      }
    } catch (error) {
      console.error('Failed to search for record', error)
    }
  }

  const handleCreateBulk = async (bulkData: Partial<Bulk>) => {
    try {
      const res = await api.post('/bulks', bulkData)
      const newBulk = res.data
      setBulks((prev) => [newBulk, ...prev])
      setValue('bulkId', newBulk._id)
      setShowBulkForm(false)
    } catch (error) {
      console.error('Failed to create bulk', error)
    }
  }

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setSteps(initialData.steps || [])
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: Omit<Procedure, '_id'>) => {
    try {
      let recordId = data.recordId

      // If no existing record and we have record fields, create a new record
      if (!existingRecord && recordFields.plateNumber) {
        setIsCreatingRecord(true)
        try {
          const recordData = {
            ...recordFields,
            status: 'idle',
            archiveAt: {
              storage: 'Kho A',
              room: '',
              row: '',
              shelf: '',
              level: '',
            },
          }
          const recordRes = await api.post('/records', recordData)
          recordId = recordRes.data._id
          setValue('recordId', recordId)
        } catch (error) {
          console.error('Failed to create record', error)
          return
        } finally {
          setIsCreatingRecord(false)
        }
      }

      const finalSteps = initialData ? steps : []
      const record = existingRecord || vehicleRecords.find((e) => e._id === recordId)

      // Update bulk size if procedure is created successfully
      if (data.bulkId) {
        try {
          await api.patch(`/bulks/${data.bulkId}/size`, { increment: 1 })
        } catch (error) {
          console.error('Failed to update bulk size', error)
        }
      }

      onSubmit({ ...data, recordId, steps: finalSteps, _tempRecord: record })
    } catch (error) {
      console.error('Failed to submit procedure', error)
    }
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

  const isEditing = !!initialData?._id

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">


      {/* Procedure Fields Section */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!hideBulkId && (
              <div className="space-y-2 w-full">
                <Label htmlFor="bulkId">Lần nhập</Label>
                <div className="w-full flex gap-2">
                  <Popover open={openBulkSelect} onOpenChange={setOpenBulkSelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBulkSelect}
                        className="w-full justify-between"
                      >
                        {watch('bulkId')
                          ? bulks.find((b) => b._id === watch('bulkId'))?.name
                          : 'Chọn lần nhập...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Tìm kiếm lần nhập..."
                          onValueChange={setBulkSearch}
                        />
                        <CommandEmpty>Không tìm thấy lần nhập.</CommandEmpty>
                        <CommandGroup>
                          {bulks.map((bulk) => (
                            <CommandItem
                              key={bulk._id}
                              value={bulk._id}
                              onSelect={(currentValue) => {
                                setValue(
                                  'bulkId',
                                  currentValue === watch('bulkId') ? '' : currentValue
                                )
                                setOpenBulkSelect(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  watch('bulkId') === bulk._id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {bulk.name} ({bulk.size} hồ sơ)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Dialog open={showBulkForm} onOpenChange={setShowBulkForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo lần nhập mới</DialogTitle>
                      </DialogHeader>
                      <BulkForm
                        onSubmit={handleCreateBulk}
                        onCancel={() => setShowBulkForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="registrationType" className="required">
                Hạng mục đăng ký
              </Label>
              <Select
                value={watch('registrationType')}
                onValueChange={(value) => setValue('registrationType', value as any)}
              >
                <SelectTrigger id="registrationType" className="w-full">
                  <SelectValue placeholder="Chọn hạng mục" />
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
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                {...register('note')}
                placeholder="Nhập ghi chú (tùy chọn)"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Fields Section */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin xe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plateNumber" className="required">
                {getLabel('plateNumber')}
              </Label>
              <Input
                id="plateNumber"
                value={recordFields.plateNumber}
                onChange={(e) =>
                  setRecordFields((prev) => ({
                    ...prev,
                    plateNumber: e.target.value.toUpperCase(),
                  }))
                }
                onBlur={handlePlateNumberBlur}
                placeholder="Nhập biển số xe..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="required">
                {getLabel('color')}
              </Label>
              <Select
                value={recordFields.color}
                onValueChange={(value) => setRecordFields((prev) => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn màu" />
                </SelectTrigger>
                <SelectContent>
                  {PLATE_COLORS.map((color) => (
                    <SelectItem key={color.label} value={color.label}>
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber" className="required">
                {getLabel('identificationNumber')}
              </Label>
              <Input
                id="identificationNumber"
                value={recordFields.identificationNumber}
                onChange={(e) =>
                  setRecordFields((prev) => ({ ...prev, identificationNumber: e.target.value }))
                }
                placeholder="Nhập số khung..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineNumber" className="required">
                {getLabel('engineNumber')}
              </Label>
              <Input
                id="engineNumber"
                value={recordFields.engineNumber}
                onChange={(e) =>
                  setRecordFields((prev) => ({ ...prev, engineNumber: e.target.value }))
                }
                placeholder="Nhập số máy..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrant" className="required">
                {getLabel('registrant')}
              </Label>
              <Input
                id="registrant"
                value={recordFields.registrant}
                onChange={(e) =>
                  setRecordFields((prev) => ({ ...prev, registrant: e.target.value }))
                }
                placeholder="Nhập tên chủ xe..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{getLabel('phone')}</Label>
              <Input
                id="phone"
                value={recordFields.phone}
                onChange={(e) => setRecordFields((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Nhập số điện thoại..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{getLabel('email')}</Label>
              <Input
                id="email"
                type="email"
                value={recordFields.email}
                onChange={(e) => setRecordFields((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{getLabel('address')}</Label>
              <Input
                id="address"
                value={recordFields.address}
                onChange={(e) => setRecordFields((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Nhập địa chỉ..."
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="recordNote">Ghi chú hồ sơ</Label>
              <Textarea
                id="recordNote"
                value={recordFields.note}
                onChange={(e) => setRecordFields((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Nhập ghi chú cho hồ sơ..."
                rows={2}
              />
            </div>
          </div>

          {existingRecord && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ✓ Tìm thấy hồ sơ hiện có cho biển số {existingRecord.plateNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Các bước đăng ký</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm bước
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Huỷ bỏ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isCreatingRecord}>
          {isCreatingRecord
            ? 'Đang tạo hồ sơ...'
            : initialData && !isCopying
            ? 'Lưu thay đổi'
            : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}
