import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { PLATE_COLORS } from '@/constants/general'
import api from '@/lib/axios'

interface VehicleRecordSearchProps {
  onVehicleSelected: (vehicle: VehicleRecord) => void
}

export default function VehicleRecordSearch({ onVehicleSelected }: VehicleRecordSearchProps) {
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
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label className="text-sm mb-1">Biển số</Label>
          <Input
            type="text"
            value={fields.plateNumber}
            onChange={e => setFields(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
            onPaste={e => {
              const pasted = e.clipboardData.getData('text')
              const parsed = parsePlateNumberInput(pasted)
              setFields(prev => ({
                ...prev,
                ...parsed,
              }))
              e.preventDefault()
            }}
            placeholder="Nhập biển số"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm mb-1">Số máy</Label>
          <Input
            type="text"
            value={fields.engineNumber}
            onChange={e => setFields(prev => ({ ...prev, engineNumber: e.target.value }))}
            placeholder="Nhập số máy"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm mb-1">Số khung</Label>
          <Input
            type="text"
            value={fields.identificationNumber}
            onChange={e => setFields(prev => ({ ...prev, identificationNumber: e.target.value }))}
            placeholder="Nhập số khung"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm mb-1">Màu biển</Label>
          <Input
            type="text"
            value={fields.color}
            onChange={e => setFields(prev => ({ ...prev, color: e.target.value }))}
            placeholder="Nhập màu biển"
          />
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
            {results.map(vehicle => (
              <div
                key={vehicle._id}
                className="border rounded p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onVehicleSelected(vehicle)
                  setShowDialog(false)
                }}
              >
                <div><b>Biển số:</b> {vehicle.plateNumber}</div>
                <div><b>Số máy:</b> {vehicle.engineNumber}</div>
                <div><b>Số khung:</b> {vehicle.identificationNumber}</div>
                <div><b>Màu:</b> {vehicle.color}</div>
                <div><b>Chủ xe:</b> {vehicle.registrant}</div>
              </div>
            ))}
            {results.length === 0 && <div>Không tìm thấy hồ sơ phù hợp.</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 