import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { plateRequestService } from '@/lib/services/plate-requests'
import type { PlateRequest } from '@/lib/types/tables.type'
import PlateRequestForm from '@/components/page/plate-requests/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'

export default function PlateRequestDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()
  const { setTitle } = useLayout()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')
  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  const [initialData, setInitialData] = useState<PlateRequest | undefined>(undefined)

  useEffect(() => {
    const resource = 'yêu cầu dập biển số'
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
        const res = await plateRequestService.getOne(id!)
        if (res) {
          setInitialData(res)
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
    data: Omit<PlateRequest, '_id'>
  ) => {
    loader.show()
    try {
      if (action === 'create') {
        await plateRequestService.create(data)
        toast.success('Tạo yêu cầu dập biển số thành công.')
      } else {
        await plateRequestService.update(id!, data)
        toast.success('Cập nhật yêu cầu dập biển số thành công.')
      }
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkSubmit = async (data: {
    bulk: string
    color: string
    vehicleType: string
    letter: string
    rangeFrom: number
    rangeTo: number
    excludedNumbers?: string
    createdBy: string
    updatedBy?: string
  }) => {
    loader.show()
    try {
      const result = await plateRequestService.bulkCreate(data)
      
      toast.success(
        `Tạo thành công ${result.created} yêu cầu dập biển số. ` +
        `${result.skipped > 0 ? `Bỏ qua ${result.skipped} số đã tồn tại. ` : ''}` +
        `${result.excluded > 0 ? `Loại trừ ${result.excluded} số.` : ''}`
      )
      
      if (result.errors && result.errors.length > 0) {
        console.error('Bulk creation errors:', result.errors)
      }
      
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể tạo yêu cầu dập biển số hàng loạt. Vui lòng thử lại.')
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
      
      <PlateRequestForm
        onSubmit={(action, data) => handleSubmit(action, data)}
        onBulkSubmit={handleBulkSubmit}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />
    </div>
  )
} 