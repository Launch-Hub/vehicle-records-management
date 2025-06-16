// import * as React from 'react'
// import {
//   DndContext,
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   closestCenter,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
//   type UniqueIdentifier,
// } from '@dnd-kit/core'
// import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
// import {
//   SortableContext,
//   arrayMove,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable'
// import { CSS } from '@dnd-kit/utilities'
// import type {
//   ColumnDef,
//   ColumnFiltersState,
//   Row,
//   SortingState,
//   VisibilityState,
// } from '@tanstack/react-table'
// import {
//   flexRender,
//   getCoreRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from '@tanstack/react-table'
// import {
//   CheckCircle2Icon,
//   ChevronDownIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   ChevronsLeftIcon,
//   ChevronsRightIcon,
//   ColumnsIcon,
//   GripVerticalIcon,
//   LoaderIcon,
//   MoreVerticalIcon,
//   PlusIcon,
//   TrendingUpIcon,
// } from 'lucide-react'
// import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
// import { toast } from 'sonner'
// import { z } from 'zod'

// import { useIsMobile } from '@/lib/hooks/use-mobile'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import {
//   type ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from '@/components/ui/chart'
// import { Checkbox } from '@/components/ui/checkbox'
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Separator } from '@/components/ui/separator'
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// interface DataTableProps<T> {
//   data: T[]
//   columns?: ColumnDef<T>[]
//   onCreate?: () => void
//   onEdit?: (item: T) => void
//   onDelete?: (item: T) => void
// }

// const defaultColumns: ColumnDef<T>[] = [
//   {
//     id: 'drag',
//     header: () => null,
//     cell: ({ row }) => <DragHandle id={row.original.id} />,
//   },
//   {
//     id: 'select',
//     header: ({ table }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() ||
//             (table.getIsSomePageRowsSelected() && 'indeterminate')
//           }
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       </div>
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: 'header',
//     header: 'Header',
//     cell: ({ row }) => {
//       return <TableCellViewer item={row.original} />
//     },
//     enableHiding: false,
//   },
//   {
//     id: 'actions',
//     cell: () => (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="ghost"
//             className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
//             size="icon"
//           >
//             <MoreVerticalIcon />
//             <span className="sr-only">Open menu</span>
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-32">
//           <DropdownMenuItem>Edit</DropdownMenuItem>
//           <DropdownMenuItem>Make a copy</DropdownMenuItem>
//           <DropdownMenuItem>Favorite</DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem>Delete</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     ),
//   },
// ]

// // Create a separate component for the drag handle
// function DragHandle({ id }: { id: number }) {
//   const { attributes, listeners } = useSortable({
//     id,
//   })

//   return (
//     <Button
//       {...attributes}
//       {...listeners}
//       variant="ghost"
//       size="icon"
//       className="size-7 text-muted-foreground hover:bg-transparent"
//     >
//       <GripVerticalIcon className="size-3 text-muted-foreground" />
//       <span className="sr-only">Drag to reorder</span>
//     </Button>
//   )
// }

// function DraggableRow({ row }: { row: Row<T> }) {
//   const { transform, transition, setNodeRef, isDragging } = useSortable({
//     id: row.original.id,
//   })

//   return (
//     <TableRow
//       data-state={row.getIsSelected() && 'selected'}
//       data-dragging={isDragging}
//       ref={setNodeRef}
//       className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
//       style={{
//         transform: CSS.Transform.toString(transform),
//         transition: transition,
//       }}
//     >
//       {row.getVisibleCells().map((cell) => (
//         <TableCell key={cell.id}>
//           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//         </TableCell>
//       ))}
//     </TableRow>
//   )
// }

// export function DataTable<T extends Record<string, any>>({
//   data: initialData,
//   onCreate,
//   onEdit,
//   onDelete,
// }: DataTableProps<T>) {
//   const [data, setData] = React.useState(() => initialData)
//   const [rowSelection, setRowSelection] = React.useState({})
//   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
//   const [sorting, setSorting] = React.useState<SortingState>([])
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   })
//   const sortableId = React.useId()
//   const sensors = useSensors(
//     useSensor(MouseSensor, {}),
//     useSensor(TouchSensor, {}),
//     useSensor(KeyboardSensor, {})
//   )

//   const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

//   const table = useReactTable({
//     data,
//     columns: defaultColumns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       columnFilters,
//       pagination,
//     },
//     getRowId: (row) => row.id.toString(),
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//   })

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event
//     if (active && over && active.id !== over.id) {
//       setData((data) => {
//         const oldIndex = dataIds.indexOf(active.id)
//         const newIndex = dataIds.indexOf(over.id)
//         return arrayMove(data, oldIndex, newIndex)
//       })
//     }
//   }

//   return (
//     <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 lg:px-6">
//         <Label htmlFor="view-selector" className="sr-only">
//           View
//         </Label>
//         <Select defaultValue="outline">
//           <SelectTrigger className="@4xl/main:hidden flex w-fit" id="view-selector">
//             <SelectValue placeholder="Select a view" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="outline">Outline</SelectItem>
//             <SelectItem value="past-performance">Past Performance</SelectItem>
//             <SelectItem value="key-personnel">Key Personnel</SelectItem>
//             <SelectItem value="focus-documents">Focus Documents</SelectItem>
//           </SelectContent>
//         </Select>
//         <TabsList className="@4xl/main:flex hidden">
//           <TabsTrigger value="outline">Outline</TabsTrigger>
//           <TabsTrigger value="past-performance" className="gap-1">
//             Past Performance{' '}
//             <Badge
//               variant="secondary"
//               className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
//             >
//               3
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="key-personnel" className="gap-1">
//             Key Personnel{' '}
//             <Badge
//               variant="secondary"
//               className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
//             >
//               2
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
//         </TabsList>
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <ColumnsIcon />
//                 <span className="hidden lg:inline">Cột hiển thị</span>
//                 <span className="lg:hidden">Columns</span>
//                 <ChevronDownIcon />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               {table
//                 .getAllColumns()
//                 .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   )
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Button variant="outline" size="sm">
//             <PlusIcon />
//             <span className="hidden lg:inline">Add Section</span>
//           </Button>
//         </div>
//       </div>
//       <TabsContent
//         value="outline"
//         className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
//       >
//         <div className="overflow-hidden rounded-lg border">
//           <DndContext
//             collisionDetection={closestCenter}
//             modifiers={[restrictToVerticalAxis]}
//             onDragEnd={handleDragEnd}
//             sensors={sensors}
//             id={sortableId}
//           >
//             <Table>
//               <TableHeader className="sticky top-0 z-10 bg-muted">
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => {
//                       return (
//                         <TableHead key={header.id} colSpan={header.colSpan}>
//                           {header.isPlaceholder
//                             ? null
//                             : flexRender(header.column.columnDef.header, header.getContext())}
//                         </TableHead>
//                       )
//                     })}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody className="**:data-[slot=table-cell]:first:w-8">
//                 {table.getRowModel().rows?.length ? (
//                   <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
//                     {table.getRowModel().rows.map((row) => (
//                       <DraggableRow key={row.id} row={row} />
//                     ))}
//                   </SortableContext>
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={defaultColumns.length} className="h-24 text-center">
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </DndContext>
//         </div>
//         <div className="flex items-center justify-between px-4">
//           <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of{' '}
//             {table.getFilteredRowModel().rows.length} row(s) selected.
//           </div>
//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <Label htmlFor="rows-per-page" className="text-sm font-medium">
//                 Số dòng mỗi trang
//               </Label>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   table.setPageSize(Number(value))
//                 }}
//               >
//                 <SelectTrigger className="w-20" id="rows-per-page">
//                   <SelectValue placeholder={table.getState().pagination.pageSize} />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((pageSize) => (
//                     <SelectItem key={pageSize} value={`${pageSize}`}>
//                       {pageSize}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//             </div>
//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Đến trang đầu</span>
//                 <ChevronsLeftIcon />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Trang trước</span>
//                 <ChevronLeftIcon />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Trang kế</span>
//                 <ChevronRightIcon />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Đến trang cuối</span>
//                 <ChevronsRightIcon />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
//       <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//     </Tabs>
//   )
// }

// function TableCellViewer({ item }: { item: T }) {
//   const isMobile = useIsMobile()

//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="link" className="w-fit px-0 text-left text-foreground">
//           {item.header}
//         </Button>
//       </SheetTrigger>
//       <SheetContent side="right" className="flex flex-col">
//         <SheetHeader className="gap-1">
//           <SheetTitle>{item.header}</SheetTitle>
//           <SheetDescription>{item.status}</SheetDescription>
//         </SheetHeader>
//         <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
//           <form className="flex flex-col gap-4">
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="header">Header</Label>
//               <Input id="header" defaultValue={item.header} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="type">Type</Label>
//                 <Select defaultValue={item.type}>
//                   <SelectTrigger id="type" className="w-full">
//                     <SelectValue placeholder="Select a type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Table of Contents">Table of Contents</SelectItem>
//                     <SelectItem value="Executive Summary">Executive Summary</SelectItem>
//                     <SelectItem value="Technical Approach">Technical Approach</SelectItem>
//                     <SelectItem value="Design">Design</SelectItem>
//                     <SelectItem value="Capabilities">Capabilities</SelectItem>
//                     <SelectItem value="Focus Documents">Focus Documents</SelectItem>
//                     <SelectItem value="Narrative">Narrative</SelectItem>
//                     <SelectItem value="Cover Page">Cover Page</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="status">Status</Label>
//                 <Select defaultValue={item.status}>
//                   <SelectTrigger id="status" className="w-full">
//                     <SelectValue placeholder="Select a status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Done">Done</SelectItem>
//                     <SelectItem value="In Progress">In Progress</SelectItem>
//                     <SelectItem value="Not Started">Not Started</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="target">Target</Label>
//                 <Input id="target" defaultValue={item.target} />
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="limit">Limit</Label>
//                 <Input id="limit" defaultValue={item.limit} />
//               </div>
//             </div>
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="reviewer">Reviewer</Label>
//               <Select defaultValue={item.reviewer}>
//                 <SelectTrigger id="reviewer" className="w-full">
//                   <SelectValue placeholder="Select a reviewer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                   <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
//                   <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </form>
//         </div>
//         <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
//           <Button className="w-full">Submit</Button>
//           <SheetClose asChild>
//             <Button variant="outline" className="w-full">
//               Done
//             </Button>
//           </SheetClose>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   )
// }
