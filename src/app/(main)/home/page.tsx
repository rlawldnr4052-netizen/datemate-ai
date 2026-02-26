'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus, Clock, MapPin, ChevronRight, Heart, Bookmark, Wallet } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { getRecommendedCourses, getMatchPercent } from '@/lib/courseRecommender'
import { fetchWeather, WeatherData } from '@/lib/api/weather'
import { formatCost, BUDGET_RANGES } from '@/lib/formatCost'
import { BudgetLevel } from '@/types/onboarding'
import PageTransition from '@/components/motion/PageTransition'

type CategoryTab = 'solo' | 'couple' | 'friends'

const categories: { id: CategoryTab; label: string }[] = [
  { id: 'couple', label: '데이트' },
  { id: 'friends', label: '친구' },
  { id: 'solo', label: '혼자' },
]

export default function HomePage() {
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget } = useOnboardingStore()
  const { courses, mode, setActiveCourse, savedCourseIds, toggleSaveCourse, budgetFilter, setBudgetFilter } = useCourseStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(dateType || 'couple')
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude).then(setWeather)
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    )
  }, [])

  const userName = currentUser?.name || '사용자'

  const userProfile = useMemo(() => ({
    dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget])

  const categoryCourses = useMemo(() => {
    let filtered = courses.filter((c) => c.dateType === activeCategory)
    if (budgetFilter) {
      const { min, max } = BUDGET_RANGES[budgetFilter]
      filtered = filtered.filter(
        (c) => (c.totalEstimatedCost ?? 0) >= min && (c.totalEstimatedCost ?? 0) < max
      )
    }
    return getRecommendedCourses(filtered, userProfile)
  }, [courses, activeCategory, budgetFilter, userProfile])

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    router.push(mode === 'blind' ? `/course/${courseId}/blind` : `/course/${courseId}`)
  }

  return (
    <PageTransition className="min-h-screen pb-28 bg-primary-50/40">
      {/* 헤더 영역 */}
      <div className="bg-gradient-to-b from-primary-100/60 to-transparent pt-14 px-5 pb-8">
        <p className="text-[13px] text-primary-400 font-medium mb-1">
          안녕하세요, {userName}님
        </p>
        <div className="flex items-start justify-between">
          <h1 className="text-[22px] font-bold text-neutral-900 leading-tight">
            오늘은 어떤 하루를<br />보내볼까요?
          </h1>
          {weather && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full border border-neutral-100">
              <span className="text-[16px]">{weather.emoji}</span>
              <span className="text-[13px] font-semibold text-neutral-700">{weather.temperature}°</span>
            </div>
          )}
        </div>
        {weather && (
          <p className="text-[12px] text-primary-400 mt-2">{weather.suggestion}</p>
        )}

        {/* 메인 CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/chat')}
          className="w-full flex items-center gap-4 mt-6 p-5 rounded-2xl active:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #FF6B52, #FF8A75)' }}
        >
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-bold text-white">AI에게 코스 추천받기</p>
            <p className="text-[12px] text-white/60 mt-0.5">취향에 맞는 코스를 만들어드려요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
        </motion.button>

        {/* 서브 CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/course/generate')}
          className="w-full flex items-center gap-4 mt-3 p-4 bg-white rounded-2xl border border-primary-100 active:bg-primary-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold text-neutral-800">새 코스 직접 만들기</p>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
        </motion.button>
      </div>

      {/* 내 코스 섹션 */}
      <div className="px-5 mt-2">
        {/* 섹션 헤더 + 탭 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-neutral-900">내 코스</h2>
          <button
            onClick={() => router.push('/course')}
            className="flex items-center gap-0.5 text-[13px] text-primary-500 font-medium"
          >
            전체보기 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {categories.map((c) => {
            const isActive = activeCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-400 border border-neutral-100'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* 예산 필터 */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setBudgetFilter(null)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              !budgetFilter
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-400 border border-neutral-100'
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
                  : 'bg-white text-neutral-400 border border-neutral-100'
              }`}
            >
              <Wallet className="w-3 h-3" />
              {BUDGET_RANGES[b].label}
            </button>
          ))}
        </div>

        {/* 코스 리스트 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {categoryCourses.length > 0 ? (
              <div className="flex flex-col gap-3">
                {categoryCourses.map((course, i) => {
                  const matchPercent = getMatchPercent(course, userProfile)
                  return (
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
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-primary-500/80">
                          {matchPercent}%
                        </div>
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

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSaveCourse(course.id) }}
                        className="self-center flex-shrink-0 w-8 h-8 flex items-center justify-center"
                      >
                        <Bookmark className={`w-4 h-4 ${savedCourseIds.includes(course.id) ? 'text-primary-500 fill-primary-500' : 'text-neutral-300'}`} />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
                <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary-300" />
                </div>
                <p className="text-[15px] font-semibold text-neutral-700 mb-1">
                  아직 코스가 없어요
                </p>
                <p className="text-[13px] text-neutral-400 mb-5">
                  AI에게 물어보면 바로 만들어줘요
                </p>
                <button
                  onClick={() => router.push('/chat')}
                  className="px-6 py-3 bg-primary-500 text-white rounded-full text-[14px] font-semibold active:bg-primary-600 transition-colors"
                >
                  AI에게 코스 요청하기
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
