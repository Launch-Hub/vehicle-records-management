import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { recordService } from '@/lib/services/records'
import type { VehicleRecord } from '@/lib/types/tables.type'
import VehicleRecordForm from '@/components/page/records/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'
import QRPrint from '@/components/shared/qr-code/qr-print'
import { PrinterIcon } from 'lucide-react'

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
  const [showQRPrint, setShowQRPrint] = useState(false)

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
        const res = await recordService.getOne(id!)
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
    data: Omit<VehicleRecord, '_id'>
  ) => {
    loader.show()
    try {
      if (action === 'create') {
        await recordService.create(data)
        toast.success('Tạo hồ sơ thành công.')
      } else {
        await recordService.update(id!, data)
        toast.success('Cập nhật hồ sơ thành công.')
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
          Quay lại
        </Button>

        {/* Print QR button - only show when editing existing record */}
        {!isCreating && !isCopying && initialData && (
          <Button
            variant="outline"
            onClick={() => setShowQRPrint(true)}
            className="flex items-center gap-2"
          >
            <PrinterIcon />
            In mã
          </Button>
        )}
      </div>
      <VehicleRecordForm
        onSubmit={(data) => handleSubmit(defaultAction, data)}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />

      {/* QR Print Component */}
      {showQRPrint && initialData && (
        <QRPrint
          url={`${window.location.origin}/registration-history/${initialData._id}`}
          title="Mã QR xem lịch sử hồ sơ"
          onPrintComplete={() => setShowQRPrint(false)}
        />
      )}
    </div>
  )
}
