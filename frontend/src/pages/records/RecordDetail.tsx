import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/lib/axios'
import type { VehicleRecord } from '@/lib/types/tables.type'
import VehicleRecordForm from '@/components/page/records/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'

export default function VehicleRecordDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()
  const { setTitle } = useLayout()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')
  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  const [initialData, setInitialData] = useState<VehicleRecord | undefined>(undefined)

  useEffect(() => {
    const resource = 'hồ sơ'
    setTitle(
      isCreating
        ? `Tạo ${resource} mới`
        : isCopying
        ? `Sao chép ${resource}`
        : `Chỉnh sửa ${resource}`
    )
    if (isCreating) return

    const fetchDetail = async () => {
      loader.show()
      try {
        const res = await api.get(`/records/${id}`)
        if (res.data) {
          setInitialData(res.data)
        } else {
          toast.error('Không tìm thấy dữ liệu.')
          navigate(-1)
        }
      } catch (err) {
        console.error(err)
        toast.error('Lỗi khi tải dữ liệu.')
        navigate(-1)
      } finally {
        loader.hide()
      }
    }
    fetchDetail()
  }, [id])

  const handleSubmit = async (
    action: 'create' | 'update' | 'copy',
    data: Omit<VehicleRecord, '_id'>
  ) => {
    loader.show()
    try {
      if (action === 'create') {
        await api.post('/records', data)
        toast.success('Tạo người dùng thành công.')
      } else {
        await api.put(`/records/${id}`, data)
        toast.success('Cập nhật người dùng thành công.')
      }
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
    } finally {
      loader.hide()
    }
  }

  return (
    <div className="flex flex-col p-6 md:px-10">
      <div className="flex justify-between mb-6">
        {/* <h1 className="text-secondary text-xl font-semibold ">
          {defaultAction === 'create'
            ? isCopying
              ? 'Sao chép người dùng'
              : 'Tạo người dùng mới'
            : 'Chỉnh sửa người dùng'}
        </h1> */}

        <Button
          variant="link"
          className="flex items-center text-secondary hover:opacity-50 gap-0 -translate-x-4"
          onClick={() => navigate(backPath(location.pathname))}
        >
          <ChevronLeft width={20} />
          Quay lại
        </Button>
      </div>
      <VehicleRecordForm
        onSubmit={(data) => handleSubmit(defaultAction, data)}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />
    </div>
  )
}
