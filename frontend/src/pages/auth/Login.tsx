import api from '@/lib/axios'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { useLoader } from '@/contexts/loader/use-loader'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loader = useLoader()

  const handleLogin = async (e: any) => {
    e.preventDefault() // Prevent form submission
    try {
      loader.show()
      const res = await api.post('/auth/login', { email, password })
      const { token } = res.data
      localStorage.setItem('token', token) // Store token for later use
      return navigate('/dashboard') // Redirect to dashboard after successful login
    } catch (err) {
      console.error(err)
      toast.error('Login failed! Invalid email or password.')
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
            <Input
              type="email"
              placeholder="Email..."
              className="p-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Mật khẩu..."
              className="p-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              size={'lg'}
              type="submit"
              className="w-full font-abold hover:translate-y-[2px] duration-200"
            >
              Đăng nhập
            </Button>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
