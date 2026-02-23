'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageCircle, Plus, Clock, MapPin, Star, Heart, User, Users, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { getRecommendedCourses, getMatchPercent } from '@/lib/courseRecommender'
import ModeToggle from '@/components/ui/ModeToggle'
import Card from '@/components/ui/Card'
import PageContainer from '@/components/layout/PageContainer'
import PageTransition from '@/components/motion/PageTransition'
import StaggerChildren, { staggerItem } from '@/components/motion/StaggerChildren'

type CategoryTab = 'solo' | 'couple' | 'friends'

const categories: { id: CategoryTab; label: string; icon: typeof Heart; emoji: string; gradient: string; description: string; bgImage: string }[] = [
  {
    id: 'solo',
    label: '혼놀족',
    icon: User,
    emoji: '🎧',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    description: '나만의 아지트를 찾는 하루',
    bgImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
  },
  {
    id: 'couple',
    label: '연인과 데이트',
    icon: Heart,
    emoji: '💕',
    gradient: 'linear-gradient(135deg, #fb7185, #f9a8d4)',
    description: '설렘 가득한 둘만의 코스',
    bgImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  },
  {
    id: 'friends',
    label: '친구와 놀기',
    icon: Users,
    emoji: '🎉',
    gradient: 'linear-gradient(135deg, #fbbf24, #fb923c)',
    description: '결정 고민 없이 빠르게 놀자',
    bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
  },
]

export default function HomePage() {
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe } = useOnboardingStore()
  const { courses, mode, setMode, setActiveCourse } = useCourseStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(dateType || 'couple')

  const userName = currentUser?.name || '사용자'

  const userProfile = useMemo(() => ({
    dateType,
    likedTags,
    dislikedTags,
    mbti,
    birthday,
    location,
    selectedVibe,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe])

  // Filter courses by active category, then sort by recommendation score
  const categoryCourses = useMemo(() => {
    const filtered = courses.filter((c) => c.dateType === activeCategory)
    return getRecommendedCourses(filtered, userProfile)
  }, [courses, activeCategory, userProfile])

  // Top personalized recommendations (across all categories)
  const topRecommended = useMemo(() => {
    return getRecommendedCourses(courses, userProfile).slice(0, 3)
  }, [courses, userProfile])

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
      <PageContainer>
        {/* Header */}
        <div className="pt-14 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-display text-neutral-900">
              안녕, {userName}님
            </h1>
            <p className="text-body-1 text-neutral-500 mt-1">
              오늘은 어떤 하루를 보낼까요?
            </p>
          </motion.div>
        </div>

        {/* Personalized Picks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="py-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <h2 className="text-title-2 text-neutral-900">당신을 위한 추천</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {topRecommended.map((course) => {
              const matchPercent = getMatchPercent(course, userProfile)
              return (
                <motion.div
                  key={course.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCourseClick(course.id)}
                  className="flex-shrink-0 w-[200px] snap-start cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden shadow-card bg-white">
                    <div className="relative h-[120px]">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(90deg, #FF6B52, #FF8A75)' }}
                      >
                        {matchPercent}% 매칭
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-body-2 font-semibold text-neutral-900 truncate">{course.title}</h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{course.region} · {course.stops.length}곳</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="py-4"
        >
          <div className="flex gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex-1 relative rounded-2xl overflow-hidden transition-all duration-300
                    ${isActive ? 'shadow-card-hover ring-2 ring-primary-400 ring-offset-1' : 'shadow-card opacity-70'}
                  `}
                  style={{ minHeight: '100px' }}
                >
                  <div className="absolute inset-0" style={{ background: cat.gradient, opacity: isActive ? 1 : 0.6 }} />
                  <div className="relative flex flex-col items-center justify-center gap-1.5 p-3 h-full">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-white font-bold text-body-2 drop-shadow-sm">{cat.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="categoryIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white/80 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Category Hero Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-6"
          >
            {(() => {
              const cat = categories.find((c) => c.id === activeCategory)!
              return (
                <div className="relative rounded-3xl overflow-hidden h-[140px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${cat.bgImage})` }}
                  />
                  <div className="absolute inset-0" style={{ background: cat.gradient.replace('135deg', '90deg'), opacity: 0.75 }} />
                  <div className="relative h-full flex flex-col justify-center px-6">
                    <h2 className="text-title-1 text-white drop-shadow-md">{cat.label}</h2>
                    <p className="text-body-2 text-white/90 mt-1 drop-shadow-sm">{cat.description}</p>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Category Courses (personalized) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`recs-${activeCategory}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-2 text-neutral-900">AI 추천 코스</h2>
              <button className="flex items-center gap-0.5 text-caption text-primary-500 font-medium">
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {categoryCourses.length > 0 ? (
                categoryCourses.map((course, i) => {
                  const matchPercent = getMatchPercent(course, userProfile)
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCourseClick(course.id)}
                      className="flex gap-4 p-3 rounded-2xl bg-white shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
                    >
                      <div
                        className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0 relative"
                        style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                      >
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                          style={{ background: 'linear-gradient(90deg, #FF6B52, #FF8A75)' }}
                        >
                          {matchPercent}%
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-body-1 font-semibold text-neutral-900 truncate">{course.title}</h3>
                        <p className="text-caption text-neutral-500 mt-0.5">{course.description.slice(0, 30)}...</p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {course.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-primary-50 text-primary-500 text-[10px] rounded-pill font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-neutral-400 text-body-2">
                  이 카테고리에 맞는 코스를 준비 중이에요
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-2 mb-2"
        >
          <h2 className="text-title-2 text-neutral-900 mb-3">코스 보기 모드</h2>
          <ModeToggle mode={mode} onChange={setMode} />
        </motion.div>

        {/* Quick Actions */}
        <StaggerChildren staggerDelay={0.1} className="py-4">
          <motion.h2 variants={staggerItem} className="text-title-2 text-neutral-900 mb-4">빠른 시작</motion.h2>
          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
            <Card
              hover
              onClick={() => router.push('/chat')}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-body-2 font-semibold text-neutral-900">AI에게 물어보기</p>
                <p className="text-caption text-neutral-400 mt-0.5">맞춤 상담 시작</p>
              </div>
            </Card>

            <Card
              hover
              onClick={() => router.push('/course/generate')}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-body-2 font-semibold text-neutral-900">새 코스 만들기</p>
                <p className="text-caption text-neutral-400 mt-0.5">AI가 실시간 생성</p>
              </div>
            </Card>
          </motion.div>
        </StaggerChildren>

        {/* Popular Courses Carousel */}
        <StaggerChildren staggerDelay={0.1} className="py-2">
          <motion.div variants={staggerItem} className="flex items-center justify-between mb-4">
            <h2 className="text-title-2 text-neutral-900">인기 코스</h2>
            <span className="text-caption text-neutral-400">모두 보기</span>
          </motion.div>

          <motion.div variants={staggerItem} className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCourseClick(course.id)}
                className="flex-shrink-0 w-[260px] snap-start cursor-pointer"
              >
                <div className="rounded-3xl overflow-hidden shadow-card bg-white">
                  <div className="relative h-[150px] overflow-hidden">
                    {mode === 'blind' ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 via-secondary-300 to-accent-300 flex items-center justify-center">
                        <div className="text-center text-white px-6">
                          <Sparkles className="w-7 h-7 mx-auto mb-2 opacity-80" />
                          <p className="text-body-1 font-bold">{course.blindTitle}</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-body-1 font-semibold text-neutral-900 mb-1">
                      {mode === 'blind' ? '???' : course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-caption text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(course.totalDuration / 60)}h
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {course.stops.length}곳
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {course.totalDistance}km
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </StaggerChildren>
      </PageContainer>
    </PageTransition>
  )
}
