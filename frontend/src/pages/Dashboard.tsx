import { ChartAreaInteractive } from '@/components/page/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/page/dashboard/section-cards'

const mock_stat_cards = [
  {
    field: 'users',
    title: 'Tổng số người dùng',
    total: 1515,
    unit: '',
    diff: 15, // the difference from previous
    ratio: 10, // the difference from previous
    insights: 'Tăng trưởng tốt trong 3 tháng trở lại đây',
    insightsColor: 'success',
    comment: '',
    commentColor: '',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards data={mock_stat_cards} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  )
}
