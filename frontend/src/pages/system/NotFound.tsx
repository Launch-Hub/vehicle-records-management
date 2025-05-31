import NotFound from '@/components/pages/_handlers/not-found'

// 404
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <NotFound />
    </div>
  )
}
