import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { useTaiwanCities, useTaiwanDistricts } from '../../hooks/useTaiwanLocations'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon } from 'lucide-react'

const AdminSettings = () => {
  const [defaultProvince, setDefaultProvince] = useState('')
  const [defaultDistrict, setDefaultDistrict] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const { cities } = useTaiwanCities()
  const { districts } = useTaiwanDistricts(defaultProvince)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/settings')
      setDefaultProvince(response.data.defaultProvince || '')
      setDefaultDistrict(response.data.defaultDistrict || '')
    } catch (error: any) {
      toast.error('載入設定時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.patch('/settings', { 
        defaultProvince: defaultProvince || null,
        defaultDistrict: defaultDistrict || null
      })
      toast.success('設定已儲存！')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '儲存設定時發生錯誤')
    } finally {
      setSaving(false)
    }
  }

  const handleProvinceChange = (value: string) => {
    setDefaultProvince(value)
    // Reset district when province changes
    setDefaultDistrict('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            系統設定
          </h1>
          <p className="text-muted-foreground">管理系統預設設定</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              網站設定
            </CardTitle>
            <CardDescription>設定網站預設顯示的縣市和區域</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    預設縣市
                  </label>
                  <Select
                    value={defaultProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full"
                  >
                    <option value="">無</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.name}>
                        {city.name} ({city.nameEn})
                      </option>
                    ))}
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    選擇後，用戶進入網站時將自動顯示此縣市
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    預設區域
                  </label>
                  <Select
                    value={defaultDistrict}
                    onChange={(e) => setDefaultDistrict(e.target.value)}
                    className="w-full"
                    disabled={!defaultProvince}
                  >
                    <option value="">無</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name} ({district.nameEn})
                      </option>
                    ))}
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    選擇後，用戶進入網站時將自動顯示此區域（需先選擇縣市）
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? '儲存中...' : '儲存設定'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminSettings

