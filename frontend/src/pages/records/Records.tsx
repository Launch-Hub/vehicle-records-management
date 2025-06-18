import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { VehicleRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { RecordDataTable } from '@/components/page/records/table'
import { joinPath } from '@/lib/utils'
import { getTableLabel } from '@/constants/dictionary'
import type { ColumnDef } from '@tanstack/react-table'

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
  // {
  //   accessorKey: 'status',
  //   header: () => <div className="text-center">{getTableLabel('status')}</div>,
  //   cell: (info: any) => (
  //     <div className="flex justify-center items-center">
  //       <Dot size={32} className={info.getValue() == 'active' ? 'text-success' : 'text-error'} />
  //       <span className="text-muted-foreground">
  //         {USER_STATUSES.find((e) => e.value === info.getValue())?.label}
  //       </span>
  //     </div>
  //   ),
  //   size: 100,
  // },
]

export default function RecordsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<VehicleRecord[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const response = await api.get('/records', { params: { search, ...pagination } })
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
    if (searchTerm === search && !searchTerm) return
    setSearch((_) => searchTerm)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
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
  }, [search, pagination])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <RecordDataTable
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
