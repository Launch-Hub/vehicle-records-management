import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { actionTypeService } from '@/lib/services/action-types'
import type { ActionType } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath, exportToExcel } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { useLoader } from '@/contexts/loader'
import { DataTable } from '@/components/shared/list-view/table'

const columns: ColumnDef<ActionType>[] = [
  {
    id: 'order',
    accessorKey: 'order',
    header: () => <div>Thứ tự</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue()}</span>,
    size: 80,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <div>Hạng mục</div>,
    cell: (info: any) => <span className="font-medium">{info.getValue()}</span>,
    minSize: 250,
  },
  {
    id: 'step',
    accessorKey: 'step',
    header: () => <div>Bước</div>,
    cell: (info: any) => <Badge variant="secondary">Bước {info.getValue()}</Badge>,
    size: 120,
  },
  {
    id: 'toStep',
    accessorKey: 'toStep',
    header: () => <div>Chuyển bước</div>,
    cell: (info: any) => {
      const value = info.getValue()
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Có' : 'Không'}</Badge>
    },
    size: 120,
  },
]

const STEP_TABS = [
  { value: '1', label: 'Tiếp nhận', color: 'bg-blue-500' },
  { value: '2', label: 'Phân loại', color: 'bg-green-500' },
  { value: '3', label: 'Thu phí', color: 'bg-yellow-500' },
  { value: '4', label: 'Trình ký', color: 'bg-red-500' },
  { value: '5', label: 'Trả kết quả', color: 'bg-purple-500' },
]

export default function ActionTypesPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ActionType[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState<string>('all')

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const params: any = { search, ...pagination }
      if (stepFilter && stepFilter !== 'all') {
        params.step = parseInt(stepFilter)
      }
      const response = await actionTypeService.getList(params)
      setTotal(response.total)
      setData(response.items)
    } catch (error) {
      console.error(error)
      toast.error('Không thể kết nối đến máy chủ! Xin thử lại sau')
    } finally {
      setIsFetching(false)
    }
  }, [search, pagination, stepFilter])

  const handleSearch = (searchTerm: string) => {
    if (!search && !searchTerm) return
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleStepTabChange = (value: string) => {
    setStepFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (actionType: ActionType) => {
    if (!actionType._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, actionType._id))
  }

  const handleCopy = (actionType: ActionType) => {
    if (!actionType._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, actionType._id)}?copy=true`)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    loader.show()
    try {
      await actionTypeService.delete(id)
      toast.success('Xóa loại hành động thành công.')
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa loại hành động. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleExport = async (
    rows: ActionType[],
    exportColumns: { key: string; label: string }[]
  ) => {
    const sortedRows = [...rows].sort((a, b) => (a.order || 0) - (b.order || 0))
    const filename = `danh-sach-loai-hanh-dong-${new Date().toISOString().split('T')[0]}.xlsx`
    return await exportToExcel({
      data: rows,
      filename,
      columns: exportColumns,
    })
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Step Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs value={stepFilter} onValueChange={handleStepTabChange} className="mb-2">
              <TabsList>
                {STEP_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={stepFilter === tab.value ? 'bg-primary text-primary' : ''}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <DataTable
            loading={isFetching}
            total={total}
            data={data}
            columns={columns}
            onPageChange={handleChangePage}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  )
}
