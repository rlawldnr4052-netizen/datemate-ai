'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
}

// 커스텀 넘버 마커 생성
function createNumberIcon(number: number, isActive: boolean) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: ${isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #f472b6, #ec4899)'};
      color: white; font-weight: bold; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
      ${isActive ? 'transform: scale(1.2);' : ''}
    ">${number}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// 현재 위치 마커
function createUserIcon() {
  return L.divIcon({
    className: 'user-marker',
    html: `<div style="
      width: 20px; height: 20px; border-radius: 50%;
      background: #3b82f6;
      border: 4px solid white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function CourseMap({ stops, userLocation, activeStopIndex, onStopClick }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [isMapReady, setIsMapReady] = useState(false)

  // 맵 초기화
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const center = stops.length > 0
      ? [stops[0].latitude, stops[0].longitude] as [number, number]
      : userLocation
        ? [userLocation.lat, userLocation.lng] as [number, number]
        : [37.5665, 126.9780] as [number, number] // 서울 기본값

    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    // OpenStreetMap 타일 (무료)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // 줌 컨트롤 우측 하단
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map
    setIsMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // 마커 & 경로 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return
    const map = mapInstanceRef.current

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // 경로선 제거 후 재생성
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        map.removeLayer(layer)
      }
    })

    const validStops = stops.filter((s) => s.latitude && s.longitude)
    if (validStops.length === 0) return

    // 코스 경로 그리기 (점선)
    const routeCoords = validStops.map((s) => [s.latitude, s.longitude] as [number, number])

    // 경로 배경선 (두껍고 연한)
    L.polyline(routeCoords, {
      color: '#e0e7ff',
      weight: 8,
      opacity: 0.8,
      dashArray: '0',
    }).addTo(map)

    // 경로 메인선 (점선 애니메이션)
    L.polyline(routeCoords, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.9,
      dashArray: '12, 8',
      lineCap: 'round',
    }).addTo(map)

    // 장소 마커
    validStops.forEach((stop, i) => {
      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createNumberIcon(stop.order, i === activeStopIndex),
      })

      marker.bindPopup(`
        <div style="text-align: center; min-width: 120px; font-family: -apple-system, sans-serif;">
          <b style="font-size: 13px;">${stop.name}</b>
          <br/>
          <span style="font-size: 11px; color: #6b7280;">${stop.category}</span>
        </div>
      `)

      if (onStopClick) {
        marker.on('click', () => onStopClick(i))
      }

      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // 현재 위치 마커
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
      })
      userMarker.bindPopup('<b style="font-family: -apple-system, sans-serif;">내 위치</b>')
      userMarker.addTo(map)
      markersRef.current.push(userMarker)
    }

    // 모든 마커가 보이도록 범위 조정
    const allPoints: [number, number][] = [...routeCoords]
    if (userLocation) {
      allPoints.push([userLocation.lat, userLocation.lng])
    }
    if (allPoints.length > 1) {
      map.fitBounds(allPoints, { padding: [50, 50] })
    }
  }, [stops, userLocation, activeStopIndex, isMapReady, onStopClick])

  return (
    <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
  )
}
