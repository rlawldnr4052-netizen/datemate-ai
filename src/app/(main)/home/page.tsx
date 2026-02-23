'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageCircle, Plus, Clock, MapPin, Star, Heart, User, Users, ChevronRight } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
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

const categoryRecommendations: Record<CategoryTab, { title: string; subtitle: string; tags: string[]; image: string }[]> = {
  solo: [
    { title: '혼자만의 북촌 산책', subtitle: '고즈넉한 골목에서 나를 만나는 시간', tags: ['#한옥', '#북카페', '#감성'], image: 'https://images.unsplash.com/photo-1583167615645-8e72a0c34a96?w=400&h=300&fit=crop' },
    { title: '성수동 카페 호핑', subtitle: '트렌디한 공간에서 혼자만의 여유', tags: ['#카페', '#빈티지', '#포토존'], image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop' },
    { title: '혼영 & 혼밥 코스', subtitle: '혼자라서 더 완벽한 미식 투어', tags: ['#맛집', '#영화', '#혼밥'], image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop' },
  ],
  couple: [
    { title: '성수동 감성 투어', subtitle: '빈티지 감성 가득한 로맨틱 하루', tags: ['#카페', '#빈티지', '#와인'], image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop' },
    { title: '한강 선셋 데이트', subtitle: '노을과 함께하는 피크닉', tags: ['#한강', '#피크닉', '#노을'], image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop' },
    { title: '이태원 루프탑 나이트', subtitle: '도시 야경 아래 특별한 밤', tags: ['#루프탑', '#야경', '#칵테일'], image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop' },
  ],
  friends: [
    { title: '을지로 먹방 투어', subtitle: '레트로 골목에서 먹고 또 먹기', tags: ['#먹방', '#을지로', '#레트로'], image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
    { title: '홍대 핫플 탐방', subtitle: '핫한 곳만 쏙쏙 골라서', tags: ['#홍대', '#핫플', '#쇼핑'], image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop' },
    { title: '연남동 힐링 코스', subtitle: '연트럴파크에서 느긋한 하루', tags: ['#연남동', '#피크닉', '#카페'], image: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=400&h=300&fit=crop' },
  ],
}

export default function HomePage() {
  const router = useRouter()
  const userName = useOnboardingStore((s) => s.userName)
  const { courses, mode, setMode, setActiveCourse } = useCourseStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('couple')

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

        {/* Category Tabs - 혼놀족 / 연인 / 친구 */}
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

        {/* Category Recommendations */}
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
              {categoryRecommendations[activeCategory].map((rec, i) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCourseClick(courses[i % courses.length].id)}
                  className="flex gap-4 p-3 rounded-2xl bg-white shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
                >
                  <div
                    className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${rec.image})` }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-body-1 font-semibold text-neutral-900 truncate">{rec.title}</h3>
                    <p className="text-caption text-neutral-500 mt-0.5">{rec.subtitle}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {rec.tags.map((tag) => (
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
              ))}
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
              onClick={() => router.push('/course')}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-body-2 font-semibold text-neutral-900">새 코스 만들기</p>
                <p className="text-caption text-neutral-400 mt-0.5">AI가 추천해요</p>
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
