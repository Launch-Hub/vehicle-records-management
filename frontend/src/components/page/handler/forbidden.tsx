import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Forbidden() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="max-w-md w-full"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-none rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <AlertTriangle className="mx-auto text-destructive" size={48} />
          <CardTitle className="text-2xl font-bold">403 - Forbidden</CardTitle>
          <p className="text-muted-foreground text-sm">
            You don’t have permission to access this page.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Login with different account
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
