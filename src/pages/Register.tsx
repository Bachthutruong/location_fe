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
import { Select } from '../components/ui/select'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(1, '名稱不可為空'),
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(6, '密碼至少需 6 個字元'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'manager']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '兩次輸入的密碼不一致',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'user',
      })
      setToken(response.data.token)
      setUser(response.data.user)
      toast.success('註冊成功！')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">註冊</CardTitle>
          <CardDescription>
            建立新帳號
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名稱</Label>
              <Input
                id="name"
                type="text"
                placeholder="您的名稱"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
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
              <Label htmlFor="role">角色</Label>
              <Select {...register('role')} id="role">
                <option value="user">使用者</option>
                <option value="manager">管理者</option>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '註冊中...' : '註冊'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            已有帳號？{' '}
            <Link to="/login" className="text-primary hover:underline">
              登入
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register



