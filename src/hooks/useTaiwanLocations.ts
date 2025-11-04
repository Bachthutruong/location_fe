import { useState, useEffect } from 'react'
import { getTaiwanCities, getDistrictsByCity } from '../lib/taiwan-api'

// Using OpenStreetMap Nominatim API for real-time data
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

export interface TaiwanCity {
  code: string
  name: string
  nameEn: string
  districts: TaiwanDistrict[]
}

export interface TaiwanDistrict {
  code: string
  name: string
  nameEn: string
}

// Cache for API responses
const districtCache = new Map<string, any>()

// Fetch cities from Nominatim API (Taiwan)
export const useTaiwanCities = () => {
  const [cities, setCities] = useState<TaiwanCity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use static data as fallback, but try to fetch from API
    const fetchCities = async () => {
      try {
        // Try to get data from Nominatim API
        const response = await fetch(
          `${NOMINATIM_API}?country=Taiwan&format=json&addressdetails=1&limit=100`,
          {
            headers: {
              'User-Agent': 'LocationManagementApp/1.0'
            }
          }
        )
        
        if (response.ok) {
          // Process Nominatim data to extract cities
          // For now, use static data as Nominatim returns individual places
          setCities(getTaiwanCities())
        } else {
          // Fallback to static data
          setCities(getTaiwanCities())
        }
      } catch (error) {
        console.error('Error fetching cities from API:', error)
        // Fallback to static data
        setCities(getTaiwanCities())
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  return { cities, loading }
}

// Fetch districts by city code
export const useTaiwanDistricts = (cityOrCode: string) => {
  const [districts, setDistricts] = useState<TaiwanDistrict[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cityOrCode) {
      setDistricts([])
      return
    }

    // Check cache first
    if (districtCache.has(cityOrCode)) {
      setDistricts(districtCache.get(cityOrCode))
      return
    }

    setLoading(true)
    
    // Resolve by code or by name
    let districtList = getDistrictsByCity(cityOrCode)
    if (!districtList || districtList.length === 0) {
      // Try to resolve by city name or English name
      const city = getTaiwanCities().find(c => c.name === cityOrCode || c.nameEn === cityOrCode)
      if (city) {
        districtList = city.districts
      }
    }
    setDistricts(districtList)
    districtCache.set(cityOrCode, districtList)
    
    setLoading(false)
  }, [cityOrCode])

  return { districts, loading }
}

// Search for places using Nominatim API
export const useSearchPlaces = (query: string) => {
  const [places, setPlaces] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 3) {
      setPlaces([])
      return
    }

    const searchPlaces = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${NOMINATIM_API}?q=${encodeURIComponent(query)}&country=Taiwan&format=json&addressdetails=1&limit=10`,
          {
            headers: {
              'User-Agent': 'LocationManagementApp/1.0'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          setPlaces(data)
        } else {
          setPlaces([])
        }
      } catch (error) {
        console.error('Error searching places:', error)
        setPlaces([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchPlaces, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  return { places, loading }
}

// Get city by name (search in static data)
export const getCityByName = (name: string): TaiwanCity | undefined => {
  const cities = getTaiwanCities()
  return cities.find(city => 
    city.name === name || 
    city.nameEn === name ||
    city.name.includes(name) ||
    city.nameEn.includes(name)
  )
}

// Get district by name
export const getDistrictByName = (districtName: string, cityCode?: string): TaiwanDistrict | undefined => {
  const districts = cityCode 
    ? getDistrictsByCity(cityCode)
    : getTaiwanCities().flatMap(city => city.districts)
  
  return districts.find(district => 
    district.name === districtName ||
    district.nameEn === districtName ||
    district.name.includes(districtName) ||
    district.nameEn.includes(districtName)
  )
}

