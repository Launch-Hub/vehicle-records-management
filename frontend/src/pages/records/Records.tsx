import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { recordService } from '@/lib/services/records'
import { settingsService } from '@/lib/services/settings'
import type { VehicleRecord } from '@/lib/types/tables.type'
import type { PaginationProps } from '@/lib/types/props'
import { joinPath } from '@/lib/utils'
import { getLabel } from '@/constants/dictionary'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/list-view/table'
import type { DataTableHandle } from '@/components/shared/list-view/table'
import { TableControls } from '@/components/shared/list-view/table-controls'
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
import { MoreVerticalIcon, QrCodeIcon, FileSpreadsheet } from 'lucide-react'

const columns: ColumnDef<VehicleRecord>[] = [
  {
    accessorKey: 'plateNumber',
    header: () => <div>{getLabel('plateNumber', 'vehicle_records')}</div>,
    cell: (info: any) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    minSize: 90,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<VehicleRecord[]>([])
  const [columnVisibility, setColumnVisibility] = useState({})
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
  const handleRowSelectionChange = (rows: VehicleRecord[]) => {
    setSelectedRows(rows)
  }

  const handleColumnVisibilityChange = (visibility: any) => {
    setColumnVisibility(visibility)
  }

  const handleToggleColumn = (columnId: string) => {
    dataTableRef.current?.toggleColumnVisibility(columnId)
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hồ sơ để xóa')
      return
    }

    const ids = selectedRows.map((row) => row._id).filter(Boolean) as string[]
    if (ids.length === 0) {
      toast.error('Không có hồ sơ hợp lệ để xóa')
      return
    }

    loader.show()
    try {
      await Promise.all(ids.map((id) => recordService.delete(id)))
      toast.success(`Đã xóa ${ids.length} hồ sơ thành công.`)
      setSelectedRows([])
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa các hồ sơ. Vui lòng thử lại sau.')
    } finally {
      loader.hide()
    }
  }

  const handleBulkCopy = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hồ sơ để sao chép')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể sao chép một hồ sơ tại một thời điểm')
      return
    }

    const selectedRow = selectedRows[0]
    if (!selectedRow._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    navigate(`${joinPath(location.pathname, selectedRow._id)}?copy=true`)
  }

  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hồ sơ để chỉnh sửa')
      return
    }

    if (selectedRows.length > 1) {
      toast.error('Chỉ có thể chỉnh sửa một hồ sơ tại một thời điểm')
      return
    }

    const selectedRow = selectedRows[0]
    if (!selectedRow._id) {
      toast.error('Có lỗi xảy ra! Vui lòng thử lại sau')
      return
    }

    navigate(joinPath(location.pathname, selectedRow._id))
  }

  // Batch QR print handler
  const handleBatchPrintQR = () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hồ sơ để in mã QR')
      return
    }

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

  const handleExportWithTemplate = async () => {
    try {
      // Get selected rows or all data
      const rowsToExport = selectedRows.length > 0 ? selectedRows : data

      // Check if template exists
      const templates = await settingsService.getExportTemplates()
      const vehicleRecordsTemplate = templates.find((t) => t.resource === 'vehicle_records')

      if (!vehicleRecordsTemplate?.hasFile) {
        toast.error('Chưa có template Excel. Vui lòng tải lên template trong phần Cài đặt.')
        return
      }

      // Prepare data for export
      const exportData = rowsToExport.map((row) => {
        const data: any = {}
        // Use all available columns
        Object.keys(row).forEach((key) => {
          if (key !== '_id' && key !== '__v') {
            data[key] = row[key as keyof VehicleRecord] || ''
          }
        })
        return data
      })

      // Export with template
      const blob = await settingsService.exportWithTemplate({
        resource: 'vehicle_records',
        data: exportData,
        filename: 'danh-sach-ho-so-xe.xlsx',
      })

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'danh-sach-ho-so-xe.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Xuất Excel thành công')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Không thể xuất Excel. Vui lòng thử lại sau.')
    }
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
      <div className="@container/main flex flex-1 flex-col gap-2 pt-4 md:pt-6">
        {/* Table Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          showSearch={true}
          columns={columns as ColumnDef<VehicleRecord>[]}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onToggleColumn={handleToggleColumn}
          showColumnToggle={true}
          resource="vehicle_records"
          onCreate={handleCreate}
          showCreate={true}
          selectedRows={selectedRows}
          onBulkEdit={handleBulkEdit}
          onBulkCopy={handleBulkCopy}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedRows([])}
          onExport={handleExportWithTemplate}
          showExport={true}
          customActions={
            <>
              <DropdownMenuItem onClick={handleExportDropdown}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                In danh sách
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBatchPrintQR}>
                <QrCodeIcon className="mr-2 h-4 w-4" />
                In mã QR ({selectedRows.length})
              </DropdownMenuItem>
            </>
          }
        />

        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <DataTable
            ref={dataTableRef}
            loading={isFetching}
            total={total}
            data={data}
            columns={columns as ColumnDef<VehicleRecord>[]} // Will be populated by TableControls
            customActionColumn={customActionColumn as ColumnDef<VehicleRecord>}
            onPageChange={handleChangePage}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onRowSelectionChange={handleRowSelectionChange}
            showSearch={false}
            showCreate={false}
            showColumnToggle={false}
            resource="vehicle_records"
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
