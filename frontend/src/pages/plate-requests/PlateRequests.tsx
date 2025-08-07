import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { plateRequestService } from '@/lib/services/plate-requests'
import type { PlateRequest } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { TableControls } from '@/components/shared/list-view/table-controls'
import { useLoader } from '@/contexts/loader/use-loader'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVerticalIcon, SearchIcon, Trash2Icon, CopyIcon, EditIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

const columns: ColumnDef<PlateRequest>[] = [
  {
    accessorKey: 'bulk',
    header: () => <div>Lô yêu cầu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 120,
  },
  {
    accessorKey: 'color',
    header: () => <div>Màu biển số</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'vehicleType',
    header: () => <div>Loại xe</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'letter',
    header: () => <div>Chữ cái</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 80,
  },
  {
    accessorKey: 'suffixNumber',
    header: () => <div>Số hiệu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'createdBy',
    header: () => <div>Người yêu cầu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
  {
    accessorKey: 'updatedBy',
    header: () => <div>Người nhận</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
]

export default function PlateRequestsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<PlateRequest[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<PlateRequest[]>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item?: PlateRequest }>({
    open: false,
  })
  const dataTableRef = useRef<DataTableHandle>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await plateRequestService.getList({ search, ...pagination })
      if (response) {
        const { total, items } = response
        setTotal(total)
        setData(items)
      }
    } catch (error) {
      console.error(error)
      toast.error('Không thể kết nối đến máy chủ! Xin thử lại sau')
    } finally {
      setIsFetching(false)
    }
  }, [search, pagination])

  const handleSearch = (searchTerm: string) => {
    if (!search && !searchTerm) return
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchInputBlur = () => {
    handleSearch(searchTerm)
  }

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (record: PlateRequest) => {
    if (!record._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, record._id))
  }

  const handleCopy = (record: PlateRequest) => {
    if (!record._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, record._id)}?copy=true`)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    loader.show()
    try {
      await plateRequestService.delete(id)
      toast.success('Xóa yêu cầu dập biển số thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa yêu cầu dập biển số. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleRowSelectionChange = (rows: PlateRequest[]) => {
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
      toast.error('Vui lòng chọn ít nhất một yêu cầu để xóa')
      return
    }

    const ids = selectedRows.map(row => row._id).filter(Boolean) as string[]
    if (ids.length === 0) {
      toast.error('Không có yêu cầu hợp lệ để xóa')
      return
    }

    loader.show()
    try {
      // Delete multiple items - you may need to implement bulk delete in your service
      await Promise.all(ids.map(id => plateRequestService.delete(id)))
      toast.success(`Đã xóa ${ids.length} yêu cầu dập biển số thành công.`)
      setSelectedRows([])
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa các yêu cầu dập biển số. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkCopy = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một yêu cầu để sao chép')
      return
    }

    // Navigate to create page with selected data
    const selectedData = selectedRows.map(row => ({
      bulk: row.bulk,
      color: row.color,
      vehicleType: row.vehicleType,
      letter: row.letter,
      suffixNumber: row.suffixNumber,
    }))
    
    // You can store this in localStorage or pass as state
    localStorage.setItem('bulkCopyData', JSON.stringify(selectedData))
    navigate(joinPath(location.pathname, 'new?bulk=true'))
  }

  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một yêu cầu để chỉnh sửa')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể chỉnh sửa một yêu cầu tại một thời điểm')
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

  const customActionColumn: ColumnDef<PlateRequest> = {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 text-muted-foreground" size="icon">
            <MoreVerticalIcon className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopy(row.original)}>Sao chép</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmDelete({ open: true, item: row.original })}>
            <span className="text-destructive">Xoá</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
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
          resource="plate_requests"
          onCreate={handleCreate}
          showCreate={true}
          selectedRows={selectedRows}
          onBulkEdit={handleBulkEdit}
          onBulkCopy={handleBulkCopy}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedRows([])}
          onExport={handleExportDropdown}
          showExport={true}
        />
        
        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <DataTable
            ref={dataTableRef}
            loading={isFetching}
            total={total}
            data={data}
            columns={columns as ColumnDef<PlateRequest>[]}
            customActionColumn={customActionColumn as ColumnDef<PlateRequest>}
            onPageChange={handleChangePage}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onRowSelectionChange={handleRowSelectionChange}
            showSearch={false}
            showCreate={false}
            showColumnToggle={false}
            resource="plate_requests"
          />
        </div>
      </div>
    </div>
  )
}
