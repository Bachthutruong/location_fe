import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
// import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
// form moved to standalone page

interface Location {
  _id: string
  name: string
  address: string
  phone?: string
  description: string
  images: string[]
  category: {
    _id: string
    name: string
  }
  province: string
  district: string
  street: string
  googleMapsLink: string
  latitude?: number
  longitude?: number
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  approvedBy?: {
    _id: string
    name: string
  }
  approvedAt?: string
  createdAt: string
}

//

const ManagerLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  // const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  // dialog/form removed; handled in standalone page

  // pagination states
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  // delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Taiwan hooks removed

  useEffect(() => {
    fetchLocations()
  }, [page, pageSize])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const params: any = { limit: pageSize, offset: (page - 1) * pageSize }
      if (search.trim()) params.search = search.trim()
      const response = await api.get('/locations/manager/my', { params })
      if (Array.isArray(response.data)) {
        setLocations(response.data)
        setTotal(response.data.length)
      } else {
        setLocations(response.data.items || [])
        setTotal(response.data.total ?? 0)
      }
    } catch (error) {
      toast.error('載入地點列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  // categories no longer needed on list page
  // form handlers removed

  const openDeleteDialog = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/locations/${deleteId}`)
      toast.success('已刪除地點！')
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除地點時發生錯誤')
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setDeleteId(null)
  }

  // pagination derived data
  const totalCount = total ?? locations.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const currentPage = Math.min(page, totalPages)
  const paginatedLocations = locations
  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1))

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      deleted: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      pending: '待審核',
      approved: '已核准',
      rejected: '已拒絕',
      deleted: '已刪除',
    }
    return (
      <Badge className={variants[status] || ''}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                水里地方創生資料庫
              </h1>
              <p className="text-muted-foreground">上傳並管理您的地點</p>
            </div>
            <Link to="/manager/locations/new">
              <Button size="lg" className="shadow-md">
                <Plus className="h-5 w-5 mr-2" />
                新增地點
              </Button>
            </Link>
          </div>
        </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>我的地點列表</CardTitle>
          <CardDescription>您建立的所有地點</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="pageSize">顯示</Label>
              <Select
                id="pageSize"
                value={String(pageSize)}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value, 10)
                  setPageSize(newSize)
                  setPage(1)
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </Select>
              <span className="text-sm text-muted-foreground">每頁</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center md:justify-end gap-2 w-full">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜尋名稱/地址..."
                className="h-9 px-3 border rounded-md w-full sm:w-64"
              />
              <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchLocations() }}>搜尋</Button>
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPage(1); fetchLocations() }}>清除</Button>
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1}>
                上一頁
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 頁
              </span>
              <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage === totalPages}>
                下一頁
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>審核者</TableHead>
                  <TableHead>建立日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      尚無任何地點
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLocations.map((location) => (
                    <TableRow key={location._id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>{location.category.name}</TableCell>
                      <TableCell>{getStatusBadge(location.status)}</TableCell>
                      <TableCell>{location.approvedBy ? location.approvedBy.name : '-'}</TableCell>
                      <TableCell>
                        {new Date(location.createdAt).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {location.status === 'approved' ? (
                            <Link to={`/location/${location._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                檢視
                              </Button>
                            </Link>
                          ) : (
                            <Link to={`/manager/locations/${location._id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                檢視
                              </Button>
                            </Link>
                          )}
                          <Link to={`/manager/locations/${location._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(location._id)}
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

      {/* dialog removed: create/edit moved to separate pages */}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除此地點嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDelete}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>刪除</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

export default ManagerLocations

