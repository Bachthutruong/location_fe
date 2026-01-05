import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { isAuthenticated } from '../lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { MapPin, ExternalLink, Flag, MessageSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog'
// import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import toast from 'react-hot-toast'
import LocationMap from '../components/LocationMap'
import ReviewList from '../components/ReviewList'

interface Location {
  _id: string
  name: string
  address: string
  description: string
  images: string[]
  category: {
    _id: string
    name: string
  }
  province: string
  district: string
  street: string
  googleMapsLink: string
  latitude?: number
  longitude?: number
  websiteLink?: string
  businessHours?: string
  featuredProducts?: string
  manager: {
    _id: string
    name: string
  }
}

interface ReportCategory {
  _id: string
  name: string
}

const LocationDetail = () => {
  const { id } = useParams()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([])
  const [reportData, setReportData] = useState({
    category: '',
    description: '',
  })
  // const user = getUser()

  useEffect(() => {
    if (id) {
      fetchLocation()
      fetchReportCategories()
    }
  }, [id])

  const fetchLocation = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/locations/${id}`)
      setLocation(response.data)
    } catch (error: any) {
      // If not found (e.g., pending), and user is owner, try manager endpoint
      try {
        if (isAuthenticated()) {
          const resp2 = await api.get(`/locations/manager/${id}`)
          setLocation(resp2.data)
          return
        }
      } catch (e) {
        // ignore and show error below
      }
      toast.error('找不到地點')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportCategories = async () => {
    try {
      const response = await api.get('/reports/categories')
      setReportCategories(response.data)
    } catch (error) {
      console.error('Error fetching report categories:', error)
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated()) {
      toast.error('請先登入以進行檢舉')
      return
    }

    if (!reportData.category || !reportData.description) {
      toast.error('請完整填寫資訊')
      return
    }

    try {
      await api.post('/reports', {
        location: id,
        category: reportData.category,
        description: reportData.description,
      })
      toast.success('已送出檢舉！')
      setReportOpen(false)
      setReportData({ category: '', description: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || '送出檢舉時發生錯誤')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center py-12 px-8">
          <CardContent>
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">找不到地點</h2>
            <p className="text-muted-foreground">此地點可能已被刪除或不存在</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Location Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-4xl mb-3">{location.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <MapPin className="h-5 w-5 text-primary" />
                      {location.address}
                    </CardDescription>
                  </div>
                  <span className="ml-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-md">
                    {location.category.name}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {location.images.length > 0 && (
                    <div className={`grid gap-4 ${
                      location.images.length === 1 ? 'grid-cols-1' : 
                      'grid-cols-1 md:grid-cols-2'
                    }`}>
                      {location.images.map((image, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-md">
                          <img
                            src={image}
                            alt={`${location.name} - ${index + 1}`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded"></span>
                      描述
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{location.description}</p>
                  </div>

                  <div className="bg-card border border-border p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded"></span>
                      詳細資訊
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">縣市</p>
                        <p className="font-medium">{location.province}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">區</p>
                        <p className="font-medium">{location.district}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">街道</p>
                        <p className="font-medium">{location.street}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">管理人</p>
                        <p className="font-medium">{location.manager.name}</p>
                      </div>
                      {location.businessHours && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">營業時間</p>
                          <p className="font-medium">{location.businessHours}</p>
                        </div>
                      )}
                      {location.websiteLink && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">網站/社群連結</p>
                          <a 
                            href={location.websiteLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            前往網站
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {location.featuredProducts && (
                    <div className="bg-muted/50 p-5 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded"></span>
                        明星商品/服務介紹
                      </h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{location.featuredProducts}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button asChild size="lg" className="flex-1 shadow-md">
                      <a href={location.googleMapsLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        在 Google 地圖查看
                      </a>
                    </Button>
                    
                    {isAuthenticated() && (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => setReportOpen(true)}
                        className="shadow-md"
                      >
                        <Flag className="h-5 w-5 mr-2" />
                        檢舉
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  評論
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ReviewList locationId={location._id} />
              </CardContent>
            </Card>
          </div>

          {/* Map Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  地圖
                </CardTitle>
                <CardDescription>
                  地點在地圖上的位置
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LocationMap locations={location ? [location] : []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>檢舉地點</DialogTitle>
            <DialogDescription>
              請選擇檢舉分類並描述問題
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportCategory">檢舉分類</Label>
              <Select
                id="reportCategory"
                value={reportData.category}
                onChange={(e) => setReportData({ ...reportData, category: e.target.value })}
              >
                <option value="">選擇分類</option>
                {reportCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportDescription">描述</Label>
              <Textarea
                id="reportDescription"
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                placeholder="請描述問題..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                取消
              </Button>
              <Button onClick={handleReport}>
                送出檢舉
              </Button>
            </div>
          </div>
          <DialogClose onClose={() => setReportOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LocationDetail

