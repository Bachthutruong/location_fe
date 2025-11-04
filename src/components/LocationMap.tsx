import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icon for selected location (red)
const createSelectedIcon = () => {
  return L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    shadowSize: [41, 41],
  })
}

// Custom icon for normal location (blue)
const createNormalIcon = () => {
  return L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    shadowSize: [41, 41],
  })
}

interface MapLocation {
  _id: string
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  googleMapsLink?: string
  category?: { _id?: string; name: string }
}

interface LocationMapProps {
  locations: MapLocation[]
  selectedLocation?: MapLocation | null
  onLocationClick?: (location: any) => void
  onProvinceSelect?: (name: string) => void
  focusProvinceName?: string
  focusCityName?: string
  focusDistrictName?: string
  suppressAutoFit?: boolean
}

// Component to handle map updates when selectedLocation changes
const MapController = ({ selectedLocation, resolvedLocations, suppressAutoFit }: { selectedLocation?: MapLocation | null; resolvedLocations: MapLocation[]; suppressAutoFit?: boolean }) => {
  const map = useMap()
  
  useEffect(() => {
    // Invalidate map size to fix layout issues
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    if (selectedLocation) {
      console.log('[MapController] selectedLocation -> center to it')
      const target = resolvedLocations.find(l => l._id === selectedLocation._id)
      const lat = target?.latitude ?? selectedLocation.latitude
      const lon = target?.longitude ?? selectedLocation.longitude
      if (lat && lon) {
        map.setView([lat, lon], 16, { animate: true, duration: 0.5 })
        return
      }
    }

    if (suppressAutoFit) {
      console.log('[MapController] suppressAutoFit is true, skip auto-fit')
      // When a province/city/district focus is active, don't override it
      return
    }

    const validLocations = resolvedLocations.filter((loc) => loc.latitude && loc.longitude)
    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude!, loc.longitude!] as [number, number]))
      console.log('[MapController] auto fit to all markers, count=', validLocations.length)
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      console.log('[MapController] no markers -> setView Taiwan default')
      map.setView([25.0330, 121.5654], 8)
    }
  }, [selectedLocation, resolvedLocations, suppressAutoFit, map])
  
  // Invalidate size on window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [map])
  
  return null
}

// const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

const LocationMap: React.FC<LocationMapProps> = ({ locations, selectedLocation, onLocationClick, onProvinceSelect, focusProvinceName, focusCityName, focusDistrictName, suppressAutoFit }) => {
  // Taiwan center coordinates (Taipei)
  const taiwanCenter: [number, number] = [25.0330, 121.5654]
  
  // Keep a local list with coordinates (geocode if missing)
  const [resolvedLocations, setResolvedLocations] = useState<MapLocation[]>([])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // Try to resolve coordinates for locations missing lat/lng
      const results: MapLocation[] = []

      for (const loc of locations) {
        if (loc.latitude && loc.longitude) {
          results.push(loc)
          continue
        }

        // Try parse from Google Maps link if present (@lat,lng or query parameters)
        if (loc.googleMapsLink) {
          const link = loc.googleMapsLink
          // Pattern 1: .../@lat,lng,
          const atIdx = link.indexOf('/@')
          if (atIdx !== -1) {
            const after = link.substring(atIdx + 2)
            const parts = after.split(',')
            const lat = parseFloat(parts[0])
            const lon = parseFloat(parts[1])
            if (!isNaN(lat) && !isNaN(lon)) {
              results.push({ ...loc, latitude: lat, longitude: lon })
              continue
            }
          }
          // Pattern 2: ?q=lat,lng
          try {
            const url = new URL(link)
            const q = url.searchParams.get('q')
            if (q) {
              const [latS, lonS] = q.split(',')
              const lat = parseFloat(latS)
              const lon = parseFloat(lonS)
              if (!isNaN(lat) && !isNaN(lon)) {
                results.push({ ...loc, latitude: lat, longitude: lon })
                continue
              }
            }
          } catch {}
        }
        // If still no coordinates, skip (avoid slow external geocoding)
      }

      if (!cancelled) {
        setResolvedLocations(results)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [locations])

  // Filter locations with valid coordinates
  const validLocations = resolvedLocations.filter((loc) => loc.latitude && loc.longitude)

  // Taiwan admin overlay (provinces/municipalities)
  const [twGeo, setTwGeo] = useState<any | null>(null)
  const provinceLayerByNameRef = useRef<Record<string, any>>({})

  const normalizeName = (n?: string) => {
    if (!n) return ''
    return n
      .replace(/臺/g, '台')
      .replace(/\s+/g, '')
      .replace(/(市|縣|州)$/g, '')
  }

  const getProvinceLayerByName = (name: string) => {
    const direct = provinceLayerByNameRef.current[name]
    if (direct) return direct
    const alt = provinceLayerByNameRef.current[name.replace(/臺/g, '台')]
    if (alt) return alt
    const norm = normalizeName(name)
    const keys = Object.keys(provinceLayerByNameRef.current)
    for (const k of keys) {
      if (normalizeName(k) === norm) return provinceLayerByNameRef.current[k]
    }
    // includes match as last resort
    for (const k of keys) {
      if (normalizeName(k).includes(norm) || norm.includes(normalizeName(k))) {
        return provinceLayerByNameRef.current[k]
      }
    }
    return undefined
  }

  useEffect(() => {
    // Fetch once
    const fetchGeo = async () => {
      try {
        // Fetch broader set of admin levels to include counties like Kinmen/Matsu
        const overpass = `https://overpass-api.de/api/interpreter?data=[out:json];area[name="Taiwan"];rel["boundary"="administrative"]["admin_level"~"^(4|5|6)$"](area);out geom;`;
        const resp = await fetch(overpass)
        if (resp.ok) {
          const data = await resp.json()
          // Convert Overpass to GeoJSON FeatureCollection
          const features = (data.elements || []).filter((el: any) => el.type === 'relation').map((rel: any) => {
            const coords = rel.members
              .filter((m: any) => m.type === 'way' && m.geometry)
              .map((m: any) => m.geometry.map((g: any) => [g.lon, g.lat]))
            return {
              type: 'Feature',
              properties: {
                name: rel.tags?.name,
                nameEn: rel.tags?.['name:en'],
                nameZh: rel.tags?.['name:zh-TW'] || rel.tags?.['name:zh'] || rel.tags?.name
              },
              geometry: { type: 'MultiLineString', coordinates: coords }
            }
          })
          setTwGeo({ type: 'FeatureCollection', features })
        }
      } catch {}
    }
    if (!twGeo) fetchGeo()
  }, [twGeo])

  // Calculate initial center
  let center: [number, number] = taiwanCenter
  let zoom = 8
  
  if (validLocations.length > 0) {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      center = [selectedLocation.latitude, selectedLocation.longitude]
      zoom = 15
    } else {
      // Calculate average center of all locations
      const avgLat = validLocations.reduce((sum, loc) => sum + loc.latitude!, 0) / validLocations.length
      const avgLng = validLocations.reduce((sum, loc) => sum + loc.longitude!, 0) / validLocations.length
      center = [avgLat, avgLng]
      zoom = validLocations.length === 1 ? 12 : 10
    }
  }

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        className="z-0"
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedLocation={selectedLocation} resolvedLocations={resolvedLocations} suppressAutoFit={suppressAutoFit} />

        {/* Focus province when filter changes */}
        {focusProvinceName && (
          <FocusProvince name={focusProvinceName} getLayer={(n) => getProvinceLayerByName(n)} />
        )}

        {/* Fallback focus by geocoding: city or district */}
        {!focusProvinceName && (focusCityName || focusDistrictName) && (
          <FocusPlace query={(focusDistrictName ? `${focusDistrictName}, ` : '') + (focusCityName ? `${focusCityName}, ` : '') + 'Taiwan'} />
        )}
        
        {validLocations.map((location) => {
          const isSelected = selectedLocation?._id === location._id
          return (
            <Marker
              key={location._id}
              position={[location.latitude!, location.longitude!]}
              icon={isSelected ? createSelectedIcon() : createNormalIcon()}
              eventHandlers={{
                click: () => {
                  if (onLocationClick) {
                    onLocationClick(location)
                  }
                },
                mouseover: (e) => {
                  (e.target as any).openPopup()
                },
                mouseout: (e) => {
                  (e.target as any).closePopup()
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{location.address}</p>
                  <p className="text-xs text-muted-foreground mb-2">{location.phone}</p>
                  {location.category?.name && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">
                      {location.category.name}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {twGeo && (
          <GeoJSON
            data={twGeo as any}
            style={() => ({ color: '#3b82f6', weight: 1, opacity: 0.6 })}
            onEachFeature={(feature: any, layer: any) => {
              const name = feature.properties?.name
              const nameEn = feature.properties?.nameEn
              const nameZh = feature.properties?.nameZh
              const names: string[] = []
              if (name) names.push(name)
              if (nameEn) names.push(nameEn)
              if (nameZh) names.push(nameZh)
              // Add variant: 臺 -> 台
              names.slice().forEach(n => {
                if (n.includes('臺')) names.push(n.replace(/臺/g, '台'))
              })
              names.forEach(n => { provinceLayerByNameRef.current[n] = layer })
              if (names.length) {
                console.log('[GeoJSON] index province layer', names)
              }
              layer.on({
                click: () => {
                  const n = feature.properties?.name || feature.properties?.nameZh || feature.properties?.nameEn
                  if (n && onProvinceSelect) onProvinceSelect(n)
                },
                mouseover: (e: any) => {
                  e.target.setStyle({ weight: 2, opacity: 0.9 })
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ weight: 1, opacity: 0.6 })
                }
              })
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LocationMap

// Helper component to fit bounds to a province layer
function FocusProvince({ name, getLayer }: { name: string; getLayer: (n: string) => any }) {
  const map = useMap()
  useEffect(() => {
    let attempts = 0
    const tryFocus = () => {
      const layer = getLayer(name)
      if (!layer) {
        console.log('[FocusProvince] layer not found for', name, 'attempt', attempts)
      }
      if (layer && layer.getBounds) {
        const b = layer.getBounds()
        if (b && b.isValid()) {
          console.log('[FocusProvince] fitBounds for', name)
          map.invalidateSize()
          setTimeout(() => {
            map.fitBounds(b, { padding: [40, 40], maxZoom: 12 })
          }, 50)
          return true
        }
      }
      return false
    }
    if (tryFocus()) return
    const interval = setInterval(() => {
      attempts += 1
      if (tryFocus() || attempts >= 10) {
        clearInterval(interval)
        // Fallback: geocode the province name if layer not found
        if (attempts >= 10) {
          const q = `${name}, Taiwan`
          console.log('[FocusProvince] fallback geocode', q)
          fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tw&limit=1&addressdetails=1&namedetails=1&accept-language=zh-TW&q=${encodeURIComponent(q)}`, {
            headers: { 'User-Agent': 'LocationManagementApp/1.0' }
          })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              const item = data && data[0]
              if (!item) return
              if (item.boundingbox) {
                const [south, north, west, east] = item.boundingbox.map((v: string) => parseFloat(v))
                const bounds = L.latLngBounds([[south, west], [north, east]])
                if (bounds.isValid()) {
                  console.log('[FocusProvince] fallback fitBounds for', name)
                  map.invalidateSize()
                  setTimeout(() => map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 }), 50)
                }
              } else if (item.lat && item.lon) {
                map.invalidateSize()
                setTimeout(() => map.setView([parseFloat(item.lat), parseFloat(item.lon)], 12), 50)
              }
            })
            .catch(() => {})
        }
      }
    }, 200)
    return () => clearInterval(interval)
  }, [name, map, getLayer])
  return null
}

// Helper component: geocode a place (city/district) and fit bounds
function FocusPlace({ query }: { query: string }) {
  const map = useMap()
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      console.log('[FocusPlace] geocoding', query)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tw&limit=1&addressdetails=1&namedetails=1&accept-language=zh-TW&q=${encodeURIComponent(query)}`
        const resp = await fetch(url, {
          headers: { 'User-Agent': 'LocationManagementApp/1.0' }
        })
        if (!resp.ok) return
        const data = await resp.json()
        const item = data && data[0]
        console.log('[FocusPlace] result', item)
        if (!item || cancelled) return
        if (item.boundingbox) {
          const [south, north, west, east] = item.boundingbox.map((v: string) => parseFloat(v))
          const bounds = L.latLngBounds([ [south, west], [north, east] ])
          if (bounds.isValid()) {
            console.log('[FocusPlace] fitBounds from boundingbox')
            map.invalidateSize()
            setTimeout(() => map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 }), 50)
          }
        } else if (item.lat && item.lon) {
          console.log('[FocusPlace] setView from lat/lon')
          map.invalidateSize()
          setTimeout(() => map.setView([parseFloat(item.lat), parseFloat(item.lon)], 12), 50)
        }
      } catch {}
    }
    run()
    return () => { cancelled = true }
  }, [query, map])
  return null
}
