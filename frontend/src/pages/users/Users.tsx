import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { userService } from '@/lib/services/users'
import type { User } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { getLabel } from '@/constants/dictionary'
import { joinPath, exportToExcel } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ColumnDef } from '@tanstack/react-table'
import { USER_STATUSES } from '@/constants/general'
import { Dot } from 'lucide-react'
import { useLoader } from '@/contexts/loader'
import { DataTable } from '@/components/shared/list-view/table'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'avatar',
    header: () => <></>,
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
    header: () => <div>{getLabel('name', 'users')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 150,
    // size: 500,
  },
  {
    accessorKey: 'phone',
    header: () => <div>{getLabel('phone', 'users')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
  {
    accessorKey: 'assignedUnit',
    header: () => <div>{getLabel('assignedUnit', 'users')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'serviceNumber',
    header: () => <div>{getLabel('serviceNumber', 'users')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'status',
    header: () => <div className="text-center">{getLabel('status', 'users')}</div>,
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
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await userService.getList({ search, ...pagination })
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

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    const isAdmin = data.find((u) => u._id === id)?.isAdmin
    if (isAdmin) {
      toast.error('Quản trị viên không thể bị xoá!')
      return
    }

    loader.show()
    try {
      await userService.delete(id)
      toast.success('Xóa người dùng thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa người dùng. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleExport = async (rows: User[], exportColumns: { key: string; label: string }[]) => {
    const filename = 'danh-sach-nguoi-dung.xlsx'
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
            resource="users"
          />
        </div>
      </div>
    </div>
  )
}
