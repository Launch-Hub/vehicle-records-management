import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { recordService } from '@/lib/services/records'
import type { VehicleRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import { getLabel } from '@/constants/dictionary'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { useLoader } from '@/contexts/loader/use-loader'
import QRPrint from '@/components/shared/qr-code/qr-print'
import QRPrintGrid from '@/components/shared/qr-code/qr-print-grid'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVerticalIcon } from 'lucide-react'

const columns: ColumnDef<VehicleRecord>[] = [
  {
    accessorKey: 'plateNumber',
    header: () => <div>{getLabel('plateNumber', 'vehicle_records')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 90,
    // size: 500,
  },
  {
    accessorKey: 'color',
    header: () => <div>{getLabel('color', 'vehicle_records')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 60,
  },
  {
    accessorKey: 'identificationNumber',
    header: () => <div>{getLabel('identificationNumber', 'vehicle_records')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'engineNumber',
    header: () => <div>{getLabel('engineNumber', 'vehicle_records')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{info.getValue() ?? ''}</span>,
    size: 100,
  },
  {
    accessorKey: 'registrant',
    header: () => <div>{getLabel('registrant', 'vehicle_records')}</div>,
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
  const [showQRPrint, setShowQRPrint] = useState(false)
  const [selectedRecordForQR, setSelectedRecordForQR] = useState<VehicleRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item?: VehicleRecord }>({
    open: false,
  })
  // Batch QR print state
  const [showQRGrid, setShowQRGrid] = useState(false)
  const [qrGridItems, setQRGridItems] = useState<{ url: string; label?: string }[]>([])
  const dataTableRef = useRef<DataTableHandle>(null)

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

  const handlePrintQR = (record: VehicleRecord) => {
    setSelectedRecordForQR(record)
    setShowQRPrint(true)
  }

  // DataTable row selection
  const [selectedRows, setSelectedRows] = useState<VehicleRecord[]>([])

  // Pass this to DataTable to get selected rows
  const handleRowSelectionChange = (rows: VehicleRecord[]) => {
    setSelectedRows(rows)
  }

  // Batch QR print handler
  const handleBatchPrintQR = () => {
    const items = selectedRows.map((record) => ({
      url: `${window.location.origin}/registration-history/${record._id}`,
      label: record.plateNumber,
    }))
    setQRGridItems(items)
    setShowQRGrid(true)
  }

  const handleExportDropdown = () => {
    dataTableRef.current?.openExportDialog()
  }

  const customActionColumn: ColumnDef<VehicleRecord> = {
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
          <DropdownMenuItem onClick={() => handlePrintQR(row.original)}>In mã QR</DropdownMenuItem>
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
        {/* Batch actions dropdown menu */}
        {selectedRows.length > 0 && (
          <div className="flex justify-end pt-4 px-4 md:pt-6 md:px-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="success" size="sm">
                  Thao tác
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuItem onClick={handleExportDropdown}>In danh sách</DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleBatchPrintQR}>In danh sách mã QR</DropdownMenuItem>
                {/* Add more actions here if needed */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <DataTable
            ref={dataTableRef}
            loading={isFetching}
            total={total}
            data={data}
            columns={columns as ColumnDef<VehicleRecord>[]}
            customActionColumn={customActionColumn as ColumnDef<VehicleRecord>}
            onPageChange={handleChangePage}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onSearch={handleSearch}
            resource="vehicle_records"
            onRowSelectionChange={handleRowSelectionChange}
          />
        </div>
      </div>

      {/* QR Print Component (single) */}
      {showQRPrint && selectedRecordForQR && (
        <QRPrint
          url={`${window.location.origin}/registration-history/${selectedRecordForQR._id}`}
          title="Mã QR xem lịch sử hồ sơ"
          onPrintComplete={() => {
            setShowQRPrint(false)
            setSelectedRecordForQR(null)
          }}
        />
      )}
      {/* QR Print Grid (batch) */}
      {showQRGrid && qrGridItems.length > 0 && (
        <QRPrintGrid items={qrGridItems} onPrintComplete={() => setShowQRGrid(false)} />
      )}
    </div>
  )
}
