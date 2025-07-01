import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { Procedure } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { UserDataTable } from '@/components/page/users/table'
import { joinPath, exportToExcel } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { getRoute } from '@/routes'
import { useLoader } from '@/contexts/loader'

const columns: ColumnDef<Procedure>[] = [
  {
    accessorKey: 'recordId',
    header: () => <div>Hồ sơ</div>,
    cell: (info: any) => {
      const record = info.getValue()
      if (typeof record === 'object' && record?.plateNumber) {
        return <span className="text-muted-foreground">{record.plateNumber}</span>
      }
      return <span className="text-muted-foreground">-</span>
    },
    minSize: 120,
  },
  {
    accessorKey: 'bulkId',
    header: () => <div>Lô</div>,
    cell: (info: any) => {
      const bulk = info.getValue()
      if (typeof bulk === 'object' && bulk?.name) {
        return <span className="text-muted-foreground">{bulk.name}</span>
      }
      return <span className="text-muted-foreground">-</span>
    },
    size: 100,
  },
  {
    accessorKey: 'registrationType',
    header: () => <div>Loại đăng ký</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
  {
    accessorKey: 'status',
    header: () => <div>Trạng thái</div>,
    cell: (info: any) => {
      const status = info.getValue()
      const statusMap: Record<string, string> = {
        pending: 'Đăng ký mới',
        processing: 'Đang xử lý',
        overdue: 'Đã quá hạn',
        completed: 'Đã hoàn thành',
        rejected: 'Đã từ chối',
        cancelled: 'Đã huỷ',
        archived: 'Đã lưu trữ',
      }
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

  // Get the step from the route config's query field
  const route = getRoute(location.pathname)
  const step = route?.query?.step

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/procedures', {
        params: { search, ...pagination, ...(step ? { step } : {}) },
      })
      if (response.data) {
        const { total, items } = response.data
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
      await api.delete(`/procedures/${id}`)
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <UserDataTable
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
            onExport={(rows) => exportToExcel({
              data: rows,
              filename: 'procedures-export.xlsx',
              headerRows: [[
                'Exported Procedures', '', '', '', '', '', '', '', '', ''
              ]], // Example header row
              // footerRows: [["Footer row 1", "", "", ""], ["Footer row 2", "", "", ""]],
            })}
          />
        </div>
      </div>
    </div>
  )
}
