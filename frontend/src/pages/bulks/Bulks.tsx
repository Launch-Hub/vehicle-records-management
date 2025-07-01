import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { Bulk } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { UserDataTable } from '@/components/page/users/table'
import { joinPath } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Bulk>[] = [
  {
    accessorKey: 'code',
    header: () => <div>Mã lô</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    minSize: 120,
  },
  {
    accessorKey: 'name',
    header: () => <div>Tên lô</div>,
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

  const location = useLocation()
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/bulks', { params: { search, ...pagination } })
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
  }

  const handleSearch = (searchTerm: string) => {
    if (searchTerm === search || !searchTerm) return
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
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

  const handleDelete = () => {
    // implement if needed
  }

  useEffect(() => {
    fetchData()
  }, [search, pagination])

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
          />
        </div>
      </div>
    </div>
  )
}
