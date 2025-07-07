import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

interface BasicTableColumn {
  key: string
  label: string
}

interface BasicTableProps<T> {
  columns: BasicTableColumn[]
  data: T[]
  emptyText?: string
}

export function BasicTable<T extends Record<string, any>>({ columns, data, emptyText }: BasicTableProps<T>) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{row[col.key]}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                {emptyText || 'Không có dữ liệu.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
export default BasicTable;
