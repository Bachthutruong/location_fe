import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Users, Flag, Trash2, Tag, Settings } from 'lucide-react'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            管理後台
          </h1>
          <p className="text-lg text-muted-foreground">管理整個系統</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
          <Link to="/admin/categories">
            <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Tag className="h-6 w-6" />
                </div>
                分類
              </CardTitle>
              <CardDescription className="mt-2">管理地點分類</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button className="w-full" variant="outline">
                管理分類
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
          <Link to="/admin/users">
            <CardHeader className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                使用者
              </CardTitle>
              <CardDescription className="mt-2">管理員工與管理者</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button className="w-full" variant="outline">
                管理使用者
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
          <Link to="/admin/reports">
            <CardHeader className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Flag className="h-6 w-6" />
                </div>
                報告
              </CardTitle>
              <CardDescription className="mt-2">管理使用者提交的報告</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button className="w-full" variant="outline">
                管理報告
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
          <Link to="/admin/deleted">
            <CardHeader className="bg-gradient-to-br from-red-500/10 to-red-600/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Trash2 className="h-6 w-6" />
                </div>
                已刪除
              </CardTitle>
              <CardDescription className="mt-2">查看已刪除的地點</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button className="w-full" variant="outline">
                查看已刪除
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
          <Link to="/admin/settings">
            <CardHeader className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6" />
                </div>
                設定
              </CardTitle>
              <CardDescription className="mt-2">管理系統設定</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button className="w-full" variant="outline">
                管理設定
              </Button>
            </CardContent>
          </Link>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

