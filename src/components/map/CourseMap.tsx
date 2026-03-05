'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchAllRouteSegments, RouteSegment } from '@/lib/api/osrm'

interface MapStop {
  order: number
  name: string
  category: string
  latitude: number
  longitude: number
  imageUrl?: string
}

interface CourseMapProps {
  stops: MapStop[]
  userLocation: { lat: number; lng: number } | null
  activeStopIndex: number
  onStopClick?: (index: number) => void
  centerRequest?: number // increment to trigger re-center
}

// Category → icon SVG mapping
function getCategoryIcon(category: string): { svg: string; color: string; bg: string } {
  const cat = category.toLowerCase()

  if (cat.includes('카페') || cat.includes('커피') || cat.includes('디저트') || cat.includes('베이커리'))
    return {
      svg: '<path d="M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v2M10 2v2M14 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',
    }

  if (cat.includes('바') || cat.includes('주점') || cat.includes('술') || cat.includes('루프탑') || cat.includes('펍') || cat.includes('와인'))
    return {
      svg: '<path d="M8 22h8M12 18v4M12 2l-5 9h10L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M7 11a5 5 0 0010 0" stroke="currentColor" stroke-width="2" fill="none"/>',
      color: '#A78BFA', bg: 'rgba(167,139,250,0.15)',
    }

  if (cat.includes('맛집') || cat.includes('식당') || cat.includes('음식') || cat.includes('양꼬치') || cat.includes('고기') || cat.includes('레스토랑') || cat.includes('밥'))
    return {
      svg: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      color: '#FB7185', bg: 'rgba(251,113,133,0.15)',
    }

  if (cat.includes('쇼핑') || cat.includes('시장') || cat.includes('마켓') || cat.includes('몰'))
    return {
      svg: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      color: '#34D399', bg: 'rgba(52,211,153,0.15)',
    }

  if (cat.includes('관광') || cat.includes('명소') || cat.includes('공원') || cat.includes('전시') || cat.includes('미술') || cat.includes('박물'))
    return {
      svg: '<path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" fill="none"/>',
      color: '#60A5FA', bg: 'rgba(96,165,250,0.15)',
    }

  // Default: map pin
  return {
    svg: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>',
    color: '#94A3B8', bg: 'rgba(148,163,184,0.15)',
  }
}

// 3D-style category marker
function createCategoryIcon(stop: MapStop, isActive: boolean) {
  const { svg, color } = getCategoryIcon(stop.category)
  const size = isActive ? 52 : 44
  const iconSize = isActive ? 22 : 18
  const offset = (size - iconSize) / 2

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 12}px;
      ">
        <!-- Shadow -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${size * 0.5}px;
          height: 6px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        <!-- Pin body -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          border-radius: ${size * 0.32}px;
          background: linear-gradient(145deg, #1E1E2E, #14141F);
          border: 2px solid ${isActive ? color : 'rgba(255,255,255,0.12)'};
          box-shadow: ${isActive
            ? `0 4px 20px ${color}44, 0 0 0 4px ${color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
            : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.5)'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" style="color: ${color}; position: absolute; top: ${offset}px; left: ${offset}px;">
            ${svg}
          </svg>
        </div>
        <!-- Pin tail -->
        <div style="
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isActive ? '#1E1E2E' : '#14141F'};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        "></div>
        <!-- Order badge -->
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color};
          color: #0B0B12;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          font-family: -apple-system, sans-serif;
        ">${stop.order}</div>
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)],
  })
}

// User location marker
function createUserIcon() {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute; inset: 0;
          border-radius: 50%;
          background: rgba(59,130,246,0.2);
          animation: userPulse 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute; inset: 4px;
          border-radius: 50%;
          background: #3B82F6;
          border: 3px solid #0B0B12;
          box-shadow: 0 0 12px rgba(59,130,246,0.5);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function CourseMap({ stops, userLocation, activeStopIndex, onStopClick, centerRequest }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routeLayersRef = useRef<L.Polyline[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [segments, setSegments] = useState<(RouteSegment | null)[]>([])
  const fetchedKeyRef = useRef('')
  const initialFitDone = useRef(false)

  // OSRM route fetch
  useEffect(() => {
    const validStops = stops.filter(s => s.latitude && s.longitude)
    const key = validStops.map(s => `${s.latitude},${s.longitude}`).join('|')
    if (key === fetchedKeyRef.current || validStops.length < 2) return
    fetchedKeyRef.current = key
    fetchAllRouteSegments(validStops).then(setSegments)
  }, [stops])

  // Map init
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const center = stops.length > 0
      ? [stops[0].latitude, stops[0].longitude] as [number, number]
      : userLocation
        ? [userLocation.lat, userLocation.lng] as [number, number]
        : [37.5665, 126.9780] as [number, number]

    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    // Dark map tiles - CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Inject pulse animation CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes userPulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .leaflet-popup-content-wrapper {
        background: #1E1E2E !important;
        color: #E2E8F0 !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
      }
      .leaflet-popup-tip { background: #1E1E2E !important; }
      .leaflet-popup-close-button { color: #94A3B8 !important; }
    `
    document.head.appendChild(style)

    mapInstanceRef.current = map
    setIsMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      style.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Center on user location when requested
  useEffect(() => {
    if (!centerRequest || !mapInstanceRef.current || !userLocation) return
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 })
  }, [centerRequest, userLocation])

  // Update markers & routes - but do NOT re-fit bounds after initial
  const updateMap = useCallback(() => {
    if (!mapInstanceRef.current || !isMapReady) return
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Clear existing routes
    routeLayersRef.current.forEach((l) => map.removeLayer(l))
    routeLayersRef.current = []

    const validStops = stops.filter((s) => s.latitude && s.longitude)
    if (validStops.length === 0) return

    // Draw route lines
    for (let i = 0; i < validStops.length - 1; i++) {
      const segment = segments[i]
      const coords: [number, number][] = segment
        ? segment.coordinates
        : [
            [validStops[i].latitude, validStops[i].longitude],
            [validStops[i + 1].latitude, validStops[i + 1].longitude],
          ]

      // Glow line
      const glow = L.polyline(coords, {
        color: 'rgba(255,255,255,0.06)',
        weight: 10,
        opacity: 1,
      }).addTo(map)
      routeLayersRef.current.push(glow)

      // Main line
      const line = L.polyline(coords, {
        color: 'rgba(255,255,255,0.25)',
        weight: 3,
        opacity: 1,
        dashArray: segment ? undefined : '8, 6',
        lineCap: 'round',
      }).addTo(map)
      routeLayersRef.current.push(line)
    }

    // Stop markers
    validStops.forEach((stop, i) => {
      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createCategoryIcon(stop, i === activeStopIndex),
        zIndexOffset: i === activeStopIndex ? 1000 : 0,
      })

      marker.bindPopup(`
        <div style="text-align: center; min-width: 100px; padding: 4px 0; font-family: -apple-system, sans-serif;">
          <div style="font-size: 13px; font-weight: 700; color: #F1F5F9; margin-bottom: 2px;">${stop.name}</div>
          <div style="font-size: 11px; color: #94A3B8;">${stop.category}</div>
        </div>
      `)

      if (onStopClick) {
        marker.on('click', () => onStopClick(i))
      }

      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // User location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 2000,
      })
      userMarker.addTo(map)
      markersRef.current.push(userMarker)
    }

    // Fit bounds only on first load
    if (!initialFitDone.current) {
      const allPoints: [number, number][] = validStops.map(s => [s.latitude, s.longitude])
      if (userLocation) {
        allPoints.push([userLocation.lat, userLocation.lng])
      }
      if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [60, 60] })
      }
      initialFitDone.current = true
    }
  }, [stops, userLocation, activeStopIndex, isMapReady, onStopClick, segments])

  useEffect(() => {
    updateMap()
  }, [updateMap])

  return (
    <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0, background: '#0B0B12' }} />
  )
}
