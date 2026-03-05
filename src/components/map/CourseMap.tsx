'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
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

function createMarkerEl(stop: MapStop, isActive: boolean, isNext: boolean): HTMLElement {
  const { icon, color } = getCategoryStyle(stop.category)
  const scale = isActive ? 1.15 : isNext ? 1.05 : 0.9

  const el = document.createElement('div')
  el.style.cursor = 'pointer'
  el.innerHTML = `
    <div style="transform:scale(${scale});transition:transform 0.3s;position:relative;width:56px;height:80px;">
      ${isNext ? `<div style="position:absolute;top:50%;left:50%;width:60px;height:60px;transform:translate(-50%,-60%);border-radius:50%;background:radial-gradient(circle,${color}33 0%,transparent 70%);animation:beaconPulse 2s ease-out infinite;"></div>` : ''}
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:32px;height:8px;background:radial-gradient(ellipse,rgba(0,0,0,0.5) 0%,transparent 70%);border-radius:50%;"></div>
      <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:44px;height:52px;background:linear-gradient(180deg,#1a1a2e,#0f0f1a);border-radius:12px 12px 4px 4px;border:1.5px solid ${isActive || isNext ? color + '88' : 'rgba(255,255,255,0.1)'};box-shadow:${isActive ? `0 0 20px ${color}44,0 8px 24px rgba(0,0,0,0.6)` : '0 4px 16px rgba(0,0,0,0.5)'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;overflow:hidden;">
        <div style="position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,${color}88,transparent);"></div>
        <span style="font-size:20px;line-height:1;margin-top:4px;">${icon}</span>
        <span style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.8);max-width:38px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:-apple-system,sans-serif;">${stop.name}</span>
      </div>
      <div style="position:absolute;top:4px;right:2px;width:18px;height:18px;border-radius:50%;background:${color};color:#0B0B12;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-family:-apple-system,sans-serif;">${stop.order}</div>
    </div>
  `
  return el
}

export default function CourseMap({ stops, userLocation, activeStopIndex, onStopClick, followUser, heading }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const routeIdsRef = useRef<string[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [segments, setSegments] = useState<(RouteSegment | null)[]>([])
  const [userToFirstSeg, setUserToFirstSeg] = useState<RouteSegment | null>(null)
  const fetchedKeyRef = useRef('')
  const initialFitDone = useRef(false)
  const userInteractingRef = useRef(false)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastUserFetchRef = useRef<{ lat: number; lng: number } | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

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
    if (lastUserFetchRef.current) {
      const dlat = userLocation.lat - lastUserFetchRef.current.lat
      const dlng = userLocation.lng - lastUserFetchRef.current.lng
      if (Math.sqrt(dlat * dlat + dlng * dlng) < 0.0007) return
    }
    lastUserFetchRef.current = { ...userLocation }
    fetchRouteSegment(userLocation.lat, userLocation.lng, stops[0].latitude, stops[0].longitude)
      .then(seg => setUserToFirstSeg(seg))
  }, [userLocation, stops])

  // Map init with MapLibre GL - native 3D pitch
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const center: [number, number] = stops.length > 0
      ? [stops[0].longitude, stops[0].latitude]
      : userLocation
        ? [userLocation.lng, userLocation.lat]
        : [126.9780, 37.5665]

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center,
      zoom: 16,
      pitch: 55,
      bearing: 0,
      attributionControl: false,
      maxPitch: 70,
    })

    // Inject animations CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes beaconPulse {
        0% { transform: translate(-50%, -60%) scale(0.8); opacity: 0.8; }
        100% { transform: translate(-50%, -60%) scale(2); opacity: 0; }
      }
      .maplibregl-canvas { outline: none; }
    `
    document.head.appendChild(style)
    styleRef.current = style

    // Auto-pause follow on user interaction
    const pauseFollow = () => {
      userInteractingRef.current = true
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
      interactionTimerRef.current = setTimeout(() => { userInteractingRef.current = false }, 5000)
    }
    map.on('dragstart', pauseFollow)
    map.on('zoomstart', pauseFollow)
    map.on('pitchstart', pauseFollow)
    map.on('rotatestart', pauseFollow)

    map.on('load', () => {
      mapInstanceRef.current = map
      setIsMapReady(true)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
      if (styleRef.current) { styleRef.current.remove(); styleRef.current = null }
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow user with native bearing (heading-up navigation)
  useEffect(() => {
    if (!followUser || !mapInstanceRef.current || !userLocation) return
    if (userInteractingRef.current) return
    mapInstanceRef.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      bearing: heading ?? mapInstanceRef.current.getBearing(),
      pitch: 55,
      duration: 600,
    })
  }, [followUser, userLocation, heading])

  // Update markers and routes
  const updateMap = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map || !isMapReady) return

    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Remove old route layers/sources
    routeIdsRef.current.forEach(id => {
      if (map.getLayer(id + '-glow')) map.removeLayer(id + '-glow')
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    })
    routeIdsRef.current = []

    const validStops = stops.filter(s => s.latitude && s.longitude)
    if (validStops.length === 0) return

    // Helper: add a route line
    const addRoute = (id: string, coords: number[][], glowColor: string, lineColor: string, lineWidth: number, dashed: boolean) => {
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
      })
      map.addLayer({
        id: id + '-glow',
        type: 'line',
        source: id,
        paint: { 'line-color': glowColor, 'line-width': 14, 'line-blur': 4 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })

      const paint: Record<string, unknown> = {
        'line-color': lineColor,
        'line-width': lineWidth,
      }
      if (dashed) paint['line-dasharray'] = [2, 2]

      map.addLayer({
        id,
        type: 'line',
        source: id,
        paint: paint as Record<string, unknown>,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })
      routeIdsRef.current.push(id)
    }

    // Route from user to first stop
    if (userLocation && validStops.length > 0) {
      const coords = userToFirstSeg
        ? userToFirstSeg.coordinates.map(c => [c[1], c[0]])
        : [[userLocation.lng, userLocation.lat], [validStops[0].longitude, validStops[0].latitude]]

      addRoute('user-route', coords, 'rgba(96,165,250,0.15)', '#60A5FA', 4, !userToFirstSeg)
    }

    // Routes between stops
    for (let i = 0; i < validStops.length - 1; i++) {
      const segment = segments[i]
      const coords = segment
        ? segment.coordinates.map(c => [c[1], c[0]])
        : [[validStops[i].longitude, validStops[i].latitude], [validStops[i + 1].longitude, validStops[i + 1].latitude]]

      const isUpcoming = i >= activeStopIndex
      addRoute(
        `route-${i}`,
        coords,
        isUpcoming ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.04)',
        isUpcoming ? 'rgba(96,165,250,0.7)' : 'rgba(255,255,255,0.15)',
        isUpcoming ? 4 : 3,
        !segment,
      )
    }

    // Stop markers (3D building style)
    validStops.forEach((stop, i) => {
      const isActive = i === activeStopIndex
      const isNext = i === activeStopIndex + 1 || (i === 0 && activeStopIndex === 0)

      const el = createMarkerEl(stop, isActive, isNext)
      if (onStopClick) el.addEventListener('click', (e) => { e.stopPropagation(); onStopClick(i) })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([stop.longitude, stop.latitude])
        .addTo(map)
      markersRef.current.push(marker)
    })

    // Fit bounds on first load
    if (!initialFitDone.current && validStops.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      validStops.forEach(s => bounds.extend([s.longitude, s.latitude]))
      if (userLocation) bounds.extend([userLocation.lng, userLocation.lat])
      map.fitBounds(bounds, { padding: 60, pitch: 55, duration: 0 })
      initialFitDone.current = true
    }
  }, [stops, activeStopIndex, isMapReady, onStopClick, segments, userLocation, userToFirstSeg])

  useEffect(() => {
    updateMap()
  }, [updateMap])

  return (
    <div ref={mapRef} className="w-full h-full" style={{ background: '#0B0B12' }} />
  )
}
