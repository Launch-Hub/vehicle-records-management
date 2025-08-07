import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { bulkService } from '@/lib/services/bulks'
import type { Bulk } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { useLoader } from '@/contexts/loader'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { TableControls } from '@/components/shared/list-view/table-controls'

const columns: ColumnDef<Bulk>[] = [
  {
    accessorKey: 'code',
    header: () => <div>Mã Lần nhập</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    minSize: 120,
  },
  {
    accessorKey: 'name',
    header: () => <div>Tên Lần nhập</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 150,
  },
  {
    accessorKey: 'size',
    header: () => <div>Số lượng</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? 0}</span>,
    size: 100,
  },
  {
    accessorKey: 'note',
    header: () => <div>Ghi chú</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 150,
  },
]

export default function BulksPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<Bulk[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Bulk[]>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const dataTableRef = useRef<DataTableHandle>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await bulkService.getList({ search, ...pagination })
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

  const handleRowSelectionChange = (rows: Bulk[]) => {
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
      toast.error('Vui lòng chọn ít nhất một lần nhập để xóa')
      return
    }

    const ids = selectedRows.map(row => row._id).filter(Boolean) as string[]
    if (ids.length === 0) {
      toast.error('Không có lần nhập hợp lệ để xóa')
      return
    }

    loader.show()
    try {
      await Promise.all(ids.map(id => bulkService.delete(id)))
      toast.success(`Đã xóa ${ids.length} lần nhập thành công.`)
      setSelectedRows([])
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa các lần nhập. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkCopy = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lần nhập để sao chép')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể sao chép một lần nhập tại một thời điểm')
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
      toast.error('Vui lòng chọn ít nhất một lần nhập để chỉnh sửa')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể chỉnh sửa một lần nhập tại một thời điểm')
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

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (bulk: Bulk) => {
    if (!bulk._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, bulk._id))
  }

  const handleCopy = (bulk: Bulk) => {
    if (!bulk._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, bulk._id)}?copy=true`)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    loader.show()
    try {
      await bulkService.delete(id)
      toast.success('Xóa lần nhập thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa lần nhập. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
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
          resource="bulks"
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
            columns={columns}
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
            resource="bulks"
          />
        </div>
      </div>
    </div>
  )
}
