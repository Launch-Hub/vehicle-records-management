import Forbidden from '@/components/page/handler/forbidden'

// 403
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-muted px-4">
      <Forbidden />
    </div>
  )
}
