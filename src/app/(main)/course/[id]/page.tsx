'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star, ChevronRight, ArrowRight, Shuffle } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useQuestStore } from '@/stores/useQuestStore'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import PageTransition from '@/components/motion/PageTransition'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { courses, setMode } = useCourseStore()
  const { startQuest } = useQuestStore()
  const course = courses.find((c) => c.id === params.id)

  if (!course) return null

  const handleStartCourse = () => {
    const missions = course.stops
      .filter((s) => s.questMission)
      .map((s) => s.questMission!)
    startQuest(course.id, missions)
    router.push('/quest')
  }

  const handleSwitchToBlind = () => {
    setMode('blind')
    router.push(`/course/${course.id}/blind`)
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
          <TopBar transparent rightAction={
            <button onClick={handleSwitchToBlind} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md">
              <Shuffle className="w-5 h-5 text-white" />
            </button>
          } />
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

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {/* Place images */}
                  <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {stop.place.imageUrls.map((url, imgI) => (
                      <div
                        key={imgI}
                        className="flex-shrink-0 w-full h-[160px] bg-cover bg-center snap-start"
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>

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
                      <div className="mb-3">
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

                    {stop.alternatives.length > 0 && (
                      <button className="flex items-center gap-1 text-body-2 text-primary-500 font-medium">
                        <Shuffle className="w-4 h-4" />
                        대안 보기
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

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
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleSwitchToBlind}>
            블라인드로 전환
          </Button>
          <Button className="flex-1" onClick={handleStartCourse}>
            이 코스로 시작
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
