import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { RecordForm } from '@/components/page/records/form'
import api from '@/lib/axios'
import type { VehicleRecord } from '@/lib/types/tables.type'
import { useLoader } from '@/contexts/loader'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { backPath } from '@/lib/utils'

export default function RecordDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')

  const [initialData, setInitialData] = useState<VehicleRecord | undefined>(undefined)

  useEffect(() => {
    if (isCreating) return

    const fetchData = async () => {
      loader.show()
      try {
        const res = await api.get(`/records/${id}`)
        setInitialData(res.data)
      } catch (err) {
        console.error(err)
        toast.error('Không thể tải hồ sơ')
        navigate(-1)
      } finally {
        loader.hide()
      }
    }

    fetchData()
  }, [id, isCreating, loader, navigate])

  const handleSubmit = async (
    action: 'create' | 'update' | 'copy',
    data: Omit<VehicleRecord, '_id'>
  ) => {
    loader.show()
    try {
      if (action === 'create' || action === 'copy') {
        await api.post('/records', data)
        toast.success('Tạo hồ sơ thành công')
      } else {
        await api.put(`/records/${id}`, data)
        toast.success('Cập nhật hồ sơ thành công')
      }
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu hồ sơ')
    } finally {
      loader.hide()
    }
  }

  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  return (
    <div className="flex flex-col p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-secondary text-xl font-semibold ">
          {defaultAction === 'create'
            ? isCopying
              ? 'Sao chép hồ sơ'
              : 'Tạo hồ sơ mới'
            : 'Chỉnh sửa hồ sơ'}
        </h1>

        <Button
          variant="link"
          className="flex items-center text-secondary hover:opacity-50 gap-0"
          onClick={() => navigate(backPath(location.pathname))}
        >
          <ChevronLeft width={20} />
          Quay lại
        </Button>
      </div>
      <RecordForm
        initialData={initialData}
        isCopying={isCopying}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
