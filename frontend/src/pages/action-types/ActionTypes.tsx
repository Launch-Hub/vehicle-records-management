import { useCallback, useEffect, useState, useRef } from 'react'
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
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { TableControls } from '@/components/shared/list-view/table-controls'
import BulkCreateActionTypes from '@/components/page/action-types/bulk-create'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<ActionType[]>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [stepFilter, setStepFilter] = useState<string>('1')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const dataTableRef = useRef<DataTableHandle>(null)

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

  const handleRowSelectionChange = (rows: ActionType[]) => {
    setSelectedRows(rows)
  }

  const handleColumnVisibilityChange = (visibility: any) => {
    setColumnVisibility(visibility)
  }

  const handleToggleColumn = (columnId: string) => {
    dataTableRef.current?.toggleColumnVisibility(columnId)
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hạng mục để xóa')
      return
    }

    const ids = selectedRows.map((row) => row._id).filter(Boolean) as string[]
    if (ids.length === 0) {
      toast.error('Không có hạng mục hợp lệ để xóa')
      return
    }

    loader.show()
    try {
      await Promise.all(ids.map((id) => actionTypeService.delete(id)))
      toast.success(`Đã xóa ${ids.length} hạng mục thành công.`)
      setSelectedRows([])
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa các hạng mục. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkCopy = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hạng mục để sao chép')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể sao chép một hạng mục tại một thời điểm')
      return
    }

    const selectedRow = selectedRows[0]
    if (!selectedRow._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    navigate(`${joinPath(location.pathname, selectedRow._id)}?copy=true`)
  }

  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hạng mục để chỉnh sửa')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể chỉnh sửa một hạng mục tại một thời điểm')
      return
    }

    const selectedRow = selectedRows[0]
    if (!selectedRow._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    navigate(joinPath(location.pathname, selectedRow._id))
  }

  const handleExportDropdown = () => {
    dataTableRef.current?.openExportDialog()
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
    <div className="flex flex-1 flex-col gap-4">
      <div className="@container/main flex flex-1 flex-col gap-2 pt-4 md:pt-6">
        {/* Step Tabs */}
        <div className="px-4 lg:px-6 flex items-center justify-between">
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
          </div>
        </div>

        {/* Table Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          showSearch={true}
          columns={[]} // Will be populated by DataTable
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onToggleColumn={handleToggleColumn}
          showColumnToggle={true}
          resource="action_types"
          onCreate={handleCreate}
          showCreate={true}
          selectedRows={selectedRows}
          onBulkEdit={handleBulkEdit}
          onBulkCopy={handleBulkCopy}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedRows([])}
          onExport={handleExportDropdown}
          showExport={true}
          customActions={
            <>
              <DropdownMenuItem onClick={() => setBulkDialogOpen(true)}>
                Thêm nhiều
              </DropdownMenuItem>
            </>
          }
        />

        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <DataTable
            ref={dataTableRef}
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
            onRowSelectionChange={handleRowSelectionChange}
            showSearch={false}
            showCreate={false}
            showColumnToggle={false}
            resource="action_types"
            showExport={false}
          />
        </div>
      </div>

      {/* Bulk Create Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
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
  )
}
