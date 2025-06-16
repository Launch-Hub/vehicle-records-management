import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useLoader } from '@/contexts/loader'
import { useAuth } from '@/contexts/auth'
import { ROUTES } from '@/routes'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loader = useLoader()
  const forgotUrl = ROUTES.find((e) => e.enPath === '/forgot-password')?.path || '/forgot-password'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      loader.show()
      const redirectURL = ROUTES.find((e) => e.enPath === '/dashboard')?.path || '/'
      await login(email, password, redirectURL)
    } catch (error: any) {
      if (error.response) {
        // Server responded with status code != 2xx
        const status = error.response.status
        const message =
          error.response.data?.message ||
          (status === 401
            ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
            : 'Đã xảy ra lỗi khi đăng nhập.')
        toast.error(message)
      } else if (error.request) {
        // Request made but no response
        toast.error('Không thể kết nối đến máy chủ.')
      } else {
        // Something else caused an error
        toast.error('Lỗi không xác định khi đăng nhập.')
      }
    } finally {
      loader.hide()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="mx-2 mb-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Tên đăng nhập hoặc Email</Label>
              <Input
                name="email"
                type="text"
                // placeholder="Email..."
                className="p-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                name="password"
                type="password"
                // placeholder="Mật khẩu..."
                className="p-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              size="lg"
              type="submit"
              className="w-full text-md font-bold hover:translate-y-[2px] duration-200"
            >
              Đăng nhập
            </Button>
            <Link
              className="text-indigo-800 text-sm duration-200 hover:opacity-75 flex items-center"
              to={forgotUrl}
            >
              Quên mật khẩu?
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
