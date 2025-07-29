import { useEffect, useState } from 'react'
import { procedureService } from '@/lib/services/procedures'
import type { Procedure } from '@/lib/types/tables.type'
import { useLoader } from '@/contexts/loader/use-loader'
import { Calendar, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ProcedureHistoryProps {
  recordId: string
}

interface HistoryItem {
  _id: string
  procedureId: string
  procedureTitle: string
  step: number
  stepTitle: string
  action: string | { _id: string; name: string; step: number }
  actionName: string
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  status: string
}

const getStatusIcon = (status: string, isCompleted: boolean) => {
  if (isCompleted) {
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }
  if (status === 'cancelled') {
    return <AlertCircle className="h-5 w-5 text-red-500" />
  }
  return <Circle className="h-5 w-5 text-gray-400" />
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành'
    case 'processing':
      return 'Đang xử lý'
    case 'cancelled':
      return 'Đã hủy'
    case 'pending':
      return 'Chờ xử lý'
    default:
      return status
  }
}

export default function ProcedureHistory({ recordId }: ProcedureHistoryProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const loader = useLoader()

  useEffect(() => {
    const fetchHistory = async () => {
      loader.show()
      try {
        const response = await procedureService.getByRecordId(recordId, { noPagination: true })
        
        // Flatten all steps from all procedures into a single timeline
        const items: HistoryItem[] = []
        
        response.items.forEach((procedure: Procedure) => {
          procedure.steps.forEach((step) => {
            items.push({
              _id: step._id || `${procedure._id}-${step.order}`,
              procedureId: procedure._id,
              procedureTitle: procedure.registrationType,
              step: step.step,
              stepTitle: step.title,
              action: step.action,
              actionName: (step.action as any)?.name || 'N/A',
              isCompleted: step.isCompleted,
              completedAt: step.completedAt,
              createdAt: step.createdAt || procedure.createdAt,
              status: procedure.status,
            })
          })
        })

        // Sort by date descending (newest first)
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setHistoryItems(items)
      } catch (error) {
        console.error('Error fetching procedure history:', error)
      } finally {
        setLoading(false)
        loader.hide()
      }
    }

    if (recordId) {
      fetchHistory()
    }
  }, [recordId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải lịch sử...</p>
        </div>
      </div>
    )
  }

  if (historyItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có đăng ký nào</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        {historyItems.map((item, index) => (
          <div key={item._id} className="relative flex items-start space-x-4 mb-6">
            {/* Timeline dot */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-background border-2 border-border rounded-full">
              {getStatusIcon(item.status, item.isCompleted)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {item.stepTitle}
                    </CardTitle>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(item.createdAt), 'HH:mm', { locale: vi })}
                      </span>
                    </div>
                    {item.completedAt && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Hoàn thành: {format(new Date(item.completedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Thủ tục:</span>
                      <span className="ml-2 text-sm">{item.procedureTitle}</span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Bước:</span>
                      <span className="ml-2 text-sm">{item.step}</span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Hành động:</span>
                      <span className="ml-2 text-sm">{item.actionName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 