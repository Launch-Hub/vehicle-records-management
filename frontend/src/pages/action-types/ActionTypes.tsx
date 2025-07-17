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
import BulkCreateActionTypes from '@/components/page/action-types/bulk-create'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { STEP_TABS } from '@/constants/general'

const columns: ColumnDef<ActionType>[] = [
  {
    id: 'order',
    accessorKey: 'order',
    header: () => <div className="text-center">Thứ tự</div>,
    cell: (info: any) => (
      <div className="flex items-center justify-center">
        <span className="text-muted-foreground">{info.getValue()}</span>
      </div>
    ),
    size: 50,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <div>Tạo mục</div>,
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

export default function ActionTypesPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ActionType[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState<string>('1')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

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
      toast.success('Xóa hạng mục thành công.')
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa hạng mục. Vui lòng thử lại sau.')
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
          <div className="px-4 lg:px-6 flex items-center justify-between mb-2">
            <Tabs value={stepFilter} onValueChange={handleStepTabChange} className="">
              <TabsList>
                {STEP_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value.toString()}
                    className={stepFilter == tab.value.toString() ? 'bg-primary text-primary' : ''}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              {/* <Button variant="outlineDestructive" onClick={() => {}}>Khôi phục mặc định</Button> */}

              <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Thêm nhiều</Button>
                </DialogTrigger>
                <DialogContent className="min-w-[90%] lg:min-w-[80%] xl:min-w-[60%] !max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Thêm các tạo mục hàng loạt</DialogTitle>
                  </DialogHeader>
                  <BulkCreateActionTypes
                    onSuccess={() => {
                      setBulkDialogOpen(false)
                      fetchData()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
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
            resource="action_types"
            showExport={false}
          />
        </div>
      </div>
    </div>
  )
}
