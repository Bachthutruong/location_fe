import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface News {
  _id: string
  title: string
  content: string
  images: string[]
  category: {
    _id: string
    name: string
    description?: string
  }
  author: {
    _id: string
    name: string
    email?: string
  }
  publishedAt?: string
  createdAt: string
  isCourse?: boolean
}

const NewsDetail = () => {
  const { id } = useParams()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  })
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    if (id) {
      fetchNews()
    }
  }, [id])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/news/${id}`)
      setNews(response.data)
    } catch (error: any) {
      toast.error('找不到新聞')
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.content.substring(0, 100),
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('連結已複製到剪貼簿')
    }
  }

  const handleRegister = async () => {
    if (!news?.isCourse || !id) return

    if (!registrationForm.name.trim()) {
      toast.error('請輸入姓名')
      return
    }
    if (!registrationForm.email.trim()) {
      toast.error('請輸入 Email')
      return
    }
    if (!registrationForm.phone.trim()) {
      toast.error('請輸入電話')
      return
    }

    try {
      setRegistering(true)
      await api.post(`/news/${id}/register`, registrationForm)
      toast.success('報名課程成功！')
      setRegistrationForm({ name: '', email: '', phone: '', note: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || '報名失敗')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">找不到新聞</p>
              <Link to="/news">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回新聞列表
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/news">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回新聞列表
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* News Header */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {news.category.name}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    分享
                  </Button>
                </div>
                <CardTitle className="text-4xl mb-4">{news.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{news.author?.name || '系統'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(news.publishedAt || news.createdAt).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Images Gallery */}
                {news.images && news.images.length > 0 && (
                  <div className="mb-6">
                    <div className="relative mb-4">
                      <img
                        src={news.images[currentImageIndex]}
                        alt={news.title}
                        className="w-full h-96 object-cover rounded-lg"
                      />
                      {news.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev > 0 ? prev - 1 : news.images.length - 1
                              )
                            }
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                          >
                            ←
                          </button>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev < news.images.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                          >
                            →
                          </button>
                        </>
                      )}
                    </div>
                    {news.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {news.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                              currentImageIndex === idx
                                ? 'border-primary'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${news.title} - ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none">
                  <div
                    className="text-base leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: news.content.replace(/\n/g, '<br />')
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">分類資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {news.category.name}
                </Badge>
                {news.category.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {news.category.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">作者資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{news.author?.name || '系統'}</p>
                    {news.author?.email && (
                      <p className="text-sm text-muted-foreground">{news.author.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Registration Form */}
            {news.isCourse && (
              <Card className="shadow-md border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">報名課程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">姓名 *</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        value={registrationForm.name}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                        placeholder="請輸入姓名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">電話 *</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={registrationForm.phone}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                        placeholder="0912345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-note">備註（選填）</Label>
                      <Textarea
                        id="reg-note"
                        value={registrationForm.note}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, note: e.target.value })}
                        placeholder="輸入備註（選填）..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleRegister} 
                      disabled={registering}
                      className="w-full"
                    >
                      {registering ? '報名中...' : '報名課程'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsDetail

