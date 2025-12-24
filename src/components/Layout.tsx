import { Outlet, Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, removeToken, removeUser } from '../lib/auth'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import HeaderMenu from './HeaderMenu'
import { LogOut, MapPin, Home, MoreHorizontal, Newspaper } from 'lucide-react'

interface MenuItem {
  name: string
  link: string
  children?: MenuItem[]
}

const MAX_MAIN_MENUS = 6 // Số menu chính hiển thị trên header

const Layout = () => {
  const navigate = useNavigate()
  const user = getUser()

  // Menu hardcoded cho admin
  const getAdminMenus = (): MenuItem[] => {
    return [
      { name: '分類管理', link: '/admin/categories' },
      { name: '使用者管理', link: '/admin/users' },
      { name: '舉報管理', link: '/admin/reports' },
      { name: '地點管理', link: '/admin/locations' },
      { name: '新聞管理', link: '/admin/news' },
      { name: '設定', link: '/admin/settings' },
      { name: '選單管理', link: '/admin/menus' },
      { name: '舉報分類', link: '/admin/report-categories' },
      { name: '新聞分類', link: '/admin/news-categories' },
      { name: '已刪除地點', link: '/admin/deleted' },
    ]
  }

  const adminMenus = user?.role === 'admin' ? getAdminMenus() : []
  const mainAdminMenus = adminMenus.slice(0, MAX_MAIN_MENUS)
  const extraAdminMenus = adminMenus.slice(MAX_MAIN_MENUS)

  const renderAdminMenu = (menu: MenuItem, index: number) => {
    return (
      <div key={`${menu.link}-${index}`}>
        <Link to={menu.link}>
          <Button variant="ghost" size="sm">
            {menu.name}
          </Button>
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <MapPin className="h-6 w-6" />
                <span className="text-xl font-bold">水里地方創生資料庫</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    首頁
                  </Button>
                </Link>

                {/* News menu for all users */}
                <Link to="/news">
                  <Button variant="ghost" size="sm">
                    <Newspaper className="h-4 w-4 mr-2" />
                    新聞
                  </Button>
                </Link>

                {/* Admin: hiển thị menu hardcoded */}
                {isAdmin && (
                  <>
                    {mainAdminMenus.map((menu, index) => renderAdminMenu(menu, index))}
                    
                    {/* Hiển thị nút "Xem thêm" nếu có extra menus */}
                    {extraAdminMenus.length > 0 && (
                      <Popover>
                        <div className="relative">
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              更多
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto min-w-[200px] p-0" align="end" side="bottom">
                            <div className="py-1">
                              {extraAdminMenus.map((menu, index) => (
                                <Link
                                  key={`${menu.link}-${index}`}
                                  to={menu.link}
                                  className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  {menu.name}
                                </Link>
                              ))}
                            </div>
                          </PopoverContent>
                        </div>
                      </Popover>
                    )}
                  </>
                )}

                {/* User khác: dùng HeaderMenu (fetch từ API) */}
                {!isAdmin && <HeaderMenu />}
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

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

