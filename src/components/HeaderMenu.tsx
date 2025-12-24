import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent, usePopover } from './ui/popover'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

interface MenuItem {
  _id: string
  name: string
  link: string
  children?: MenuItem[]
}

type HeaderMenuProps = {
  // Admin: showAll = true (hiển thị tất cả)
  // User khác: showAll = false (6 menu đầu + "Xem thêm")
  showAll?: boolean
}

const MAX_MAIN_MENUS = 6 // Số menu chính hiển thị trên header

const HeaderMenu: React.FC<HeaderMenuProps> = ({ showAll = false }) => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  const normalizeLink = (link: string): string => {
    if (!link) return '/'
    // External links không cần normalize
    if (link.startsWith('http://') || link.startsWith('https://')) return link
    // Đảm bảo internal link luôn có "/" ở đầu
    return link.startsWith('/') ? link : `/${link}`
  }

  // Collect all accessible menu links (including children) for ProtectedRoute
  const collectAccessibleLinks = (menuList: MenuItem[]): string[] => {
    const links: string[] = []
    menuList.forEach((menu) => {
      if (menu.link) {
        links.push(normalizeLink(menu.link))
      }
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach((child) => {
          if (child.link) {
            links.push(normalizeLink(child.link))
          }
        })
      }
    })
    return links
  }

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menus')
      const menuData = response.data || []
      setMenus(menuData)
      
      // Debug
      console.log('=== HeaderMenu fetchMenus ===');
      console.log('showAll:', showAll);
      console.log('menus count:', menuData.length);
      console.log('menus:', menuData);
      console.log('===========================');
      
      // Lưu accessible links vào localStorage để ProtectedRoute có thể check
      const accessibleLinks = collectAccessibleLinks(menuData)
      localStorage.setItem('accessibleMenuLinks', JSON.stringify(accessibleLinks))
    } catch (error: any) {
      console.error('Error fetching menus:', error)
      setMenus([])
      localStorage.removeItem('accessibleMenuLinks')
    } finally {
      setLoading(false)
    }
  }

  const isExternalLink = (link: string) => {
    return link.startsWith('http://') || link.startsWith('https://')
  }


  const ExtraMenusPopoverContent = ({ menus, renderMenuLink }: { menus: MenuItem[], renderMenuLink: (menu: MenuItem, isChild: boolean, onLinkClick?: () => void) => React.ReactNode }) => {
    const { setOpen } = usePopover()
    return (
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <MoreHorizontal className="h-4 w-4" />
            更多
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto min-w-[200px] p-0" align="end" side="bottom">
          <div className="py-1">
            {menus.map((menu) => {
              if (menu.children && menu.children.length > 0) {
                return (
                  <div key={menu._id} className="border-b last:border-b-0">
                    <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                      {menu.name}
                    </div>
                    {menu.children.map((child) => (
                      <div key={child._id}>
                        {renderMenuLink(child, true, () => setOpen(false))}
                      </div>
                    ))}
                  </div>
                )
              } else {
                return (
                  <div key={menu._id}>
                    {renderMenuLink(menu, true, () => setOpen(false))}
                  </div>
                )
              }
            })}
          </div>
        </PopoverContent>
      </div>
    )
  }

  const renderMenuLink = (menu: MenuItem, isChild = false, onLinkClick?: () => void) => {
    const className = isChild
      ? 'block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors'
      : 'text-sm font-medium hover:text-primary transition-colors'

    const normalizedLink = normalizeLink(menu.link)

    if (isExternalLink(menu.link)) {
      return (
        <a
          href={normalizedLink}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onLinkClick}
        >
          {menu.name}
        </a>
      )
    } else {
      return (
        <Link to={normalizedLink} className={className} onClick={onLinkClick}>
          {menu.name}
        </Link>
      )
    }
  }

  const MenuPopoverContent = ({ menu }: { menu: MenuItem }) => {
    const { setOpen } = usePopover()
    return (
      <div className="py-1">
        {/* Hiển thị cả parent menu và children */}
        <div>
          {renderMenuLink(menu, true, () => setOpen(false))}
        </div>
        {menu.children && menu.children.map((child) => (
          <div key={child._id}>
            {renderMenuLink(child, true, () => setOpen(false))}
          </div>
        ))}
      </div>
    )
  }

  const renderMenu = (menu: MenuItem) => {
    // If menu has children, show as popover
    if (menu.children && menu.children.length > 0) {
      return (
        <Popover key={menu._id}>
          <div className="relative">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                {menu.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-[200px] p-0" align="start" side="bottom">
              <MenuPopoverContent menu={menu} />
            </PopoverContent>
          </div>
        </Popover>
      )
    } else {
      // Simple link for menu without children
      const normalizedLink = normalizeLink(menu.link)
      return (
        <div key={menu._id}>
          {isExternalLink(menu.link) ? (
            <a
              href={normalizedLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                {menu.name}
              </Button>
            </a>
          ) : (
            <Link to={normalizedLink}>
              <Button variant="ghost" size="sm">
                {menu.name}
              </Button>
            </Link>
          )}
        </div>
      )
    }
  }

  if (loading || menus.length === 0) {
    return null
  }

  // Chia menu thành main menus và extra menus
  // Admin (showAll = true): hiển thị toàn bộ, không có "Xem thêm"
  const mainMenus = showAll ? menus : menus.slice(0, MAX_MAIN_MENUS)
  const extraMenus = showAll ? [] : menus.slice(MAX_MAIN_MENUS)

  return (
    <>
      {/* Hiển thị main menus */}
      {mainMenus.map((menu) => renderMenu(menu))}
      
      {/* Hiển thị nút "Xem thêm" nếu có extra menus và không phải admin */}
      {extraMenus.length > 0 && !showAll && (
        <Popover>
          <ExtraMenusPopoverContent menus={extraMenus} renderMenuLink={renderMenuLink} />
        </Popover>
      )}
    </>
  )
}

export default HeaderMenu

