import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Location {
  _id: string
  name: string
  address: string
  category: {
    _id: string
    name: string
  }
  manager: {
    _id: string
    name: string
    email: string
  }
  deletedBy: {
    _id: string
    name: string
    email: string
  }
  deletedAt: string
  createdAt: string
}

const AdminDeletedLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeletedLocations()
  }, [])

  const fetchDeletedLocations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/locations/deleted')
      setLocations(response.data)
    } catch (error) {
      toast.error('載入已刪除地點列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">已刪除的地點</h1>
        <p className="text-muted-foreground">查看所有已刪除的地點與刪除者</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>已刪除地點列表</CardTitle>
          <CardDescription>所有已被刪除的地點</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>地點名稱</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead>管理者</TableHead>
                  <TableHead>刪除者</TableHead>
                  <TableHead>刪除日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暫無被刪除的地點
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location._id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>{location.category.name}</TableCell>
                      <TableCell>{location.manager.name}</TableCell>
                      <TableCell>{location.deletedBy.name}</TableCell>
                      <TableCell>
                        {new Date(location.deletedAt).toLocaleString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/location/${location._id}`}>
                          <button className="text-primary hover:underline flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            檢視詳情
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDeletedLocations



