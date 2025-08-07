import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchIcon, ChevronDownIcon, PlusIcon, MoreVerticalIcon, Trash2Icon, CopyIcon, EditIcon } from 'lucide-react'
import { getLabel } from '@/constants/dictionary'
import type { VisibilityState } from '@tanstack/react-table'

interface TableControlsProps<T> {
  // Search
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: (term: string) => void
  showSearch?: boolean
  
  // Column visibility
  columns: any[]
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (visibility: VisibilityState) => void
  onToggleColumn: (columnId: string) => void
  showColumnToggle?: boolean
  resource: string
  
  // Actions
  onCreate: () => void
  showCreate?: boolean
  
  // Bulk actions
  selectedRows: T[]
  onBulkEdit?: () => void
  onBulkCopy?: () => void
  onBulkDelete?: () => void
  onClearSelection?: () => void
  
  // Export
  onExport?: () => void
  showExport?: boolean
}

export function TableControls<T>({
  searchTerm,
  onSearchChange,
  onSearch,
  showSearch = true,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onToggleColumn,
  showColumnToggle = true,
  resource,
  onCreate,
  showCreate = true,
  selectedRows,
  onBulkEdit,
  onBulkCopy,
  onBulkDelete,
  onClearSelection,
  onExport,
  showExport = true,
}: TableControlsProps<T>) {
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleSearchInputBlur = () => {
    onSearch(searchTerm)
  }

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm)
    }
  }

  return (
    <div className="flex items-center justify-between pt-4 px-4 md:pt-6 md:px-6">
      {/* Search */}
      {showSearch && (
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
      )}
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Selection info */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm text-muted-foreground">
              Đã chọn {selectedRows.length} mục
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Bỏ chọn
            </Button>
          </div>
        )}
        
        {/* Column visibility */}
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!columns.filter((col) => col.getCanHide?.()).length}
              asChild
            >
              <Button variant="outline" size="sm">
                <ChevronDownIcon className="size-4" /> Cột hiển thị
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {columns
                .filter((col) => col.getCanHide?.())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible?.()}
                    onCheckedChange={() => onToggleColumn(col.id)}
                  >
                    {getLabel(
                      (col.columnDef.header && typeof col.columnDef.header === 'string'
                        ? col.columnDef.header
                        : col.id) as keyof typeof import('@/constants/dictionary')[typeof resource],
                      resource as any
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="success" size="sm">
              Thao tác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {selectedRows.length > 0 ? (
              <>
                {onBulkEdit && (
                  <DropdownMenuItem onClick={onBulkEdit}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onBulkCopy && (
                  <DropdownMenuItem onClick={onBulkCopy}>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Sao chép
                  </DropdownMenuItem>
                )}
                {onBulkDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onBulkDelete}>
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      <span className="text-destructive">Xóa ({selectedRows.length})</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
              </>
            ) : null}
            {onExport && (
              <DropdownMenuItem onClick={onExport}>In danh sách</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Create button */}
        {showCreate && (
          <Button variant="default" size="sm" onClick={onCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Thêm</span>
          </Button>
        )}
      </div>
    </div>
  )
} 