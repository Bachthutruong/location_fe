import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface CourseRegistration {
  _id: string
  news: {
    _id: string
    title: string
  }
  name: string
  email: string
  phone: string
  note?: string
  createdAt: string
}

interface News {
  _id: string
  title: string
  isCourse?: boolean
}

const CourseRegistrations = () => {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([])
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedRegistration, setSelectedRegistration] = useState<CourseRegistration | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchNews()
      fetchRegistrations()
    }
  }, [id, page, pageSize])

  const fetchNews = async () => {
    try {
      const response = await api.get(`/news/admin/${id}`)
      setNews(response.data)
    } catch (error) {
      toast.error('載入新聞資訊時發生錯誤')
    }
  }

  const fetchRegistrations = async () => {
    if (!id) return
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: pageSize,
        offset: (page - 1) * pageSize
      }
      const response = await api.get(`/news/${id}/registrations`, { params })
      setRegistrations(response.data.items || [])
      setTotal(response.data.total || 0)
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入報名列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (registrationId: string) => {
    try {
      const response = await api.get(`/news/registrations/${registrationId}`)
      setSelectedRegistration(response.data)
      setDetailDialogOpen(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入詳細資訊時發生錯誤')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">課程報名列表</h1>
          <p className="text-muted-foreground">
            {news ? `「${news.title}」的報名記錄` : '載入中...'}
          </p>
        </div>
        <Link to="/admin/news">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回新聞列表
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>篩選條件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">每頁顯示:</label>
              <Select
                value={pageSize.toString()}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value))
                  setPage(1)
                }}
                className="w-24"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>報名記錄</CardTitle>
          <CardDescription>共 {total} 筆報名記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>電話</TableHead>
                    <TableHead>報名時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        尚無任何報名記錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((reg) => (
                      <TableRow key={reg._id}>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.phone}</TableCell>
                        <TableCell>
                          {new Date(reg.createdAt).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(reg._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            查看詳情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
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
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      上一頁
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 10) {
                          pageNum = i + 1
                        } else if (page <= 5) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 4) {
                          pageNum = totalPages - 9 + i
                        } else {
                          pageNum = page - 5 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      下一頁
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>報名詳細資訊</DialogTitle>
            <DialogDescription>查看完整的報名資訊</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">課程</label>
                <p className="mt-1">{selectedRegistration.news?.title || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">姓名</label>
                <p className="mt-1">{selectedRegistration.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{selectedRegistration.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">電話</label>
                <p className="mt-1">{selectedRegistration.phone}</p>
              </div>
              {selectedRegistration.note && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">備註</label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedRegistration.note}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">報名時間</label>
                <p className="mt-1">
                  {new Date(selectedRegistration.createdAt).toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              關閉
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CourseRegistrations

