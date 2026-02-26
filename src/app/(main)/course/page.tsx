'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, Bookmark } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import ModeToggle from '@/components/ui/ModeToggle'
import TopBar from '@/components/ui/TopBar'
import PageTransition from '@/components/motion/PageTransition'

export default function CourseListPage() {
  const router = useRouter()
  const { courses, mode, setMode, setActiveCourse, savedCourseIds, toggleSaveCourse } = useCourseStore()

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    router.push(mode === 'blind' ? `/course/${courseId}/blind` : `/course/${courseId}`)
  }

  return (
    <PageTransition className="min-h-screen bg-primary-50/40 pb-28">
      <TopBar title="코스" showBack={false} />

      <div className="px-5 py-4">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="px-5 flex flex-col gap-3">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCourseClick(course.id)}
            className="flex gap-4 p-3.5 bg-white rounded-2xl border border-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer active:bg-primary-50/50 transition-colors"
          >
            {/* 썸네일 */}
            <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 relative overflow-hidden bg-primary-50">
              {course.heroImageUrl && (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                />
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
                {mode === 'blind' ? course.blindTitle : course.title}
              </h3>
              <p className="text-[13px] text-neutral-400 mt-0.5 line-clamp-1">
                {mode === 'blind' ? course.blindSubtitle : course.description.slice(0, 30) + '...'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(course.totalDuration / 60)}시간
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {course.stops.length}곳
                </span>
              </div>
            </div>

            {/* 저장 */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSaveCourse(course.id) }}
              className="self-center flex-shrink-0 w-8 h-8 flex items-center justify-center"
            >
              <Bookmark className={`w-4 h-4 ${savedCourseIds.includes(course.id) ? 'text-primary-500 fill-primary-500' : 'text-neutral-300'}`} />
            </button>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  )
}
