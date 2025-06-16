import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@/routes'

export default function Forbidden() {
  const navigate = useNavigate()
  const loginUrl = ROUTES.find((e) => e.enPath === '/login')?.path || '/login'

  return (
    <motion.div
      className="max-w-md w-full"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-none rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <AlertTriangle className="mx-auto text-destructive" size={54} />
          <CardTitle className="text-2xl font-bold text-warning">
            {/* 403 - Forbidden */}
            Truy cập bị hạn chế
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {/* You don't have permission to access this page. */}
            Bạn không có quyền truy cập trang này
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            Quay lại
            {/* Go Back */}
          </Button>
          <Button variant="outline" onClick={() => navigate(loginUrl)}>
            {/* Login with different account */}
            Đăng nhập bằng tài khoản khác
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
