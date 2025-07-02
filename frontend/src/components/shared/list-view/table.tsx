import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type ColumnDef,
  type Row,
  type VisibilityState,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  PlusIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  ChevronsRightIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronsLeftIcon,
  SearchIcon,
  FileSpreadsheet,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { PaginationProps } from '@/lib/types/props'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLabel } from '@/constants/dictionary'
import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LoaderOverlay } from '@/components/shared/loader/loader-overlay'

interface DataTableProps<T> {
  loading: boolean
  total: number
  data: T[]
  columns: ColumnDef<T>[]
  onSearch: (term: string) => void
  onPageChange: (pagination: PaginationProps) => void
  onCreate: () => void
  onEdit: (item: T) => void
  onCopy: (item: T) => void
  onDelete: (id: string) => void
  onExport?: (rows: T[], columns: { key: string; label: string }[]) => void
}

function DataRow<T>({ row }: { row: Row<T> }) {
  return (
    <TableRow data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable<T extends Record<string, any>>({
  total,
  data: initialData,
  loading,
  columns,
  onSearch,
  onPageChange,
  onCreate,
  onEdit,
  onCopy,
  onDelete,
  onExport,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>(() => initialData)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item: T | null }>({
    open: false,
    item: null,
  })
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>(() => {
    if (!columns) return []
    return columns.map((col: any) => (typeof col.accessorKey === 'string' ? col.accessorKey : ''))
  })

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const selectColumn: ColumnDef<T> = {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  }

  const actionColumn: ColumnDef<T> = {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 text-muted-foreground" size="icon">
            <MoreVerticalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
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

  const defaultColumns: ColumnDef<T>[] = useMemo(() => {
    const dataColumns = columns
      ? columns
      : initialData.length
      ? Object.keys(initialData[0])
          .filter((e) => e != '_id')
          .map((key) => ({
            accessorKey: key,
            // header: key.charAt(0).toUpperCase() + key.slice(1),
            header: () => <>{getLabel(key)}</>,
            cell: (info: any) => (
              <span className="text-muted-foreground">{String(info.getValue())}</span>
            ),
          }))
      : []

    return [selectColumn, ...dataColumns, actionColumn]
  }, [selectColumn, actionColumn, columns, initialData])

  const table = useReactTable({
    // Use a default pageSize for pageCount calculation
    pageCount: Math.ceil(total / pagination.pageSize), // Fallback to 10 if pageSize isn't available yet
    data,
    columns: defaultColumns,
    state: { rowSelection, columnVisibility, columnFilters, sorting, pagination },
    getRowId: (_, i) => i.toString(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(table.getState().pagination) : updater
      setPagination(newState)
      onPageChange(newState)
      setRowSelection({})
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    table.setPageIndex(0) // Reset to first page on search
    onSearch(term)
  }

  // Pagination handlers
  const toFirstPage = () => table.setPageIndex(0)
  const toPreviousPage = () => table.previousPage()
  const toNextPage = () => table.nextPage()
  const toLastPage = () => table.setPageIndex(table.getPageCount() - 1)

  // Get selected rows
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)

  const allExportableColumns =
    columns?.filter((col: any) => typeof col.accessorKey === 'string') || []

  const handleExportClick = () => {
    setExportDialogOpen(true)
  }

  const handleExportConfirm = () => {
    if (onExport) {
      // Only export selected columns
      const selectedCols = allExportableColumns.filter((col: any) =>
        selectedExportColumns.includes(col.accessorKey as string)
      )
      // Map to { key, label }
      const exportColumns = selectedCols.map((col: any) => ({
        key: col.accessorKey as string,
        label: getLabel(col.accessorKey as string),
      }))
      onExport(selectedRows, exportColumns)
    }
    setExportDialogOpen(false)
  }

  return (
    <div className="flex w-full flex-col justify-start gap-6 relative">
      {loading && <LoaderOverlay />}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="cursor-pointer absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={(e) => handleSearch(e.target.value)}
            className="w-full pr-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!table.getAllColumns().filter((col) => col.getCanHide()).length}
              asChild
            >
              <Button variant="outline" size="sm">
                <ChevronDownIcon className="mr-2 size-4" /> Cột hiển thị
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={() => col.toggleVisibility()}
                  >
                    {typeof col.columnDef.header === 'string'
                      ? col.columnDef.header
                      : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={onCreate}>
            <PlusIcon /> <span className="hidden lg:inline">Tạo mới</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
            disabled={!selectedRows.length}
            className="border-success text-success hover:border-success hover:text-success"
          >
            <FileSpreadsheet className="mr-2 size-4" />
            Xuất Excel
          </Button>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => <DataRow key={row.id} row={row} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={defaultColumns.length} className="h-24 text-center">
                    Không tìm thấy kết quả nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          {table.getFilteredSelectedRowModel().rows.length ? (
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              Đang chọn {table.getFilteredSelectedRowModel().rows.length} trên{' '}
              {table.getFilteredRowModel().rows.length} hàng.
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số dòng mỗi trang
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={toFirstPage}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Đến trang đầu</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={toPreviousPage}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Trang trước</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={toNextPage}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Trang kế</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={toLastPage}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Đến trang cuối</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn chắc chắn muốn xoá người dùng này chứ?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete.item) {
                  onDelete(confirmDelete.item._id)
                }
                setConfirmDelete({ open: false, item: null })
              }}
            >
              Xoá
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false, item: null })}>
              Huỷ bỏ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn cột để xuất Excel</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-60 overflow-auto">
            {allExportableColumns.map((col: any) => (
              <label key={col.accessorKey as string} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedExportColumns.includes(col.accessorKey as string)}
                  onCheckedChange={(checked) => {
                    setSelectedExportColumns((prev) =>
                      checked
                        ? [...prev, col.accessorKey as string]
                        : prev.filter((k) => k !== col.accessorKey)
                    )
                  }}
                />
                <span>{getLabel(col.accessorKey as string)}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleExportConfirm} disabled={!selectedExportColumns.length}>
              Xuất Excel
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
