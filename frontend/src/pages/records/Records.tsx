import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { recordService } from '@/lib/services/records'
import type { VehicleRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import { getTableLabel } from '@/constants/dictionary'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/list-view/table'
import { useLoader } from '@/contexts/loader/use-loader'

const columns: ColumnDef<VehicleRecord>[] = [
  {
    accessorKey: 'plateNumber',
    header: () => <div>{getTableLabel('plateNumber')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 90,
    // size: 500,
  },
  {
    accessorKey: 'color',
    header: () => <div>{getTableLabel('color')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 60,
  },
  {
    accessorKey: 'identificationNumber',
    header: () => <div>{getTableLabel('identificationNumber')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'engineNumber',
    header: () => <div>{getTableLabel('engineNumber')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'registrant',
    header: () => <div>{getTableLabel('registrant')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
]

export default function RecordsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<VehicleRecord[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await recordService.getList({ search, ...pagination })
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
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (record: VehicleRecord) => {
    if (!record._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, record._id))
  }

  const handleCopy = (record: VehicleRecord) => {
    if (!record._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(`${joinPath(location.pathname, record._id)}?copy=true`)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    loader.show()
    try {
      await recordService.delete(id)
      toast.success('Xóa hồ sơ thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa hồ sơ. Vui lòng thử lại sau.')
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
          />
        </div>
      </div>
    </div>
  )
}
