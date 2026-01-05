import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, removeToken, removeUser } from '../lib/auth'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import HeaderMenu from './HeaderMenu'
import { LogOut, MapPin, Home, MoreHorizontal, Menu, X } from 'lucide-react'

interface MenuItem {
  name: string
  link: string
  children?: MenuItem[]
}

const MAX_MAIN_MENUS = 6 // Số menu chính hiển thị trên header

const Layout = () => {
  const navigate = useNavigate()
  const user = getUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Menu hardcoded cho admin
  const getAdminMenus = (): MenuItem[] => {
    return [
      { name: '地點管理', link: '/admin/locations' },
      { name: '新聞管理', link: '/admin/news' },
    ]
  }

  const adminMenus = user?.role === 'admin' ? getAdminMenus() : []
  const mainAdminMenus = adminMenus.slice(0, MAX_MAIN_MENUS)
  const extraAdminMenus = adminMenus.slice(MAX_MAIN_MENUS)

  const renderAdminMenu = (menu: MenuItem, index: number) => {
    return (
      <div key={`${menu.link}-${index}`}>
        <Link to={menu.link} onClick={() => setIsMobileMenuOpen(false)}>
          <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto md:justify-center">
            {menu.name}
          </Button>
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <MapPin className="h-6 w-6" />
              <span className="text-xl font-bold">水里地方創生資料庫</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center justify-between flex-1 ml-8">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    首頁
                  </Button>
                </Link>

                {/* News menu for all users - REMOVED per request */}
                {/* <Link to="/news">
                  <Button variant="ghost" size="sm">
                    <Newspaper className="h-4 w-4 mr-2" />
                    新聞
                  </Button>
                </Link> */}

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

              <div className="flex items-center space-x-4">
                {isAuthenticated() ? (
                  <>
                    <span className="text-sm">您好，{user?.name}</span>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="secondary" size="sm">
                          管理後台
                        </Button>
                      </Link>
                    )}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-white absolute w-full left-0 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  首頁
                </Button>
              </Link>

              {/* <Link to="/news" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Newspaper className="h-4 w-4 mr-2" />
                  新聞
                </Button>
              </Link> */}

              {isAdmin && (
                <>
                  <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">管理選單</div>
                  {mainAdminMenus.map((menu, index) => renderAdminMenu(menu, index))}
                  {extraAdminMenus.map((menu, index) => renderAdminMenu(menu, index))}
                </>
              )}

              {!isAdmin && (
                <div className="flex flex-col items-start space-y-2 w-full">
                  <HeaderMenu showAll={true} />
                </div>
              )}

              <div className="border-t pt-4 flex flex-col space-y-2">
                {isAuthenticated() ? (
                  <>
                    <div className="px-2 text-sm">您好，{user?.name}</div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="secondary" size="sm" className="w-full justify-start">
                          管理後台
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      登出
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">登入</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">註冊</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

