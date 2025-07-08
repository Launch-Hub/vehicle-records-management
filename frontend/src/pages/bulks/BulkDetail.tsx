import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  Plus,
  Eye,
  Save,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react'

import api from '@/lib/axios'
import type { Bulk, Procedure } from '@/lib/types/tables.type'
import BulkForm from '@/components/page/bulks/form'
import ProcedureForm from '@/components/page/procedures/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'
import { getProcedureStatusLabel } from '@/constants/dictionary'
import { bulkService } from '@/lib/services/bulks'
import { procedureService } from '@/lib/services/procedures'

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
  const [actionTypes, setActionTypes] = useState<any[]>([])

  useEffect(() => {
    const resource = 'Lần nhập'
    setTitle(
      isCreating
        ? `Tạo ${resource} mới`
        : isCopying
        ? `Sao chép ${resource}`
        : `Chỉnh sửa ${resource}`
    )
    
    // Fetch action types for registration type display
    fetchActionTypes()
    
    if (isCreating) return

    const fetchDetail = async () => {
      loader.show()
      try {
        const [bulkRes, proceduresRes] = await Promise.all([
          bulkService.getOne(id!),
          api.get(`/bulks/${id}/procedures`),
        ])

        if (bulkRes) {
          setInitialData(bulkRes)
          setBulkData(bulkRes)
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
    toast.success('Đã lưu đăng ký vào danh sách chờ.')
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

  const fetchActionTypes = async () => {
    try {
      const res = await api.get('/action-types', {
        params: { step: 1, pageIndex: 0, pageSize: 100 },
      })
      if (res.data.items) {
        setActionTypes(res.data.items)
      }
    } catch (error) {
      console.error('Failed to fetch action types', error)
    }
  }

  const getRegistrationType = (type: string) => {
    return actionTypes.find((actionType) => actionType.name === type)?.name || 'Không xác định'
  }

  const handleSave = async () => {
    loader.show()
    try {
      let savedBulk: Bulk

      // Save bulk first
      if (defaultAction === 'create') {
        savedBulk = await bulkService.create(bulkData)
      } else {
        savedBulk = await bulkService.update(id!, bulkData)
      }

      // Save procedures
      for (const procedure of procedures) {
        const procedureData = {
          ...procedure,
          bulkId: savedBulk._id,
        }

        if (procedure._id) {
          await procedureService.update(procedure._id as string, procedureData)
        } else {
          await procedureService.create(procedureData)
        }
      }

      toast.success(defaultAction === 'create' ? 'Tạo Lần nhập thành công.' : 'Cập nhật Lần nhập thành công.')
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
    } finally {
      loader.hide()
    }
  }

  // Helper to determine completed steps
  const isStepCompleted = {
    'bulk-info': !!bulkData.name,
    'add-procedures': !!bulkData.name && (procedures.length > 0 || existingProcedures.length > 0),
    preview: false, // preview is never "completed" until save
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

      <Tabs
        value={currentStep}
        onValueChange={(value) => setCurrentStep(value as WorkflowStep)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="bulk-info">
            {isStepCompleted['bulk-info'] && (
              <CheckCircle className="text-green-500 w-4 h-4 mr-1" />
            )}
            Thông tin lần nhập
          </TabsTrigger>
          <TabsTrigger value="add-procedures" disabled={!bulkData.name}>
            {isStepCompleted['add-procedures'] && (
              <CheckCircle className="text-green-500 w-4 h-4 mr-1" />
            )}
            Nhập hồ sơ
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            disabled={procedures.length === 0 && existingProcedures.length === 0}
          >
            Xem trước
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-info" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Thông tin lần nhập</h2>
          </div>
          <BulkForm
            initialData={defaultAction === 'update' ? initialData : undefined}
            isCopying={isCopying}
            onSubmit={handleBulkSubmit}
            onCancel={() => navigate(backPath(location.pathname))}
          />
        </TabsContent>

        <TabsContent value="add-procedures" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Nhập hồ sơ</h2>
            <div className="flex items-center gap-2">
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

          <div className="flex flex-col gap-6 items-start">
            {/* Form Section */}
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">
                  {selectedProcedureIndex !== null
                    ? `Chỉnh sửa đăng ký ${selectedProcedureIndex + 1}`
                    : 'Thêm đăng ký mới'}
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
            <div className="space-y-4 w-full">
              <h3 className="text-md font-medium">Danh sách đăng ký</h3>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-center w-10">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure, index) => (
                      <TableRow key={index}>
                        <TableCell>{procedure.record?.plateNumber}</TableCell>
                        <TableCell>
                          {getRegistrationType(procedure.registrationType || '')}
                        </TableCell>
                        <TableCell>{procedure.note}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSelectProcedure(index)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleRemoveProcedure(index)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {existingProcedures.map((procedure, index) => (
                      <TableRow key={procedure._id || index}>
                        <TableCell>Đăng ký hiện có {procedures.length + index + 1}</TableCell>
                        <TableCell>
                          {getRegistrationType(procedure.registrationType || '')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getProcedureStatusLabel(procedure.status || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    ))}
                    {procedures.length === 0 && existingProcedures.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          Chưa có đăng ký nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Xem trước</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('add-procedures')}>
                Quay lại
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* Bulk Info Card */}
            <div className="flex flex-col gap-1">
              <div>
                <strong>Mã Lần nhập:</strong> {bulkData.code}
              </div>
              <div>
                <strong>Tên Lần nhập:</strong> {bulkData.name}
              </div>
              <div>
                <strong>Ghi chú:</strong> {bulkData.note || 'Không có'}
              </div>
            </div>

            {/* Procedures Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đăng ký ({procedures.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure, index) => (
                      <TableRow key={index}>
                        <TableCell>{procedure.record?.plateNumber}</TableCell>
                        <TableCell>
                          {getRegistrationType(procedure.registrationType || '')}
                        </TableCell>
                        <TableCell>{procedure.note}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getProcedureStatusLabel(procedure.status || '')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {procedures.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          Chưa có đăng ký nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
