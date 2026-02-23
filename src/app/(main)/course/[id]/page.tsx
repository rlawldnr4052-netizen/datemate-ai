'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Star, ArrowRight, X, ExternalLink, Navigation } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useQuestStore } from '@/stores/useQuestStore'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import PageTransition from '@/components/motion/PageTransition'
import { Place } from '@/types/course'

interface PlaceDetail {
  place_name: string
  category_name: string
  phone: string
  address_name: string
  road_address_name: string
  place_url: string
  x: string
  y: string
}

function PlaceDetailPopup({ place, onClose }: { place: Place; onClose: () => void }) {
  const [kakaoData, setKakaoData] = useState<PlaceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(place.name)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.places && data.places.length > 0) {
            setKakaoData(data.places[0])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchPlaceDetail()
  }, [place.name])

  const kakaoMapUrl = kakaoData?.place_url || `https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Popup */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-app bg-white rounded-t-3xl overflow-hidden safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center z-10"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Place image */}
        {place.imageUrls.length > 0 && (
          <div
            className="w-full h-[180px] bg-cover bg-center"
            style={{ backgroundImage: `url(${place.imageUrls[0]})` }}
          />
        )}

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-title-1 text-neutral-900 mb-1">{place.name}</h3>
              <span className="text-caption text-primary-500 font-medium">{place.category}</span>
            </div>
            <div className="flex items-center gap-1 bg-accent-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
              <span className="text-body-2 font-bold text-accent-600">{place.rating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-body-2 text-neutral-500 mb-4">{place.description}</p>

          {/* Address */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <span className="text-body-2 text-neutral-600">
              {loading ? '주소 불러오는 중...' : (kakaoData?.road_address_name || kakaoData?.address_name || place.address || '주소 정보 없음')}
            </span>
          </div>

          {/* Phone */}
          {kakaoData?.phone && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-body-2 text-neutral-400">📞</span>
              <a href={`tel:${kakaoData.phone}`} className="text-body-2 text-primary-500 underline">
                {kakaoData.phone}
              </a>
            </div>
          )}

          {/* Category from Kakao */}
          {kakaoData?.category_name && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-body-2 text-neutral-400">🏷️</span>
              <span className="text-caption text-neutral-500">{kakaoData.category_name}</span>
            </div>
          )}

          {/* Recommended menus */}
          {place.recommendedMenus.length > 0 && (
            <div className="mb-4">
              <p className="text-caption font-semibold text-neutral-700 mb-2">추천 메뉴</p>
              <div className="flex gap-2 flex-wrap">
                {place.recommendedMenus.map((menu) => (
                  <span key={menu} className="px-3 py-1.5 bg-accent-50 text-accent-600 text-caption font-medium rounded-xl">
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estimated time */}
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-caption text-neutral-500">예상 소요시간 {place.estimatedTime}분</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pb-4">
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FEE500] text-neutral-900 rounded-2xl text-body-2 font-bold"
            >
              <ExternalLink className="w-4 h-4" />
              카카오맵에서 보기
            </a>
            {kakaoData?.x && kakaoData?.y && (
              <a
                href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${kakaoData.y},${kakaoData.x}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-500 text-white rounded-2xl text-body-2 font-bold"
              >
                <Navigation className="w-4 h-4" />
                길찾기
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { courses } = useCourseStore()
  const { startQuest } = useQuestStore()
  const course = courses.find((c) => c.id === params.id)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  if (!course) return null

  const handleStartCourse = () => {
    const missions = course.stops
      .filter((s) => s.questMission)
      .map((s) => s.questMission!)
    startQuest(course.id, missions)
    router.push('/quest')
  }

  return (
    <PageTransition className="min-h-screen bg-white pb-32">
      {/* Hero */}
      <div className="relative h-[280px]">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${course.heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute top-0 left-0 right-0 z-10">
          <TopBar transparent />
        </div>
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="text-display text-white mb-2">{course.title}</h1>
          <div className="flex items-center gap-3 text-body-2 text-white/80">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.floor(course.totalDuration / 60)}시간</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{course.stops.length}곳</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" />{course.totalDistance}km</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 py-4 flex gap-2 flex-wrap">
        {course.tags.map((tag) => (
          <Tag key={tag} label={tag} active size="sm" />
        ))}
      </div>

      {/* Description */}
      <p className="px-5 text-body-1 text-neutral-600 mb-6">
        {course.description}
      </p>

      {/* Timeline */}
      <div className="px-5">
        <h2 className="text-title-2 text-neutral-900 mb-4">코스 순서</h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-neutral-200" />

          {course.stops.map((stop, i) => (
            <motion.div
              key={stop.place.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex gap-4 mb-6 last:mb-0"
            >
              {/* Timeline node */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-bold text-body-1 shadow-md z-10">
                {stop.order}
              </div>

              {/* Content - clickable */}
              <div className="flex-1 pb-6">
                <button
                  onClick={() => setSelectedPlace(stop.place)}
                  className="w-full text-left bg-white rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
                >
                  {/* Place images */}
                  {stop.place.imageUrls.length > 0 && (
                    <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                      {stop.place.imageUrls.map((url, imgI) => (
                        <div
                          key={imgI}
                          className="flex-shrink-0 w-full h-[160px] bg-cover bg-center snap-start"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-title-2 text-neutral-900">{stop.place.name}</h3>
                      <span className="text-caption text-primary-500 font-medium">{stop.place.category}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
                      <span className="text-body-2 font-medium text-neutral-700">{stop.place.rating}</span>
                    </div>
                    <p className="text-body-2 text-neutral-500 mb-3 line-clamp-2">
                      {stop.place.description}
                    </p>

                    {stop.place.recommendedMenus.length > 0 && (
                      <div className="mb-2">
                        <p className="text-caption font-medium text-neutral-600 mb-1">추천 메뉴</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {stop.place.recommendedMenus.map((menu) => (
                            <span key={menu} className="px-2 py-0.5 bg-accent-100 text-accent-500 text-caption rounded-pill">
                              {menu}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-neutral-300 mt-2">탭하여 자세히 보기</p>
                  </div>
                </button>

                {/* Walking duration */}
                {i < course.stops.length - 1 && course.stops[i + 1].walkingMinutesFromPrev && (
                  <div className="flex items-center gap-2 mt-3 ml-2 text-caption text-neutral-400">
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    도보 {course.stops[i + 1].walkingMinutesFromPrev}분
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-app p-5 bg-gradient-to-t from-white via-white to-white/0">
        <Button className="w-full" onClick={handleStartCourse}>
          이 코스로 시작
        </Button>
      </div>

      {/* Place Detail Popup */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailPopup
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
