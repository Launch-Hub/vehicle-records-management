import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { User } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { UserDataTable } from '@/components/page/users/table'
import { getTableLabel } from '@/constants/dictionary'
import { joinPath } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ColumnDef } from '@tanstack/react-table'
import { USER_STATUSES } from '@/constants/general'
import { Dot } from 'lucide-react'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'avatar',
    header: () => <div>{getTableLabel('avatar')}</div>,
    cell: (info: any) => (
      <Avatar className="mx-auto">
        <AvatarImage src={String(info.getValue())} />
        <AvatarFallback>{info.name?.chaAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    ),
    size: 60,
  },
  {
    accessorKey: 'name',
    header: () => <div>{getTableLabel('name')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 150,
    // size: 500,
  },
  {
    accessorKey: 'phone',
    header: () => <div>{getTableLabel('phone')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
  {
    accessorKey: 'assignedUnit',
    header: () => <div>{getTableLabel('assignedUnit')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'serviceNumber',
    header: () => <div>{getTableLabel('serviceNumber')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'status',
    header: () => <div className="text-center">{getTableLabel('status')}</div>,
    cell: (info: any) => (
      <div className="flex justify-center items-center">
        <Dot size={32} className={info.getValue() == 'active' ? 'text-success' : 'text-error'} />
        <span className="text-muted-foreground">
          {USER_STATUSES.find((e) => e.value === info.getValue())?.label}
        </span>
      </div>
    ),
    size: 100,
  },
]

export default function UsersPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/users', { params: { search, ...pagination } })
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
    setSearch((_) => searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (user: User) => {
    if (!user._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, user._id))
  }

  const handleCopy = (user: User) => {
    if (!user._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, user._id)}?copy=true`)
  }

  const handleDelete = (id: string) => {
    // Implement as needed
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
