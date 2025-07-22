import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Plus, Trash2, PlusCircle, PrinterIcon, X } from 'lucide-react'
import type {
  Procedure,
  ProcedureStep,
  VehicleRecord,
  Bulk,
  ActionType,
} from '@/lib/types/tables.type'
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
import { useDebounce } from '@/lib/hooks/use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import BulkForm from '@/components/page/bulks/form'
import { uploadService } from '@/lib/services/upload'
import { QRCodeCanvas } from 'qrcode.react'
import QRPrint from '@/components/shared/qr-code/qr-print'
import VehicleRecordSearch from './vehicle-search'
import { LAST_STEP } from '@/constants/general'
import { Checkbox } from '@/components/ui/checkbox'

interface ProcedureFormProps {
  initialData?: Procedure
  isCopying?: boolean
  onSubmit: (data: Omit<Procedure, '_id'>) => void
  onCancel?: () => void
  isNew?: boolean
  step?: number
  submitButtonText?: string
}

export default function ProcedureForm({
  initialData,
  onSubmit,
  onCancel,
  isNew = false,
  step = 1,
  submitButtonText = 'Tiếp nhận',
}: ProcedureFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Omit<Procedure, '_id'> & { isPromoteIdentityPlate?: boolean }>({
    defaultValues: initialData || {
      recordId: '', // keep as recordId for frontend compatibility
      bulkId: undefined,
      registrationType: '',
      currentStep: step,
      steps: [],
      dueDate: new Date().getTime() + 48 * 60 * 60 * 1000,
      status: 'pending',
      paidAmount: '',
      action: '', // temp for step
      newPlate: '',
      returnType: '',
      isPromoteIdentityPlate: false,
    },
  })

  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([])

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
    vehicleType: 'Ô tô',
  })
  const [existingRecord, setExistingRecord] = useState<VehicleRecord | null>(null)
  const [isCreatingRecord, setIsCreatingRecord] = useState(false)

  // Bulk selection states
  const [bulks, setBulks] = useState<Bulk[]>([])
  const [openBulkSelect, setOpenBulkSelect] = useState(false)
  const [bulkSearch, setBulkSearch] = useState('')
  const [isFetchingBulks, setIsFetchingBulks] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)

  // Action types states
  const [actionTypes, setActionTypes] = useState<ActionType[]>([])
  const [isFetchingActionTypes, setIsFetchingActionTypes] = useState(false)

  // State for step 1 image upload
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [useCustomColor, setUseCustomColor] = useState(false)

  // const debouncedRecordSearch = useDebounce(recordSearch, 500)
  const debouncedBulkSearch = useDebounce(bulkSearch, 500)

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

  const fetchActionTypes = useCallback(async () => {
    setIsFetchingActionTypes(true)
    try {
      const res = await api.get('/action-types', {
        params: { step: step, pageIndex: 0, pageSize: 100 },
      })
      if (res.data.items) {
        setActionTypes(res.data.items)
      }
    } catch (error) {
      console.error('Failed to fetch action types', error)
    } finally {
      setIsFetchingActionTypes(false)
    }
  }, [step])

  useEffect(() => {
    fetchActionTypes()
  }, [fetchActionTypes])

  useEffect(() => {
    fetchBulks(debouncedBulkSearch)
  }, [debouncedBulkSearch, fetchBulks])

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

  // Handle step 1 image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImageUrl(URL.createObjectURL(file)) // for preview only
  }

  // Handle image removal
  const handleRemoveImage = () => {
    setImage(null)
    setImageUrl(null)
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Handle step image removal
  const handleRemoveStepImage = (stepIndex: number) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], attachments: [] }
    setSteps(updatedSteps)
  }

  const handleFormSubmit = async (data: Omit<Procedure, '_id'>) => {
    try {
      console.log('dueDate from form data:', data.dueDate)
      let recordId = data.recordId
      // If no existing record and we have record fields, create a new record
      if (!existingRecord && recordFields.plateNumber) {
        setIsCreatingRecord(true)
        try {
          const recordData = {
            ...recordFields,
            status: 'idle',
            archiveAt: null,
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

      if (!recordId) {
        toast.error('Vui lòng chọn hoặc tạo một hồ sơ xe.')
        return
      }
      // Find the action type ID for the selected registration type
      const selectedActionType = actionTypes.find((at) =>
        step === 1 ? at.name === getValues('registrationType') : at.name === getValues('action')
      )
      if (!selectedActionType?._id) {
        toast.error('Vui lòng chọn phương thức xử lý hợp lệ.')
        return
      }

      // Upload image if present and not yet uploaded
      let uploadedImageUrl = imageUrl
      if (image && (!imageUrl || imageUrl.startsWith('blob:'))) {
        setIsUploadingImage(true)
        try {
          const res = await uploadService.uploadImage(image)
          uploadedImageUrl = res.file.storedName
          setImageUrl(res.file.storedName)
        } catch (error) {
          console.error('Failed to upload image', error)
          setIsUploadingImage(false)
          return
        }
        setIsUploadingImage(false)
      }
      // Prepare step 1 with attachment if creating
      const finalSteps = initialData ? steps : []

      if (selectedActionType) {
        finalSteps.push({
          order: steps.length + 1,
          step: step,
          title: selectedActionType.name,
          action: selectedActionType._id, // Use ObjectId instead of name
          note: '',
          attachments: uploadedImageUrl ? [uploadedImageUrl] : [],
          isCompleted: selectedActionType.toStep === LAST_STEP,
        })

        // step is finished => move to the next step
        data.currentStep = Number(selectedActionType.toStep)
      }

      // Update bulk size if procedure is created successfully
      if (data.bulkId) {
        try {
          await api.patch(`/bulks/${data.bulkId}/size`, { increment: 1 })
        } catch (error) {
          console.error('Failed to update bulk size', error)
        }
      }
      // Ensure dueDate is a valid Date object

      // Map frontend fields to backend fields
      onSubmit({
        ...data,
        record: recordId,
        bulk: data.bulkId,
        steps: finalSteps,
        paidAmount: data.paidAmount,
        newPlate: data.newPlate,
        returnType: data.returnType,
        isPromoteIdentityPlate: data.isPromoteIdentityPlate,
      } as any)
    } catch (error) {
      console.error('Failed to submit procedure', error)
    }
  }

  const addStep = () => {
    const newStep: ProcedureStep = {
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

  const updateStep = (index: number, field: keyof ProcedureStep, value: any) => {
    const updatedSteps = [...steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setSteps(updatedSteps)
  }

  const isEditing = !!initialData?._id
  const [showQR, setShowQR] = useState(false)
  const [showQRPrint, setShowQRPrint] = useState(false)
  const recordId = existingRecord?._id || getValues('recordId')
  const recordDetailUrl = recordId
    ? `${window.location.origin}/registration-history/${recordId}`
    : ''

  // Handler to update vehicle record fields when a vehicle is selected from search
  const handleVehicleSelected = (vehicle: VehicleRecord) => {
    setExistingRecord(vehicle)
    setValue('recordId', vehicle._id)
    setRecordFields({
      plateNumber: vehicle.plateNumber,
      color: vehicle.color,
      identificationNumber: vehicle.identificationNumber,
      engineNumber: vehicle.engineNumber,
      registrant: vehicle.registrant,
      phone: vehicle.phone || '',
      email: vehicle.email || '',
      address: vehicle.address || '',
      note: vehicle.note || '',
      vehicleType: vehicle.vehicleType || 'Ô tô',
    })
    toast.success('Đã chọn phương tiện.')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-3/4 grid grid-cols-2 md:grid-cols-3 gap-6">
          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="registrationType" className="required">
                {step === 1 ? 'Trạng thái đăng ký' : 'Phương thức xử lý'}
              </Label>
              <div className="flex gap-2 items-end">
                <Select
                  value={watch('registrationType')}
                  onValueChange={(value) => setValue('registrationType', value as any)}
                  disabled={isFetchingActionTypes || isSubmitting}
                >
                  <SelectTrigger id="registrationType" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái đăng ký" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((actionType) => (
                      <SelectItem key={actionType._id} value={actionType.name}>
                        {actionType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="action" className="required">
                {step === 1 ? 'Trạng thái đăng ký' : 'Phương thức xử lý'}
              </Label>
              <div className="flex gap-2 items-end">
                <Select
                  value={watch('action')}
                  onValueChange={(value) => setValue('action', value as any)}
                  disabled={isFetchingActionTypes || isSubmitting}
                >
                  <SelectTrigger id="actionType" className="w-full">
                    <SelectValue placeholder="Chọn phương thức xử lý" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((actionType) => (
                      <SelectItem key={actionType._id} value={actionType.name}>
                        {actionType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-2 w-full">
              <Label htmlFor="bulkId">Kiểm tra lần nhập</Label>
              <div className="w-full flex gap-2">
                <Popover open={openBulkSelect} onOpenChange={setOpenBulkSelect}>
                  <PopoverTrigger asChild disabled={isFetchingBulks || isSubmitting}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBulkSelect}
                      className="flex-1 justify-between"
                    >
                      {watch('bulkId')
                        ? bulks.find((b) => b._id === watch('bulkId'))?.name
                        : 'Chọn lần nhập (không bắt buộc)'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm lần nhập" onValueChange={setBulkSearch} />
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
                    <BulkForm onSubmit={handleCreateBulk} onCancel={() => setShowBulkForm(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 w-full">
              <Label htmlFor="paidAmount">Phí xử lý</Label>
              <div className="w-full flex gap-2">
                <Select
                  value={watch('paidAmount')}
                  onValueChange={(value) => setValue('paidAmount', value, { shouldValidate: true })}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn số tiền" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50000">50.000đ</SelectItem>
                    <SelectItem value="100000">100.000đ</SelectItem>
                    <SelectItem value="150000">150.000đ</SelectItem>
                    <SelectItem value="1000000">1.000.000đ</SelectItem>
                    <SelectItem value="2000000">2.000.000đ</SelectItem>
                    <SelectItem value="4000000">4.000.000đ</SelectItem>
                    <SelectItem value="20000000">20.000.000đ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2 w-full">
              <Label htmlFor="newPlate">Biển số mới (nếu có)</Label>
              <div className="w-full flex gap-2">
                <Input
                  id="newPlate"
                  placeholder="Biển số mới (nếu có)"
                  value={watch('newPlate')}
                  onChange={(e) => setValue('newPlate', e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <Label htmlFor="_"></Label>

              <div className="w-full flex gap-2 items-center">
                <Checkbox
                  id="isPromoteIdentityPlate"
                  checked={!!watch('isPromoteIdentityPlate')}
                  onCheckedChange={(e) => setValue('isPromoteIdentityPlate', !!e)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isPromoteIdentityPlate">Đề xuất dập biển định danh</Label>
              </div>
              <div className="w-full flex gap-2 items-center">
                <Checkbox
                  id="isPromoteBusinessPlate"
                  checked={!!watch('isPromoteBusinessPlate')}
                  onCheckedChange={(e) => setValue('isPromoteBusinessPlate', !!e)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isPromoteBusinessPlate">Đề xuất dập biển vàng</Label>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-2 w-full">
              <Label htmlFor="returnType">Hình thức trả kết quả</Label>
              <div className="w-full flex gap-2">
                <Select
                  value={watch('returnType')}
                  onValueChange={(value) => setValue('returnType', value, { shouldValidate: true })}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn hình thức trả kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Trả trực tiếp</SelectItem>
                    <SelectItem value="post_office">Trả qua bưu điện</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="image">Đính kèm</Label>
            <div className="flex items-start gap-4">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                disabled={isUploadingImage}
                className="flex-shrink-0"
              >
                {isUploadingImage ? 'Đang tải lên...' : 'Chọn tệp'}
              </Button>
              {imageUrl && (
                <div className="relative inline-block">
                  <img
                    src={imageUrl.startsWith('blob:') ? imageUrl : `/uploads/du/${imageUrl}`}
                    alt="Ảnh đính kèm"
                    className="max-h-20 rounded border ml-2"
                    style={{ maxWidth: 80 }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                {...register('note')}
                placeholder="Nhập ghi chú (tùy chọn)"
                rows={3}
              />
            </div> */}
        </div>

        <div className="w-1/4 space-y-2">
          <div className="h-[14px]"></div>
          <div className="flex justify-end gap-2">
            {/* Print and QR buttons */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (recordId) {
                  setShowQRPrint(true)
                } else {
                  // Show error or alert that no record is selected
                  alert('Vui lòng chọn hoặc tạo hồ sơ xe trước khi in mã QR')
                }
              }}
              disabled={!recordId}
            >
              <PrinterIcon />
              In mã
            </Button>

            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mã QR xem lịch sử hồ sơ</DialogTitle>
                </DialogHeader>
                {recordId && (
                  <div className="flex flex-col items-center gap-4">
                    <QRCodeCanvas
                      value={recordDetailUrl}
                      size={200}
                      level="H"
                      // includeMargin
                      // marginSize={0}
                      bgColor="#fff"
                      fgColor="#000"
                    />
                    <div className="text-xs break-all text-center">{recordDetailUrl}</div>
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                      <PrinterIcon className="mr-2" />
                      In mã
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Huỷ bỏ
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isCreatingRecord}>
              {isCreatingRecord ? 'Đang xử lý...' : submitButtonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicle Search Section */}
      <VehicleRecordSearch
        onVehicleSelected={handleVehicleSelected}
        recordFields={recordFields}
        setRecordFields={setRecordFields}
        useCustomColor={useCustomColor}
        setUseCustomColor={setUseCustomColor}
      />
      {/* Accordion moved to VehicleRecordSearch */}

      {/* QR Print Component */}
      {showQRPrint && recordDetailUrl && (
        <QRPrint
          url={recordDetailUrl}
          title="Mã QR xem lịch sử hồ sơ"
          onPrintComplete={() => setShowQRPrint(false)}
        />
      )}

      {/* Don't touch this below code please. It's not related */}
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
                      <Label htmlFor="image">Đính kèm</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                      />
                      {isUploadingImage && <div>Đang tải lên...</div>}
                      {imageUrl && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={
                              imageUrl.startsWith('blob:') ? imageUrl : `/uploads/du/${imageUrl}`
                            }
                            alt="Ảnh bước 1"
                            className="max-h-40 rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {step.attachments && step.attachments.length > 0 && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={`/uploads/du/${step.attachments[0]}`}
                            alt="Ảnh bước"
                            className="max-h-40 rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => handleRemoveStepImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
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
    </form>
  )
}
