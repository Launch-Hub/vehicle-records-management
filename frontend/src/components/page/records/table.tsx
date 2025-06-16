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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface DataTableProps<T> {
  loading: boolean
  data: T[]
  columns?: ColumnDef<T>[]
  onSearch: (term: string) => void
  onPageChange: (pagination: PaginationProps) => void
  onCreate: () => void
  onEdit: (item: T) => void
  onCopy: (item: T) => void
  onDelete: (id: string) => void
}

function DataRow<T>({ row }: { row: Row<T> }) {
  return (
    <TableRow data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function RecordDataTable<T extends Record<string, any>>({
  data: initialData,
  loading,
  columns,
  onSearch,
  onPageChange,
  onCreate,
  onEdit,
  onDelete,
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

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    onSearch(term)
  }

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
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const defaultColumns: ColumnDef<T>[] = useMemo(() => {
    const userColumns = columns
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

    return [selectColumn, ...userColumns, actionColumn]
  }, [columns, initialData])

  const table = useReactTable({
    data,
    columns: defaultColumns,
    state: { rowSelection, columnVisibility, columnFilters, sorting, pagination },
    getRowId: (_, i) => i.toString(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex w-full flex-col justify-start gap-6">
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
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={onCreate}>
            <PlusIcon /> <span className="hidden lg:inline">Tạo mới</span>
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
                    <TableHead key={header.id}>
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
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Đến trang đầu</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Trang trước</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Trang kế</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
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
    </div>
  )
}
