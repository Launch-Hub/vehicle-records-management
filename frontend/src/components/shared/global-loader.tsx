import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GlobalLoader() {
  return (
    // prettier-ignore
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm')}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}
