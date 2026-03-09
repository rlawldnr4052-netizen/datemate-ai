'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Navigation,
  Footprints, Bus, Car,
  CheckCircle2, ExternalLink,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCourseStore } from '@/stores/useCourseStore'
import { buildNaverDestinationOnlyUrl, type NaverTransportMode } from '@/lib/naverMapUrl'

const CourseMap = dynamic(() => import('@/components/map/CourseMap'), { ssr: false })

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export default function CourseMapPage() {
  const params = useParams()
  const router = useRouter()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === params.id)

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeStopIndex, setActiveStopIndex] = useState(0)
  const [visitedStops, setVisitedStops] = useState<Set<number>>(new Set())
  const [heading, setHeading] = useState<number | null>(null)
  const [transportMode, setTransportMode] = useState<NaverTransportMode>('walk')

  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        if (course && course.stops.length > 0) {
          const first = course.stops[0].place
          setUserLocation({ lat: first.latitude - 0.002, lng: first.longitude - 0.001 })
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [course])

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      // @ts-expect-error webkitCompassHeading is Safari-specific
      const h = e.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null)
      if (h !== null && h !== undefined) setHeading(h)
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  const handleStopClick = useCallback((index: number) => {
    setActiveStopIndex(index)
  }, [])

  const handleMarkVisited = (index: number) => {
    setVisitedStops((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
    if (index < (course?.stops.length || 0) - 1) {
      setActiveStopIndex(index + 1)
    }
  }

  if (!course) return null

  const stops = course.stops.map((s) => ({
    order: s.order,
    name: s.place.name,
    category: s.place.category,
    latitude: s.place.latitude,
    longitude: s.place.longitude,
    imageUrl: s.place.imageUrls[0],
  }))

  const activeStop = course.stops[activeStopIndex]
  const targetStop = activeStop

  const distToTarget = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, targetStop.place.latitude, targetStop.place.longitude)
    : null
  const modeSpeed = { walk: 0.083, transit: 0.333, car: 0.667 }
  const modeLabel = { walk: '도보', transit: '대중교통', car: '차' }
  const minToTarget = distToTarget ? Math.round(distToTarget / modeSpeed[transportMode]) : null

  const glass = {
    background: 'rgba(11,11,18,0.88)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#0B0B12]">
      {/* Map */}
      <div className="absolute inset-0">
        <CourseMap
          stops={stops}
          userLocation={userLocation}
          activeStopIndex={activeStopIndex}
          onStopClick={handleStopClick}
          followUser
          heading={heading}
        />
      </div>

      {/* === TOP: nav + transport + dots === */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ ...glass, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-300" />
          </button>

          <div className="flex-1 rounded-2xl px-3 py-2" style={{ ...glass, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-neutral-200 truncate">{targetStop.place.name}</p>
                <p className="text-[11px] text-neutral-500">
                  {distToTarget !== null ? `${formatDistance(distToTarget)} · ${modeLabel[transportMode]} ${minToTarget}분` : '...'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-400">{activeStopIndex + 1}/{course.stops.length}</span>
            </div>
          </div>

          <a
            href={buildNaverDestinationOnlyUrl(
              { lng: targetStop.place.longitude, lat: targetStop.place.latitude, name: targetStop.place.name },
              transportMode
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>

        {/* Transport + dots in one row */}
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex gap-1">
            {([
              { mode: 'walk' as NaverTransportMode, icon: Footprints, label: '도보' },
              { mode: 'transit' as NaverTransportMode, icon: Bus, label: '대중교통' },
              { mode: 'car' as NaverTransportMode, icon: Car, label: '차' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  background: transportMode === mode ? 'rgba(96,165,250,0.2)' : 'transparent',
                  color: transportMode === mode ? '#93C5FD' : 'rgba(255,255,255,0.35)',
                }}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {course.stops.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStopIndex(i)}
                style={{
                  width: i === activeStopIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: visitedStops.has(i)
                    ? 'rgba(52,211,153,0.6)'
                    : i === activeStopIndex
                      ? 'rgba(96,165,250,0.8)'
                      : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* === BOTTOM: minimal stop bar + 도착 === */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8 pt-3">
        {visitedStops.size === course.stops.length ? (
          <div className="rounded-2xl p-4 text-center" style={{ ...glass, boxShadow: '0 -4px 20px rgba(0,0,0,0.4)' }}>
            <p className="text-[14px] font-bold text-neutral-200 mb-2">코스 완료!</p>
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ ...glass, boxShadow: '0 -4px 20px rgba(0,0,0,0.4)' }}>
            {activeStop.place.imageUrls[0] && (
              <div
                className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})` }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-neutral-200 truncate">{activeStop.place.name}</p>
              <p className="text-[11px] text-neutral-500">{activeStop.place.category}</p>
            </div>
            {!visitedStops.has(activeStopIndex) ? (
              <button
                onClick={() => handleMarkVisited(activeStopIndex)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.2)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                도착!
              </button>
            ) : (
              <div
                className="px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#6EE7B7' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                완료
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
