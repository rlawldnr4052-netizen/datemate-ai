'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Navigation, ChevronUp, ChevronDown, ChevronRight,
  MapPin, Clock, Footprints, Bus, Car,
  CheckCircle2, Locate,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCourseStore } from '@/stores/useCourseStore'
import { Place } from '@/types/course'
import {
  NaverTransportMode,
  buildNaverDirectionsUrl,
  buildNaverDestinationOnlyUrl,
} from '@/lib/naverMapUrl'

const CourseMap = dynamic(() => import('@/components/map/CourseMap'), { ssr: false })

function getTransitSteps(from: Place, to: Place) {
  const dist = haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
  const walkMinutes = Math.round(dist / 0.08)

  if (dist < 0.8) {
    return [{ type: 'walk' as const, description: `${to.name}까지 도보 이동`, duration: walkMinutes, detail: `약 ${Math.round(dist * 1000)}m` }]
  }
  if (dist < 3) {
    return [
      { type: 'walk' as const, description: '가까운 버스 정류장까지', duration: 3, detail: '약 200m' },
      { type: 'bus' as const, description: `${to.name} 방면 버스`, duration: Math.round(dist * 3), detail: `약 ${Math.round(dist * 1000)}m` },
      { type: 'walk' as const, description: `${to.name}까지`, duration: 2, detail: '약 150m' },
    ]
  }
  return [
    { type: 'walk' as const, description: '가까운 지하철역까지', duration: 5, detail: '약 400m' },
    { type: 'subway' as const, description: `${to.name} 근처 역 하차`, duration: Math.round(dist * 2.5), detail: `약 ${Math.ceil(dist)}km` },
    { type: 'walk' as const, description: `${to.name}까지`, duration: 4, detail: '약 300m' },
  ]
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function CourseMapPage() {
  const params = useParams()
  const router = useRouter()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === params.id)

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeStopIndex, setActiveStopIndex] = useState(0)
  const [showPanel, setShowPanel] = useState(true)
  const [visitedStops, setVisitedStops] = useState<Set<number>>(new Set())
  const [centerRequest, setCenterRequest] = useState(0)

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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [course])

  const handleStopClick = useCallback((index: number) => {
    setActiveStopIndex(index)
    setShowPanel(true)
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
  const transitSteps = nextStop ? getTransitSteps(activeStop.place, nextStop.place) : []
  const transitTotalMinutes = transitSteps.reduce((sum, s) => sum + s.duration, 0)
  const progress = visitedStops.size / course.stops.length * 100

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#0B0B12]">
      {/* Map */}
      <div className="absolute inset-0">
        <CourseMap
          stops={stops}
          userLocation={userLocation}
          activeStopIndex={activeStopIndex}
          onStopClick={handleStopClick}
          centerRequest={centerRequest}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(11,11,18,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-300" />
          </button>

          <div
            className="flex-1 rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(11,11,18,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[13px] font-bold text-neutral-200 truncate">{course.title}</h2>
              <span className="text-[12px] text-white/50 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.5))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Stop chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
          {course.stops.map((stop, i) => (
            <button
              key={stop.place.id}
              onClick={() => handleStopClick(i)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={
                i === activeStopIndex
                  ? { background: 'rgba(255,255,255,0.15)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }
                  : visitedStops.has(i)
                    ? { background: 'rgba(52,211,153,0.12)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.2)' }
                    : { background: 'rgba(11,11,18,0.75)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }
              }
            >
              {visitedStops.has(i) ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/[0.12] flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              )}
              {stop.place.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current location button */}
      <button
        onClick={() => setCenterRequest((n) => n + 1)}
        className="absolute right-4 z-10 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          bottom: showPanel ? 'calc(45vh + 60px)' : '80px',
          background: 'rgba(11,11,18,0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'bottom 0.3s ease',
        }}
      >
        <Locate className="w-5 h-5 text-blue-400" />
      </button>

      {/* Panel toggle */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="absolute left-1/2 -translate-x-1/2 z-10 w-10 h-6 rounded-full flex items-center justify-center"
        style={{
          bottom: showPanel ? 'calc(45vh + 8px)' : '16px',
          background: 'rgba(11,11,18,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'bottom 0.3s ease',
        }}
      >
        {showPanel ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronUp className="w-4 h-4 text-neutral-400" />}
      </button>

      {/* Bottom panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-10 rounded-t-3xl max-h-[45vh] overflow-hidden"
            style={{
              background: 'rgba(14,14,22,0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            <div className="overflow-y-auto max-h-[calc(45vh-20px)] pb-8">
              {/* Current place */}
              <div className="px-5 pb-3">
                <div className="flex items-start gap-3">
                  {activeStop.place.imageUrls[0] && (
                    <div
                      className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})`, background: activeStop.place.imageUrls[0] ? undefined : 'rgba(255,255,255,0.06)' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.12)', color: '#E2E8F0' }}
                      >
                        {activeStopIndex + 1}
                      </div>
                      <h3 className="text-[15px] font-bold text-neutral-200 truncate">{activeStop.place.name}</h3>
                    </div>
                    <p className="text-[12px] text-neutral-500 font-medium mt-0.5">{activeStop.place.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeStop.place.estimatedTime}분
                      </span>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> {activeStop.place.address || '주소 정보 없음'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  {!visitedStops.has(activeStopIndex) ? (
                    <button
                      onClick={() => handleMarkVisited(activeStopIndex)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      도착 완료!
                    </button>
                  ) : (
                    <div
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold"
                      style={{ background: 'rgba(52,211,153,0.1)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.15)' }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      방문 완료
                    </div>
                  )}
                  <a
                    href={activeStopIndex > 0
                      ? buildNaverDirectionsUrl(
                          { lng: course.stops[activeStopIndex - 1].place.longitude, lat: course.stops[activeStopIndex - 1].place.latitude, name: course.stops[activeStopIndex - 1].place.name },
                          { lng: activeStop.place.longitude, lat: activeStop.place.latitude, name: activeStop.place.name },
                          'walk'
                        )
                      : buildNaverDestinationOnlyUrl(
                          { lng: activeStop.place.longitude, lat: activeStop.place.latitude, name: activeStop.place.name },
                          'walk'
                        )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    길찾기
                  </a>
                </div>
              </div>

              {/* Next stop transit info */}
              {nextStop && transitSteps.length > 0 && (
                <div className="px-5 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-semibold text-neutral-400">다음 장소로 이동</p>
                    <span className="text-[12px] text-neutral-500 font-bold">약 {transitTotalMinutes}분</span>
                  </div>

                  {(() => {
                    const walkMin = transitTotalMinutes || 10
                    const transitMin = Math.max(Math.ceil(walkMin * 0.45), 2)
                    const carMin = Math.max(Math.ceil(walkMin * 0.2), 1)
                    const fromPoint = { lng: activeStop.place.longitude, lat: activeStop.place.latitude, name: activeStop.place.name }
                    const toPoint = { lng: nextStop.place.longitude, lat: nextStop.place.latitude, name: nextStop.place.name }
                    const modeOptions: { key: NaverTransportMode; icon: typeof Footprints; label: string; time: number }[] = [
                      { key: 'walk', icon: Footprints, label: '도보', time: walkMin },
                      { key: 'transit', icon: Bus, label: '대중교통', time: transitMin },
                      { key: 'car', icon: Car, label: '자동차', time: carMin },
                    ]
                    return (
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {modeOptions.map((m, i) => (
                          <a
                            key={m.key}
                            href={buildNaverDirectionsUrl(fromPoint, toPoint, m.key)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 px-4 py-3 transition-colors active:bg-white/[0.04] ${
                              i < modeOptions.length - 1 ? 'border-b border-white/[0.06]' : ''
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                              <m.icon className="w-4 h-4 text-neutral-400" />
                            </div>
                            <span className="flex-1 text-[13px] font-semibold text-neutral-300">{m.label}</span>
                            <span className="text-[12px] text-neutral-500 font-medium">약 {m.time}분</span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Next stop preview */}
                  <div
                    className="mt-3 flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {nextStop.place.imageUrls[0] && (
                      <div
                        className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${nextStop.place.imageUrls[0]})` }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-semibold text-neutral-300 truncate block">{nextStop.place.name}</span>
                      <span className="text-[11px] text-neutral-500">{nextStop.place.category}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* All stops visited */}
              {visitedStops.size === course.stops.length && (
                <div className="px-5 pt-4 pb-2">
                  <div
                    className="text-center p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-[15px] font-bold text-neutral-200 mb-1">코스 완료!</p>
                    <p className="text-[12px] text-neutral-500">오늘 데이트 어땠어요?</p>
                    <button
                      onClick={() => router.push('/home')}
                      className="mt-3 px-6 py-2.5 rounded-xl text-[13px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      홈으로 돌아가기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
