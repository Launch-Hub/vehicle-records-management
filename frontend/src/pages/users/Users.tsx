import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/lib/axios'
import type { User } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { UserDataTable } from '@/components/page/users/table'

export default function UsersPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [data, setData] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/users', {
        params: {
          search,
          ...pagination,
        },
      })
      if (response.data) setData(response.data)
    } catch (error) {
      console.error(error)
      toast.error('Không thể kết nối đến máy chủ! Xin thử lại sau')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (searchTerm === search && !searchTerm) return
    setSearch(searchTerm)
    setPagination((pagination) => ({ ...pagination, pageIndex: 0 }))
    fetchData()
  }

  const handleChangePage = (pagination: PaginationProps) => {
    setPagination(pagination)
    fetchData()
  }

  const joinPath = (base: string, segment: string) => {
    return base.endsWith('/') ? `${base}${segment}` : `${base}/${segment}`
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
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <UserDataTable
            loading={isFetching}
            data={data}
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
