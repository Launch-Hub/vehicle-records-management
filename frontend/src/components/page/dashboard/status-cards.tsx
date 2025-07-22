import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DashboardStats } from '@/lib/services/dashboard'
import { getStatusLabel } from '@/constants/dictionary'

interface StatusCardsProps {
  stats: DashboardStats
  fetching: boolean
}

export function StatusCards({ stats, fetching }: StatusCardsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
      {/* Vehicle Records by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hồ sơ xe theo trạng thái</CardTitle>
          <CardDescription>Phân bố {stats.totals.records} hồ sơ theo trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.byStatus.records.length > 0 ? (
              stats.byStatus.records.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item._id)}>{getStatusLabel(item._id)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.count / stats.totals.records) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Procedures by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Đăng ký theo trạng thái</CardTitle>
          <CardDescription>
            Phân bố {stats.totals.procedures} đăng ký theo trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.byStatus.procedures.length > 0 ? (
              stats.byStatus.procedures.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item._id)}>{getStatusLabel(item._id)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.count / stats.totals.procedures) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
