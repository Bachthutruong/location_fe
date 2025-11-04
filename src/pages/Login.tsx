import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../lib/api'
import { setToken, setUser } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(6, '密碼至少需 6 個字元'),
})

type LoginForm = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', data)
      setToken(response.data.token)
      setUser(response.data.user)
      toast.success('登入成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">登入</CardTitle>
          <CardDescription>
            請輸入您的登入資訊
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            還沒有帳號？{' '}
            <Link to="/register" className="text-primary hover:underline">
              註冊
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login



