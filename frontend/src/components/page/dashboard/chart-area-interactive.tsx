import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { useIsMobile } from '@/lib/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { DashboardStats } from '@/lib/services/dashboard'

interface ChartAreaInteractiveProps {
  stats: DashboardStats
}

const chartConfig = {
  records: {
    label: 'Hồ sơ xe',
    color: 'hsl(var(--chart-1))',
  },
  procedures: {
    label: 'Đăng ký',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const getTimeRangeLabel = (timeRange: string) => {
  switch (timeRange) {
    case '90d':
      return '3 tháng qua'
    case '30d':
      return '30 ngày qua'
    case '7d':
      return '7 ngày qua'
    default:
      return '30 ngày qua'
  }
}

export function ChartAreaInteractive({ stats }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState('30d')

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d')
    }
  }, [isMobile])

  // Transform stats data for the chart
  const chartData = React.useMemo(() => {
    const recordsMap = new Map(stats.trends.records.map((item) => [item._id, item.count]))
    const proceduresMap = new Map(stats.trends.procedures.map((item) => [item._id, item.count]))

    // Get all unique dates
    const allDates = new Set([
      ...stats.trends.records.map((item) => item._id),
      ...stats.trends.procedures.map((item) => item._id),
    ])

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        records: recordsMap.get(date) || 0,
        procedures: proceduresMap.get(date) || 0,
      }))
  }, [stats.trends])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardTitle>Hoạt động hệ thống</CardTitle>
          <CardDescription>
            <span className="@[540px]/card:block hidden">
              Thống kê lượng đăng ký trong {getTimeRangeLabel(timeRange)}
            </span>
          </CardDescription>
          <div className="absolute right-4 top-4">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="@[767px]/card:flex hidden"
            >
              <ToggleGroupItem value="7d" className="h-8 px-2.5">
                7 ngày
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="h-8 px-2.5">
                30 ngày
              </ToggleGroupItem>
              <ToggleGroupItem value="90d" className="h-8 px-2.5">
                3 tháng
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
                <SelectValue placeholder="30 ngày" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7d" className="rounded-lg">
                  7 ngày
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  30 ngày
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  3 tháng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="records" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="procedures" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('vi-VN', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
                className="text-xs"
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(payload[0].payload.date)
                    return (
                      <ChartTooltipContent>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-sm font-medium">Hồ sơ xe</span>
                            </div>
                            <span className="text-sm tabular-nums">{payload[0].value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-secondary" />
                              <span className="text-sm font-medium">Đăng ký</span>
                            </div>
                            <span className="text-sm tabular-nums">{payload[1]?.value || 0}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </ChartTooltipContent>
                    )
                  }
                  return null
                }}
              />
              <Area
                dataKey="records"
                fill="url(#records)"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="procedures"
                fill="url(#procedures)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
