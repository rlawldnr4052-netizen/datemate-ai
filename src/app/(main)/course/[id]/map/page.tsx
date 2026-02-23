'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Navigation, ChevronUp, ChevronDown,
  MapPin, Clock, Footprints, Bus, Train,
  CheckCircle2, Circle, ExternalLink,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCourseStore } from '@/stores/useCourseStore'
import { Place } from '@/types/course'

// Leaflet은 SSR 불가 → dynamic import
const CourseMap = dynamic(() => import('@/components/map/CourseMap'), { ssr: false })

interface TransitStep {
  type: 'walk' | 'bus' | 'subway'
  description: string
  duration: number
  detail?: string
}

function getTransitSteps(from: Place, to: Place): TransitStep[] {
  const dist = haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
  const walkMinutes = Math.round(dist / 0.08) // 약 80m/분

  if (dist < 0.8) {
    return [{ type: 'walk', description: `${to.name}까지 도보 이동`, duration: walkMinutes, detail: `약 ${Math.round(dist * 1000)}m` }]
  }

  if (dist < 3) {
    return [
      { type: 'walk', description: '가까운 버스 정류장까지', duration: 3, detail: '약 200m' },
      { type: 'bus', description: `${to.name} 방면 버스`, duration: Math.round(dist * 3), detail: `약 ${Math.round(dist * 1000)}m` },
      { type: 'walk', description: `${to.name}까지`, duration: 2, detail: '약 150m' },
    ]
  }

  return [
    { type: 'walk', description: '가까운 지하철역까지', duration: 5, detail: '약 400m' },
    { type: 'subway', description: `${to.name} 근처 역 하차`, duration: Math.round(dist * 2.5), detail: `약 ${Math.ceil(dist)}km` },
    { type: 'walk', description: `${to.name}까지`, duration: 4, detail: '약 300m' },
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

function TransitIcon({ type }: { type: TransitStep['type'] }) {
  switch (type) {
    case 'walk': return <Footprints className="w-4 h-4 text-green-500" />
    case 'bus': return <Bus className="w-4 h-4 text-blue-500" />
    case 'subway': return <Train className="w-4 h-4 text-purple-500" />
  }
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

  // 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        // 위치 가져오기 실패시 코스 첫번째 장소 근처로 설정
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
    <div className="h-screen w-full relative overflow-hidden">
      {/* 지도 */}
      <div className="absolute inset-0">
        <CourseMap
          stops={stops}
          userLocation={userLocation}
          activeStopIndex={activeStopIndex}
          onStopClick={handleStopClick}
        />
      </div>

      {/* 상단 바 */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>

          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-md px-4 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-body-2 font-bold text-neutral-800 truncate">{course.title}</h2>
              <span className="text-caption text-primary-500 font-semibold">{Math.round(progress)}%</span>
            </div>
            {/* 진행 바 */}
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* 스톱 칩 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
          {course.stops.map((stop, i) => (
            <button
              key={stop.place.id}
              onClick={() => handleStopClick(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium transition-all ${
                i === activeStopIndex
                  ? 'bg-primary-500 text-white shadow-md'
                  : visitedStops.has(i)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white/90 text-neutral-600 shadow-sm'
              }`}
            >
              {visitedStops.has(i) ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">{i + 1}</span>
              )}
              {stop.place.name}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 위치 버튼 */}
      <button
        onClick={() => {
          if (userLocation) {
            // 지도 중심 이동은 CourseMap 내부에서 처리
            setUserLocation({ ...userLocation })
          }
        }}
        className="absolute right-4 bottom-[340px] z-10 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center"
      >
        <Navigation className="w-5 h-5 text-blue-500" />
      </button>

      {/* 패널 토글 */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="absolute left-1/2 -translate-x-1/2 bottom-[300px] z-10 w-10 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
      >
        {showPanel ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronUp className="w-4 h-4 text-neutral-400" />}
      </button>

      {/* 하단 정보 패널 */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-2xl max-h-[45vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>

            <div className="overflow-y-auto max-h-[calc(45vh-20px)] pb-8">
              {/* 현재 장소 */}
              <div className="px-5 pb-3">
                <div className="flex items-start gap-3">
                  {activeStop.place.imageUrls[0] && (
                    <div
                      className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${activeStop.place.imageUrls[0]})` }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {activeStopIndex + 1}
                      </div>
                      <h3 className="text-title-2 text-neutral-900 truncate">{activeStop.place.name}</h3>
                    </div>
                    <p className="text-caption text-primary-500 font-medium mt-0.5">{activeStop.place.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-caption text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeStop.place.estimatedTime}분
                      </span>
                      <span className="text-caption text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {activeStop.place.address || '주소 정보 없음'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 방문 완료 / 카카오맵 버튼 */}
                <div className="flex gap-2 mt-3">
                  {!visitedStops.has(activeStopIndex) ? (
                    <button
                      onClick={() => handleMarkVisited(activeStopIndex)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl text-caption font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      도착 완료!
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-700 rounded-xl text-caption font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      방문 완료
                    </div>
                  )}
                  <a
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(activeStop.place.name)},${activeStop.place.latitude},${activeStop.place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FEE500] text-neutral-900 rounded-xl text-caption font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    카카오 내비
                  </a>
                </div>
              </div>

              {/* 다음 장소 이동 정보 */}
              {nextStop && transitSteps.length > 0 && (
                <div className="px-5 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-caption font-semibold text-neutral-700">
                      다음 장소로 이동
                    </p>
                    <span className="text-caption text-primary-500 font-bold">
                      약 {transitTotalMinutes}분
                    </span>
                  </div>

                  {/* 이동 단계 */}
                  <div className="relative pl-6">
                    {/* 수직 연결선 */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-200" />

                    {transitSteps.map((step, i) => (
                      <div key={i} className="relative flex items-start gap-3 mb-3 last:mb-0">
                        {/* 아이콘 */}
                        <div className="absolute -left-6 w-4 h-4 rounded-full bg-white flex items-center justify-center z-10">
                          <TransitIcon type={step.type} />
                        </div>

                        <div className="flex-1 bg-neutral-50 rounded-xl px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-caption font-medium text-neutral-700">{step.description}</span>
                            <span className="text-[11px] text-neutral-400">{step.duration}분</span>
                          </div>
                          {step.detail && (
                            <span className="text-[11px] text-neutral-400">{step.detail}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 다음 장소 미리보기 */}
                  <div className="mt-3 flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                    {nextStop.place.imageUrls[0] && (
                      <div
                        className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${nextStop.place.imageUrls[0]})` }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Circle className="w-3 h-3 text-primary-400" />
                        <span className="text-caption font-semibold text-neutral-800 truncate">{nextStop.place.name}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">{nextStop.place.category}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 모든 장소 방문 완료 */}
              {visitedStops.size === course.stops.length && (
                <div className="px-5 pt-4 pb-2">
                  <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl">
                    <p className="text-title-2 text-neutral-900 mb-1">코스 완료!</p>
                    <p className="text-caption text-neutral-500">오늘 데이트 어땠어요?</p>
                    <button
                      onClick={() => router.push('/home')}
                      className="mt-3 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-caption font-bold"
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
