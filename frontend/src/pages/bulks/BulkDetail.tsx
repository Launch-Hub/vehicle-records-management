import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Plus, Eye, Save } from 'lucide-react'

import api from '@/lib/axios'
import type { Bulk, Procedure } from '@/lib/types/tables.type'
import BulkForm from '@/components/page/bulks/form'
import ProcedureForm from '@/components/page/procedures/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'

type WorkflowStep = 'bulk-info' | 'add-procedures' | 'preview'

export default function BulkDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()
  const { setTitle } = useLayout()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')
  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('bulk-info')
  const [bulkData, setBulkData] = useState<Partial<Bulk>>({})
  const [procedures, setProcedures] = useState<Partial<Procedure>[]>([])
  const [initialData, setInitialData] = useState<Bulk | undefined>(undefined)
  const [existingProcedures, setExistingProcedures] = useState<Procedure[]>([])
  const [selectedProcedure, setSelectedProcedure] = useState<Partial<Procedure> | null>(null)
  const [selectedProcedureIndex, setSelectedProcedureIndex] = useState<number | null>(null)

  useEffect(() => {
    const resource = 'lô'
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
        const [bulkRes, proceduresRes] = await Promise.all([
          api.get(`/bulks/${id}`),
          api.get(`/bulks/${id}/procedures`)
        ])
        
        if (bulkRes.data) {
          setInitialData(bulkRes.data)
          setBulkData(bulkRes.data)
        } else {
          toast.error('Không tìm thấy dữ liệu.')
          navigate(-1)
          return
        }
        
        if (proceduresRes.data) {
          setExistingProcedures(proceduresRes.data)
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

  const handleBulkSubmit = (data: Partial<Bulk>) => {
    setBulkData(data)
    setCurrentStep('add-procedures')
  }

  const handleProcedureSubmit = (data: Partial<Procedure>) => {
    if (selectedProcedureIndex !== null) {
      // Editing existing procedure in the new list
      const updatedProcedures = [...procedures]
      updatedProcedures[selectedProcedureIndex] = data
      setProcedures(updatedProcedures)
    } else {
      // Adding new procedure
      setProcedures([...procedures, data])
    }
    // Reset form
    setSelectedProcedure(null)
    setSelectedProcedureIndex(null)
    toast.success('Đã lưu thủ tục vào danh sách chờ.')
  }

  const handleSelectProcedure = (index: number) => {
    setSelectedProcedure(procedures[index])
    setSelectedProcedureIndex(index)
  }

  const handleAddNewProcedure = () => {
    setSelectedProcedure(null)
    setSelectedProcedureIndex(null)
  }

  const handleRemoveProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index))
    if (index === selectedProcedureIndex) {
      handleAddNewProcedure()
    }
  }

  const handlePreview = () => {
    setCurrentStep('preview')
  }

  const handleSave = async () => {
    loader.show()
    try {
      let savedBulk: Bulk

      // Save bulk first
      if (defaultAction === 'create') {
        const bulkRes = await api.post('/bulks', bulkData)
        savedBulk = bulkRes.data
      } else {
        const bulkRes = await api.put(`/bulks/${id}`, bulkData)
        savedBulk = bulkRes.data
      }

      // Save procedures
      for (const procedure of procedures) {
        const procedureData = {
          ...procedure,
          bulkId: savedBulk._id
        }
        
        if (procedure._id) {
          await api.put(`/procedures/${procedure._id}`, procedureData)
        } else {
          await api.post('/procedures', procedureData)
        }
      }

      toast.success(defaultAction === 'create' ? 'Tạo lô thành công.' : 'Cập nhật lô thành công.')
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
    } finally {
      loader.hide()
    }
  }

  const renderBulkInfoStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Thông tin lô</h2>
        <Badge variant="outline">Bước 1/3</Badge>
      </div>
      <BulkForm
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
        onSubmit={handleBulkSubmit}
        onCancel={() => navigate(backPath(location.pathname))}
      />
    </div>
  )

  const renderAddProceduresStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Thêm thủ tục</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Bước 2/3</Badge>
          <Button variant="ghost" onClick={handlePreview}>
            Bỏ qua
          </Button>
          <Button
            onClick={handlePreview}
            disabled={procedures.length === 0 && existingProcedures.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem trước
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">
              {selectedProcedureIndex !== null
                ? `Chỉnh sửa thủ tục ${selectedProcedureIndex + 1}`
                : 'Thêm thủ tục mới'}
            </h3>
            {selectedProcedureIndex !== null && (
              <Button variant="outline" size="sm" onClick={handleAddNewProcedure}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </Button>
            )}
          </div>
          <ProcedureForm
            key={selectedProcedureIndex ?? 'new'}
            initialData={selectedProcedure as any}
            hideBulkId={true}
            onSubmit={handleProcedureSubmit}
            onCancel={selectedProcedureIndex !== null ? handleAddNewProcedure : undefined}
          />
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Danh sách thủ tục</h3>
          <div className="space-y-4">
            {procedures.map((procedure, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Thủ tục mới {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" onClick={() => handleSelectProcedure(index)}>
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveProcedure(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Loại: {procedure.registrationType || 'Chưa có'}
                </div>
              </div>
            ))}
            {existingProcedures.map((procedure, index) => (
              <div key={procedure._id || index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Thủ tục hiện có {procedures.length + index + 1}
                  </span>
                  <Badge variant="secondary">{procedure.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Loại: {procedure.registrationType}
                </div>
                {typeof procedure.recordId === 'object' && procedure.recordId?.plateNumber && (
                  <div className="text-sm text-muted-foreground">
                    Biển số: {procedure.recordId.plateNumber}
                  </div>
                )}
              </div>
            ))}
            {procedures.length === 0 && existingProcedures.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Chưa có thủ tục nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Xem trước</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('add-procedures')}>
            Quay lại
          </Button>
          <Badge variant="outline">Bước 3/3</Badge>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Lưu lô
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lô</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Mã lô:</strong> {bulkData.code}</div>
            <div><strong>Tên lô:</strong> {bulkData.name}</div>
            <div><strong>Ghi chú:</strong> {bulkData.note || 'Không có'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thủ tục ({procedures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {procedures.map((procedure, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="font-medium">Thủ tục {index + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    Loại: {procedure.registrationType}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trạng thái: {procedure.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

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

      {currentStep === 'bulk-info' && renderBulkInfoStep()}
      {currentStep === 'add-procedures' && renderAddProceduresStep()}
      {currentStep === 'preview' && renderPreviewStep()}
    </div>
  )
} 