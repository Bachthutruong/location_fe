import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { CheckCircle, XCircle, Trash2, Eye, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
// import { useTaiwanCities, useTaiwanDistricts } from '../../hooks/useTaiwanLocations'

interface Location {
  _id: string
  name: string
  address: string
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
  manager: {
    _id: string
    name: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  approvedBy?: {
    _id: string
    name: string
  }
  approvedAt?: string
  createdAt: string
}

//

const AdminLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  // const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Taiwan hooks not used on list page

  useEffect(() => {
    fetchLocations()
  }, [statusFilter, page, pageSize])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const params: any = { limit: pageSize, offset: (page - 1) * pageSize }
      if (statusFilter) params.status = statusFilter
      if (search.trim()) params.search = search.trim()
      const response = await api.get('/locations/all', { params })
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

  // categories no longer needed here

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/locations/${id}/approve`)
      toast.success('已核准地點！')
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '核准地點時發生錯誤')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/locations/${id}/reject`)
      toast.success('已拒絕地點！')
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '拒絕地點時發生錯誤')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/locations/${id}`)
      toast.success('已刪除地點！')
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除地點時發生錯誤')
    }
  }

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                地點管理
              </h1>
              <p className="text-muted-foreground">審核、新增、編輯、刪除地點</p>
            </div>
            <div className="flex gap-4">
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="">全部狀態</option>
                <option value="pending">待審核</option>
                <option value="approved">已核准</option>
                <option value="rejected">已拒絕</option>
              </Select>
              <Link to="/admin/locations/new">
                <Button size="lg" className="shadow-md">
                  <Plus className="h-5 w-5 mr-2" />
                  新增地點
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>地點列表</CardTitle>
            <CardDescription>系統中的所有地點</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">顯示</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1) }}
                  className="w-24"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Select>
                <span className="text-sm text-muted-foreground">每頁</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋名稱／地址..."
                  className="h-9 px-3 border rounded-md w-64"
                />
                <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchLocations() }}>搜尋</Button>
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPage(1); fetchLocations() }}>清除</Button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  上一頁
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 頁 / 共 {Math.max(1, Math.ceil((total ?? locations.length) / pageSize))}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil((total ?? locations.length) / pageSize)), p + 1))} disabled={page >= Math.max(1, Math.ceil((total ?? locations.length) / pageSize))}>
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
                    <TableHead>管理人</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>審核者</TableHead>
                    <TableHead>建立日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Chưa có địa điểm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.category.name}</TableCell>
                        <TableCell>{location.manager.name}</TableCell>
                        <TableCell>{getStatusBadge(location.status)}</TableCell>
                        <TableCell>
                          {location.approvedBy ? location.approvedBy.name : '-'}
                        </TableCell>
                        <TableCell>
                        {new Date(location.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/locations/${location._id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                檢視/編輯
                              </Button>
                            </Link>
                            {location.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedId(location._id); setConfirmApproveOpen(true) }} className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  審核
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedId(location._id); setConfirmRejectOpen(true) }} className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  拒絕
                                </Button>
                              </>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => { setSelectedId(location._id); setConfirmDeleteOpen(true) }}>
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

        {/* Confirm Approve */}
        <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>確認審核地點</DialogTitle>
              <DialogDescription>確定要審核通過此地點嗎？</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmApproveOpen(false)}>取消</Button>
              <Button onClick={() => { if (selectedId) handleApprove(selectedId); setConfirmApproveOpen(false) }}>審核</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Reject */}
        <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>確認拒絕</DialogTitle>
              <DialogDescription>確定要拒絕此地點嗎？</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmRejectOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={() => { if (selectedId) handleReject(selectedId); setConfirmRejectOpen(false) }}>拒絕</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>確認刪除</DialogTitle>
              <DialogDescription>此操作無法復原。</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={() => { if (selectedId) handleDelete(selectedId); setConfirmDeleteOpen(false) }}>刪除</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AdminLocations

