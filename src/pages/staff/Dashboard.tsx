import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { FileCheck } from 'lucide-react'

const StaffDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trang quản trị Nhân viên</h1>
        <p className="text-muted-foreground">Duyệt, sửa, xóa địa điểm</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Quản lý địa điểm
          </CardTitle>
          <CardDescription>Duyệt, sửa, xóa các địa điểm</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/staff/locations">
            <Button>Quản lý địa điểm</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default StaffDashboard



