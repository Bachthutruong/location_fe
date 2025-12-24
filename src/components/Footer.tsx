import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

interface MenuItem {
  _id: string
  name: string
  link: string
  children?: MenuItem[]
}

const Footer = () => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menus')
      console.log('Menus fetched:', response.data)
      setMenus(response.data || [])
    } catch (error: any) {
      console.error('Error fetching menus:', error)
      console.error('Error details:', error.response?.data)
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  const isExternalLink = (link: string) => {
    return link.startsWith('http://') || link.startsWith('https://')
  }

  const renderMenuLink = (menu: MenuItem) => {
    if (isExternalLink(menu.link)) {
      return (
        <a
          href={menu.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {menu.name}
        </a>
      )
    } else {
      return (
        <Link
          to={menu.link}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {menu.name}
        </Link>
      )
    }
  }

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">載入中...</div>
        ) : menus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {menus.map((menu) => (
              <div key={menu._id} className="space-y-2">
                <div className="font-semibold text-foreground mb-3">
                  {renderMenuLink(menu)}
                </div>
                {menu.children && menu.children.length > 0 && (
                  <ul className="space-y-2">
                    {menu.children.map((child) => (
                      <li key={child._id}>
                        {renderMenuLink(child)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 水里地方創生資料庫. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

