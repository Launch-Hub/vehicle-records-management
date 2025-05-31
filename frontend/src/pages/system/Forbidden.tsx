import Forbidden from '@/components/pages/_handlers/forbidden'

// 403
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-muted px-4">
      <Forbidden />
    </div>
  )
}
