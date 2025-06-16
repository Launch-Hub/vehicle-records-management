import NotFound from '@/components/page/handler/not-found'

// 404
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <NotFound />
    </div>
  )
}
