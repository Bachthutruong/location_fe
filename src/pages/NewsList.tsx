import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Search, Calendar, User, Newspaper } from 'lucide-react'

interface News {
  _id: string
  title: string
  content: string
  images: string[]
  category: {
    _id: string
    name: string
  }
  author: {
    _id: string
    name: string
  }
  publishedAt?: string
  createdAt: string
}

interface NewsCategory {
  _id: string
  name: string
}

const NewsList = () => {
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchNews()
  }, [search, selectedCategory, page])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news-categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize
      }
      if (selectedCategory) {
        params.category = selectedCategory
      }
      if (search.trim()) {
        params.search = search.trim()
      }
      const response = await api.get('/news', { params })
      if (response.data.items) {
        setNews(response.data.items)
        setTotal(response.data.total || 0)
      } else {
        setNews(response.data)
        setTotal(response.data.length)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchNews()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              新聞資訊
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">最新活動、促銷與新聞</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="搜尋標題或內容..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">全部分類</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Button onClick={handleSearch} className="w-full">
                  搜尋
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">載入中...</p>
          </div>
        ) : news.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">尚無新聞</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {news.map((item) => (
                <Link key={item._id} to={`/news/${item._id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
                    {item.images && item.images.length > 0 && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90">
                            {item.category.name}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {truncateContent(item.content)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{item.author?.name || '系統'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(item.publishedAt || item.createdAt).toLocaleDateString('zh-TW')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一頁
                </Button>
                <span className="text-muted-foreground">
                  第 {page} 頁 / 共 {Math.ceil(total / pageSize)} 頁
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * pageSize >= total}
                >
                  下一頁
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NewsList

