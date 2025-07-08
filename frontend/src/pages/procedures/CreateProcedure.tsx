import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { procedureService } from '@/lib/services/procedures'
import type { Procedure } from '@/lib/types/tables.type'
import ProcedureForm from '@/components/page/procedures/form'
import { useLoader } from '@/contexts/loader/use-loader'
import BasicTable from '@/components/shared/list-view/basic-table'
import { actionTypeService } from '@/lib/services/action-types'

export default function CreateProcedurePage() {
  const loader = useLoader()
  const [latestProcedures, setLatestProcedures] = useState<Procedure[]>([])
  const [registrationTypes, setRegistrationTypes] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    const latest = await procedureService.getList({ pageIndex: 0, pageSize: 5, step: 1 })
    setLatestProcedures(latest.items)
    const types = await actionTypeService.getList({ step: 1, pageIndex: 0, pageSize: 100 })
    setRegistrationTypes(types.items || [])
  }, [])

  const handleSubmit = async (data: Omit<Procedure, '_id'>) => {
    loader.show()
    try {
      await procedureService.create(data)
      toast.success('Tiếp nhận hồ sơ thành công.')
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
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
      <ProcedureForm onSubmit={handleSubmit} />
      <div>
        <h2 className="font-semibold text-lg mb-2">Tiếp nhận gần đây</h2>
        <BasicTable
          columns={[
            { key: 'registrationType', label: 'Loại đăng ký' },
            { key: 'plateNumber', label: 'Biển số' },
            { key: 'createdAt', label: 'Ngày tạo' },
          ]}
          data={latestProcedures.map((p) => ({
            registrationType:
              registrationTypes.find((type) => type._id === p.registrationType)?.name || '',
            plateNumber: p.record?.plateNumber || '',
            createdAt: p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
          }))}
          emptyText="Chưa có hồ sơ nào."
        />
      </div>
    </div>
  )
}
