import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface NewsCategory {
  _id: string
  name: string
}

const AdminNewsForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = useMemo(() => Boolean(id), [id])

  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    published: false,
    isCourse: false,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, newsRes] = await Promise.all([
          api.get('/news-categories'),
          isEdit ? api.get(`/news/admin/${id}`) : Promise.resolve({ data: null })
        ])
        setCategories(catRes.data)
        if (isEdit && newsRes.data) {
          const news = newsRes.data
          setFormData({
            title: news.title || '',
            content: news.content || '',
            category: news.category?._id || '',
            published: news.published || false,
            isCourse: news.isCourse || false,
          })
          if (Array.isArray(news.images) && news.images.length > 0) {
            setExistingImages(news.images)
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
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...files])
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setNewImagePreviews((prev) => [...prev, ...newPreviews])
      // Reset input to allow selecting the same file again
      e.target.value = ''
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
    if (!formData.title.trim()) {
      toast.error('標題為必填')
      return
    }
    if (!formData.content.trim()) {
      toast.error('內容為必填')
      return
    }
    if (!formData.category) {
      toast.error('請選擇分類')
      return
    }
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('published', formData.published ? 'true' : 'false')
      formDataToSend.append('isCourse', formData.isCourse ? 'true' : 'false')
      if (isEdit) formDataToSend.append('keepImages', JSON.stringify(existingImages))
      newImages.forEach((image) => formDataToSend.append('images', image))

      if (isEdit && id) {
        await api.put(`/news/${id}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('更新新聞成功！')
      } else {
        await api.post('/news', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('新增新聞成功！')
      }
      navigate('/admin/news')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存新聞時發生錯誤')
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
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isEdit ? '編輯新聞' : '新增新聞'}
            </h1>
            <p className="text-muted-foreground">{isEdit ? '更新新聞資訊' : '建立新新聞'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/news')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {isEdit ? '更新' : '儲存'}
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>新聞資訊</CardTitle>
            <CardDescription>請完整填寫以下資訊</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">分類 *</Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">選擇分類</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">標題 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="新聞標題"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">內容 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="新聞內容..."
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published">發布狀態</Label>
                <Select
                  id="published"
                  value={formData.published ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, published: e.target.value === 'true' })}
                >
                  <option value="false">未發布</option>
                  <option value="true">已發布</option>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCourse"
                    checked={formData.isCourse}
                    onChange={(e) => setFormData({ ...formData, isCourse: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isCourse" className="cursor-pointer">
                    這是 地方創生課程
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  勾選後，用戶在查看此新聞時將看到表單來註冊課程
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">圖片</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="text-sm text-muted-foreground">
                  {isEdit ? '選擇新圖片以新增/移除' : '可上傳多張圖片'}
                </p>
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                    {existingImages.map((src, idx) => (
                      <div key={idx} className="relative w-full aspect-square overflow-hidden rounded-md border">
                        <button
                          type="button"
                          className="absolute top-1 right-1 z-10 bg-white/80 rounded-full px-2 text-xs hover:bg-white"
                          onClick={() => removeExistingImage(src)}
                        >
                          X
                        </button>
                        <img src={src} alt={`current-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                    {newImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-full aspect-square overflow-hidden rounded-md border">
                        <button
                          type="button"
                          className="absolute top-1 right-1 z-10 bg-white/80 rounded-full px-2 text-xs hover:bg-white"
                          onClick={() => removeNewImage(idx)}
                        >
                          X
                        </button>
                        <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/news')}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> {isEdit ? '更新' : '新增'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminNewsForm

