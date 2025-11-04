import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Plus, Edit, Trash2, Key } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  _id: string
  email: string
  name: string
  role: 'admin' | 'staff' | 'manager' | 'user'
  createdAt: string
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as User['role'],
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: '',
    newPassword: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      toast.error('載入使用者列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('請填寫完整資訊')
      return
    }

    if (!editingUser && !formData.password) {
      toast.error('請輸入密碼')
      return
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      if (!editingUser || formData.password) {
        payload.password = formData.password
      }

      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, payload)
        toast.success('更新使用者成功！')
      } else {
        await api.post('/users', payload)
        toast.success('新增使用者成功！')
      }
      handleCloseDialog()
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存使用者時發生錯誤')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此使用者嗎？')) {
      return
    }

    try {
      await api.delete(`/users/${id}`)
      toast.success('刪除使用者成功！')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除使用者時發生錯誤')
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6) {
      toast.error('密碼長度至少需 6 個字元')
      return
    }

    try {
      await api.patch(`/users/${resetPasswordData.userId}/reset-password`, {
        newPassword: resetPasswordData.newPassword,
      })
      toast.success('重設密碼成功！')
      setResetPasswordOpen(false)
      setResetPasswordData({ userId: '', newPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || '重設密碼時發生錯誤')
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: '管理員',
      staff: '員工',
      manager: '管理者',
      user: '使用者',
    }
    return labels[role] || role
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              使用者管理
            </h1>
            <p className="text-muted-foreground">管理員工與管理者</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="lg" className="shadow-md">
            <Plus className="h-5 w-5 mr-2" />
            新增使用者
          </Button>
        </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>使用者列表</CardTitle>
          <CardDescription>系統中的所有使用者</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>建立日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      尚無任何使用者
                    </TableCell>
                  </TableRow>
                ) : (
                  users
                    .filter((u) => u.role !== 'user') // Only show admin, staff, manager
                    .map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleLabel(user.role)}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </Button>
                            {user.role === 'manager' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setResetPasswordData({ userId: user._id, newPassword: '' })
                                  setResetPasswordOpen(true)
                                }}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                重設密碼
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              刪除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? '編輯使用者' : '新增使用者'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? '更新使用者資訊'
                : '新增使用者（員工或管理者）'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名稱</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="使用者名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              >
                <option value="staff">員工</option>
                <option value="manager">管理者</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {(!editingUser || formData.password) && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? '新密碼（若不更改可留空）' : '密碼'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingUser ? '更新' : '新增'}
              </Button>
            </div>
          </div>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重設密碼</DialogTitle>
            <DialogDescription>
              為管理者重設密碼
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密碼</Label>
              <Input
                id="newPassword"
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) =>
                  setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
                取消
              </Button>
              <Button onClick={handleResetPassword}>重設</Button>
            </div>
          </div>
          <DialogClose onClose={() => setResetPasswordOpen(false)} />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

export default AdminUsers

