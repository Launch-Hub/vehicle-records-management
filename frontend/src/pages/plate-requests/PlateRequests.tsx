import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { plateRequestService } from '@/lib/services/plate-requests'
import type { PlateRequest } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import { getLabel } from '@/constants/dictionary'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { useLoader } from '@/contexts/loader/use-loader'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVerticalIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

const columns: ColumnDef<PlateRequest>[] = [
  {
    accessorKey: 'bulk',
    header: () => <div>Lô yêu cầu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 120,
  },
  {
    accessorKey: 'color',
    header: () => <div>Màu biển số</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'vehicleType',
    header: () => <div>Loại xe</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'letter',
    header: () => <div>Chữ cái</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 80,
  },
  {
    accessorKey: 'suffixNumber',
    header: () => <div>Số hiệu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'createdBy',
    header: () => <div>Người yêu cầu</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
  {
    accessorKey: 'updatedBy',
    header: () => <div>Người nhận</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 120,
  },
]

export default function PlateRequestsPage() {
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<PlateRequest[]>([])
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item?: PlateRequest }>({
    open: false,
  })
  const dataTableRef = useRef<DataTableHandle>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await plateRequestService.getList({ search, ...pagination })
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchInputBlur = () => {
    handleSearch(searchTerm)
  }

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination)
  }

  const handleCreate = () => {
    navigate(joinPath(location.pathname, 'new'))
  }

  const handleEdit = (record: PlateRequest) => {
    if (!record._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }
    navigate(joinPath(location.pathname, record._id))
  }

  const handleCopy = (record: PlateRequest) => {
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
      await plateRequestService.delete(id)
      toast.success('Xóa yêu cầu dập biển số thành công.')
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa yêu cầu dập biển số. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleExportDropdown = () => {
    dataTableRef.current?.openExportDialog()
  }

  const customActionColumn: ColumnDef<PlateRequest> = {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 text-muted-foreground" size="icon">
            <MoreVerticalIcon className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopy(row.original)}>Sao chép</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmDelete({ open: true, item: row.original })}>
            <span className="text-destructive">Xoá</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* Search and actions row */}
        <div className="flex items-center justify-between pt-4 px-4 md:pt-6 md:px-6">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="cursor-pointer absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onBlur={handleSearchInputBlur}
              onKeyDown={handleSearchInputKeyDown}
              className="w-full pr-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="success" size="sm">
                Thao tác
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportDropdown}>In danh sách</DropdownMenuItem>
              {/* Add more actions here if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <DataTable
            ref={dataTableRef}
            loading={isFetching}
            total={total}
            data={data}
            columns={columns as ColumnDef<PlateRequest>[]}
            customActionColumn={customActionColumn as ColumnDef<PlateRequest>}
            onPageChange={handleChangePage}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onSearch={handleSearch}
            showSearch={false}
            resource="plate_requests"
          />
        </div>
      </div>
    </div>
  )
} 