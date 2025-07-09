import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { ChevronDown, Copy, QrCode } from 'lucide-react'
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
import { useIsMobile } from '@/lib/hooks/use-mobile'
import BuiltinCameraScanner from '@/components/shared/qr-code/camera-scanner'
import { Textarea } from '@/components/ui/textarea'

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
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [showCameraScanner, setShowCameraScanner] = useState(false)
  const [scannerError, setScannerError] = useState<string | Error | null>(null)
  const isMobile = useIsMobile()

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
      note: '',
      vehicleType: 'Ô tô',
      issuerId: '',
      status: 'idle',
      archiveAt: {
        storage: 'Kho A',
        room: '',
        row: '',
        shelf: '',
        level: '',
      },
      ...initialData,
    },
  })

  const values = form.watch()

  const handleFormSubmit = async (data: VehicleRecordFormValues) => {
    onSubmit(data)
  }

  const handleStartCameraScanner = () => {
    setScannerError(null)
    setShowCameraScanner(true)
  }

  const handleStopCameraScanner = () => {
    setShowCameraScanner(false)
  }

  const handleMobileScanSuccess = (result: string) => {
    form.setValue('plateNumber', result.toUpperCase())
    setScannerError(null)
    setShowCameraScanner(false)
  }

  const handleMobileScanError = (error: string | Error) => {
    setScannerError(error)
  }

  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy to clipboard: ', err)
    })
  }

  const renderPlate = useMemo(() => {
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

    // Get background color for plate preview
    let backgroundColor = '#ffffff'
    if (!useCustomColor) {
      const selectedColor = PLATE_COLORS.find((e) => e.label === values.color)
      backgroundColor = selectedColor?.color || '#ffffff'
    }

    return (
      <div
        className="h-[120px] aspect-15/10 border-4 border-black/70 p-2 rounded-xl flex flex-col gap-1 items-center justify-center text-4xl font-extrabold family-biensoxe"
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <div className="text-black/90">{plateParts[0]}</div>
        <div className="text-black/90 mb-1">{plateParts[1]}</div>
      </div>
    )
  }, [values.plateNumber, values.color, useCustomColor])

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      // Check if the initial color is a custom color (not in predefined list)
      if (initialData.color && !PLATE_COLORS.find((c) => c.label === initialData.color)) {
        setUseCustomColor(true)
      }
    }
  }, [initialData, form])

  const isEditing = initialData && !isCopying

  // Show camera scanner overlay
  if (showCameraScanner) {
    return (
      <BuiltinCameraScanner
        onScanSuccess={handleMobileScanSuccess}
        onScanError={handleMobileScanError}
        onClose={handleStopCameraScanner}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex flex-col gap-8">
          <div className="w-1/6">{renderPlate}</div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{getLabel('plateNumber', 'vehicle_records')}</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          placeholder={
                            isMobile ? 'Tap icon to scan...' : 'Scan or input plate number...'
                          }
                          className="pr-20"
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                          {field.value && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(field.value)}
                              className="h-8 w-8 text-gray-500 hover:text-primary"
                              aria-label="Copy code"
                            >
                              <Copy className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleStartCameraScanner}
                            className="h-8 w-8 text-gray-500 hover:text-primary"
                            aria-label="Start Camera Scanner"
                          >
                            <QrCode className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {scannerError && (
                      <div className="mt-1 p-2 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        {scannerError instanceof Error ? scannerError.message : scannerError}
                      </div>
                    )}
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
                    <FormLabel className="required">{getLabel('identificationNumber', 'vehicle_records')}</FormLabel>
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
                    <FormLabel className="required">{getLabel('engineNumber', 'vehicle_records')}</FormLabel>
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
                  <FormItem className="w-full gap-0.5">
                    <FormLabel className="w-full flex justify-between items-center">
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
                    </FormLabel>
                    <FormControl className="w-full">
                      {useCustomColor ? (
                        <Input {...field} placeholder="Nhập màu tùy chỉnh..." />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full !max-w-full overflow-hidden">
                            <Button variant="outline" className="w-full justify-between">
                              <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
                                {values.color ? values.color : 'Chọn màu'}
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {PLATE_COLORS.map((c) => (
                              <DropdownMenuItem
                                key={c.label}
                                onClick={() => {
                                  field.onChange(c.label)
                                }}
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
                    </FormControl>
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
                    <FormLabel className="required">{getLabel('registrant', 'vehicle_records')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase())
                          field.onChange(capitalized)
                        }}
                      />
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
                    <FormLabel>{getLabel('address', 'vehicle_records')}</FormLabel>
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
                    <FormLabel>{getLabel('phone', 'vehicle_records')}</FormLabel>
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
                    <FormLabel>{getLabel('email', 'vehicle_records')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4 space-y-2">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLabel('note', 'vehicle_records')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4 space-y-2">
              <Label>{getLabel('archiveAt', 'vehicle_records')}</Label>
              <div className="grid grid-cols-4 gap-2">
                {/* current storage is fixed - 1 storage only */}
                {/* <FormField
                  control={form.control}
                  name="archiveAt.storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Kho" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
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
        </div>

        <div className="mt-8 flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Huỷ bỏ
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Lưu
          </Button>
        </div>
      </form>
    </Form>
  )
}
