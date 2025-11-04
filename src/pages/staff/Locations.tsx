import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { CheckCircle, XCircle, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTaiwanCities, useTaiwanDistricts } from '../../hooks/useTaiwanLocations'

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

const StaffLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    googleMapsLink: '',
    province: '',
    district: '',
    street: '',
  })

  // Taiwan locations data
  const { cities } = useTaiwanCities()
  const { districts } = useTaiwanDistricts(formData.province)

  // Add reset password functionality for managers
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: '',
    newPassword: '',
  })

  const handleResetPassword = async () => {
    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6) {
      toast.error('密碼至少需 6 個字元')
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

  useEffect(() => {
    fetchLocations()
  }, [statusFilter])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      const response = await api.get('/locations/all', { params })
      setLocations(response.data)
    } catch (error) {
      toast.error('載入地點列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

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
    if (!confirm('您確定要刪除此地點嗎？')) {
      return
    }

    try {
      await api.delete(`/locations/${id}`)
      toast.success('已刪除地點！')
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除地點時發生錯誤')
    }
  }

  const handleOpenEditDialog = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      description: location.description,
      address: location.address,
      googleMapsLink: location.googleMapsLink,
      province: location.province,
      district: location.district,
      street: location.street,
    })
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingLocation(null)
    setFormData({
      name: '',
      description: '',
      address: '',
      googleMapsLink: '',
      province: '',
      district: '',
      street: '',
    })
  }

  const handleUpdate = async () => {
    if (!editingLocation) return

    try {
      await api.put(`/locations/${editingLocation._id}`, formData)
      toast.success('更新地點成功！')
      handleCloseEditDialog()
      fetchLocations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新地點時發生錯誤')
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
              <p className="text-muted-foreground">審核、編輯、刪除地點</p>
            </div>
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
          </div>
        </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>地點列表</CardTitle>
          <CardDescription>系統中的所有地點</CardDescription>
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
                      尚無任何地點
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
                          <Link to={`/location/${location._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              檢視
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(location)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            編輯
                          </Button>
                          {location.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedId(location._id); setConfirmApproveOpen(true) }}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                審核
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedId(location._id); setConfirmRejectOpen(true) }}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                拒絕
                              </Button>
                            </>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(location._id)}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯地點</DialogTitle>
            <DialogDescription>更新地點資訊</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">地點名稱</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">縣市</Label>
                <Select
                  id="province"
                  value={formData.province}
                  onChange={(e) => {
                    setFormData({ ...formData, province: e.target.value, district: '' })
                  }}
                >
                  <option value="">選擇縣市</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name} ({city.nameEn})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">區</Label>
                <Select
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  disabled={!formData.province}
                >
                  <option value="">選擇區</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.name}>
                      {district.name} ({district.nameEn})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">街道</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">完整地址</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleMapsLink">Google 地圖連結</Label>
              <Input
                id="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseEditDialog}>
                取消
              </Button>
              <Button onClick={handleUpdate}>更新</Button>
            </div>
          </div>
          <DialogClose onClose={() => setEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Confirm Approve */}
      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認審核</DialogTitle>
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
        <DialogContent>
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

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>為管理者重設密碼</DialogTitle>
            <DialogDescription>
              重設管理者的密碼
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

export default StaffLocations

