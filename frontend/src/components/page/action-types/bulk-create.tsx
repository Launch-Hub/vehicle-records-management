import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { actionTypeService } from '@/lib/services/action-types'
import { STEP_TABS } from '@/constants/general'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BulkActionType {
  order: number
  name: string
  step: number
  toStep: number
}

const emptyRow: BulkActionType = { order: 1, name: '', step: 1, toStep: 2 }

export default function BulkCreateActionTypes({ onSuccess }: { onSuccess?: () => void }) {
  const [rows, setRows] = useState<BulkActionType[]>([{ ...emptyRow }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (index: number, field: keyof BulkActionType, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1]
    setRows((prev) => {
      const rows = [...prev, { ...lastRow, order: lastRow.order + 1, name: '' }]
      rows.sort((a, b) => a.order - b.order)
      return rows
    })
  }

  const handleRemoveRow = (index: number) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const actionTypes = rows
        .filter((row) => row.name && row.step && row.order && row.toStep)
        .map((row) => ({
          order: Number(row.order),
          name: row.name, 
          step: Number(row.step),
          toStep: Number(row.toStep),
        }))
      if (actionTypes.length === 0) {
        toast.error('Vui lòng nhập đầy đủ thông tin cho ít nhất một dòng.')
        setIsSubmitting(false)
        return
      }
      const res = await actionTypeService.createBulk(actionTypes)
      toast.success(res.message || 'Tạo nhiều hạng mục thành công!')
      setRows([{ ...emptyRow }])
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo nhiều hạng mục.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%]">Thứ tự</TableHead>
            <TableHead>Tạo mục</TableHead>
            <TableHead className="w-[18%]">Bước</TableHead>
            <TableHead className="w-[18%]">Chuyển bước</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Input
                  type="number"
                  value={row.order}
                  onChange={(e) => handleChange(idx, 'order', e.target.value)}
                  min={1}
                  required
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                  required
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.step.toString()}
                  onValueChange={(value) => handleChange(idx, 'step', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn bước" />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_TABS.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value.toString()}>
                        {tab.value} - {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.toStep.toString()}
                  onValueChange={(value) => handleChange(idx, 'toStep', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn bước tiếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_TABS.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value.toString()}>
                        {tab.value} - {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveRow(idx)}
                  disabled={rows.length === 1}
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button type="button" onClick={handleAddRow} variant="outline">
          Thêm dòng
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Tạo nhiều
        </Button>
      </div>
    </form>
  )
}
