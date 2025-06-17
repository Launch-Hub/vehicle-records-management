/*
  Updated DataTable.tsx
  - Injected handlers: onCreate, onEdit, onDelete
  - Columns are inferred from data's keys if not provided
  - Modal added for item creation
  - Preserved original classNames
*/

import * as React from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { PlusIcon, MoreVerticalIcon, GripVerticalIcon, ChevronDownIcon } from 'lucide-react'

interface DataTableProps<T> {
  data: T[]
  columns?: ColumnDef<T>[]
  onCreate?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
    </Button>
  )
}

function DraggableRow<T>({ row }: { row: Row<T> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.id })
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging}
      data-state={row.getIsSelected() && 'selected'}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable<T extends Record<string, any>>({
  data: initialData,
  columns,
  onCreate,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [data, setData] = React.useState<T[]>(initialData)
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const defaultColumns: ColumnDef<T>[] = React.useMemo(() => {
    if (columns) return columns
    if (!initialData.length) return []
    return Object.keys(initialData[0]).map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      cell: (info) => <span className="text-muted-foreground">{String(info.getValue())}</span>,
    }))
  }, [columns, initialData])

  const table = useReactTable({
    data,
    columns: defaultColumns,
    state: { rowSelection, columnVisibility, columnFilters, sorting },
    getRowId: (_, i) => i.toString(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIdx = prev.findIndex((_, idx) => idx.toString() === active.id)
        const newIdx = prev.findIndex((_, idx) => idx.toString() === over.id)
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDownIcon className="mr-2 size-4" /> Columns
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
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="mr-2 size-4" /> Add New
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={table.getRowModel().rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
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
                  table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={defaultColumns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>

      <Sheet open={showCreateModal} onOpenChange={setShowCreateModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Item</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <Button
              onClick={() => {
                onCreate?.()
                setShowCreateModal(false)
              }}
              className="w-full"
            >
              Create
            </Button>
            <Button onClick={() => setShowCreateModal(false)} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>
    </div>
  )
}
