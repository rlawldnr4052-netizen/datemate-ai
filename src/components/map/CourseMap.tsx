'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchAllRouteSegments, fetchRouteSegment, RouteSegment } from '@/lib/api/osrm'

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
  followUser?: boolean
  heading?: number | null
}

function getCategoryStyle(category: string): { icon: string; color: string } {
  const cat = category.toLowerCase()
  if (cat.includes('카페') || cat.includes('커피') || cat.includes('디저트') || cat.includes('베이커리'))
    return { icon: '☕', color: '#F59E0B' }
  if (cat.includes('바') || cat.includes('주점') || cat.includes('술') || cat.includes('루프탑') || cat.includes('펍'))
    return { icon: '🍸', color: '#A78BFA' }
  if (cat.includes('맛집') || cat.includes('식당') || cat.includes('음식') || cat.includes('양꼬치') || cat.includes('고기') || cat.includes('레스토랑'))
    return { icon: '🍽️', color: '#FB7185' }
  if (cat.includes('쇼핑') || cat.includes('시장') || cat.includes('마켓') || cat.includes('몰'))
    return { icon: '🛍️', color: '#34D399' }
  if (cat.includes('관광') || cat.includes('명소') || cat.includes('공원') || cat.includes('전시'))
    return { icon: '📷', color: '#60A5FA' }
  return { icon: '📍', color: '#94A3B8' }
}

function createBuildingMarker(stop: MapStop, isActive: boolean, isNext: boolean) {
  const { icon, color } = getCategoryStyle(stop.category)
  const scale = isActive ? 1.15 : isNext ? 1.05 : 0.9

  return L.divIcon({
    className: 'building-marker',
    html: `
      <div style="transform: scale(${scale}); transition: transform 0.3s; position: relative; width: 56px; height: 80px;">
        ${isNext ? `<div style="position:absolute;top:50%;left:50%;width:60px;height:60px;transform:translate(-50%,-60%);border-radius:50%;background:radial-gradient(circle,${color}33 0%,transparent 70%);animation:beaconPulse 2s ease-out infinite;"></div>` : ''}
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:32px;height:8px;background:radial-gradient(ellipse,rgba(0,0,0,0.5) 0%,transparent 70%);border-radius:50%;"></div>
        <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:44px;height:52px;background:linear-gradient(180deg,#1a1a2e,#0f0f1a);border-radius:12px 12px 4px 4px;border:1.5px solid ${isActive||isNext?color+'88':'rgba(255,255,255,0.1)'};box-shadow:${isActive?`0 0 20px ${color}44,0 8px 24px rgba(0,0,0,0.6)`:'0 4px 16px rgba(0,0,0,0.5)'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;overflow:hidden;">
          <div style="position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,${color}88,transparent);"></div>
          <span style="font-size:20px;line-height:1;margin-top:4px;">${icon}</span>
          <span style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.8);max-width:38px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:-apple-system,sans-serif;">${stop.name}</span>
        </div>
        <div style="position:absolute;top:4px;right:2px;width:18px;height:18px;border-radius:50%;background:${color};color:#0B0B12;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-family:-apple-system,sans-serif;">${stop.order}</div>
      </div>
    `,
    iconSize: [56, 80],
    iconAnchor: [28, 76],
    popupAnchor: [0, -70],
  })
}

export default function CourseMap({ stops, userLocation, activeStopIndex, onStopClick, followUser, heading }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routeLayersRef = useRef<L.Layer[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [segments, setSegments] = useState<(RouteSegment | null)[]>([])
  const [userToFirstSeg, setUserToFirstSeg] = useState<RouteSegment | null>(null)
  const fetchedKeyRef = useRef('')
  const initialFitDone = useRef(false)
  const userInteractingRef = useRef(false)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastUserFetchRef = useRef<{ lat: number; lng: number } | null>(null)

  // OSRM route fetch between stops
  useEffect(() => {
    const validStops = stops.filter(s => s.latitude && s.longitude)
    const key = validStops.map(s => `${s.latitude},${s.longitude}`).join('|')
    if (key === fetchedKeyRef.current || validStops.length < 2) return
    fetchedKeyRef.current = key
    fetchAllRouteSegments(validStops).then(setSegments)
  }, [stops])

  // OSRM route from user location to first stop
  useEffect(() => {
    if (!userLocation || stops.length === 0 || !stops[0].latitude) return
    // Only refetch if moved > 80m
    if (lastUserFetchRef.current) {
      const dlat = userLocation.lat - lastUserFetchRef.current.lat
      const dlng = userLocation.lng - lastUserFetchRef.current.lng
      if (Math.sqrt(dlat * dlat + dlng * dlng) < 0.0007) return
    }
    lastUserFetchRef.current = { ...userLocation }
    fetchRouteSegment(userLocation.lat, userLocation.lng, stops[0].latitude, stops[0].longitude)
      .then(seg => setUserToFirstSeg(seg))
  }, [userLocation, stops])

  // Map init - always allow all interactions
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const center = stops.length > 0
      ? [stops[0].latitude, stops[0].longitude] as [number, number]
      : userLocation
        ? [userLocation.lat, userLocation.lng] as [number, number]
        : [37.5665, 126.9780] as [number, number]

    const map = L.map(mapRef.current, {
      center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      // All interactions enabled
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Auto-pause follow on user interaction
    map.on('dragstart zoomstart', () => {
      userInteractingRef.current = true
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
      interactionTimerRef.current = setTimeout(() => { userInteractingRef.current = false }, 5000)
    })

    const style = document.createElement('style')
    style.textContent = `
      @keyframes beaconPulse {
        0% { transform: translate(-50%, -60%) scale(0.8); opacity: 0.8; }
        100% { transform: translate(-50%, -60%) scale(2); opacity: 0; }
      }
      .leaflet-popup-content-wrapper {
        background: #1E1E2E !important; color: #E2E8F0 !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
      }
      .leaflet-popup-tip { background: #1E1E2E !important; }
    `
    document.head.appendChild(style)

    mapInstanceRef.current = map
    setIsMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      style.remove()
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Soft follow - pan to user unless they're interacting
  useEffect(() => {
    if (!followUser || !mapInstanceRef.current || !userLocation) return
    if (userInteractingRef.current) return
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], mapInstanceRef.current.getZoom(), { animate: true, duration: 0.6 })
  }, [followUser, userLocation])

  // Compass heading
  useEffect(() => {
    if (!mapRef.current || heading === null || heading === undefined) return
    mapRef.current.style.transform = `rotate(${-heading}deg)`
    mapRef.current.style.transformOrigin = 'center center'
    mapRef.current.style.transition = 'transform 0.3s ease'
  }, [heading])

  // Update markers and routes
  const updateMap = useCallback(() => {
    if (!mapInstanceRef.current || !isMapReady) return
    const map = mapInstanceRef.current

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    routeLayersRef.current.forEach((l) => map.removeLayer(l))
    routeLayersRef.current = []

    const validStops = stops.filter((s) => s.latitude && s.longitude)
    if (validStops.length === 0) return

    // Draw route from user to first stop
    if (userLocation && validStops.length > 0) {
      const coords: [number, number][] = userToFirstSeg
        ? userToFirstSeg.coordinates
        : [[userLocation.lat, userLocation.lng], [validStops[0].latitude, validStops[0].longitude]]

      // Glow
      const glow = L.polyline(coords, {
        color: 'rgba(96,165,250,0.12)',
        weight: 16, opacity: 1, lineCap: 'round',
      }).addTo(map)
      routeLayersRef.current.push(glow)

      // Main line (active blue)
      const line = L.polyline(coords, {
        color: '#60A5FA',
        weight: 5, opacity: 0.9,
        dashArray: userToFirstSeg ? '10, 10' : '8, 8',
        lineCap: 'round',
      }).addTo(map)
      routeLayersRef.current.push(line)
    }

    // Draw routes between stops
    for (let i = 0; i < validStops.length - 1; i++) {
      const segment = segments[i]
      const coords: [number, number][] = segment
        ? segment.coordinates
        : [[validStops[i].latitude, validStops[i].longitude], [validStops[i + 1].latitude, validStops[i + 1].longitude]]

      const isUpcoming = i >= activeStopIndex

      const glow = L.polyline(coords, {
        color: isUpcoming ? 'rgba(96,165,250,0.10)' : 'rgba(255,255,255,0.03)',
        weight: 14, opacity: 1, lineCap: 'round',
      }).addTo(map)
      routeLayersRef.current.push(glow)

      const line = L.polyline(coords, {
        color: isUpcoming ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.12)',
        weight: isUpcoming ? 4 : 3,
        opacity: 1,
        dashArray: segment ? undefined : '8, 6',
        lineCap: 'round',
      }).addTo(map)
      routeLayersRef.current.push(line)
    }

    // Stop markers (3D buildings)
    validStops.forEach((stop, i) => {
      const isActive = i === activeStopIndex
      const isNext = i === activeStopIndex + 1 || (i === 0 && activeStopIndex === 0)

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createBuildingMarker(stop, isActive, isNext),
        zIndexOffset: isActive ? 1000 : isNext ? 500 : 0,
      })

      if (onStopClick) marker.on('click', () => onStopClick(i))
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // Fit bounds on first load
    if (!initialFitDone.current) {
      const allPoints: [number, number][] = validStops.map(s => [s.latitude, s.longitude])
      if (userLocation) allPoints.push([userLocation.lat, userLocation.lng])
      if (allPoints.length > 1) map.fitBounds(allPoints, { padding: [60, 60] })
      initialFitDone.current = true
    }
  }, [stops, activeStopIndex, isMapReady, onStopClick, segments, userLocation, userToFirstSeg])

  useEffect(() => {
    updateMap()
  }, [updateMap])

  return (
    <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0, background: '#0B0B12' }} />
  )
}
