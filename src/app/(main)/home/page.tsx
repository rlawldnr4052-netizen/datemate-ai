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
  // 배경 그라디언트 (더 진하게 - 글래스모피즘용)
  bg1: string
  bg2: string
  bg3: string
  // 액센트
  accent: string
  accentSoft: string
  accentText: string
  // 글래스 카드
  glassBg: string
  glassBorder: string
  glassHighlight: string
  // 태그
  tagBg: string
  tagText: string
}[] = [
  {
    id: 'solo',
    label: '혼놀족',
    emoji: '🎧',
    description: '나만의 감성 아지트를 찾아서',
    bg1: '#ddd6fe',
    bg2: '#c4b5fd',
    bg3: '#f5f3ff',
    accent: '#7c3aed',
    accentSoft: 'rgba(139,92,246,0.15)',
    accentText: '#6d28d9',
    glassBg: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(167,139,250,0.25)',
    glassHighlight: 'rgba(139,92,246,0.08)',
    tagBg: 'rgba(139,92,246,0.12)',
    tagText: '#7c3aed',
  },
  {
    id: 'couple',
    label: '연인과 데이트',
    emoji: '💕',
    description: '설렘 가득한 둘만의 코스',
    bg1: '#fecdd3',
    bg2: '#fda4af',
    bg3: '#fff1f2',
    accent: '#e11d48',
    accentSoft: 'rgba(236,72,153,0.12)',
    accentText: '#be123c',
    glassBg: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(251,113,133,0.25)',
    glassHighlight: 'rgba(236,72,153,0.06)',
    tagBg: 'rgba(236,72,153,0.10)',
    tagText: '#be123c',
  },
  {
    id: 'friends',
    label: '친구와 놀기',
    emoji: '🎉',
    description: '고민 없이 바로 놀자!',
    bg1: '#fde68a',
    bg2: '#fcd34d',
    bg3: '#fffbeb',
    accent: '#d97706',
    accentSoft: 'rgba(245,158,11,0.12)',
    accentText: '#b45309',
    glassBg: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(252,211,77,0.3)',
    glassHighlight: 'rgba(245,158,11,0.06)',
    tagBg: 'rgba(245,158,11,0.12)',
    tagText: '#b45309',
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
    dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe])

  const categoryCourses = useMemo(() => {
    const filtered = courses.filter((c) => c.dateType === activeCategory)
    return getRecommendedCourses(filtered, userProfile)
  }, [courses, activeCategory, userProfile])

  const handleCourseClick = (courseId: string) => {
    setActiveCourse(courseId)
    router.push(mode === 'blind' ? `/course/${courseId}/blind` : `/course/${courseId}`)
  }

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen pb-28 relative overflow-hidden"
        >
          {/* 배경 그라디언트 — 위에서 아래로 점점 연해짐 */}
          <div
            className="fixed inset-0 -z-10 transition-all duration-500"
            style={{
              background: `
                radial-gradient(ellipse 120% 60% at 50% -10%, ${cat.bg2}90 0%, transparent 60%),
                radial-gradient(ellipse 80% 40% at 80% 20%, ${cat.bg1}60 0%, transparent 50%),
                radial-gradient(ellipse 80% 40% at 20% 30%, ${cat.bg1}40 0%, transparent 50%),
                linear-gradient(180deg, ${cat.bg3} 0%, #ffffff 50%)
              `,
            }}
          />

          {/* ── 유형 탭 (최상단, 글래스) ── */}
          <div className="sticky top-0 z-20 pt-12 pb-3 px-5">
            <div
              className="flex gap-1.5 p-1.5 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(255,255,255,0.45)',
                border: `1px solid ${cat.glassBorder}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              {categories.map((c) => {
                const isActive = activeCategory === c.id
                return (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveCategory(c.id)}
                    className="flex-1 relative rounded-xl overflow-hidden transition-all duration-300"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${cat.accent}, ${cat.accent}cc)`,
                          boxShadow: `0 4px 16px ${cat.accent}30`,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                    <div className="relative flex flex-col items-center gap-0.5 py-2.5 px-1">
                      <span className="text-lg leading-none">{c.emoji}</span>
                      <span
                        className="text-[11px] font-bold transition-colors duration-200"
                        style={{ color: isActive ? 'white' : '#9ca3af' }}
                      >
                        {c.label}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── 인사 ── */}
          <div className="px-5 pt-4 pb-5">
            <motion.div
              key={`g-${activeCategory}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-caption text-neutral-400 mb-1">
                안녕, {userName}님
              </p>
              <h1 className="text-[26px] font-extrabold text-neutral-900 leading-tight">
                {cat.emoji} {cat.label}
              </h1>
              <p className="text-body-2 mt-1" style={{ color: cat.accentText }}>
                {cat.description}
              </p>
            </motion.div>
          </div>

          {/* ── 빠른 액션 (글래스) ── */}
          <div className="px-5 mb-6">
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/chat')}
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl backdrop-blur-lg transition-shadow"
                style={{
                  background: cat.glassBg,
                  border: `1px solid ${cat.glassBorder}`,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  style={{ background: cat.accentSoft }}
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
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl backdrop-blur-lg transition-shadow"
                style={{
                  background: cat.glassBg,
                  border: `1px solid ${cat.glassBorder}`,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  style={{ background: cat.accentSoft }}
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

          {/* ── AI 추천 코스 ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`c-${activeCategory}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="px-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: cat.accent }} />
                  <h2 className="text-title-2 text-neutral-900">추천 코스</h2>
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCourseClick(course.id)}
                        className="flex gap-4 p-3 rounded-2xl backdrop-blur-lg cursor-pointer transition-all active:shadow-lg"
                        style={{
                          background: cat.glassBg,
                          border: `1px solid ${cat.glassBorder}`,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                      >
                        {/* 썸네일 */}
                        <div className="w-[76px] h-[76px] rounded-xl bg-cover bg-center flex-shrink-0 relative overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                          />
                          <div
                            className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white backdrop-blur-sm"
                            style={{ background: `${cat.accent}cc` }}
                          >
                            {matchPercent}%
                          </div>
                        </div>

                        {/* 정보 */}
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
                                className="px-2 py-0.5 text-[10px] rounded-full font-medium backdrop-blur-sm"
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
                <div
                  className="text-center py-12 rounded-2xl backdrop-blur-lg"
                  style={{
                    background: cat.glassBg,
                    border: `1px solid ${cat.glassBorder}`,
                  }}
                >
                  <p className="text-2xl mb-2">{cat.emoji}</p>
                  <p className="text-body-2 text-neutral-600 mb-1">{cat.label} 코스를 준비 중이에요</p>
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
