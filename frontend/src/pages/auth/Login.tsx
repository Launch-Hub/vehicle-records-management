import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token } = res.data
      localStorage.setItem('token', token) // Store token for later use
    } catch (err) {
      console.error(err)
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="mx-2 mb-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email..."
              className="p-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Enter password..."
              className="p-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full font-extrabold hover:translate-y-[2px] duration-200"
            >
              Let's Start!
            </Button>
          </form>
          {error ? <p className="mt-4 text-center text-sm">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
