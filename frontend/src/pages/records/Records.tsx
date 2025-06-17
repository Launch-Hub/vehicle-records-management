import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { VehicleRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { RecordDataTable } from '@/components/page/records/table'
import { joinPath } from '@/lib/utils'

export default function RecordsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [data, setData] = useState<VehicleRecord[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/records', {
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
    setPagination((p) => ({ ...p, pageIndex: 0 }))
    fetchData()
  }

  const handleChangePage = (pagination: PaginationProps) => {
    setPagination(pagination)
    fetchData()
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (record: VehicleRecord) => {
    navigate(joinPath(location.pathname, record._id))
  }

  const handleCopy = (record: VehicleRecord) => {
    navigate(`${joinPath(location.pathname, record._id)}?copy=true`)
  }

  const handleDelete = (id: string) => {
    // implement if needed
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <RecordDataTable
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
