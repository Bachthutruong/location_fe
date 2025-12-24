import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Plus, Edit, Trash2, Users, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { appRoutes } from '../../config/routes'

interface Menu {
  _id: string
  name: string
  link: string
  parent?: {
    _id: string
    name: string
  } | string
  order: number
  isGlobal?: boolean
  userId?: {
    _id: string
    name: string
  } | string
  createdAt: string
  children?: Menu[]
}

interface User {
  _id: string
  name: string
  email: string
  role: string
}

const AdminMenus = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'user'>('global')
  
  // Global menu state
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    parent: '',
    order: 0,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)

  // User menu state
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userMenus, setUserMenus] = useState<Menu[]>([])
  console.log("userMenus", userMenus)
  const [assignedMenuIds, setAssignedMenuIds] = useState<string[]>([])
  const [userMenuLoading, setUserMenuLoading] = useState(false)
  const [userMenuDialogOpen, setUserMenuDialogOpen] = useState(false)
  const [editingUserMenu, setEditingUserMenu] = useState<Menu | null>(null)
  const [allAvailableMenus, setAllAvailableMenus] = useState<Menu[]>([]) // All menus for selection in dialog
  const [userMenuFormData, setUserMenuFormData] = useState({
    menuType: 'route' as 'route' | 'new', // 'route' = chọn từ routes, 'new' = tạo mới
    selectedRoute: '',
    name: '',
    link: '',
    parent: '',
    order: 0,
  })
  
  // Global assign dialog state
  const [globalAssignDialogOpen, setGlobalAssignDialogOpen] = useState(false)
  const [globalAssignFormData, setGlobalAssignFormData] = useState({
    menuType: 'route' as 'route' | 'new', // 'route' = chọn từ routes, 'new' = tạo mới
    selectedRoute: '',
    name: '',
    link: '',
    parent: '',
    order: 0,
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(12)

  useEffect(() => {
    if (activeTab === 'global') {
      fetchMenus()
    } else {
      fetchUsers()
      // Load all global menus for dialog selection
      fetchAllMenusForSelection()
    }
  }, [activeTab])

  const fetchAllMenusForSelection = async () => {
    try {
      // Lấy menu từ API /menus (menu đang hiển thị ở header - đã có cấu trúc tree)
      const response = await api.get('/menus')
      const menuTree = response.data || []
      
      // Flatten tree structure để lưu vào state (cần flat để dễ tìm kiếm)
      const flattenMenus = (menuList: Menu[]): Menu[] => {
        const result: Menu[] = []
        menuList.forEach((menu: any) => {
          result.push({
            _id: menu._id,
            name: menu.name,
            link: menu.link,
            parent: menu.parent,
            order: menu.order || 0,
            isGlobal: menu.isGlobal,
            userId: menu.userId,
            createdAt: menu.createdAt || new Date().toISOString()
          })
          if (menu.children && menu.children.length > 0) {
            result.push(...flattenMenus(menu.children))
          }
        })
        return result
      }
      const flatMenus = flattenMenus(menuTree)
      setAllAvailableMenus(flatMenus)
    } catch (error) {
      console.error('Error fetching menus for selection:', error)
      setAllAvailableMenus([])
    }
  }

  useEffect(() => {
    if (selectedUser && activeTab === 'user') {
      fetchUserMenus()
    }
  }, [selectedUser, activeTab])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const response = await api.get('/menus/all?global=true')
      setMenus(response.data)
    } catch (error) {
      toast.error('載入選單列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user-menus/users')
      setUsers(response.data)
    } catch (error) {
      toast.error('載入使用者列表時發生錯誤')
    }
  }

  const fetchUserMenus = async () => {
    if (!selectedUser) return
    
    try {
      setUserMenuLoading(true)
      // Get all global menus (flat)
      const globalResponse = await api.get('/menus/all?global=true')
      const allGlobalMenus = globalResponse.data || []
      
      // Get user-specific menus and assignments
      const userResponse = await api.get(`/user-menus/user/${selectedUser._id}`)
      const userSpecificMenus = userResponse.data.allMenus.filter((m: Menu) => !m.isGlobal) || []
      
      // Combine all menus (flat structure for selection and tree building)
      const allMenus = [...allGlobalMenus, ...userSpecificMenus]
      setUserMenus(allMenus)
      setAssignedMenuIds(userResponse.data.assignedMenuIds || [])
    } catch (error) {
      toast.error('載入使用者選單時發生錯誤')
    } finally {
      setUserMenuLoading(false)
    }
  }

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        link: menu.link,
        parent: typeof menu.parent === 'object' ? menu.parent._id : (menu.parent || ''),
        order: menu.order || 0,
      })
    } else {
      setEditingMenu(null)
      setFormData({ name: '', link: '', parent: '', order: 0 })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMenu(null)
    setFormData({ name: '', link: '', parent: '', order: 0 })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('選單名稱不可為空')
      return
    }
    if (!formData.link.trim()) {
      toast.error('選單連結不可為空')
      return
    }

    try {
      // Normalize link: đảm bảo internal link có "/" ở đầu
      let normalizedLink = formData.link.trim()
      if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
        normalizedLink = normalizedLink.startsWith('/') ? normalizedLink : `/${normalizedLink}`
      }
      
      const payload: any = {
        name: formData.name,
        link: normalizedLink,
        order: formData.order || 0,
        isGlobal: true,
      }
      if (formData.parent && formData.parent !== '') {
        payload.parent = formData.parent
      }

      if (editingMenu) {
        await api.put(`/menus/${editingMenu._id}`, payload)
        toast.success('更新選單成功！')
      } else {
        await api.post('/menus', payload)
        toast.success('新增選單成功！')
      }
      handleCloseDialog()
      fetchMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存選單時發生錯誤')
    }
  }

  const handleOpenDeleteDialog = (menu: Menu) => {
    setMenuToDelete(menu)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return
    try {
      await api.delete(`/menus/${menuToDelete._id}`)
      toast.success('刪除選單成功！')
      setDeleteDialogOpen(false)
      setMenuToDelete(null)
      fetchMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '刪除選單時發生錯誤')
    }
  }

  // User menu handlers
  const handleAssignMenus = async () => {
    if (!selectedUser) return
    
    try {
      await api.post(`/user-menus/user/${selectedUser._id}`, {
        menuIds: assignedMenuIds
      })
      toast.success('選單分配成功！')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '分配選單時發生錯誤')
    }
  }

  const handleToggleMenuAssignment = (menuId: string) => {
    if (assignedMenuIds.includes(menuId)) {
      setAssignedMenuIds(assignedMenuIds.filter(id => id !== menuId))
    } else {
      setAssignedMenuIds([...assignedMenuIds, menuId])
    }
  }

  const handleOpenUserMenuDialog = async (menu?: Menu) => {
    if (menu) {
      // Edit mode: pre-fill form with menu data
      setEditingUserMenu(menu)
      // Determine menu type based on link
      const matchingRoute = appRoutes.find(r => r.path === menu.link)
      if (matchingRoute) {
        setUserMenuFormData({
          menuType: 'route',
          selectedRoute: menu.link,
          name: menu.name,
          link: menu.link,
          parent: typeof menu.parent === 'object' ? menu.parent._id : (menu.parent || ''),
          order: menu.order || 0,
        })
      } else {
        setUserMenuFormData({
          menuType: 'new',
          selectedRoute: '',
          name: menu.name,
          link: menu.link,
          parent: typeof menu.parent === 'object' ? menu.parent._id : (menu.parent || ''),
          order: menu.order || 0,
        })
      }
    } else {
      // New mode
      setEditingUserMenu(null)
      setUserMenuFormData({
        menuType: 'route',
        selectedRoute: '',
        name: '',
        link: '',
        parent: '',
        order: 0,
      })
    }
    setUserMenuDialogOpen(true)
  }

  const handleSubmitGlobalAssign = async () => {
    if (!globalAssignFormData.name.trim()) {
      toast.error('選單名稱不可為空')
      return
    }

    try {
      let menuId: string
      
      if (globalAssignFormData.menuType === 'route') {
        // Chọn từ routes
        if (!globalAssignFormData.selectedRoute) {
          toast.error('請選擇路由')
          return
        }
        
        const selectedRoute = appRoutes.find(r => r.path === globalAssignFormData.selectedRoute)
        if (!selectedRoute) {
          toast.error('路由不存在')
          return
        }

        // Tạo menu global từ route
        // Đảm bảo link luôn có "/" ở đầu
        const normalizedLink = selectedRoute.path.startsWith('/') 
          ? selectedRoute.path 
          : `/${selectedRoute.path}`
        
        const payload: any = {
          name: globalAssignFormData.name || selectedRoute.name,
          link: normalizedLink,
          order: globalAssignFormData.order || 0,
          isGlobal: true,
        }
        if (globalAssignFormData.parent && globalAssignFormData.parent !== '') {
          payload.parent = globalAssignFormData.parent
        }

        const response = await api.post('/menus', payload)
        menuId = response.data._id
      } else {
        // Tạo menu mới
        if (!globalAssignFormData.link.trim()) {
          toast.error('選單連結不可為空')
          return
        }

        // Normalize link: đảm bảo internal link có "/" ở đầu
        let normalizedLink = globalAssignFormData.link.trim()
        if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
          normalizedLink = normalizedLink.startsWith('/') ? normalizedLink : `/${normalizedLink}`
        }
        
        const payload: any = {
          name: globalAssignFormData.name,
          link: normalizedLink,
          order: globalAssignFormData.order || 0,
          isGlobal: true,
        }
        if (globalAssignFormData.parent && globalAssignFormData.parent !== '') {
          payload.parent = globalAssignFormData.parent
        }

        const response = await api.post('/menus', payload)
        menuId = response.data._id
      }

      // Assign menu cho tất cả user
      await api.post('/user-menus/assign-global', { menuIds: [menuId] })
      toast.success('選單已新增並分配給所有使用者！')
      
      setGlobalAssignDialogOpen(false)
      setGlobalAssignFormData({
        menuType: 'route',
        selectedRoute: '',
        name: '',
        link: '',
        parent: '',
        order: 0,
      })
      fetchMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存選單時發生錯誤')
    }
  }

  const handleSubmitUserMenu = async () => {
    if (!selectedUser) {
      toast.error('請先選擇使用者')
      return
    }
    if (!userMenuFormData.name.trim()) {
      toast.error('選單名稱不可為空')
      return
    }

    try {
      let menuId: string
      
      if (editingUserMenu) {
        // Edit mode: update existing menu
        if (userMenuFormData.menuType === 'route') {
          if (!userMenuFormData.selectedRoute) {
            toast.error('請選擇路由')
            return
          }
          
          const selectedRoute = appRoutes.find(r => r.path === userMenuFormData.selectedRoute)
          if (!selectedRoute) {
            toast.error('路由不存在')
            return
          }

          const normalizedLink = selectedRoute.path.startsWith('/') 
            ? selectedRoute.path 
            : `/${selectedRoute.path}`
          
          const payload: any = {
            name: userMenuFormData.name || selectedRoute.name,
            link: normalizedLink,
            order: userMenuFormData.order || 0,
          }
          if (userMenuFormData.parent && userMenuFormData.parent !== '') {
            payload.parent = userMenuFormData.parent
          }

          await api.put(`/menus/${editingUserMenu._id}`, payload)
          menuId = editingUserMenu._id
        } else {
          if (!userMenuFormData.link.trim()) {
            toast.error('選單連結不可為空')
            return
          }

          let normalizedLink = userMenuFormData.link.trim()
          if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
            normalizedLink = normalizedLink.startsWith('/') ? normalizedLink : `/${normalizedLink}`
          }
          
          const payload: any = {
            name: userMenuFormData.name,
            link: normalizedLink,
            order: userMenuFormData.order || 0,
          }
          if (userMenuFormData.parent && userMenuFormData.parent !== '') {
            payload.parent = userMenuFormData.parent
          }

          await api.put(`/menus/${editingUserMenu._id}`, payload)
          menuId = editingUserMenu._id
        }
        
        toast.success('選單已更新！')
      } else {
        // Create mode: create new menu
        if (userMenuFormData.menuType === 'route') {
          // Chọn từ routes
          if (!userMenuFormData.selectedRoute) {
            toast.error('請選擇路由')
            return
          }
          
          const selectedRoute = appRoutes.find(r => r.path === userMenuFormData.selectedRoute)
          if (!selectedRoute) {
            toast.error('路由不存在')
            return
          }

          // Tạo menu cho user từ route
          // Đảm bảo link luôn có "/" ở đầu
          const normalizedLink = selectedRoute.path.startsWith('/') 
            ? selectedRoute.path 
            : `/${selectedRoute.path}`
          
          const payload: any = {
            name: userMenuFormData.name || selectedRoute.name,
            link: normalizedLink,
            order: userMenuFormData.order || 0,
          }
          if (userMenuFormData.parent && userMenuFormData.parent !== '') {
            payload.parent = userMenuFormData.parent
          }

          const response = await api.post(`/user-menus/user/${selectedUser._id}/menu`, payload)
          menuId = response.data._id
        } else {
          // Tạo menu mới
          if (!userMenuFormData.link.trim()) {
            toast.error('選單連結不可為空')
            return
          }

          // Normalize link: đảm bảo internal link có "/" ở đầu
          let normalizedLink = userMenuFormData.link.trim()
          if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
            normalizedLink = normalizedLink.startsWith('/') ? normalizedLink : `/${normalizedLink}`
          }
          
          const payload: any = {
            name: userMenuFormData.name,
            link: normalizedLink,
            order: userMenuFormData.order || 0,
          }
          if (userMenuFormData.parent && userMenuFormData.parent !== '') {
            payload.parent = userMenuFormData.parent
          }

          const response = await api.post(`/user-menus/user/${selectedUser._id}/menu`, payload)
          menuId = response.data._id
        }

        // Assign menu cho user
        if (!assignedMenuIds.includes(menuId)) {
          await api.post(`/user-menus/user/${selectedUser._id}`, {
            menuIds: [...assignedMenuIds, menuId]
          })
        }
        
        toast.success('選單已新增並分配給使用者！')
      }
      
      setUserMenuDialogOpen(false)
      setEditingUserMenu(null)
      setUserMenuFormData({
        menuType: 'route',
        selectedRoute: '',
        name: '',
        link: '',
        parent: '',
        order: 0,
      })
      fetchUserMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存選單時發生錯誤')
    }
  }

  // Build hierarchical structure for global menus
  const buildMenuTree = (menuList: Menu[]): Menu[] => {
    const menuMap = new Map<string, Menu & { children: Menu[] }>()
    const roots: (Menu & { children: Menu[] })[] = []
    
    menuList.forEach((menu: Menu) => {
      const menuObj = { ...menu, children: [] as Menu[] }
      menuMap.set(menu._id, menuObj)
    })
    
    menuList.forEach((menu: Menu) => {
      const menuObj = menuMap.get(menu._id)!
      if (menu.parent) {
        const parentId = typeof menu.parent === 'object' ? menu.parent._id : menu.parent
        const parent = menuMap.get(parentId)
        if (parent) {
          parent.children.push(menuObj)
        } else {
          roots.push(menuObj)
        }
      } else {
        roots.push(menuObj)
      }
    })
    
    return roots as Menu[]
  }

  const rootMenus = buildMenuTree(menus)
  // For dialog, rebuild tree from allAvailableMenus (menus from header API)
  const userRootMenus = buildMenuTree(allAvailableMenus)
  
  // Pagination for users
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(users.length / usersPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">選單管理</h1>
        <p className="text-muted-foreground">管理網站選單和分配選單給使用者</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'global'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          全域選單
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'user'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          使用者選單
        </button>
      </div>

      {/* Global Menu Tab */}
      {activeTab === 'global' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">管理所有使用者都能看到的選單</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setGlobalAssignDialogOpen(true)
                  setGlobalAssignFormData({
                    menuType: 'route',
                    selectedRoute: '',
                    name: '',
                    link: '',
                    parent: '',
                    order: 0,
                  })
                }}
              >
                分配給所有使用者
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新增選單
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>全域選單列表</CardTitle>
              <CardDescription>所有使用者都能看到的選單</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">載入中...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>連結</TableHead>
                      <TableHead>父選單</TableHead>
                      <TableHead>順序</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menus.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          尚無任何選單
                        </TableCell>
                      </TableRow>
                    ) : (
                      menus
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((menu) => (
                          <TableRow key={menu._id}>
                            <TableCell className="font-medium">
                              {typeof menu.parent === 'object' && menu.parent ? (
                                <span className="text-muted-foreground">└ {menu.name}</span>
                              ) : (
                                menu.name
                              )}
                            </TableCell>
                            <TableCell>
                              <a
                                href={menu.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {menu.link}
                              </a>
                            </TableCell>
                            <TableCell>
                              {typeof menu.parent === 'object' && menu.parent
                                ? menu.parent.name
                                : '-'}
                            </TableCell>
                            <TableCell>{menu.order || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(menu)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  編輯
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleOpenDeleteDialog(menu)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  刪除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* User Menu Tab */}
      {activeTab === 'user' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>選擇使用者</CardTitle>
              <CardDescription>選擇要管理選單的使用者</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>電子郵件</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          尚無使用者
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentUsers.map((user: User) => (
                        <TableRow 
                          key={user._id}
                          className={`cursor-pointer ${selectedUser?._id === user._id ? 'bg-primary/5' : ''}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUser(user)
                              }}
                            >
                              選擇
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      顯示 {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} / {users.length} 個使用者
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一頁
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一頁
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedUser && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>為 {selectedUser.name} 設定選單</CardTitle>
                    <CardDescription>選擇或新增選單給此使用者</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleOpenUserMenuDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      新增選單
                    </Button>
                    <Button onClick={handleAssignMenus}>
                      儲存分配
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userMenuLoading ? (
                  <div className="text-center py-8">載入中...</div>
                ) : (
                  <div className="space-y-4">
                    {userRootMenus.map((menu) => {
                      // Check if menu is user-specific (has userId)
                      const isUserSpecific = menu.userId && (
                        typeof menu.userId === 'object' 
                          ? menu.userId._id === selectedUser?._id
                          : menu.userId === selectedUser?._id
                      )
                      
                      return (
                        <div key={menu._id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={assignedMenuIds.includes(menu._id)}
                                onChange={() => handleToggleMenuAssignment(menu._id)}
                                className="w-5 h-5"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{menu.name}</div>
                                <div className="text-sm text-muted-foreground">{menu.link}</div>
                                {menu.children && menu.children.length > 0 && (
                                  <div className="mt-2 ml-8 space-y-1">
                                    {menu.children.map((child: any) => {
                                      const isChildUserSpecific = child.userId && (
                                        typeof child.userId === 'object' 
                                          ? child.userId._id === selectedUser?._id
                                          : child.userId === selectedUser?._id
                                      )
                                      
                                      return (
                                        <div key={child._id} className="flex items-center gap-2">
                                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                                            <input
                                              type="checkbox"
                                              checked={assignedMenuIds.includes(child._id)}
                                              onChange={() => handleToggleMenuAssignment(child._id)}
                                              className="w-4 h-4"
                                            />
                                            <span className="text-sm">└ {child.name}</span>
                                          </label>
                                          {isChildUserSpecific && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleOpenUserMenuDialog(child)}
                                            >
                                              <Edit className="h-4 w-4 mr-1" />
                                              編輯
                                            </Button>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </label>
                            {isUserSpecific && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUserMenuDialog(menu)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                編輯
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Global Menu Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? '編輯選單' : '新增全域選單'}
            </DialogTitle>
            <DialogDescription>
              {editingMenu ? '更新選單資訊' : '新增所有使用者都能看到的選單'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">選單名稱</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：關於我們、聯絡我們..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">選單連結</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="例如：/about, https://example.com..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">父選單（選填）</Label>
              <Select
                id="parent"
                value={formData.parent}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                className="w-full"
              >
                <option value="">無（頂層選單）</option>
                {rootMenus
                  .filter(menu => !editingMenu || menu._id !== editingMenu._id)
                  .map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.name}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">顯示順序</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="數字越小越前面"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingMenu ? '更新' : '新增'}
              </Button>
            </div>
          </div>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* User Menu Dialog */}
      <Dialog open={userMenuDialogOpen} onOpenChange={setUserMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUserMenu ? '編輯選單' : '新增選單給'} {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              {editingUserMenu ? '更新選單資訊' : '從系統路由選擇或新增選單給此使用者'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Menu Type Selection */}
            <div className="space-y-2">
              <Label>選單類型</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMenuType"
                    value="route"
                    checked={userMenuFormData.menuType === 'route'}
                    onChange={() => setUserMenuFormData({ 
                      ...userMenuFormData, 
                      menuType: 'route',
                      selectedRoute: '',
                      name: '',
                      link: '',
                      parent: '',
                      order: 0
                    })}
                  />
                  <span>從系統路由選擇</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMenuType"
                    value="new"
                    checked={userMenuFormData.menuType === 'new'}
                    onChange={() => setUserMenuFormData({ 
                      ...userMenuFormData, 
                      menuType: 'new',
                      selectedRoute: '',
                      name: '',
                      link: '',
                      parent: '',
                      order: 0
                    })}
                  />
                  <span>新增選單</span>
                </label>
              </div>
            </div>

            {/* Select Route */}
            {userMenuFormData.menuType === 'route' && (
              <div className="space-y-2">
                <Label>選擇系統路由</Label>
                <Select
                  value={userMenuFormData.selectedRoute}
                  onChange={(e) => {
                    const selectedRoute = appRoutes.find(r => r.path === e.target.value)
                    setUserMenuFormData({
                      ...userMenuFormData,
                      selectedRoute: e.target.value,
                      name: selectedRoute?.name || '',
                      link: selectedRoute?.path || '',
                    })
                  }}
                  className="w-full"
                >
                  <option value="">請選擇路由</option>
                  {appRoutes.map((route) => (
                    <option key={route.path} value={route.path}>
                      {route.name} ({route.path})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="user-menu-name">選單名稱</Label>
              <Input
                id="user-menu-name"
                value={userMenuFormData.name}
                onChange={(e) => setUserMenuFormData({ ...userMenuFormData, name: e.target.value })}
                placeholder="例如：管理儀表板、設定..."
                disabled={userMenuFormData.menuType === 'route' && !userMenuFormData.selectedRoute}
              />
            </div>

            {/* Menu Link - Only for new menu or show readonly for route */}
            {userMenuFormData.menuType === 'new' ? (
              <div className="space-y-2">
                <Label htmlFor="user-menu-link">選單連結</Label>
                <Input
                  id="user-menu-link"
                  value={userMenuFormData.link}
                  onChange={(e) => setUserMenuFormData({ ...userMenuFormData, link: e.target.value })}
                  placeholder="例如：/admin, https://example.com..."
                />
              </div>
            ) : (
              userMenuFormData.selectedRoute && (
                <div className="space-y-2">
                  <Label htmlFor="user-menu-link">選單連結</Label>
                  <Input
                    id="user-menu-link"
                    value={userMenuFormData.link}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">連結來自選定的路由，無法修改</p>
                </div>
              )
            )}

            {/* Parent Menu */}
            {(userMenuFormData.menuType === 'new' || userMenuFormData.menuType === 'route') && (
              <div className="space-y-2">
                <Label htmlFor="user-menu-parent">父選單（選填）</Label>
                <Select
                  id="user-menu-parent"
                  value={userMenuFormData.parent}
                  onChange={(e) => setUserMenuFormData({ ...userMenuFormData, parent: e.target.value })}
                  className="w-full"
                >
                  <option value="">無（頂層選單）</option>
                  {userRootMenus.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Order */}
            {(userMenuFormData.menuType === 'new' || userMenuFormData.menuType === 'route') && (
              <div className="space-y-2">
                <Label htmlFor="user-menu-order">顯示順序</Label>
                <Input
                  id="user-menu-order"
                  type="number"
                  value={userMenuFormData.order}
                  onChange={(e) => setUserMenuFormData({ ...userMenuFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="數字越小越前面"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setUserMenuDialogOpen(false)
                setUserMenuFormData({
                  menuType: 'route',
                  selectedRoute: '',
                  name: '',
                  link: '',
                  parent: '',
                  order: 0,
                })
              }}>
                取消
              </Button>
              <Button onClick={handleSubmitUserMenu}>
                {editingUserMenu ? '更新' : '新增並分配'}
              </Button>
            </div>
          </div>
          <DialogClose onClose={() => {
            setUserMenuDialogOpen(false)
            setEditingUserMenu(null)
            setUserMenuFormData({
              menuType: 'route',
              selectedRoute: '',
              name: '',
              link: '',
              parent: '',
              order: 0,
            })
          }} />
        </DialogContent>
      </Dialog>

      {/* Global Assign Dialog */}
      <Dialog open={globalAssignDialogOpen} onOpenChange={setGlobalAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配選單給所有使用者</DialogTitle>
            <DialogDescription>
              從系統路由選擇或新增選單給所有使用者
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Menu Type Selection */}
            <div className="space-y-2">
              <Label>選單類型</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="globalMenuType"
                    value="route"
                    checked={globalAssignFormData.menuType === 'route'}
                    onChange={() => setGlobalAssignFormData({ 
                      ...globalAssignFormData, 
                      menuType: 'route',
                      selectedRoute: '',
                      name: '',
                      link: '',
                      parent: '',
                      order: 0
                    })}
                  />
                  <span>從系統路由選擇</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="globalMenuType"
                    value="new"
                    checked={globalAssignFormData.menuType === 'new'}
                    onChange={() => setGlobalAssignFormData({ 
                      ...globalAssignFormData, 
                      menuType: 'new',
                      selectedRoute: '',
                      name: '',
                      link: '',
                      parent: '',
                      order: 0
                    })}
                  />
                  <span>新增選單</span>
                </label>
              </div>
            </div>

            {/* Select Route */}
            {globalAssignFormData.menuType === 'route' && (
              <div className="space-y-2">
                <Label>選擇系統路由</Label>
                <Select
                  value={globalAssignFormData.selectedRoute}
                  onChange={(e) => {
                    const selectedRoute = appRoutes.find(r => r.path === e.target.value)
                    setGlobalAssignFormData({
                      ...globalAssignFormData,
                      selectedRoute: e.target.value,
                      name: selectedRoute?.name || '',
                      link: selectedRoute?.path || '',
                    })
                  }}
                  className="w-full"
                >
                  <option value="">請選擇路由</option>
                  {appRoutes.map((route) => (
                    <option key={route.path} value={route.path}>
                      {route.name} ({route.path})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="global-menu-name">選單名稱</Label>
              <Input
                id="global-menu-name"
                value={globalAssignFormData.name}
                onChange={(e) => setGlobalAssignFormData({ ...globalAssignFormData, name: e.target.value })}
                placeholder="例如：管理儀表板、設定..."
                disabled={globalAssignFormData.menuType === 'route' && !globalAssignFormData.selectedRoute}
              />
            </div>

            {/* Menu Link - Only for new menu or show readonly for route */}
            {globalAssignFormData.menuType === 'new' ? (
              <div className="space-y-2">
                <Label htmlFor="global-menu-link">選單連結</Label>
                <Input
                  id="global-menu-link"
                  value={globalAssignFormData.link}
                  onChange={(e) => setGlobalAssignFormData({ ...globalAssignFormData, link: e.target.value })}
                  placeholder="例如：/admin, https://example.com..."
                />
              </div>
            ) : (
              globalAssignFormData.selectedRoute && (
                <div className="space-y-2">
                  <Label htmlFor="global-menu-link">選單連結</Label>
                  <Input
                    id="global-menu-link"
                    value={globalAssignFormData.link}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">連結來自選定的路由，無法修改</p>
                </div>
              )
            )}

            {/* Parent Menu */}
            {(globalAssignFormData.menuType === 'new' || globalAssignFormData.menuType === 'route') && (
              <div className="space-y-2">
                <Label htmlFor="global-menu-parent">父選單（選填）</Label>
                <Select
                  id="global-menu-parent"
                  value={globalAssignFormData.parent}
                  onChange={(e) => setGlobalAssignFormData({ ...globalAssignFormData, parent: e.target.value })}
                  className="w-full"
                >
                  <option value="">無（頂層選單）</option>
                  {rootMenus.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Order */}
            {(globalAssignFormData.menuType === 'new' || globalAssignFormData.menuType === 'route') && (
              <div className="space-y-2">
                <Label htmlFor="global-menu-order">顯示順序</Label>
                <Input
                  id="global-menu-order"
                  type="number"
                  value={globalAssignFormData.order}
                  onChange={(e) => setGlobalAssignFormData({ ...globalAssignFormData, order: parseInt(e.target.value) || 0 })}
                  placeholder="數字越小越前面"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setGlobalAssignDialogOpen(false)
                setGlobalAssignFormData({
                  menuType: 'route',
                  selectedRoute: '',
                  name: '',
                  link: '',
                  parent: '',
                  order: 0,
                })
              }}>
                取消
              </Button>
              <Button onClick={handleSubmitGlobalAssign}>
                新增並分配
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法復原。確定要刪除選單
              {menuToDelete ? ` "${menuToDelete.name}"` : ''}嗎？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </div>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminMenus
