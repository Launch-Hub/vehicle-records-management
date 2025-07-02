import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { actionTypeService } from '@/lib/services/action-types'

interface BulkActionType {
  order: number | ''
  name: string
  step: number | ''
  toStep: number | ''
}

const emptyRow: BulkActionType = { order: '', name: '', step: '', toStep: '' }

export default function BulkCreateActionTypes({ onSuccess }: { onSuccess?: () => void }) {
  const [rows, setRows] = useState<BulkActionType[]>([ { ...emptyRow } ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (index: number, field: keyof BulkActionType, value: string) => {
    setRows((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  const handleAddRow = () => {
    setRows((prev) => [ ...prev, { ...emptyRow } ])
  }

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const actionTypes = rows
        .filter(row => row.name && row.step && row.order && row.toStep !== '')
        .map(row => ({
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
      toast.success(res.message || 'Tạo nhiều loại hành động thành công!')
      setRows([ { ...emptyRow } ])
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo nhiều loại hành động.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo nhiều loại hành động</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Hạng mục</TableHead>
                <TableHead>Bước</TableHead>
                <TableHead>Chuyển bước</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.order}
                      onChange={e => handleChange(idx, 'order', e.target.value)}
                      min={1}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.name}
                      onChange={e => handleChange(idx, 'name', e.target.value)}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.step}
                      onChange={e => handleChange(idx, 'step', e.target.value)}
                      min={1}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.toStep}
                      onChange={e => handleChange(idx, 'toStep', e.target.value)}
                      min={0}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveRow(idx)} disabled={rows.length === 1}>
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-2">
            <Button type="button" onClick={handleAddRow} variant="outline">Thêm dòng</Button>
            <Button type="submit" disabled={isSubmitting}>Tạo nhiều</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 