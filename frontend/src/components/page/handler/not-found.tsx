import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-none rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <SearchX className="mx-auto text-primary" size={48} />
          <CardTitle className="text-2xl font-bold">404 - Not Found</CardTitle>
          <p className="text-muted-foreground text-sm">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
