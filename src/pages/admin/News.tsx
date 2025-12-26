import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface News {
  _id: string
  title: string
  content: string
  images: string[]
  category: {
    _id: string
    name: string
  }
  author: {
    _id: string
    name: string
  }
  published: boolean
  publishedAt?: string
  createdAt: string
  isCourse?: boolean
}

const AdminNews = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    fetchNews()
    fetchCategories()
  }, [categoryFilter, publishedFilter, page, pageSize])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news-categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params: any = { limit: pageSize, offset: (page - 1) * pageSize }
      if (categoryFilter) params.category = categoryFilter
      if (publishedFilter !== '') params.published = publishedFilter
      if (search.trim()) params.search = search.trim()
      const response = await api.get('/news/all', { params })
      if (Array.isArray(response.data)) {
        setNews(response.data)
        setTotal(response.data.length)
      } else {
        setNews(response.data.items || [])
        setTotal(response.data.total ?? 0)
      }
    } catch (error) {
      toast.error('載入新聞列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/news/${id}`)
      toast.success('刪除新聞成功！')
      fetchNews()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除新聞時發生錯誤')
    }
  }

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedId) {
      await handleDelete(selectedId)
      setDeleteDialogOpen(false)
      setSelectedId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">新聞管理</h1>
          <p className="text-muted-foreground">管理所有新聞文章</p>
        </div>
        <Link to="/admin/news/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增新聞
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>篩選條件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">搜尋</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="搜尋標題或內容..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1)
                    fetchNews()
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">分類</label>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">全部</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">發布狀態</label>
              <Select
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">全部</option>
                <option value="true">已發布</option>
                <option value="false">未發布</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setPage(1); fetchNews() }} className="w-full">
                搜尋
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新聞列表</CardTitle>
          <CardDescription>所有新聞文章</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>標題</TableHead>
                    <TableHead>分類</TableHead>
                    <TableHead>作者</TableHead>
                    <TableHead>圖片數</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        尚無任何新聞
                      </TableCell>
                    </TableRow>
                  ) : (
                    news.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.category?.name || '-'}</TableCell>
                        <TableCell>{item.author?.name || '-'}</TableCell>
                        <TableCell>{item.images?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant={item.published ? 'default' : 'secondary'}>
                            {item.published ? '已發布' : '未發布'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.isCourse && (
                              <Link to={`/admin/news/${item._id}/registrations`}>
                                <Button variant="outline" size="sm">
                                  <Users className="h-4 w-4 mr-2" />
                                  查看報名
                                </Button>
                              </Link>
                            )}
                            <Link to={`/admin/news/${item._id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                編輯
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(item._id)}
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
              {total !== null && total > pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    顯示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} / {total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      上一頁
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * pageSize >= total}
                    >
                      下一頁
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法復原。確定要刪除此新聞嗎？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminNews

