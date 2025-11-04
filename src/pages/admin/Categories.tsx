import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  _id: string
  name: string
  description?: string
  createdAt: string
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      toast.error('載入分類列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('分類名稱不可為空')
      return
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData)
        toast.success('更新分類成功！')
      } else {
        await api.post('/categories', formData)
        toast.success('新增分類成功！')
      }
      handleCloseDialog()
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存分類時發生錯誤')
    }
  }

  const handleOpenDeleteDialog = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      await api.delete(`/categories/${categoryToDelete._id}`)
      toast.success('刪除分類成功！')
      handleCloseDeleteDialog()
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除分類時發生錯誤')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">分類管理</h1>
          <p className="text-muted-foreground">新增、編輯、刪除地點分類</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          新增分類
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分類列表</CardTitle>
          <CardDescription>所有地點分類</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>建立日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      尚無任何分類
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            編輯
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(category)}
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
              {editingCategory ? '編輯分類' : '新增分類'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? '更新分類資訊'
                : '新增地點的分類'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">分類名稱</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：租屋、餐飲店..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="分類描述..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingCategory ? '更新' : '新增'}
              </Button>
            </div>
          </div>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法復原。確定要刪除分類
              {categoryToDelete ? ` "${categoryToDelete.name}"` : ''}嗎？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </div>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCategories



