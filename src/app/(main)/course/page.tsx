'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, Bookmark, Wallet, Lock, Dices } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { formatCost, BUDGET_RANGES } from '@/lib/formatCost'
import { BudgetLevel } from '@/types/onboarding'
import ModeToggle from '@/components/ui/ModeToggle'
import TopBar from '@/components/ui/TopBar'
import PageTransition from '@/components/motion/PageTransition'

export default function CourseListPage() {
  const router = useRouter()
  const { courses, mode, setMode, setActiveCourse, savedCourseIds, toggleSaveCourse, budgetFilter, setBudgetFilter } = useCourseStore()

  const filteredCourses = useMemo(() => {
    if (!budgetFilter) return courses
    const { min, max } = BUDGET_RANGES[budgetFilter]
    return courses.filter(
      (c) => (c.totalEstimatedCost ?? 0) >= min && (c.totalEstimatedCost ?? 0) < max
    )
  }, [courses, budgetFilter])

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    router.push(mode === 'blind' ? `/course/${courseId}/blind` : `/course/${courseId}`)
  }

  return (
    <PageTransition className="min-h-screen bg-[#0B0B12] pb-28">
      <TopBar title="코스" showBack={false} />

      <div className="px-5 py-4">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* 예산 필터 */}
      <div className="px-5 pb-3 flex gap-2">
        <button
          onClick={() => setBudgetFilter(null)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
            !budgetFilter
              ? 'bg-neutral-800 text-white'
              : 'glass-pill text-neutral-400'
          }`}
        >
          전체
        </button>
        {(['budget', 'moderate', 'premium'] as BudgetLevel[]).map((b) => (
          <button
            key={b}
            onClick={() => setBudgetFilter(budgetFilter === b ? null : b)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1 ${
              budgetFilter === b
                ? 'bg-neutral-800 text-white'
                : 'glass-pill text-neutral-400'
            }`}
          >
            <Wallet className="w-3 h-3" />
            {BUDGET_RANGES[b].label}
          </button>
        ))}
      </div>

      {/* 가챠 데이트 배너 (블라인드 모드에서만) */}
      {mode === 'blind' && (
        <div className="px-5 pb-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/course/gacha')}
            className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(124,58,237,0.12))',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)' }}
            >
              <Dices className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-bold text-indigo-300">가챠 데이트</p>
              <p className="text-[11px] text-neutral-500">모든 걸 랜덤으로 뽑아서 떠나는 모험</p>
            </div>
            <span className="text-[20px]" style={{ color: '#A5B4FC' }}>&#8250;</span>
          </motion.button>
        </div>
      )}

      <div className="px-5 flex flex-col gap-3">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCourseClick(course.id)}
            className="flex gap-4 p-3.5 glass-card cursor-pointer active:bg-white/[0.06] transition-colors"
          >
            {/* 썸네일 */}
            <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 relative overflow-hidden bg-primary-50">
              {mode === 'blind' ? (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(124,58,237,0.15))' }}>
                  <Lock className="w-6 h-6 text-neutral-500" />
                </div>
              ) : (
                course.heroImageUrl && (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                  />
                )
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
                {(course.totalEstimatedCost ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-primary-500 font-medium">
                    <Wallet className="w-3 h-3" />
                    {formatCost(course.totalEstimatedCost ?? 0)}
                  </span>
                )}
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
