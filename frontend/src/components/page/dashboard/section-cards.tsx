import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatCardProps } from '@/lib/types/props'

interface SectionCardsProps {
  data: StatCardProps[]
}

export function SectionCards({ data }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {data.map((stat) => (
        // If stat.colorClass is provided, apply it to the Card for custom coloring
        <Card className={`@container/card ${stat.colorClass ?? ''}`.trim()} key={stat.title}>
          <CardHeader className="relative">
            <CardDescription className="text-md text-foreground">{stat.title}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stat.total?.toLocaleString('en-US')} {stat.unit}
            </CardTitle>
            <div className="absolute right-4 top-6" hidden={!stat.diff}>
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {stat.diff > 0 ? (
                  <TrendingUpIcon className="size-3 text-sucess" />
                ) : stat.diff < 0 ? (
                  <TrendingDownIcon className="size-3" />
                ) : (
                  <TrendingUpIcon className="size-3" />
                )}
                {stat.ratio?.toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{stat.insights}</div>
          </CardFooter>
        </Card>
      ))}
      {/*
        To use a custom color, pass colorClass in the data, e.g.:
        { title: 'Example', total: 10, colorClass: 'bg-blue-100 text-blue-900' }
      */}
    </div>
  )
}
