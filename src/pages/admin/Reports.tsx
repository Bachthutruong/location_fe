import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Report {
  _id: string
  location: {
    _id: string
    name: string
    address: string
  }
  category: {
    _id: string
    name: string
  }
  description: string
  reportedBy: {
    _id: string
    name: string
    email: string
  }
  status: 'pending' | 'resolved' | 'rejected'
  resolvedBy?: {
    _id: string
    name: string
    email: string
  }
  resolvedAt?: string
  createdAt: string
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmResolveOpen, setConfirmResolveOpen] = useState(false)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      const response = await api.get('/reports', { params })
      setReports(response.data)
    } catch (error) {
      toast.error('載入報告列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/reports/${id}/resolve`)
      toast.success('已解決報告！')
      fetchReports()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '解決報告時發生錯誤')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/reports/${id}/reject`)
      toast.success('已拒絕報告！')
      fetchReports()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '拒絕報告時發生錯誤')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      pending: '待處理',
      resolved: '已解決',
      rejected: '已拒絕',
    }
    return (
      <Badge className={variants[status] || ''}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">報告管理</h1>
          <p className="text-muted-foreground">管理使用者的報告</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">全部狀態</option>
          <option value="pending">待處理</option>
          <option value="resolved">已解決</option>
          <option value="rejected">已拒絕</option>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>報告列表</CardTitle>
          <CardDescription>所有使用者的報告</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>地點</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>回報者</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>建立日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      尚無任何報告
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <Link
                          to={`/location/${report.location._id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {report.location.name}
                        </Link>
                      </TableCell>
                      <TableCell>{report.category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>{report.reportedBy.name}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/location/${report.location._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              檢視
                            </Button>
                          </Link>
                          {report.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedId(report._id); setConfirmResolveOpen(true) }}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                解決
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedId(report._id); setConfirmRejectOpen(true) }}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                拒絕
                              </Button>
                            </>
                          )}
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
      {/* Confirm Resolve */}
      <Dialog open={confirmResolveOpen} onOpenChange={setConfirmResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認解決</DialogTitle>
            <DialogDescription>確定要將此報告標記為已解決嗎？</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmResolveOpen(false)}>取消</Button>
            <Button onClick={() => { if (selectedId) handleResolve(selectedId); setConfirmResolveOpen(false) }}>解決</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Reject */}
      <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認拒絕</DialogTitle>
            <DialogDescription>確定要拒絕此報告嗎？</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => { if (selectedId) handleReject(selectedId); setConfirmRejectOpen(false) }}>拒絕</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminReports



