import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileTextIcon, PackageIcon } from 'lucide-react'

interface RecentActivityProps {
  stats: {
    today: {
      records: number
      procedures: number
      bulks: number
    }
    week: {
      records: number
      procedures: number
    }
  }
}

export function RecentActivity({ stats }: RecentActivityProps) {
  const activities = [
    // {
    //   icon: FileTextIcon,
    //   title: 'Hồ sơ xe mới',
    //   count: stats.today.records,
    //   period: 'Hôm nay',
    //   color: 'text-blue-600',
    //   bgColor: 'bg-blue-50 dark:bg-blue-950',
    // },
    {
      icon: PackageIcon,
      title: 'Đăng ký mới',
      count: stats.today.procedures,
      period: 'Hôm nay',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    // {
    //   icon: PackageIcon,
    //   title: 'Lần nhập hồ sơ mới',
    //   count: stats.today.bulks,
    //   period: 'Hôm nay',
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-50 dark:bg-purple-950',
    // },
    {
      icon: FileTextIcon,
      title: 'Hồ sơ tuần này',
      count: stats.week.records,
      period: '7 ngày qua',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      icon: PackageIcon,
      title: 'Đăng ký tuần này',
      count: stats.week.procedures,
      period: '7 ngày qua',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
        <CardDescription>
          Tổng quan hoạt động trong ngày và tuần
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-lg p-3 ${activity.bgColor}`}
            >
              <div className={`p-2 rounded-md ${activity.bgColor}`}>
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {activity.count}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activity.period}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 