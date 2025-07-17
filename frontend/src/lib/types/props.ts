// Dialog
export interface DialogProps<T> {
  open: boolean
  onClose: () => void
  onSubmit: (action: string, data: Omit<T, '_id'>) => void
  initialData?: T
  isCopying?: boolean
  isSelfEdit?: boolean
  isChangeStep?: boolean
}

// Pagination
export interface PaginationProps {
  pageIndex: number
  pageSize: number
}

// Statistics
export interface StatProps {
  total: number
  unit: string
  diff: number // the difference from previous
  ratio: number // the difference ratio from previous (%)
}
export interface StatCardProps extends StatProps {
  field: string
  title: string
  insights?: string
  colorClass?: string; // Optional custom class for card color
}
export interface StatChartProps {
  field: string
  title: string
  insights: string
  chartData: StatProps[]
  colorClass?: string; // Optional custom class for card color
}
