import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Building2 } from 'lucide-react'

const ManagerDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">管理者主控台</h1>
        <p className="text-muted-foreground">上傳並管理您的地點</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            我的地點
          </CardTitle>
          <CardDescription>上傳並管理您的地點</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/manager/locations">
            <Button>管理地點</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default ManagerDashboard



