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

const statusMap: Record<string, string> = {
  pending: 'Đăng ký mới',
  processing: 'Đang xử lý',
  overdue: 'Đã quá hạn',
  completed: 'Đã hoàn thành',
  rejected: 'Đã từ chối',
  cancelled: 'Đã huỷ',
  archived: 'Đã lưu trữ',
}

// Utility hook to fetch and cache record details by ID
function useRecordDetails(recordId?: string) {
  const [record, setRecord] = useState<null | { plateNumber: string }>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!recordId) return
    let mounted = true
    setLoading(true)
    recordService
      .getOne(recordId)
      .then((data) => {
        if (mounted) setRecord(data)
      })
      .catch(() => {
        if (mounted) setRecord(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [recordId])
  return { record, loading }
}

// Utility hook to fetch and cache bulk details by ID
function useBulkDetails(bulkId?: string) {
  const [bulk, setBulk] = useState<null | { name: string }>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!bulkId) return
    let mounted = true
    setLoading(true)
    bulkService
      .getOne(bulkId)
      .then((data) => {
        if (mounted) setBulk(data)
      })
      .catch(() => {
        if (mounted) setBulk(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [bulkId])
  return { bulk, loading }
}

// Utility cell component for record
function TableRecordCell({ recordId }: { recordId?: string }) {
  const { record, loading } = useRecordDetails(recordId)
  if (loading) return <span className="text-muted-foreground">Đang tải...</span>
  if (record && record.plateNumber)
    return <span className="text-muted-foreground">{record.plateNumber}</span>
  return <span className="text-muted-foreground">-</span>
}

// Utility cell component for bulk
function TableBulkCell({ bulkId }: { bulkId?: string }) {
  const { bulk, loading } = useBulkDetails(bulkId)
  if (loading) return <span className="text-muted-foreground">Đang tải...</span>
  if (bulk && bulk.name) return <span className="text-muted-foreground">{bulk.name}</span>
  return <span className="text-muted-foreground">-</span>
}

const columns: ColumnDef<Procedure>[] = [
  {
    accessorKey: 'recordId',
    header: () => <div>Hồ sơ</div>,
    cell: (info: any) => <TableRecordCell recordId={info.getValue() as string} />,
    minSize: 200,
  },
  {
    accessorKey: 'registrationType',
    header: () => <div>Tạo mục đăng ký</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 150,
  },
  {
    accessorKey: 'bulkId',
    header: () => <div>Lần nhập</div>,
    cell: (info: any) => <TableBulkCell bulkId={info.getValue() as string} />,
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

  console.log(step)

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
          />
        </div>
      </div>
    </div>
  )
}
