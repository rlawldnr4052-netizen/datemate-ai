'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import ModeToggle from '@/components/ui/ModeToggle'
import TopBar from '@/components/ui/TopBar'
import PageContainer from '@/components/layout/PageContainer'
import PageTransition from '@/components/motion/PageTransition'
import StaggerChildren, { staggerItem } from '@/components/motion/StaggerChildren'

export default function CourseListPage() {
  const router = useRouter()
  const { courses, mode, setMode, setActiveCourse } = useCourseStore()

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    router.push(mode === 'blind' ? `/course/${courseId}/blind` : `/course/${courseId}`)
  }

  return (
    <PageTransition>
      <TopBar title="코스" showBack={false} />
      <PageContainer>
        <div className="py-4">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        <StaggerChildren staggerDelay={0.1} className="pb-4">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={staggerItem}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCourseClick(course.id)}
              className="mb-4 rounded-3xl overflow-hidden shadow-card bg-white cursor-pointer"
            >
              <div className="relative h-[160px]">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-title-2 text-white font-bold">
                    {mode === 'blind' ? course.blindTitle : course.title}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-body-2 text-neutral-600 mb-3 line-clamp-2">
                  {mode === 'blind' ? course.blindSubtitle : course.description}
                </p>
                <div className="flex items-center gap-4 text-caption text-neutral-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{Math.floor(course.totalDuration / 60)}시간</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{course.stops.length}곳</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{course.totalDistance}km</span>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>
      </PageContainer>
    </PageTransition>
  )
}
