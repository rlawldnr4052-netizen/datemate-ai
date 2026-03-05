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

// Cute character avatar component
function CharacterAvatar({ heading }: { heading: number | null }) {
  return (
    <div className="relative" style={{ width: 72, height: 96 }}>
      {/* Direction cone */}
      {heading !== null && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: `translateX(-50%)`,
            width: 0,
            height: 0,
            borderLeft: '24px solid transparent',
            borderRight: '24px solid transparent',
            borderBottom: '30px solid rgba(96,165,250,0.15)',
            filter: 'blur(4px)',
          }}
        />
      )}

      {/* Ground ring */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 56, height: 14, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(96,165,250,0.25) 0%, transparent 70%)',
      }} />

      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid rgba(96,165,250,0.4)',
        }}
      />

      {/* Character body */}
      <svg
        width={72}
        height={86}
        viewBox="0 0 72 86"
        style={{ position: 'absolute', bottom: 6, left: 0 }}
      >
        {/* Shadow */}
        <ellipse cx="36" cy="82" rx="14" ry="4" fill="rgba(0,0,0,0.3)" />

        {/* Body / jacket */}
        <rect x="22" y="48" width="28" height="26" rx="14" fill="url(#bodyGrad)" />

        {/* Arms */}
        <ellipse cx="19" cy="56" rx="5" ry="8" fill="url(#bodyGrad)" />
        <ellipse cx="53" cy="56" rx="5" ry="8" fill="url(#bodyGrad)" />

        {/* Head */}
        <circle cx="36" cy="34" r="18" fill="#FDBCB4" />

        {/* Hair */}
        <path d="M18 30 C18 16 26 8 36 8 C46 8 54 16 54 30 C52 22 44 16 36 16 C28 16 20 22 18 30Z" fill="#4A3728" />
        <path d="M18 30 C17 32 17 34 18 36 C18 34 19 32 20 30 C22 24 28 20 36 20 C44 20 50 24 52 30 C53 32 54 34 54 36 C55 34 55 32 54 30" fill="#5B4A3C" opacity="0.6" />

        {/* Eyes */}
        <circle cx="30" cy="34" r="2.5" fill="#2D2D2D" />
        <circle cx="42" cy="34" r="2.5" fill="#2D2D2D" />
        <circle cx="31" cy="33" r="0.8" fill="white" />
        <circle cx="43" cy="33" r="0.8" fill="white" />

        {/* Blush */}
        <ellipse cx="24" cy="38" rx="4" ry="2" fill="rgba(255,140,140,0.3)" />
        <ellipse cx="48" cy="38" rx="4" ry="2" fill="rgba(255,140,140,0.3)" />

        {/* Smile */}
        <path d="M31 40 Q36 45 41 40" stroke="#2D2D2D" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Legs */}
        <rect x="27" y="70" width="8" height="8" rx="4" fill="#334155" />
        <rect x="37" y="70" width="8" height="8" rx="4" fill="#334155" />

        <defs>
          <linearGradient id="bodyGrad" x1="22" y1="48" x2="50" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF8A75" />
            <stop offset="100%" stopColor="#E8453A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Idle bobbing animation wrapper */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0 }}
      />
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
  // Distance to target
  const distToTarget = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, targetStop.place.latitude, targetStop.place.longitude)
    : null
  const walkMinToTarget = distToTarget ? Math.round(distToTarget / 0.08) : null

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#0B0B12]">
      {/* Map */}
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

      {/* Character avatar - center of screen */}
      {followMode && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <CharacterAvatar heading={heading} />
        </div>
      )}

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

          {/* Navigation info card */}
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
        {/* Follow mode toggle */}
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

        {/* Naver map directions */}
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

      {/* Bottom action bar (when detail is hidden) */}
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
              {/* Current stop */}
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

              {/* Action buttons */}
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

              {/* Next stop preview */}
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
                  {userLocation && (
                    <span className="text-[11px] text-neutral-500 flex-shrink-0">
                      {formatDistance(haversineDistance(activeStop.place.latitude, activeStop.place.longitude, nextStop.place.latitude, nextStop.place.longitude))}
                    </span>
                  )}
                </div>
              )}

              {/* All complete */}
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
