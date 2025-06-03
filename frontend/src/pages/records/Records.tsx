import { DataTable } from '@/components/shared/list/data-table'
import { data } from '@/constants/mock-data'

export default function RecordsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}
