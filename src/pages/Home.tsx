import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { MapPin, Search, Navigation, Share2, X, ChevronLeft, ExternalLink } from 'lucide-react'
import LocationMap from '../components/LocationMap'
import toast from 'react-hot-toast'
import { useTaiwanCities, useTaiwanDistricts } from '../hooks/useTaiwanLocations'

interface AppLocation {
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
  latitude?: number
  longitude?: number
  googleMapsLink: string
  manager: {
    _id: string
    name: string
  }
}

interface Category {
  _id: string
  name: string
}

const Home = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<AppLocation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<AppLocation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'about'>('overview')
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(384)

  // Taiwan locations data from API
  const { cities } = useTaiwanCities()
  const { districts } = useTaiwanDistricts(selectedProvince)

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchLocations = useCallback(async () => {
    // Only fetch if all required filters are set and at least one category is selected
    if (!selectedProvince || !selectedDistrict || selectedCategories.length === 0) {
      return
    }

    try {
      setLoading(true)
      const params: any = {
        categories: selectedCategories.join(','), // Send as comma-separated string
        province: selectedProvince,
        district: selectedDistrict
      }
      if (search) params.search = search

      const response = await api.get('/locations', { params })
      setLocations(response.data)
    } catch (error: any) {
      toast.error('載入地點列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }, [selectedProvince, selectedDistrict, selectedCategories, search])

  // Fetch categories on mount only
  useEffect(() => {
    fetchCategories()
  }, [])

  // Only fetch locations when all required filters are set: province, district, and at least one category
  // Also refetch when search changes (if all filters are set)
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedCategories.length > 0) {
      fetchLocations()
    } else {
      // Clear locations if filters are not complete
      setLocations([])
      setSelectedLocation(null)
    }
  }, [selectedCategories, selectedProvince, selectedDistrict, search, fetchLocations])

  // Reset selected location when filters/search change to avoid showing detail by default
  useEffect(() => {
    setSelectedLocation(null)
    setSidebarOpen(true)
  }, [selectedCategories, selectedProvince, selectedDistrict, search])

  // Invalidate map size when sidebar opens/closes
  useEffect(() => {
    // Trigger map resize after sidebar animation completes
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      if (sidebarRef.current) {
        const width = Math.round(sidebarRef.current.getBoundingClientRect().width)
        setSidebarWidth(width)
      }
    }, 350) // Wait for sidebar animation (300ms) + 50ms buffer
    
    return () => clearTimeout(timer)
  }, [sidebarOpen])

  // Update sidebar width on resize
  useEffect(() => {
    const onResize = () => {
      if (sidebarRef.current) {
        const width = Math.round(sidebarRef.current.getBoundingClientRect().width)
        setSidebarWidth(width)
      }
    }
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Provinces and districts are now from Taiwan API, not from locations

  const handleLocationClick = (location: AppLocation) => {
    setSelectedLocation(location)
    setSidebarOpen(true)
  }

  const handleClearSearch = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedProvince('')
    setSelectedDistrict('')
    setSelectedLocation(null)
  }

  const handleShare = async () => {
    if (selectedLocation) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: selectedLocation.name,
            text: selectedLocation.description,
            url: window.location.href + `/location/${selectedLocation._id}`
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href + `/location/${selectedLocation._id}`)
        toast.success('已複製連結！')
      }
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#e9eef6]">
      {/* Left Sidebar (Google Maps-like panel) */}
      <div ref={sidebarRef} className={`absolute left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-[999] transition-transform duration-300 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: sidebarOpen ? '384px' : '0' }}>
        {/* Sidebar Header: search & filters */}
        {!selectedLocation && (
          <div className="sticky top-0 z-10 bg-white">
            {/* App bar */}
            <div className="flex items-center justify-between px-3 pt-4 pb-2 border-b">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="隱藏側邊欄"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold">Jiudi Maps</h2>
              </div>
            </div>
            {/* Search bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="在 Jiudi Maps 上搜尋"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setSidebarOpen(true)
                  }}
                  className="pl-10 pr-10 h-11 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-0"
                />
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    aria-label="清除搜尋"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Province and District filters */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Select
                  value={selectedProvince}
                  onChange={(e) => { 
                    setSelectedProvince(e.target.value); 
                    setSelectedDistrict(''); 
                    setSelectedCategories([]);
                    setLocations([]);
                    setSelectedLocation(null);
                    setSidebarOpen(true); 
                    console.log('[Home] province changed ->', e.target.value) 
                  }}
                  className="h-9 border-gray-200"
                >
                  <option value="">所有縣市</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>{city.name} ({city.nameEn})</option>
                  ))}
                </Select>
                <Select
                  value={selectedDistrict}
                  onChange={(e) => { 
                    setSelectedDistrict(e.target.value); 
                    setSelectedCategories([]);
                    setLocations([]);
                    setSelectedLocation(null);
                    setSidebarOpen(true); 
                    console.log('[Home] district changed ->', e.target.value) 
                  }}
                  disabled={!selectedProvince}
                  className="h-9 border-gray-200"
                >
                  <option value="">所有區域</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.name}>{district.name} ({district.nameEn})</option>
                  ))}
                </Select>
              </div>
              
              {/* Category tags - only show when province and district are selected */}
              {selectedProvince && selectedDistrict && (
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground mb-2">分類:</div>  
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat._id)
                      return (
                        <Badge
                          key={cat._id}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            if (isSelected) {
                              // Remove category from selection
                              setSelectedCategories(selectedCategories.filter(id => id !== cat._id))
                              setLocations([])
                              setSelectedLocation(null)
                            } else {
                              // Add category to selection
                              setSelectedCategories([...selectedCategories, cat._id])
                              setSidebarOpen(true)
                            }
                          }}
                        >
                          {cat.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedLocation ? (
          // Location Detail View
          <div className="pt-24 px-4">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Location Image */}
            {selectedLocation.images[0] && (
              <img
                src={selectedLocation.images[0]}
                alt={selectedLocation.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {/* Location Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{selectedLocation.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-2">{selectedLocation.address}</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {selectedLocation.category.name}
              </Badge>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                總覽
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                評論
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                介紹
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(selectedLocation.googleMapsLink, '_blank', 'noopener,noreferrer')}
              >
                <Navigation className="h-4 w-4 mr-2" />
                路線
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Location Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{selectedLocation.address}</p>
                      <p className="text-muted-foreground">{selectedLocation.province}, {selectedLocation.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">管理員:</span>
                    <span>{selectedLocation.manager.name}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">描述</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLocation.description}
                  </p>
                </div>

                {/* Images */}
                {selectedLocation.images.length > 1 && (
                  <div>
                    <h3 className="font-semibold mb-2">圖片和影片</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedLocation.images.slice(1, 5).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedLocation.name} - ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
{/* 
                <Button
                  className="w-full"
                  onClick={() => navigate(`/location/${selectedLocation._id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Xem chi tiết đầy đủ
                </Button> */}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">評論將在詳細頁面顯示</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/location/${selectedLocation._id}`)}
                >
                  查看所有評論
                </Button>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">資訊</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">縣市:</span>
                      <span>{selectedLocation.province}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">區/鄉鎮:</span>
                      <span>{selectedLocation.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">分類:</span>
                      <span>{selectedLocation.category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">管理員:</span>
                      <span>{selectedLocation.manager.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Locations List View
          <div className="pt-4 px-4">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-3">
              <h2 className="text-base font-semibold text-gray-800">結果</h2>
            </div>

            {!selectedProvince || !selectedDistrict ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  請選擇縣市和區/鄉鎮
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  然後選擇分類以查看地點
                </p>
              </div>
            ) : selectedCategories.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  請選擇分類
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  選擇一個或多個分類以上以查看地點
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  找不到任何地點
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  嘗試更改篩選條件或搜尋關鍵字
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((location) => {
                  const loc = location as any
                  const selectedId = selectedLocation ? (selectedLocation as any)._id : null
                  return (
                  <Card
                    key={loc._id}
                    className={`cursor-pointer hover:shadow-lg transition-all border-0 ${
                      selectedId === loc._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleLocationClick(location as any)}
                    onMouseEnter={() => setHoveredId(loc._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex gap-4 p-4 relative">
                      <div className="relative">
                        {loc.images[0] && (
                          <img
                            src={loc.images[0]}
                            alt={loc.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        {hoveredId === loc._id && (
                          <div className="absolute top-1 right-1">
                            <Badge variant="secondary" className="text-xs shadow-sm">
                              {loc.category?.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-lg line-clamp-1 flex-1">{loc.name}</h3>
                          {loc.googleMapsLink && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(loc.googleMapsLink, '_blank', 'noopener,noreferrer')
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                              aria-label="開啟 Google 地圖"
                              title="開啟 Google 地圖"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{loc.address}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {loc.category.name}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )})}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reopen sidebar button when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1001] bg-white p-3 rounded-full shadow-md hover:bg-gray-50"
          aria-label="開啟側邊欄"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>
      )}

      {/* Fullscreen Map */}
      <div 
        className="absolute top-0 bottom-0 right-0 z-0"
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px',
          transition: 'margin-left 0.3s ease',
          width: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <LocationMap
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationClick={handleLocationClick}
          onProvinceSelect={(name) => {
            setSelectedProvince(name)
            setSelectedDistrict('')
            setSidebarOpen(true)
          }}
          focusProvinceName={selectedProvince}
          focusCityName={selectedProvince}
          focusDistrictName={selectedDistrict}
          suppressAutoFit={Boolean(selectedProvince || selectedDistrict)}
        />

        {/* Floating map controls (visual only) */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-[1000]">
          <button className="bg-white rounded-md shadow-md w-10 h-10 flex items-center justify-center hover:bg-gray-50" aria-label="放大">
            +
          </button>
          <button className="bg-white rounded-md shadow-md w-10 h-10 flex items-center justify-center hover:bg-gray-50" aria-label="縮小">
            −
          </button>
        </div>
        <div className="absolute bottom-6 left-4 z-[1000]">
          <button className="bg-white rounded-md shadow-md px-3 h-10 flex items-center gap-2 hover:bg-gray-50" aria-label="地圖圖層">
            <span className="w-5 h-5 bg-gray-200 rounded-sm" />
            <span className="text-sm">地圖圖層</span>
          </button>
        </div>
      </div>

      {/* Results Count Badge */}
      {!selectedLocation && selectedProvince && selectedDistrict && selectedCategories.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-md text-sm">
          找到 <span className="font-semibold text-primary">{locations.length}</span> 個地點
        </div>
      )}
    </div>
  )
}

export default Home
