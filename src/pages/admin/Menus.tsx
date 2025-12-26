import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTaiwanCities, useTaiwanDistricts } from '../../hooks/useTaiwanLocations'

interface Menu {
  _id: string
  name: string
  link?: string
  menuType?: 'link' | 'filter'
  filterProvince?: string
  filterDistrict?: string
  filterCategories?: string[]
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

const AdminMenus = () => {
  // Global menu state
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    menuType: 'link' as 'link' | 'filter',
    filterProvince: '',
    filterDistrict: '',
    filterCategories: [] as string[],
    parent: '',
    order: 0,
  })
  const [allCategories, setAllCategories] = useState<Array<{_id: string, name: string}>>([])
  
  // Taiwan locations data
  const { cities } = useTaiwanCities()
  const { districts } = useTaiwanDistricts(formData.filterProvince)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)

  useEffect(() => {
    fetchMenus()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setAllCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }


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


  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        link: menu.link || '',
        menuType: menu.menuType || 'link',
        filterProvince: menu.filterProvince || '',
        filterDistrict: menu.filterDistrict || '',
        filterCategories: menu.filterCategories || [],
        parent: menu.parent && typeof menu.parent === 'object' ? menu.parent._id : (menu.parent || ''),
        order: menu.order || 0,
      })
    } else {
      setEditingMenu(null)
      setFormData({ 
        name: '', 
        link: '', 
        menuType: 'link',
        filterProvince: '',
        filterDistrict: '',
        filterCategories: [],
        parent: '', 
        order: 0 
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMenu(null)
    setFormData({ 
      name: '', 
      link: '', 
      menuType: 'link',
      filterProvince: '',
      filterDistrict: '',
      filterCategories: [],
      parent: '', 
      order: 0 
    })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('選單名稱不可為空')
      return
    }
    
    if (formData.menuType === 'link' && !formData.link.trim()) {
      toast.error('選單連結不可為空')
      return
    }
    
    if (formData.menuType === 'filter') {
      // At least one filter must be set
      if (!formData.filterProvince && !formData.filterDistrict && formData.filterCategories.length === 0) {
        toast.error('請至少選擇一個篩選條件（縣市、區域或分類）')
        return
      }
    }

    try {
      const payload: any = {
        name: formData.name,
        menuType: formData.menuType,
        order: formData.order || 0,
        isGlobal: true,
      }
      
      if (formData.menuType === 'link') {
        // Normalize link: đảm bảo internal link có "/" ở đầu
        let normalizedLink = formData.link.trim()
        if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
          normalizedLink = normalizedLink.startsWith('/') ? normalizedLink : `/${normalizedLink}`
        }
        payload.link = normalizedLink
      } else {
        // Filter menu type
        payload.link = '/'
        if (formData.filterProvince) payload.filterProvince = formData.filterProvince
        if (formData.filterDistrict) payload.filterDistrict = formData.filterDistrict
        if (formData.filterCategories.length > 0) payload.filterCategories = formData.filterCategories
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
        const parentId = menu.parent && typeof menu.parent === 'object' ? menu.parent._id : menu.parent
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">選單管理</h1>
        <p className="text-muted-foreground">管理網站選單</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">管理所有使用者都能看到的選單</p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          新增選單
        </Button>
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
            
            {/* Menu Type Selection */}
            <div className="space-y-2">
              <Label>選單類型</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuType"
                    value="link"
                    checked={formData.menuType === 'link'}
                    onChange={() => setFormData({ ...formData, menuType: 'link' })}
                  />
                  <span>連結選單</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuType"
                    value="filter"
                    checked={formData.menuType === 'filter'}
                    onChange={() => setFormData({ ...formData, menuType: 'filter' })}
                  />
                  <span>篩選選單</span>
                </label>
              </div>
            </div>

            {/* Link Input - Only for link type */}
            {formData.menuType === 'link' && (
              <div className="space-y-2">
                <Label htmlFor="link">選單連結</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="例如：/about, https://example.com..."
                />
              </div>
            )}

            {/* Filter Configuration - Only for filter type */}
            {formData.menuType === 'filter' && (
              <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                <div className="text-sm font-medium mb-2">篩選條件設定</div>
                
                {/* Province Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filterProvince">縣市（選填）</Label>
                  <Select
                    id="filterProvince"
                    value={formData.filterProvince}
                    onChange={(e) => setFormData({ ...formData, filterProvince: e.target.value, filterDistrict: '' })}
                    className="w-full"
                  >
                    <option value="">所有縣市</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.name}>
                        {city.name} ({city.nameEn})
                      </option>
                    ))}
                  </Select>
                </div>

                {/* District Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filterDistrict">區域（選填）</Label>
                  <Select
                    id="filterDistrict"
                    value={formData.filterDistrict}
                    onChange={(e) => setFormData({ ...formData, filterDistrict: e.target.value })}
                    disabled={!formData.filterProvince}
                    className="w-full"
                  >
                    <option value="">所有區域</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name} ({district.nameEn})
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>分類（選填）</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {allCategories.length === 0 ? (
                      <div className="text-sm text-muted-foreground">載入中...</div>
                    ) : (
                      allCategories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.filterCategories.includes(cat._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  filterCategories: [...formData.filterCategories, cat._id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  filterCategories: formData.filterCategories.filter(id => id !== cat._id)
                                })
                              }
                            }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.filterCategories.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      已選擇 {formData.filterCategories.length} 個分類
                    </div>
                  )}
                </div>
              </div>
            )}

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
