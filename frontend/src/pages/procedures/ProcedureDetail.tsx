import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/lib/axios'
import type { Procedure } from '@/lib/types/tables.type'
import ProcedureForm from '@/components/page/procedures/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'

export default function ProcedureDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()
  const { setTitle } = useLayout()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')
  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  const [initialData, setInitialData] = useState<Procedure | undefined>(undefined)

  useEffect(() => {
    const resource = 'thủ tục'
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
        const res = await api.get(`/procedures/${id}`)
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
  }, [id, isCreating, isCopying, setTitle, loader, navigate])

  const handleSubmit = async (
    action: 'create' | 'update' | 'copy',
    data: Omit<Procedure, '_id'>
  ) => {
    loader.show()
    try {
      if (action === 'create') {
        await api.post('/procedures', data)
        toast.success('Tạo thủ tục thành công.')
      } else {
        await api.put(`/procedures/${id}`, data)
        toast.success('Cập nhật thủ tục thành công.')
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
        <Button
          variant="link"
          className="flex items-center text-secondary hover:opacity-50 gap-0 -translate-x-4"
          onClick={() => navigate(backPath(location.pathname))}
        >
          <ChevronLeft width={20} />
          Quay lại
        </Button>
      </div>
      <ProcedureForm
        onSubmit={(data) => handleSubmit(defaultAction, data as any)}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />
    </div>
  )
} 