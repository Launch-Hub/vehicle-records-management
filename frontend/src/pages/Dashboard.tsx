import { useEffect, useState } from 'react'
import { ChartAreaInteractive } from '@/components/page/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/page/dashboard/section-cards'
import { StatusCards } from '@/components/page/dashboard/status-cards'
import { RecentActivity } from '@/components/page/dashboard/recent-activity'
import { dashboardService, type DashboardStats } from '@/lib/services/dashboard'
import { ROUTES } from '@/routes'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (err) {
        setError('Failed to load dashboard statistics')
        console.error('Dashboard stats error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Transform stats data for the cards - showing procedure statistics
  const statCards = [
    // {
    //   field: 'overdue',
    //   title: 'Hồ sơ trễ hạn',
    //   total: stats.procedureStats.overdue,
    //   unit: '',
    //   diff: 0,
    //   ratio: 0,
    //   // insights: '',
    //   colorClass: 'bg-red-100 border-red-400',
    //   url: '/quan-ly-dang-ky?status=overdue',
    // },
    {
      field: 'processing',
      title: 'Hồ sơ đang xử lý',
      total: stats.procedureStats.processing,
      unit: '',
      diff: 0,
      ratio: 0,
      // insights: '',
      colorClass: 'bg-green-100 border-green-400',
      url: '/quan-ly-dang-ky?step=2',
    },
    {
      field: 'processing',
      title: 'Hồ sơ đang trình ký',
      total: stats.procedureStats.steps.find((step) => step.step === 5)?.count || 0,
      unit: '',
      diff: 0,
      ratio: 0,
      // insights: '',
      colorClass: 'bg-green-100 border-green-400',
      url: '/quan-ly-dang-ky?step=5',
    },
    {
      field: 'archived',
      title: 'Kết quả đang chờ trả',
      total: stats.procedureStats.steps.find((step) => step.step === 6)?.count || 0,
      unit: '',
      diff: 0,
      ratio: 0,
      // insights: '',
      colorClass: 'bg-green-100 border-green-400',
      url: '/quan-ly-dang-ky?step=6',
    },
    {
      field: 'archived',
      title: 'Kết quả đã trả',
      total: stats.procedureStats.steps.find((step) => step.step === 7)?.count || 0,
      unit: '',
      diff: 0,
      ratio: 0,
      // insights: '',
      colorClass: 'bg-green-100 border-green-400',
      url: '/quan-ly-dang-ky?step=7',
    },
    // {
    //   field: 'archived',
    //   title: 'Hồ sơ đã lưu kho',
    //   total: stats.procedureStats.archived,
    //   unit: '',
    //   diff: 0,
    //   ratio: 0,
    //   // insights: '',
    //   colorClass: 'bg-green-300',
    // },
    // {
    //   field: 'archived',
    //   title: 'Hồ sơ đã ra kho',
    //   total: stats.procedureStats.archived,
    //   unit: '',
    //   diff: 0,
    //   ratio: 0,
    //   // insights: '',
    //   colorClass: 'bg-orange-200',
    // },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Banner to notify about overdue procedures */}
          {stats.procedureStats.overdue > 0 && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Đang có {stats.procedureStats.overdue} hồ sơ trễ hạn</AlertTitle>
              <AlertDescription>
                Vui lòng kiểm tra và xử lý các hồ sơ trễ hạn để đảm bảo quy trình được thực hiện đúng thời gian.
              </AlertDescription>
            </Alert>
          )}
          <SectionCards fetching={loading} data={statCards} />
          <RecentActivity fetching={loading} stats={stats} />
          {/* <StatusCards fetching={loading} stats={stats} /> */}
          <ChartAreaInteractive fetching={loading} stats={stats} />
        </div>
      </div>
    </div>
  )
}
