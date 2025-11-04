import { Outlet, Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, removeToken, removeUser } from '../lib/auth'
import { Button } from './ui/button'
import { LogOut, MapPin, Home, Users, Flag, Trash2, FileCheck, Building2, Tags } from 'lucide-react'

const Layout = () => {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <MapPin className="h-6 w-6" />
                <span className="text-xl font-bold">地點管理</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    首頁
                  </Button>
                </Link>

                {user?.role === 'admin' && (
                  <>
                            <Link to="/admin/locations">
                              <Button variant="ghost" size="sm">
                                地點
                              </Button>
                            </Link>
                            <Link to="/admin/categories">
                              <Button variant="ghost" size="sm">
                                分類
                              </Button>
                            </Link>
                            <Link to="/admin/users">
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        使用者
                      </Button>
                    </Link>
                    <Link to="/admin/reports">
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        報告
                      </Button>
                    </Link>
                    <Link to="/admin/report-categories">
                      <Button variant="ghost" size="sm">
                        <Tags className="h-4 w-4 mr-2" />
                        報告分類
                      </Button>
                    </Link>
                    <Link to="/admin/deleted">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        已刪除
                      </Button>
                    </Link>
                  </>
                )}

                {user?.role === 'staff' && (
                  <Link to="/staff/locations">
                    <Button variant="ghost" size="sm">
                      <FileCheck className="h-4 w-4 mr-2" />
                      審核地點
                    </Button>
                  </Link>
                )}

                {user?.role === 'manager' && (
                  <Link to="/manager/locations">
                    <Button variant="ghost" size="sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      我的地點
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <>
                  <span className="text-sm">您好，{user?.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">登入</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">註冊</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

