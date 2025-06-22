import { useEffect, useState } from 'react'
import { ChartAreaInteractive } from '@/components/page/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/page/dashboard/section-cards'
import { StatusCards } from '@/components/page/dashboard/status-cards'
import { RecentActivity } from '@/components/page/dashboard/recent-activity'
import { dashboardService, type DashboardStats } from '@/lib/services/dashboard'
import { Loader2 } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Try again
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
    {
      field: 'createdPending',
      title: 'Đăng ký chờ xử lý',
      total: stats.procedureStats.createdPending,
      unit: '',
      diff: 0, // No daily tracking for this specific status
      ratio: 0,
      insights: 'Đăng ký đang chờ xử lý',
      insightsColor: 'default',
      comment: 'Trạng thái pending',
      commentColor: '',
    },
    {
      field: 'processing',
      title: 'Đăng ký đang xử lý',
      total: stats.procedureStats.processing,
      unit: '',
      diff: 0, // No daily tracking for this specific status
      ratio: 0,
      insights: 'Đăng ký đang được xử lý',
      insightsColor: 'default',
      comment: 'Trạng thái processing',
      commentColor: '',
    },
    {
      field: 'overdue',
      title: 'Đăng ký quá hạn',
      total: stats.procedureStats.overdue,
      unit: '',
      diff: 0, // No daily tracking for this specific status
      ratio: 0,
      insights: 'Đăng ký đã quá hạn xử lý',
      insightsColor: 'destructive',
      comment: 'Cần chú ý xử lý',
      commentColor: '',
    },
    {
      field: 'completedArchived',
      title: 'Đăng ký hoàn thành',
      total: stats.procedureStats.completedArchived,
      unit: '',
      diff: 0, // No daily tracking for this specific status
      ratio: 0,
      insights: 'Đăng ký đã hoàn thành',
      insightsColor: 'success',
      comment: 'Trạng thái completed/archived',
      commentColor: '',
    },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards data={statCards} />
          <div className="px-4 lg:px-6">
            <RecentActivity stats={stats} />
          </div>
          <StatusCards stats={stats} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive stats={stats} />
          </div>
        </div>
      </div>
    </div>
  )
}
