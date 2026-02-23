'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus, Clock, MapPin, ChevronRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { getRecommendedCourses, getMatchPercent } from '@/lib/courseRecommender'
import PageTransition from '@/components/motion/PageTransition'

type CategoryTab = 'solo' | 'couple' | 'friends'

const categories: {
  id: CategoryTab
  label: string
  emoji: string
  description: string
  bgFrom: string
  bgTo: string
  accent: string
  accentLight: string
  accentText: string
  tagBg: string
  tagText: string
  chatPrompt: string
}[] = [
  {
    id: 'solo',
    label: '혼놀족',
    emoji: '🎧',
    description: '나만의 감성 아지트를 찾아서',
    bgFrom: '#f5f0ff',
    bgTo: '#ede5ff',
    accent: '#8b5cf6',
    accentLight: '#ede9fe',
    accentText: '#7c3aed',
    tagBg: '#f3e8ff',
    tagText: '#7c3aed',
    chatPrompt: '혼자 즐기기 좋은 코스 추천해줘',
  },
  {
    id: 'couple',
    label: '연인과 데이트',
    emoji: '💕',
    description: '설렘 가득한 둘만의 코스',
    bgFrom: '#fff5f7',
    bgTo: '#ffe4ec',
    accent: '#ec4899',
    accentLight: '#fce7f3',
    accentText: '#db2777',
    tagBg: '#fce7f3',
    tagText: '#db2777',
    chatPrompt: '연인과 데이트 코스 추천해줘',
  },
  {
    id: 'friends',
    label: '친구와 놀기',
    emoji: '🎉',
    description: '고민 없이 바로 놀자!',
    bgFrom: '#fffbeb',
    bgTo: '#fef3c7',
    accent: '#f59e0b',
    accentLight: '#fef9c3',
    accentText: '#d97706',
    tagBg: '#fef3c7',
    tagText: '#d97706',
    chatPrompt: '친구들이랑 놀기 좋은 코스 추천해줘',
  },
]

export default function HomePage() {
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe } = useOnboardingStore()
  const { courses, mode, setActiveCourse } = useCourseStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(dateType || 'couple')

  const userName = currentUser?.name || '사용자'
  const cat = categories.find((c) => c.id === activeCategory)!

  const userProfile = useMemo(() => ({
    dateType,
    likedTags,
    dislikedTags,
    mbti,
    birthday,
    location,
    selectedVibe,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe])

  const categoryCourses = useMemo(() => {
    const filtered = courses.filter((c) => c.dateType === activeCategory)
    return getRecommendedCourses(filtered, userProfile)
  }, [courses, activeCategory, userProfile])

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    if (mode === 'blind') {
      router.push(`/course/${courseId}/blind`)
    } else {
      router.push(`/course/${courseId}`)
    }
  }

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen pb-24"
          style={{ background: `linear-gradient(180deg, ${cat.bgFrom} 0%, ${cat.bgTo} 30%, #ffffff 60%)` }}
        >
          {/* 유형 탭 (최상단) */}
          <div className="sticky top-0 z-20 pt-12 pb-3 px-5" style={{ background: `linear-gradient(180deg, ${cat.bgFrom}, ${cat.bgFrom}ee)`, backdropFilter: 'blur(12px)' }}>
            <div className="flex gap-2">
              {categories.map((c) => {
                const isActive = activeCategory === c.id
                return (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(c.id)}
                    className="flex-1 relative rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      background: isActive ? cat.accent : 'rgba(255,255,255,0.7)',
                      boxShadow: isActive ? `0 4px 20px ${cat.accent}40` : '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-1 py-3 px-2">
                      <span className="text-xl">{c.emoji}</span>
                      <span
                        className="text-caption font-bold"
                        style={{ color: isActive ? 'white' : '#6b7280' }}
                      >
                        {c.label}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="tabIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/60"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 인사 + 카테고리 설명 */}
          <div className="px-5 pt-4 pb-6">
            <motion.div
              key={`greeting-${activeCategory}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h1 className="text-display text-neutral-900">
                {cat.emoji} {cat.label}
              </h1>
              <p className="text-body-1 mt-1" style={{ color: cat.accentText }}>
                {cat.description}
              </p>
              <p className="text-caption text-neutral-400 mt-1">
                안녕, {userName}님! 오늘의 코스를 찾아볼까요?
              </p>
            </motion.div>
          </div>

          {/* 빠른 액션 */}
          <div className="px-5 mb-6">
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/chat')}
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm"
                style={{ borderLeft: `4px solid ${cat.accent}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: cat.accentLight }}
                >
                  <MessageCircle className="w-5 h-5" style={{ color: cat.accent }} />
                </div>
                <div className="text-left">
                  <p className="text-body-2 font-bold text-neutral-800">AI에게 물어보기</p>
                  <p className="text-[11px] text-neutral-400">맞춤 코스 상담</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/course/generate')}
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm"
                style={{ borderLeft: `4px solid ${cat.accent}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: cat.accentLight }}
                >
                  <Plus className="w-5 h-5" style={{ color: cat.accent }} />
                </div>
                <div className="text-left">
                  <p className="text-body-2 font-bold text-neutral-800">코스 만들기</p>
                  <p className="text-[11px] text-neutral-400">AI 실시간 생성</p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* AI 추천 코스 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`courses-${activeCategory}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="px-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: cat.accent }} />
                  <h2 className="text-title-2 text-neutral-900">{cat.label} 추천 코스</h2>
                </div>
                <button
                  onClick={() => router.push('/course')}
                  className="flex items-center gap-0.5 text-caption font-medium"
                  style={{ color: cat.accentText }}
                >
                  전체보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {categoryCourses.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {categoryCourses.map((course, i) => {
                    const matchPercent = getMatchPercent(course, userProfile)
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCourseClick(course.id)}
                        className="flex gap-4 p-3 rounded-2xl bg-white shadow-sm cursor-pointer active:shadow-md transition-shadow"
                      >
                        <div
                          className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0 relative"
                          style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                        >
                          <div
                            className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                            style={{ background: cat.accent }}
                          >
                            {matchPercent}%
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-body-1 font-semibold text-neutral-900 truncate">
                            {mode === 'blind' ? course.blindTitle : course.title}
                          </h3>
                          <p className="text-caption text-neutral-500 mt-0.5 line-clamp-1">
                            {mode === 'blind' ? course.blindSubtitle : course.description.slice(0, 30) + '...'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {Math.floor(course.totalDuration / 60)}시간
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {course.stops.length}곳
                            </span>
                          </div>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {course.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] rounded-full font-medium"
                                style={{ background: cat.tagBg, color: cat.tagText }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl bg-white/60">
                  <p className="text-2xl mb-2">{cat.emoji}</p>
                  <p className="text-body-2 text-neutral-500 mb-1">{cat.label} 코스를 준비 중이에요</p>
                  <p className="text-caption text-neutral-400 mb-4">AI에게 물어보면 바로 만들어줘요!</p>
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-5 py-2.5 rounded-xl text-caption font-bold text-white"
                    style={{ background: cat.accent }}
                  >
                    AI에게 코스 요청하기
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  )
}
