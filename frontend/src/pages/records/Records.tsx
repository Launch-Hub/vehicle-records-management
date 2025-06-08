import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { LegalRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { RecordDataTable } from '@/components/page/records/table'
import { RecordDialog } from '@/components/page/records/dialog'

export default function RecordsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [data, setData] = useState<LegalRecord[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  // 
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [object, setObject] = useState<LegalRecord | undefined>(undefined)
  const [isCopying, setIsCopying] = useState(false)

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/records', {
        params: {
          search,
          ...pagination,
        },
      })
      if (response.data) {
        console.log('resp: ', response.data)
        setData(response.data)
      }
    } catch (error) {
      console.log(error)
      toast.error('Không thể kết nối đến máy chủ! Xin thử lại sau')
    } finally {
      setIsFetching(false)
    }
    return []
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

  const handleCreate = () => {
    setObject(undefined)
    setShowCreateModal(true)
  }

  const handleEdit = (value: LegalRecord) => {
    setObject(value)
    setShowCreateModal(true)
  }

  const handleCopy = (value: LegalRecord) => {
    setObject(value)
    setIsCopying(true)
    setShowCreateModal(true)
  }

  const handleDelete = (id: string) => {}

  const handleSubmit = async (action: string, data: Omit<LegalRecord, '_id'>) => {
    switch (action) {
      case 'create':
        break
      case 'update':
        break
      case 'copy':
        break
    }
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
          <RecordDialog
            open={showCreateModal}
            onSubmit={handleSubmit}
            onClose={() => setShowCreateModal(false)}
            initialData={object}
            isCopying={isCopying}
          />
        </div>
      </div>
    </div>
  )
}
