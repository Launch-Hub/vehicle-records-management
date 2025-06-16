export interface DialogProps<T> {
  open: boolean
  onClose: () => void
  onSubmit: (action: string, data: Omit<T, '_id'>) => void
  initialData?: T
  isCopying?: boolean
}

export interface PaginationProps {
  pageIndex?: number
  pageSize?: number
}
