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
import { Plus, Trash2, PlusCircle, ChevronDown, PrinterIcon } from 'lucide-react'
import type { Procedure, ProcedureStep, VehicleRecord, Bulk } from '@/lib/types/tables.type'
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
import { PLATE_COLORS, VEHICLE_TYPES } from '@/constants/general'
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
import { uploadService } from '@/lib/services/upload'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { QrCodeIcon } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import QRPrint from '@/components/shared/qr-code/qr-print'

interface ProcedureFormProps {
  initialData?: Procedure
  isCopying?: boolean
  hideBulkId?: boolean
  onSubmit: (data: Omit<Procedure, '_id'>) => void
  onCancel?: () => void
}

export default function ProcedureForm({
  initialData,
  hideBulkId = false,
  onSubmit,
  onCancel,
}: ProcedureFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Omit<Procedure, '_id'>>({
    defaultValues: initialData || {
      recordId: '', // keep as recordId for frontend compatibility
      bulkId: undefined,
      registrationType: '',
      currentStep: 1,
      steps: [],
      dueDate: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
      status: 'pending',
    },
  })

  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
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
  const [actionTypes, setActionTypes] = useState<any[]>([])
  const [isFetchingActionTypes, setIsFetchingActionTypes] = useState(false)

  // State for step 1 image upload
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [useCustomColor, setUseCustomColor] = useState(false)

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

  const fetchActionTypes = useCallback(async () => {
    setIsFetchingActionTypes(true)
    try {
      const res = await api.get('/action-types', {
        params: { step: 1, pageIndex: 0, pageSize: 100 },
      })
      if (res.data.items) {
        setActionTypes(res.data.items)
      }
    } catch (error) {
      console.error('Failed to fetch action types', error)
    } finally {
      setIsFetchingActionTypes(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords(debouncedRecordSearch, 0)
  }, [debouncedRecordSearch, fetchRecords])

  useEffect(() => {
    fetchBulks(debouncedBulkSearch)
  }, [debouncedBulkSearch, fetchBulks])

  useEffect(() => {
    fetchActionTypes()
  }, [fetchActionTypes])

  // Check for existing record when plate number changes
  const handlePlateNumberBlur = async () => {
    const plateNumber = recordFields.plateNumber.trim()
    if (!plateNumber) return

    try {
      const res = await api.post('/records/search', {
        plateNumber,
        identificationNumber: recordFields.identificationNumber,
        engineNumber: recordFields.engineNumber,
        vehicleType: recordFields.vehicleType,
      })
      if (res.data) {
        const record = res.data
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
          vehicleType: record.vehicleType || 'Ô tô',
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
          vehicleType: 'Ô tô',
        }))
      }
    } catch (error) {
      setExistingRecord(null)
      setValue('recordId', '')
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
        vehicleType: 'Ô tô',
      }))
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

  // Handle step 1 image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImageUrl(URL.createObjectURL(file)) // for preview only
  }

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
      let finalSteps = initialData ? steps : []
      if (!initialData) {
        // Find the action type ID for the selected registration type
        const selectedActionType = actionTypes.find(at => at.name === getValues('registrationType'))
        const actionTypeId = selectedActionType?._id
        
        finalSteps = [
          {
            order: 1,
            step: 1,
            title: '',
            action: actionTypeId, // Use ObjectId instead of name
            note: '',
            attachments: uploadedImageUrl ? [uploadedImageUrl] : [],
            isCompleted: false,
          },
        ]
        // step 1 is finished
        data.currentStep = 2
      }
      const _record = existingRecord || vehicleRecords.find((e) => e._id === recordId)
      // Update bulk size if procedure is created successfully
      if (data.bulkId) {
        try {
          await api.patch(`/bulks/${data.bulkId}/size`, { increment: 1 })
        } catch (error) {
          console.error('Failed to update bulk size', error)
        }
      }
      // Ensure dueDate is a valid Date object
      let dueDate = data.dueDate
      if (!(dueDate instanceof Date)) {
        dueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
      
      // Find the action type ID for the selected registration type
      const selectedActionType = actionTypes.find(at => at.name === data.registrationType)
      const actionTypeId = selectedActionType?._id
      
      // Map frontend fields to backend fields
      onSubmit({
        ...data,
        record: recordId,
        bulk: data.bulkId,
        steps: finalSteps.map(step => ({
          ...step,
          action: step.step === 1 ? actionTypeId : step.action // Use ObjectId for step 1, keep existing for others
        })),
        dueDate,
        _record,
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

  // Helper to parse QR or pasted string for plateNumber and related fields
  function parsePlateNumberInput(input: string) {
    // Remove leading/trailing whitespace
    const str = input.trim()
    // Pattern 1: "plateNumber; color; engineNumber; identificationNumber"
    if (str.includes(';')) {
      const [plateNumber, color, engineNumber, identificationNumber] = str
        .split(';')
        .map((s) => s.trim())
      return {
        plateNumber: plateNumber?.toUpperCase() || '',
        color: PLATE_COLORS.find((c) => c.dictionary.includes(color.toLowerCase()))?.label || '',
        engineNumber: engineNumber || '',
        identificationNumber: identificationNumber || '',
      }
    }
    // Pattern 2: "plateNumber-[nevermind]-[nevermind]..."
    if (str.includes('-')) {
      const [plateNumber] = str.split('-')
      return {
        plateNumber: plateNumber?.toUpperCase() || '',
        color: '',
        engineNumber: '',
        identificationNumber: '',
      }
    }
    // Fallback: treat as plateNumber only
    return {
      plateNumber: str.toUpperCase(),
      color: '',
      engineNumber: '',
      identificationNumber: '',
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Procedure Fields Section */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="registrationType" className="required">
            Trạng thái đăng ký
          </Label>
          <Select
            value={watch('registrationType')}
            onValueChange={(value) => setValue('registrationType', value as any)}
          >
            <SelectTrigger id="registrationType" className="w-full">
              <SelectValue placeholder="Chọn hạng mục" />
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

        {!hideBulkId && (
          <div className="space-y-2 w-full">
            <Label htmlFor="bulkId">Kiểm tra lần nhập</Label>
            <div className="w-full flex gap-2">
              <Popover open={openBulkSelect} onOpenChange={setOpenBulkSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBulkSelect}
                    className="flex-1 justify-between"
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
                            setValue('bulkId', currentValue === watch('bulkId') ? '' : currentValue)
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

        <div className="space-y-2">
          <Label htmlFor="image">Đính kèm</Label>
          <div className="flex items-center gap-4">
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
              {isUploadingImage ? 'Đang tải lên...' : 'Chọn ảnh'}
            </Button>
            {imageUrl && (
              <img
                src={`/uploads/du/${imageUrl}`}
                alt="Ảnh đính kèm"
                className="max-h-20 rounded border ml-2"
                style={{ maxWidth: 80 }}
              />
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
        <div className="space-y-2">
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
            {/* <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQR(true)}
                  disabled={!recordId}
                >
                  <QrCodeIcon className="mr-2" />
                  Tạo mã
                </Button> */}
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
                      includeMargin
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
              {isCreatingRecord ? 'Đang tiếp nhận...' : 'Tiếp nhận'}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Print Component */}
      {showQRPrint && recordDetailUrl && (
        <QRPrint
          url={recordDetailUrl}
          title="Mã QR xem lịch sử hồ sơ"
          onPrintComplete={() => setShowQRPrint(false)}
        />
      )}

      {/* Add the search area here */}
      <div className="mb-4 p-4 border rounded bg-gray-50 flex flex-col gap-2">
        <div className="font-semibold mb-2">Tìm kiếm xe</div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <Label className="text-sm mb-1">Biển số</Label>
            <Input
              type="text"
              value={recordFields.plateNumber}
              onChange={(e) =>
                setRecordFields((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))
              }
              placeholder="Nhập biển số"
            />
          </div>
          <div className="flex flex-col">
            <Label className="text-sm mb-1">Số máy</Label>
            <Input
              type="text"
              value={recordFields.engineNumber}
              onChange={(e) =>
                setRecordFields((prev) => ({ ...prev, engineNumber: e.target.value }))
              }
              placeholder="Nhập số máy"
            />
          </div>
          <div className="flex flex-col">
            <Label className="text-sm mb-1">Số khung</Label>
            <Input
              type="text"
              value={recordFields.identificationNumber}
              onChange={(e) =>
                setRecordFields((prev) => ({ ...prev, identificationNumber: e.target.value }))
              }
              placeholder="Nhập số khung"
            />
          </div>
          <div className="flex flex-col">
            <Label className="text-sm mb-1">Màu biển</Label>
            <Input
              type="text"
              value={recordFields.color}
              onChange={(e) => setRecordFields((prev) => ({ ...prev, color: e.target.value }))}
              placeholder="Nhập màu biển"
            />
          </div>
          <Button
            type="button"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={async () => {
              try {
                const res = await api.post('/records/search', {
                  plateNumber: recordFields.plateNumber,
                  engineNumber: recordFields.engineNumber,
                  identificationNumber: recordFields.identificationNumber,
                  color: recordFields.color,
                })
                if (res.data) {
                  const record = res.data
                  setExistingRecord(record)
                  setValue('recordId', record._id)
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
                    vehicleType: record.vehicleType || 'Ô tô',
                  })
                } else {
                  setExistingRecord(null)
                  setValue('recordId', '')
                  setRecordFields((prev) => ({
                    ...prev,
                    registrant: '',
                    phone: '',
                    email: '',
                    address: '',
                    note: '',
                    vehicleType: 'Ô tô',
                  }))
                }
              } catch (error) {
                setExistingRecord(null)
                setValue('recordId', '')
                setRecordFields((prev) => ({
                  ...prev,
                  registrant: '',
                  phone: '',
                  email: '',
                  address: '',
                  note: '',
                  vehicleType: 'Ô tô',
                }))
              }
            }}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Record Fields Section */}
      <Accordion type="multiple" defaultValue={['vehicle', 'owner']} className="mb-4">
        <AccordionItem value="vehicle">
          <AccordionTrigger>Thông tin xe</AccordionTrigger>
          <AccordionContent className="">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber" className="required">
                  {getLabel('plateNumber', 'vehicle_records')}
                </Label>
                <Input
                  id="plateNumber"
                  value={recordFields.plateNumber}
                  onChange={(e) => {
                    // If user is typing, just update plateNumber
                    setRecordFields((prev) => ({
                      ...prev,
                      plateNumber: e.target.value.toUpperCase(),
                    }))
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text')
                    const parsed = parsePlateNumberInput(pasted)
                    setRecordFields((prev) => ({
                      ...prev,
                      ...parsed,
                    }))
                    // Prevent default paste to avoid double input
                    e.preventDefault()
                  }}
                  onBlur={handlePlateNumberBlur}
                  placeholder="Nhập hoặc quét mã biển số..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identificationNumber">
                  {getLabel('identificationNumber', 'vehicle_records')}
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
                <Label htmlFor="engineNumber">{getLabel('engineNumber', 'vehicle_records')}</Label>
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
                <Label htmlFor="vehicleType" className="required">
                  {getLabel('vehicleType', 'vehicle_records')}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild={false}
                    className="w-full !max-w-full overflow-hidden"
                  >
                    <span className="w-full justify-between cursor-pointer inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
                        {recordFields.vehicleType ? recordFields.vehicleType : 'Chọn loại xe'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {VEHICLE_TYPES.map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => setRecordFields((prev) => ({ ...prev, vehicleType: t }))}
                      >
                        {t}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="color"
                  className="w-full flex justify-between items-center mb-[2px]"
                >
                  <span>{getLabel('color', 'vehicle_records')}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Tùy chỉnh</span>
                    <Switch
                      id="custom-color"
                      checked={useCustomColor}
                      onCheckedChange={setUseCustomColor}
                      className="mr-0"
                    />
                  </div>
                </Label>
                {useCustomColor ? (
                  <Input
                    value={recordFields.color}
                    onChange={(e) =>
                      setRecordFields((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="Nhập màu tùy chỉnh..."
                  />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild={false}
                      className="w-full !max-w-full overflow-hidden"
                    >
                      <span className="w-full justify-between cursor-pointer inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focusVisible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
                          {recordFields.color ? recordFields.color : 'Chọn màu'}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {PLATE_COLORS.map((c) => (
                        <DropdownMenuItem
                          key={c.label}
                          onClick={() => setRecordFields((prev) => ({ ...prev, color: c.label }))}
                        >
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="ml-2">{c.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="owner">
          <AccordionTrigger>Thông tin chủ xe</AccordionTrigger>
          <AccordionContent className="">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrant" className="required">
                  {getLabel('registrant', 'vehicle_records')}
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
                <Label htmlFor="phone">{getLabel('phone', 'vehicle_records')}</Label>
                <Input
                  id="phone"
                  value={recordFields.phone}
                  onChange={(e) => setRecordFields((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{getLabel('email', 'vehicle_records')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={recordFields.email}
                  onChange={(e) => setRecordFields((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Nhập email..."
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="address">{getLabel('address', 'vehicle_records')}</Label>
                <Input
                  id="address"
                  value={recordFields.address}
                  onChange={(e) =>
                    setRecordFields((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Nhập địa chỉ..."
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="recordNote">{getLabel('note', 'vehicle_records')}</Label>
                <Textarea
                  id="recordNote"
                  value={recordFields.note}
                  onChange={(e) => setRecordFields((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập ghi chú cho xe..."
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
                        <div className="mt-2">
                          <img
                            src={`/uploads/du/${imageUrl}`}
                            alt="Ảnh bước 1"
                            className="max-h-40 rounded border"
                          />
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
