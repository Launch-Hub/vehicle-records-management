import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useLocation } from 'react-router-dom'

import { procedureService } from '@/lib/services/procedures'
import type { Procedure, VehicleRecord } from '@/lib/types/tables.type'
import ProcedureForm from '@/components/page/procedures/form'
import { useLoader } from '@/contexts/loader/use-loader'
import BasicTable from '@/components/shared/list-view/basic-table'
import { Button } from '@/components/ui/button'
import { getLabel } from '@/constants/dictionary'
import { getRoute } from '@/routes'
import { beautifyDate } from '@/lib/utils'

export default function ProceedProcedurePage() {
  const loader = useLoader()
  const location = useLocation()
  const [latestProcedures, setLatestProcedures] = useState<Procedure[]>([])

  const route = getRoute(location.pathname)
  const step = Number(route?.query?.step ?? 1)
  const title = route?.title ?? 'Xử lý hồ sơ'

  const fetchData = useCallback(async () => {
    const latest = await procedureService.getList({ pageIndex: 0, pageSize: 5, step })
    setLatestProcedures(latest.items)
    console.log(latest.items)
  }, [step])

  const handleSubmit = async (data: Omit<Procedure, '_id'>) => {
    loader.show()
    try {
      await procedureService.create({
        ...data,
        steps: [
          {
            order: 1,
            step,
            title: 'Processing',
            action: '',
            isCompleted: false,
            attachments: [],
          },
        ],
      })
      toast.success('Xử lý hồ sơ thành công.')
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      await fetchData()
      loader.hide()
    }
  }

  const handleDelete = async (id: string) => {
    loader.show()
    try {
      await procedureService.delete(id)
      toast.success('Đã xoá hồ sơ.')
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      await fetchData()
      loader.hide()
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* <h1 className="text-2xl font-bold">{title}</h1> */}
      <ProcedureForm
        onSubmit={handleSubmit}
        isNew={step === 1}
        step={step}
        submitButtonText={title}
      />
      <div>
        <h2 className="font-semibold text-lg mb-2">Đăng ký gần đây</h2>
        <BasicTable
          key={latestProcedures.length}
          columns={[
            { key: 'registrationType', label: getLabel('registrationType', 'procedures') },
            { key: 'plateNumber', label: getLabel('plateNumber', 'vehicle_records') },
            { key: 'createdAt', label: getLabel('createdAt', 'procedures') },
            { key: 'action', label: '', width: '80' },
          ]}
          data={latestProcedures.map((p) => ({
            _id: p._id,
            registrationType: p.registrationType || '',
            plateNumber: (p.record as VehicleRecord)?.plateNumber || '',
            createdAt: beautifyDate(p.createdAt),
          }))}
          emptyText="Chưa có hồ sơ nào."
          renderCell={(col, row) => {
            if (col.key === 'action') {
              return (
                <Button variant="destructive" size="sm" onClick={() => handleDelete(row._id)}>
                  Xoá
                </Button>
              )
            }
            return (row as Record<string, any>)[col.key]
          }}
        />
      </div>
    </div>
  )
}
