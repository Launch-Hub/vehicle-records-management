import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { PLATE_COLORS, VEHICLE_TYPES } from '@/constants/general'
import api from '@/lib/axios'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { ChevronDown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { getLabel } from '@/constants/dictionary'

interface VehicleRecordSearchProps {
  onVehicleSelected: (vehicle: VehicleRecord) => void
  recordFields: {
    plateNumber: string
    color: string
    identificationNumber: string
    engineNumber: string
    registrant: string
    phone: string
    email: string
    address: string
    note: string
    vehicleType: string
  }
  setRecordFields: React.Dispatch<React.SetStateAction<any>>
  useCustomColor: boolean
  setUseCustomColor: (val: boolean) => void
}

export default function VehicleRecordSearch({
  onVehicleSelected,
  recordFields,
  setRecordFields,
  useCustomColor,
  setUseCustomColor,
}: VehicleRecordSearchProps) {
  const [fields, setFields] = useState({
    plateNumber: '',
    engineNumber: '',
    identificationNumber: '',
    color: '',
  })
  const [results, setResults] = useState<VehicleRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  // Helper to parse QR or pasted string for plateNumber and related fields
  function parsePlateNumberInput(input: string) {
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
    // Pattern 2: "plateNumber-[nevermind]-[nevermind]"
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

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = {
        plateNumber: fields.plateNumber,
        engineNumber: fields.engineNumber,
        identificationNumber: fields.identificationNumber,
        color: fields.color,
        noPagination: true,
      }
      const res = await api.get('/records', { params })
      const items = res.data?.items || []
      if (items.length === 1) {
        onVehicleSelected(items[0])
      } else if (items.length > 1) {
        setResults(items)
        setShowDialog(true)
      } else {
        setResults([])
        setShowDialog(false)
      }
    } catch (error) {
      setResults([])
      setShowDialog(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="font-semibold">Tìm kiếm xe</div>
      <div className="flex gap-4 items-end">
        <div className="w-3/4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm mb-1">{getLabel('plateNumber', 'vehicle_records')}</Label>
            <Input
              type="text"
              value={fields.plateNumber}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))
              }
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text')
                const parsed = parsePlateNumberInput(pasted)
                setFields((prev) => ({
                  ...prev,
                  ...parsed,
                }))
                e.preventDefault()
              }}
              placeholder="Nhập hoặc quét mã biển số"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm mb-1">{getLabel('engineNumber', 'vehicle_records')}</Label>
            <Input
              type="text"
              value={fields.engineNumber}
              onChange={(e) => setFields((prev) => ({ ...prev, engineNumber: e.target.value }))}
              placeholder="Nhập số máy"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm mb-1">
              {getLabel('identificationNumber', 'vehicle_records')}
            </Label>
            <Input
              type="text"
              value={fields.identificationNumber}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, identificationNumber: e.target.value }))
              }
              placeholder="Nhập số khung"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm mb-1">{getLabel('color', 'vehicle_records')}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild={false} className="w-full !max-w-full overflow-hidden">
                <span className="w-full justify-between cursor-pointer inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focusVisible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <span
                    className={`overflow-hidden text-ellipsis whitespace-nowrap block ${
                      fields.color ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {fields.color ? fields.color : 'Chọn màu'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PLATE_COLORS.map((c) => (
                  <DropdownMenuItem
                    key={c.label}
                    onClick={() => setFields((prev: any) => ({ ...prev, color: c.label }))}
                  >
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="ml-2">{c.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </Button>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn hồ sơ xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {results.map((vehicle) => (
              <div
                key={vehicle._id}
                className="border rounded p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onVehicleSelected(vehicle)
                  setShowDialog(false)
                }}
              >
                <div>
                  <b>Biển số:</b> {vehicle.plateNumber}
                </div>
                <div>
                  <b>Số máy:</b> {vehicle.engineNumber}
                </div>
                <div>
                  <b>Số khung:</b> {vehicle.identificationNumber}
                </div>
                <div>
                  <b>Màu:</b> {vehicle.color}
                </div>
                <div>
                  <b>Chủ xe:</b> {vehicle.registrant}
                </div>
              </div>
            ))}
            {results.length === 0 && <div>Không tìm thấy hồ sơ phù hợp.</div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Detail Section (Accordion) */}
      {/* defaultValue={['vehicle', 'owner']} */}
      <Accordion type="multiple" defaultValue={['vehicle']} className="mb-4">
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
                    setRecordFields((prev: any) => ({
                      ...prev,
                      plateNumber: e.target.value.toUpperCase(),
                    }))
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text')
                    const parsed = parsePlateNumberInput(pasted)
                    setRecordFields((prev: any) => ({
                      ...prev,
                      ...parsed,
                    }))
                    e.preventDefault()
                  }}
                  placeholder="Nhập biển số"
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
                    setRecordFields((prev: any) => ({
                      ...prev,
                      identificationNumber: e.target.value,
                    }))
                  }
                  placeholder="Nhập số khung"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineNumber">{getLabel('engineNumber', 'vehicle_records')}</Label>
                <Input
                  id="engineNumber"
                  value={recordFields.engineNumber}
                  onChange={(e) =>
                    setRecordFields((prev: any) => ({ ...prev, engineNumber: e.target.value }))
                  }
                  placeholder="Nhập số máy"
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
                        onClick={() =>
                          setRecordFields((prev: any) => ({ ...prev, vehicleType: t }))
                        }
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
                      setRecordFields((prev: any) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="Nhập màu tùy chỉnh"
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
                          onClick={() =>
                            setRecordFields((prev: any) => ({ ...prev, color: c.label }))
                          }
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
                    setRecordFields((prev: any) => ({ ...prev, registrant: e.target.value }))
                  }
                  placeholder="Nhập tên chủ xe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{getLabel('phone', 'vehicle_records')}</Label>
                <Input
                  id="phone"
                  value={recordFields.phone}
                  onChange={(e) =>
                    setRecordFields((prev: any) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{getLabel('email', 'vehicle_records')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={recordFields.email}
                  onChange={(e) =>
                    setRecordFields((prev: any) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Nhập email"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="address">{getLabel('address', 'vehicle_records')}</Label>
                <Input
                  id="address"
                  value={recordFields.address}
                  onChange={(e) =>
                    setRecordFields((prev: any) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="recordNote">{getLabel('note', 'vehicle_records')}</Label>
                <Textarea
                  id="recordNote"
                  value={recordFields.note}
                  onChange={(e) =>
                    setRecordFields((prev: any) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Nhập ghi chú cho xe"
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
