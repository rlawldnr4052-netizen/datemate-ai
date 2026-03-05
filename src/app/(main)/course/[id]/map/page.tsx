'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Navigation, ChevronRight, ChevronUp,
  MapPin, Clock, Footprints,
  CheckCircle2, Compass,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCourseStore } from '@/stores/useCourseStore'
import { buildNaverDestinationOnlyUrl } from '@/lib/naverMapUrl'

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

// Character back-view avatar
function CharacterBackView() {
  return (
    <div className="relative" style={{ width: 64, height: 90 }}>
      {/* Ground pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 40, height: 12, borderRadius: '50%',
          border: '2px solid rgba(96,165,250,0.3)',
        }}
      />
      {/* Ground shadow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 12, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
      }} />

      {/* Character SVG - back view */}
      <motion.svg
        width={64}
        height={80}
        viewBox="0 0 80 100"
        style={{ position: 'absolute', bottom: 4, left: 0 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="jb" x1="24" y1="46" x2="56" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF8A75" />
            <stop offset="100%" stopColor="#D94030" />
          </linearGradient>
          <linearGradient id="hb" x1="22" y1="6" x2="58" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5B4A3C" />
            <stop offset="100%" stopColor="#3D2E22" />
          </linearGradient>
        </defs>
        {/* Legs */}
        <rect x="30" y="76" width="8" height="14" rx="4" fill="#2D3748" />
        <rect x="42" y="76" width="8" height="14" rx="4" fill="#2D3748" />
        <ellipse cx="34" cy="90" rx="5" ry="3" fill="#1A202C" />
        <ellipse cx="46" cy="90" rx="5" ry="3" fill="#1A202C" />
        {/* Body */}
        <path d="M28 50 C28 46 32 44 40 44 C48 44 52 46 52 50 L54 74 C54 78 48 80 40 80 C32 80 26 78 26 74 Z" fill="url(#jb)" />
        <line x1="40" y1="46" x2="40" y2="78" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <path d="M30 48 C30 44 34 42 40 42 C46 42 50 44 50 48" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none" />
        {/* Arms */}
        <path d="M28 52 C22 54 20 60 21 66 C21 68 23 68 24 66 L28 56" fill="url(#jb)" />
        <path d="M52 52 C58 54 60 60 59 66 C59 68 57 68 56 66 L52 56" fill="url(#jb)" />
        {/* Neck */}
        <rect x="36" y="36" width="8" height="10" rx="3" fill="#EAADA4" />
        {/* Head */}
        <circle cx="40" cy="26" r="18" fill="url(#hb)" />
        <path d="M24 30 C22 24 24 14 32 10" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" fill="none" />
        <path d="M56 30 C58 24 56 14 48 10" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" fill="none" />
        <path d="M28 38 C30 42 36 44 40 44 C44 44 50 42 52 38 C52 36 48 40 40 40 C32 40 28 36 28 38Z" fill="url(#hb)" />
        {/* Ears */}
        <ellipse cx="22" cy="28" rx="3" ry="4" fill="#EAADA4" />
        <ellipse cx="58" cy="28" rx="3" ry="4" fill="#EAADA4" />
        <ellipse cx="22" cy="28" rx="2" ry="3" fill="#E09E95" />
        <ellipse cx="58" cy="28" rx="2" ry="3" fill="#E09E95" />
        {/* Backpack */}
        <rect x="35" y="52" width="10" height="12" rx="3" fill="rgba(0,0,0,0.15)" />
        <rect x="37" y="54" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
      </motion.svg>

      {/* Direction arrow */}
      <div style={{
        position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: '10px solid rgba(96,165,250,0.6)',
        filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.4))',
      }} />
    </div>
  )
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
  const [showDetail, setShowDetail] = useState(false)
  const [followMode, setFollowMode] = useState(true)

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
    setShowDetail(true)
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
  const walkMinToTarget = distToTarget ? Math.round(distToTarget / 0.08) : null

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#0B0B12]">
      {/* Map fills entire screen - MapLibre handles 3D natively via pitch */}
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

      {/* Character overlay - positioned at center like Pokemon GO */}
      <div
        className="absolute left-1/2 z-20 pointer-events-none"
        style={{
          top: showDetail ? '38%' : '52%',
          transform: 'translate(-50%, -50%)',
          transition: 'top 0.3s ease',
        }}
      >
        <CharacterBackView />
      </div>

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(11,11,18,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-300" />
          </button>

          <div
            className="flex-1 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(11,11,18,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.15)' }}>
                <Navigation className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-neutral-200 truncate">{targetStop.place.name}</p>
                <p className="text-[11px] text-neutral-500">
                  {distToTarget !== null ? `${formatDistance(distToTarget)} · 도보 약 ${walkMinToTarget}분` : '거리 계산 중...'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-400 flex-shrink-0">
                {activeStopIndex + 1}/{course.stops.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-2">
          {course.stops.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveStopIndex(i); setShowDetail(true) }}
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
      </div>

      {/* Right side buttons */}
      <div className="absolute right-4 z-10 flex flex-col gap-2" style={{ bottom: showDetail ? 'calc(38vh + 16px)' : '100px', transition: 'bottom 0.3s ease' }}>
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

        <a
          href={buildNaverDestinationOnlyUrl(
            { lng: targetStop.place.longitude, lat: targetStop.place.latitude, name: targetStop.place.name },
            'walk'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(11,11,18,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <MapPin className="w-5 h-5 text-green-400" />
        </a>
      </div>

      {/* Bottom action bar (when detail hidden) */}
      {!showDetail && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8 pt-3">
          <button
            onClick={() => setShowDetail(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: 'rgba(14,14,22,0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {activeStop.place.imageUrls[0] && (
              <div
                className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})` }}
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[14px] font-bold text-neutral-200 truncate">{activeStop.place.name}</p>
              <p className="text-[12px] text-neutral-500">{activeStop.place.category}</p>
            </div>
            <ChevronUp className="w-5 h-5 text-neutral-500 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Detail bottom panel */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-10 rounded-t-3xl"
            style={{
              maxHeight: '38vh',
              background: 'rgba(14,14,22,0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <button onClick={() => setShowDetail(false)} className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(38vh - 20px)' }}>
              <div className="flex items-start gap-3 mb-3">
                {activeStop.place.imageUrls[0] && (
                  <div
                    className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})` }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(96,165,250,0.2)', color: '#93C5FD' }}>
                      {activeStopIndex + 1}
                    </div>
                    <h3 className="text-[15px] font-bold text-neutral-200 truncate">{activeStop.place.name}</h3>
                  </div>
                  <p className="text-[12px] text-neutral-500 mt-0.5">{activeStop.place.category}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activeStop.place.estimatedTime}분
                    </span>
                    {distToTarget !== null && (
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Footprints className="w-3 h-3" /> {formatDistance(distToTarget)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {!visitedStops.has(activeStopIndex) ? (
                  <button
                    onClick={() => handleMarkVisited(activeStopIndex)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold"
                    style={{ background: 'rgba(96,165,250,0.15)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.2)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    도착 완료!
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold"
                    style={{ background: 'rgba(52,211,153,0.1)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    방문 완료
                  </div>
                )}
                <a
                  href={buildNaverDestinationOnlyUrl(
                    { lng: activeStop.place.longitude, lat: activeStop.place.latitude, name: activeStop.place.name },
                    'walk'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  네이버 길찾기
                </a>
              </div>

              {nextStop && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-neutral-400">다음 장소</p>
                    <p className="text-[13px] font-bold text-neutral-300 truncate">{nextStop.place.name}</p>
                  </div>
                  <span className="text-[11px] text-neutral-500 flex-shrink-0">
                    {formatDistance(haversineDistance(activeStop.place.latitude, activeStop.place.longitude, nextStop.place.latitude, nextStop.place.longitude))}
                  </span>
                </div>
              )}

              {visitedStops.size === course.stops.length && (
                <div className="text-center p-4 rounded-2xl mt-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[15px] font-bold text-neutral-200 mb-1">코스 완료!</p>
                  <p className="text-[12px] text-neutral-500 mb-3">오늘 데이트 어땠어요?</p>
                  <button
                    onClick={() => router.push('/home')}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#E2E8F0' }}>
                    홈으로 돌아가기
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
