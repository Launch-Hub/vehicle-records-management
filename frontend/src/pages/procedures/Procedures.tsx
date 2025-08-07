import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import type { Procedure } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath, exportToExcel } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { getRoute } from '@/routes'
import { useLoader } from '@/contexts/loader'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { TableControls } from '@/components/shared/list-view/table-controls'
import { procedureService } from '@/lib/services/procedures'
import { ProcedureFilter } from '@/components/page/procedures/filter'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVerticalIcon } from 'lucide-react'
import ProcedureDialog from '@/components/page/procedures/dialog'

const statusMap: Record<string, string> = {
  pending: 'Đăng ký mới',
  processing: 'Đang xử lý',
  overdue: 'Đã quá hạn',
  completed: 'Đã hoàn thành',
  rejected: 'Đã từ chối',
  cancelled: 'Đã huỷ',
  archived: 'Đã lưu trữ',
}

const columns: ColumnDef<Procedure>[] = [
  {
    accessorKey: 'record',
    header: () => <div>Hồ sơ</div>,
    cell: (info: any) => {
      const record = info.row.original.record
      return (
        <span className="text-muted-foreground">
          {record && record.plateNumber ? record.plateNumber : '-'}
        </span>
      )
    },
    minSize: 200,
  },
  {
    accessorKey: 'registrationType',
    header: () => <div>Tạo mục đăng ký</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 150,
  },
  {
    accessorKey: 'bulk',
    header: () => <div>Lần nhập</div>,
    cell: (info: any) => {
      const bulk = info.row.original.bulk
      return <span className="text-muted-foreground">{bulk && bulk.name ? bulk.name : '-'}</span>
    },
    size: 120,
  },
  {
    accessorKey: 'status',
    header: () => <div>Trạng thái</div>,
    cell: (info: any) => {
      const status = info.getValue()
      return <span className="text-muted-foreground">{statusMap[status] || status}</span>
    },
    size: 100,
  },
]

export default function ProceduresPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<Procedure[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Procedure[]>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [proceedDialog, setProceedDialog] = useState<{ open: boolean; procedure?: Procedure }>({
    open: false,
  })
  const dataTableRef = useRef<DataTableHandle>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  // Parse query params from the address bar
  const searchParams = new URLSearchParams(location.search)
  const queryParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    queryParams[key] = value
  })

  // Get the step from the merged route config and query params
  const routeStep = getRoute(location.pathname)?.query?.step ?? -1
  const urlStep = searchParams.get('step')
  const urlSearch = searchParams.get('search') || ''
  const currentStep = urlStep && urlStep !== 'all' ? parseInt(urlStep) : (routeStep !== -1 ? Number(routeStep) : undefined)

  // Initialize search from URL
  useEffect(() => {
    if (urlSearch !== search) {
      setSearch(urlSearch)
    }
  }, [urlSearch])

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const stepParam = currentStep !== undefined ? currentStep : undefined
      const response = await procedureService.getList({
        search,
        ...pagination,
        ...(stepParam !== undefined ? { step: stepParam } : {}),
      })
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
  }, [search, pagination, currentStep])

  const handleSearch = (searchTerm: string) => {
    if (!search && !searchTerm) return
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleStepChange = (newStep: number | undefined) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    // The step change will be handled by the filter component through URL updates
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (procedure: Procedure) => {
    if (!procedure._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, procedure._id))
  }

  const handleCopy = (procedure: Procedure) => {
    if (!procedure._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, procedure._id)}?copy=true`)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    loader.show()
    try {
      await procedureService.delete(id)
      toast.success('Xóa đăng ký thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa đăng ký. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleExport = async (
    rows: Procedure[],
    exportColumns: { key: string; label: string }[]
  ) => {
    const sortedRows = [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const fromDate = sortedRows[0].createdAt.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const toDate = sortedRows[sortedRows.length - 1].createdAt.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const filename = `danh-sach-dang-ky-${fromDate}-${toDate}.xlsx`
    return await exportToExcel({
      data: rows,
      filename,
      columns: exportColumns,
    })
  }

  const handleProceed = (procedure: Procedure) => {
    setProceedDialog({ open: true, procedure })
  }
  const handleProceedClose = () => {
    setProceedDialog({ open: false })
  }
  const handleProceedSubmit = async (_action: string, data: Omit<Procedure, '_id'>) => {
    // If you need the _id, get it from proceedDialog.procedure
    setProceedDialog({ open: false })
    fetchData()
  }

  const handleRowSelectionChange = (rows: Procedure[]) => {
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
      toast.error('Vui lòng chọn ít nhất một đăng ký để xóa')
      return
    }

    const ids = selectedRows.map(row => row._id).filter(Boolean) as string[]
    if (ids.length === 0) {
      toast.error('Không có đăng ký hợp lệ để xóa')
      return
    }

    loader.show()
    try {
      await Promise.all(ids.map(id => procedureService.delete(id)))
      toast.success(`Đã xóa ${ids.length} đăng ký thành công.`)
      setSelectedRows([])
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa các đăng ký. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkCopy = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một đăng ký để sao chép')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể sao chép một đăng ký tại một thời điểm')
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
      toast.error('Vui lòng chọn ít nhất một đăng ký để chỉnh sửa')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể chỉnh sửa một đăng ký tại một thời điểm')
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

  const customActionColumn: ColumnDef<Procedure> = {
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
          {Number(currentStep) > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleProceed(row.original)}>
                Tiến trình
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={() => setConfirmDelete({ open: true, item: row.original })}>
            <span className="text-destructive">Xoá</span>
          </DropdownMenuItem> */}
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
        {/* Filter Component */}
        <ProcedureFilter
          onSearchChange={handleSearch}
          onStepChange={handleStepChange}
          currentSearch={search}
          currentStep={currentStep}
        />
        
        {/* Table Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          showSearch={false} // Hide search since we have external filter
          columns={[]} // Will be populated by DataTable
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onToggleColumn={handleToggleColumn}
          showColumnToggle={true}
          resource="procedures"
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
            onSearch={() => {}} // Disable search in table since we have external filter
            onExport={handleExport}
            onRowSelectionChange={handleRowSelectionChange}
            customActionColumn={Number(currentStep) > 1 ? customActionColumn : undefined}
            showSearch={false} // Hide search in table
            showCreate={false}
            showColumnToggle={false}
            resource="procedures"
          />
        </div>
      </div>
      <ProcedureDialog
        open={proceedDialog.open}
        onClose={handleProceedClose}
        onSubmit={handleProceedSubmit}
        initialData={proceedDialog.procedure}
        isChangeStep={true}
      />
    </div>
  )
}
