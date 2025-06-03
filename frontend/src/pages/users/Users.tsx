import { DataTable } from '@/components/shared/list/data-table'
import type { User } from '@/lib/types'
import { useEffect, useState } from 'react'

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])

  const fetchData = async () => {
    try {
    } catch {}
    return []
  }

  useEffect(() => {}, [])

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
