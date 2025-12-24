// Routes configuration from App.tsx
export interface RouteConfig {
  path: string
  name: string
  description?: string
}

export const appRoutes: RouteConfig[] = [
  { path: '/', name: '首頁', description: 'Home' },
  { path: '/admin', name: '管理儀表板', description: 'Admin Dashboard' },
  { path: '/admin/categories', name: '分類管理', description: 'Categories Management' },
  { path: '/admin/users', name: '使用者管理', description: 'Users Management' },
  { path: '/admin/report-categories', name: '舉報分類', description: 'Report Categories' },
  { path: '/admin/reports', name: '舉報管理', description: 'Reports Management' },
  { path: '/admin/deleted', name: '已刪除地點', description: 'Deleted Locations' },
  { path: '/admin/locations', name: '地點管理', description: 'Locations Management' },
  { path: '/admin/locations/new', name: '新增地點', description: 'New Location' },
  { path: '/admin/settings', name: '設定', description: 'Settings' },
  { path: '/admin/menus', name: '選單管理', description: 'Menus Management' },
  { path: '/admin/news-categories', name: '新聞分類', description: 'News Categories' },
  { path: '/admin/news', name: '新聞管理', description: 'News Management' },
  { path: '/admin/news/new', name: '新增新聞', description: 'New News' },
  { path: '/staff/locations', name: '員工地點', description: 'Staff Locations' },
  { path: '/manager/locations', name: '經理地點', description: 'Manager Locations' },
  { path: '/manager/locations/new', name: '經理新增地點', description: 'Manager New Location' },
]

