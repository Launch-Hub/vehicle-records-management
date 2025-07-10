import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import type { Procedure } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath, exportToExcel } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { getRoute } from '@/routes'
import { useLoader } from '@/contexts/loader'
import { DataTable } from '@/components/shared/list-view/table'
import { procedureService } from '@/lib/services/procedures'
import { recordService } from '@/lib/services/records'
import { bulkService } from '@/lib/services/bulks'
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
  const [proceedDialog, setProceedDialog] = useState<{ open: boolean; procedure?: Procedure }>({ open: false })

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
  const step = getRoute(location.pathname)?.query?.step ?? -1

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const stepParam = step !== undefined ? Number(step) : undefined
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
  }, [search, pagination, step])

  const handleSearch = (searchTerm: string) => {
    if (!search && !searchTerm) return
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
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
          {Number(step) > 1 && (
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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
            customActionColumn={Number(step) > 1 ? customActionColumn : undefined}
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
