'use client'

import { motion } from 'framer-motion'
import { Map, ChevronRight, Loader2, Clock, Footprints } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CourseRecommendation } from '@/types/chat'

interface CourseTimelineCardProps {
  course: CourseRecommendation
  generatedCourseId?: string
  isGenerating?: boolean
}

export default function CourseTimelineCard({ course, generatedCourseId, isGenerating }: CourseTimelineCardProps) {
  const router = useRouter()

  const totalHours = Math.floor(course.estimatedDuration / 60)
  const totalMins = course.estimatedDuration % 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="mt-2 glass-card overflow-hidden"
    >
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[15px] font-bold text-neutral-900">{course.title}</h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">{course.description}</p>
      </div>

      {/* 타임라인 */}
      <div className="px-4 pb-3">
        <div className="relative">
          {/* 세로 연결선 */}
          <div
            className="absolute left-[15px] bg-primary-500/30"
            style={{
              top: 32,
              bottom: course.places.length > 1 ? 24 : 0,
              width: 2,
            }}
          />

          {course.places.map((place, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              {/* 장소 카드 */}
              <div className="flex items-start gap-3 relative">
                {/* 번호 원 */}
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-[12px] font-bold z-10 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>

                {/* 장소 정보 */}
                <div className="flex-1 pb-1">
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-neutral-800 truncate">
                        {place.name}
                      </span>
                      <span className="text-[11px] text-primary-500 font-medium px-2 py-0.5 bg-primary-500/10 rounded-full flex-shrink-0">
                        {place.category}
                      </span>
                    </div>
                    {place.startTime && place.endTime && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3 text-neutral-300" />
                        <span className="text-[11px] text-neutral-400">
                          {place.startTime} ~ {place.endTime}
                        </span>
                      </div>
                    )}
                    <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                      {place.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* 이동 시간 */}
              {index < course.places.length - 1 && (
                <div className="flex items-center gap-2 ml-[14px] pl-[18px] py-1.5">
                  <Footprints className="w-3 h-3 text-neutral-300" />
                  <span className="text-[11px] text-neutral-400">
                    {course.places[index + 1]?.walkingMinFromPrev
                      ? `도보 ${course.places[index + 1].walkingMinFromPrev}분`
                      : '이동'}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 총 소요시간 */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[12px] text-neutral-500">
          총 소요시간 약 {totalHours > 0 ? `${totalHours}시간` : ''}{totalMins > 0 ? ` ${totalMins}분` : ''}
        </span>
      </div>

      {/* 하단 액션 */}
      <div className="flex border-t border-white/[0.08]">
        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-3.5">
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
            <span className="text-[13px] text-primary-500 font-medium">코스 생성 중...</span>
          </div>
        ) : generatedCourseId ? (
          <>
            <button
              onClick={() => router.push(`/course/${generatedCourseId}`)}
              className="flex-1 flex items-center justify-center gap-1 py-3.5 text-primary-500 text-[13px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
            >
              코스 보러가기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-px bg-white/[0.08]" />
            <button
              onClick={() => router.push(`/course/${generatedCourseId}/map`)}
              className="flex-1 flex items-center justify-center gap-1 py-3.5 text-emerald-400 text-[13px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
            >
              <Map className="w-3.5 h-3.5" /> 지도에서 보기
            </button>
          </>
        ) : (
          <div className="flex-1 py-3.5 text-center text-[12px] text-neutral-400">
            코스 상세 정보를 준비하고 있어요
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function CourseTimelineSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 glass-card overflow-hidden"
    >
      <div className="p-4 space-y-2">
        <div className="h-4 w-32 bg-white/[0.08] rounded-lg animate-pulse" />
        <div className="h-3 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 bg-white/[0.04] rounded-xl p-3 space-y-2">
              <div className="h-4 w-24 bg-white/[0.08] rounded-lg animate-pulse" />
              <div className="h-3 w-full bg-white/[0.04] rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 py-3.5 border-t border-white/[0.08]">
        <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
        <span className="text-[13px] text-primary-500 font-medium">코스를 만들고 있어요...</span>
      </div>
    </motion.div>
  )
}
