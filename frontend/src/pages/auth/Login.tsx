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
import { LogoPng } from '@/constants/assets'

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
      const redirectURL = ROUTES.find((e) => e.enPath === '/')?.path || '/'
      await login(email, password, redirectURL)
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status
        const message =
          error.response.data?.message ||
          (status === 401
            ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
            : 'Đã xảy ra lỗi khi đăng nhập.')
        toast.error(message)
      } else if (error.request) {
        toast.error('Không thể kết nối đến máy chủ.')
      } else {
        toast.error('Lỗi không xác định khi đăng nhập.')
      }
    } finally {
      loader.hide()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-3xl flex rounded-xl shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div
          className="hidden md:block w-2/5 bg-cover bg-center"
          // style={{
          //   backgroundImage:
          //     'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800)',
          // }}
        >
          <div className="h-full bg-accent flex flex-col items-center justify-center">
            <h2 className="text-secondary text-2xl font-bold text-center">Đăng Ký Xe</h2>
            <h1 className="text-primary text-5xl font-extrabold text-center p-4">Minh Tú</h1>
            <div className="max-w-1/2 mx-auto">
              <img src={LogoPng} className="w-full object-contain" />
            </div>
          </div>
        </div>
        {/* Login Form Section */}
        <Card className="w-full md:w-3/5 bg-background border-none rounded-none">
          <CardHeader className="pt-8">
            <CardTitle className="text-3xl font-bold text-center">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Tên đăng nhập hoặc Email</Label>
                <Input
                  name="email"
                  type="text"
                  className="p-4 text-base rounded-lg"
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
                  className="p-4 text-base rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                size="lg"
                type="submit"
                className="w-full text-lg font-bold hover:bg-primary/90 transition-transform hover:-translate-y-1 duration-200"
              >
                Đăng nhập
              </Button>
              <Link
                className="text-indigo-800 text-sm hover:text-indigo-600 transition-opacity duration-200 flex items-center"
                to={forgotUrl}
              >
                Quên mật khẩu?
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
