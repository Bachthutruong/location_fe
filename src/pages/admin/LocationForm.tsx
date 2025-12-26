import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Upload, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTaiwanCities, useTaiwanDistricts } from '../../hooks/useTaiwanLocations'

interface Category { _id: string; name: string }

const AdminLocationForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = useMemo(() => Boolean(id), [id])

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    province: '',
    district: '',
    street: '',
    address: '',
    phone: '',
    googleMapsLink: '',
    description: '',
    latitude: '',
    longitude: '',
    websiteLink: '',
    businessHours: '',
    featuredProducts: '',
  })

  const { cities } = useTaiwanCities()
  const { districts } = useTaiwanDistricts(formData.province)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          isEdit ? api.get(`/locations/admin/${id}`) : Promise.resolve({ data: null })
        ])
        setCategories(catRes.data)
        if (isEdit && locRes.data) {
          const location = locRes.data
          setFormData({
            name: location.name || '',
            category: location.category?._id || '',
            province: location.province || '',
            district: location.district || '',
            street: location.street || '',
            address: location.address || '',
            phone: location.phone || '',
            googleMapsLink: location.googleMapsLink || '',
            description: location.description || '',
            latitude: location.latitude?.toString() || '',
            longitude: location.longitude?.toString() || '',
            websiteLink: location.websiteLink || '',
            businessHours: location.businessHours || '',
            featuredProducts: location.featuredProducts || '',
          })
          if (Array.isArray(location.images) && location.images.length > 0) {
            setExistingImages(location.images)
          }
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || '載入資料時發生錯誤')
      } finally {
        setInitialLoading(false)
      }
    }
    load()
    return () => {
      setNewImagePreviews((prev) => {
        prev.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) })
        return []
      })
    }
  }, [id, isEdit])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setNewImages(files)
      setNewImagePreviews((prev) => {
        prev.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) })
        return []
      })
      const nextPreviews = files.map((file) => URL.createObjectURL(file))
      setNewImagePreviews(nextPreviews)
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }
  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx))
    setNewImagePreviews((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(idx, 1)
      if (removed && removed.startsWith('blob:')) URL.revokeObjectURL(removed)
      return copy
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.address || !formData.phone || !formData.googleMapsLink || !formData.description) {
      toast.error('請完整填寫必填資訊')
      return
    }
    if (!isEdit && newImages.length === 0) {
      toast.error('請至少上傳一張圖片')
      return
    }
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('province', formData.province)
      formDataToSend.append('district', formData.district)
      formDataToSend.append('street', formData.street)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('googleMapsLink', formData.googleMapsLink)
      formDataToSend.append('description', formData.description)
      if (formData.latitude) formDataToSend.append('latitude', formData.latitude)
      if (formData.longitude) formDataToSend.append('longitude', formData.longitude)
      if (formData.websiteLink) formDataToSend.append('websiteLink', formData.websiteLink)
      if (formData.businessHours) formDataToSend.append('businessHours', formData.businessHours)
      if (formData.featuredProducts) formDataToSend.append('featuredProducts', formData.featuredProducts)
      if (isEdit) formDataToSend.append('keepImages', JSON.stringify(existingImages))
      newImages.forEach((image) => formDataToSend.append('images', image))

      if (isEdit && id) {
        await api.put(`/locations/${id}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('更新地點成功！')
      } else {
        await api.post('/locations', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('新增地點成功！')
      }
      navigate('/admin/locations')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存地點時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isEdit ? '編輯地點' : '新增地點'}
            </h1>
            <p className="text-muted-foreground">{isEdit ? '更新地點資訊' : '上傳新地點'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/locations')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {isEdit ? '更新' : '儲存' }
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>地點資訊</CardTitle>
            <CardDescription>請完整填寫以下資訊</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">分類 *</Label>
                <Select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">選擇分類</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">地點名稱 *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="地點名稱" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">縣市 *</Label>
                  <Select id="province" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '' })}>
                    <option value="">選擇縣市</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.name}>{city.name} ({city.nameEn})</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">區 *</Label>
                  <Select id="district" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} disabled={!formData.province}>
                    <option value="">選擇區</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>{district.name} ({district.nameEn})</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">街道 *</Label>
                  <Input id="street" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} placeholder="街道" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">完整地址 *</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="完整地址" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話 *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="例如：0901234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMapsLink">Google 地圖連結 *</Label>
                <Input id="googleMapsLink" value={formData.googleMapsLink} onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })} placeholder="https://maps.google.com/..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">緯度（選填）</Label>
                  <Input id="latitude" type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="23.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">經度（選填）</Label>
                  <Input id="longitude" type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="121.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述 *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="地點描述..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteLink">網站/社群連結（選填）</Label>
                <Input id="websiteLink" value={formData.websiteLink} onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })} placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessHours">營業時間（選填）</Label>
                <Input id="businessHours" value={formData.businessHours} onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })} placeholder="例如：週一至週五 09:00-18:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredProducts">明星商品/服務介紹（選填）</Label>
                <Textarea id="featuredProducts" value={formData.featuredProducts} onChange={(e) => setFormData({ ...formData, featuredProducts: e.target.value })} placeholder="請詳細介紹商品或服務..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">圖片 {!isEdit && '*'} </Label>
                <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} />
                <p className="text-sm text-muted-foreground">{isEdit ? '選擇新圖片以新增/移除' : '請上傳至少一張圖片'}</p>
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {existingImages.map((src, idx) => (
                      <div key={idx} className="relative w-full aspect-square overflow-hidden rounded-md border">
                        <button type="button" className="absolute top-1 right-1 z-10 bg-white/80 rounded-full px-2 text-xs" onClick={() => removeExistingImage(src)}>X</button>
                        <img src={src} alt={`current-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {newImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-full aspect-square overflow-hidden rounded-md border">
                        <button type="button" className="absolute top-1 right-1 z-10 bg-white/80 rounded-full px-2 text-xs" onClick={() => removeNewImage(idx)}>X</button>
                        <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/locations')}>取消</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  <Upload className="h-4 w-4 mr-2" /> {isEdit ? '更新' : '新增'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminLocationForm


