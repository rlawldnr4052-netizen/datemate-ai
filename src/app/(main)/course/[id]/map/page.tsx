'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Navigation, ChevronRight,
  Clock, Footprints, Bus, Car,
  CheckCircle2, Compass, ExternalLink,
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
  const [followMode, setFollowMode] = useState(true)
  const [transportMode, setTransportMode] = useState<NaverTransportMode>('walk')

  // GPS watch
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

  // Compass heading
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
  const nextStop = activeStopIndex < course.stops.length - 1 ? course.stops[activeStopIndex + 1] : null
  const targetStop = visitedStops.has(activeStopIndex) && nextStop ? nextStop : activeStop

  const distToTarget = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, targetStop.place.latitude, targetStop.place.longitude)
    : null
  const modeSpeed = { walk: 0.083, transit: 0.333, car: 0.667 }
  const modeLabel = { walk: '도보', transit: '대중교통', car: '차' }
  const minToTarget = distToTarget ? Math.round(distToTarget / modeSpeed[transportMode]) : null

  const glassStyle = {
    background: 'rgba(11,11,18,0.88)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#0B0B12]">
      {/* Map fills entire screen - character is rendered as a map marker */}
      <div className="absolute inset-0">
        <CourseMap
          stops={stops}
          userLocation={userLocation}
          activeStopIndex={activeStopIndex}
          onStopClick={handleStopClick}
          followUser={followMode}
          heading={followMode ? heading : null}
        />
      </div>

      {/* === All UI at the top === */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top">
        {/* Row 1: Back + Nav bar */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ ...glassStyle, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-300" />
          </button>

          <div className="flex-1 rounded-2xl px-4 py-2.5" style={{ ...glassStyle, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.15)' }}>
                <Navigation className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-neutral-200 truncate">{targetStop.place.name}</p>
                <p className="text-[11px] text-neutral-500">
                  {distToTarget !== null ? `${formatDistance(distToTarget)} · ${modeLabel[transportMode]} 약 ${minToTarget}분` : '거리 계산 중...'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-400 flex-shrink-0">
                {activeStopIndex + 1}/{course.stops.length}
              </span>
            </div>
          </div>

          {/* Green Naver directions button */}
          <a
            href={buildNaverDestinationOnlyUrl(
              { lng: targetStop.place.longitude, lat: targetStop.place.latitude, name: targetStop.place.name },
              transportMode
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
            }}
          >
            <ExternalLink className="w-4.5 h-4.5 text-white" />
          </a>
        </div>

        {/* Row 2: Transport mode selector */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-1">
          {([
            { mode: 'walk' as NaverTransportMode, icon: Footprints, label: '도보' },
            { mode: 'transit' as NaverTransportMode, icon: Bus, label: '대중교통' },
            { mode: 'car' as NaverTransportMode, icon: Car, label: '차' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setTransportMode(mode)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all"
              style={{
                background: transportMode === mode ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
                color: transportMode === mode ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${transportMode === mode ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Row 3: Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-1.5">
          {course.stops.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStopIndex(i)}
              className="transition-all"
              style={{
                width: i === activeStopIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: visitedStops.has(i)
                  ? 'rgba(52,211,153,0.6)'
                  : i === activeStopIndex
                    ? 'rgba(96,165,250,0.8)'
                    : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Row 3: Stop info card */}
        <div className="mx-4 mt-1 rounded-2xl p-3" style={{ ...glassStyle, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center gap-3">
            {activeStop.place.imageUrls[0] && (
              <div
                className="w-11 h-11 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})` }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(96,165,250,0.2)', color: '#93C5FD' }}>
                  {activeStopIndex + 1}
                </div>
                <h3 className="text-[13px] font-bold text-neutral-200 truncate">{activeStop.place.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-neutral-500">{activeStop.place.category}</span>
                <span className="text-[11px] text-neutral-600">·</span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {activeStop.place.estimatedTime}분
                </span>
              </div>
            </div>
            {!visitedStops.has(activeStopIndex) ? (
              <button
                onClick={() => handleMarkVisited(activeStopIndex)}
                className="px-3 py-2 rounded-xl text-[11px] font-bold flex-shrink-0 flex items-center gap-1"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.2)' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                도착!
              </button>
            ) : (
              <div
                className="px-3 py-2 rounded-xl text-[11px] font-bold flex-shrink-0 flex items-center gap-1"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#6EE7B7' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                완료
              </div>
            )}
          </div>

          {/* Next stop hint */}
          {nextStop && (
            <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <ChevronRight className="w-3 h-3 text-neutral-600 flex-shrink-0" />
              <span className="text-[10px] text-neutral-500 flex-shrink-0">다음</span>
              <span className="text-[11px] font-semibold text-neutral-400 truncate">{nextStop.place.name}</span>
              <span className="text-[10px] text-neutral-600 ml-auto flex-shrink-0">
                {formatDistance(haversineDistance(activeStop.place.latitude, activeStop.place.longitude, nextStop.place.latitude, nextStop.place.longitude))}
              </span>
            </div>
          )}

          {/* Course complete */}
          {visitedStops.size === course.stops.length && (
            <div className="text-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[13px] font-bold text-neutral-200">코스 완료!</p>
              <button
                onClick={() => router.push('/home')}
                className="mt-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
              >
                홈으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side button */}
      <div className="absolute right-4 bottom-8 z-10">
        <button
          onClick={() => setFollowMode(!followMode)}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: followMode ? 'rgba(96,165,250,0.2)' : 'rgba(11,11,18,0.9)',
            border: `1px solid ${followMode ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <Compass className={`w-5 h-5 ${followMode ? 'text-blue-400' : 'text-neutral-400'}`} />
        </button>
      </div>
    </div>
  )
}
