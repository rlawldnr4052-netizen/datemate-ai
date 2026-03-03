'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus, Clock, MapPin, ChevronRight, Heart, Bookmark, Wallet, Users, UserPlus, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useFriendStore } from '@/stores/useFriendStore'
import { getRecommendedCourses, getMatchPercent } from '@/lib/courseRecommender'
import { fetchWeather, WeatherData } from '@/lib/api/weather'
import { formatCost, BUDGET_RANGES } from '@/lib/formatCost'
import { BudgetLevel } from '@/types/onboarding'
import PageTransition from '@/components/motion/PageTransition'

type CategoryTab = 'couple' | 'friends' | 'solo'

const categoryThemes: Record<CategoryTab, {
  label: string
  emoji: string
  title: string
  subtitle: string
  gradient: string
  bgFrom: string
  bgTo: string
  accent: string
  accentLight: string
  accentBg: string
  tabActive: string
  tabText: string
  ctaGradient: string
  cardBorder: string
}> = {
  couple: {
    label: '연인과 데이트',
    emoji: '💕',
    title: '로맨틱 데이트',
    subtitle: '설레는 하루를 시작해볼까요?',
    gradient: 'linear-gradient(180deg, #FFE0EC 0%, #FFF5F7 40%, #FFFFFF 100%)',
    bgFrom: '#FFE0EC',
    bgTo: '#FFF5F7',
    accent: '#E8457C',
    accentLight: '#FF7EB3',
    accentBg: 'rgba(232, 69, 124, 0.08)',
    tabActive: 'linear-gradient(135deg, #FF7EB3, #E8457C)',
    tabText: '#E8457C',
    ctaGradient: 'linear-gradient(135deg, #FF7EB3, #E8457C)',
    cardBorder: 'rgba(232, 69, 124, 0.12)',
  },
  friends: {
    label: '친구와 놀기',
    emoji: '🎉',
    title: '친구와 놀기',
    subtitle: '고민 없이 바로 놀자!',
    gradient: 'linear-gradient(180deg, #FFF0C8 0%, #FFFBF0 40%, #FFFFFF 100%)',
    bgFrom: '#FFF0C8',
    bgTo: '#FFFBF0',
    accent: '#D4890B',
    accentLight: '#FFB830',
    accentBg: 'rgba(212, 137, 11, 0.08)',
    tabActive: 'linear-gradient(135deg, #FFD060, #F5A623)',
    tabText: '#D4890B',
    ctaGradient: 'linear-gradient(135deg, #FFD060, #F5A623)',
    cardBorder: 'rgba(212, 137, 11, 0.12)',
  },
  solo: {
    label: '혼놀족',
    emoji: '🎧',
    title: '나만의 시간',
    subtitle: '온전한 나를 위한 하루',
    gradient: 'linear-gradient(180deg, #E8E0FF 0%, #F5F0FF 40%, #FFFFFF 100%)',
    bgFrom: '#E8E0FF',
    bgTo: '#F5F0FF',
    accent: '#7C3AED',
    accentLight: '#A78BFA',
    accentBg: 'rgba(124, 58, 237, 0.08)',
    tabActive: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    tabText: '#7C3AED',
    ctaGradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    cardBorder: 'rgba(124, 58, 237, 0.12)',
  },
}

const tabOrder: CategoryTab[] = ['solo', 'couple', 'friends']

export default function HomePage() {
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.currentUser)
  const syncToSupabase = useAuthStore((s) => s.syncToSupabase)
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget, setDateType } = useOnboardingStore()
  const { courses, mode, setActiveCourse, savedCourseIds, toggleSaveCourse, budgetFilter, setBudgetFilter } = useCourseStore()
  const { getPartner, getFriendUsers, fetchFriends, fetchRequests, receivedRequests } = useFriendStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(dateType || 'couple')
  const [weather, setWeather] = useState<WeatherData | null>(null)

  const myId = currentUser?.id || ''
  const partnerId = getPartner(myId)
  const friendUsers = getFriendUsers()
  const partnerUser = friendUsers.find((u) => u.id === partnerId) || null

  // Supabase에 유저 동기화 (Supabase 연동 전 가입자 대응)
  useEffect(() => {
    syncToSupabase()
  }, [syncToSupabase])

  useEffect(() => {
    if (myId) {
      fetchFriends(myId)
      fetchRequests(myId)
    }
  }, [myId, fetchFriends, fetchRequests])

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
  const theme = categoryThemes[activeCategory]

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
    <PageTransition className="min-h-screen pb-28">
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ background: theme.gradient }}
        className="min-h-screen"
      >
        {/* -- 알림 벨 -- */}
        <div className="pt-12 px-5 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/friends')}
            className="relative w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Bell className="w-5 h-5" style={{ color: theme.accent }} />
            {receivedRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {receivedRequests.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* -- 상단 탭 -- */}
        <div className="pt-2 px-4">
          <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-sm rounded-2xl">
            {tabOrder.map((tabId) => {
              const t = categoryThemes[tabId]
              const isActive = activeCategory === tabId
              return (
                <motion.button
                  key={tabId}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setActiveCategory(tabId); setDateType(tabId) }}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all relative"
                  style={{
                    background: isActive ? t.tabActive : 'transparent',
                  }}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                  >
                    {t.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* -- 인사 + 타이틀 -- */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[13px] font-medium mb-2" style={{ color: theme.accent }}>
            안녕, {userName}님
          </p>
          <h1 className="text-[26px] font-extrabold text-neutral-900 leading-tight flex items-center gap-2">
            <span className="text-[30px]">{theme.emoji}</span> {theme.title}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: theme.accentLight }}>
            {theme.subtitle}
          </p>

          {weather && (
            <div
              className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-full"
              style={{ background: theme.accentBg }}
            >
              <span className="text-[15px]">{weather.emoji}</span>
              <span className="text-[13px] font-semibold" style={{ color: theme.accent }}>
                {weather.temperature}° {weather.label}
              </span>
            </div>
          )}
        </div>

        {/* -- 함께하는 사람 -- */}
        {activeCategory === 'couple' && (
          <div className="px-5 pt-4">
            {partnerUser ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                style={{ background: theme.accentBg }}
              >
                <Heart className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent, fill: theme.accent }} />
                <span className="text-[13px] font-semibold" style={{ color: theme.accent }}>
                  {partnerUser.name}님과 함께
                </span>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/friends')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-dashed"
                style={{ borderColor: theme.accentLight, color: theme.accent }}
              >
                <Heart className="w-4 h-4" />
                <span className="text-[13px] font-semibold">연인을 설정해보세요</span>
              </motion.button>
            )}
          </div>
        )}

        {activeCategory === 'friends' && (
          <div className="px-5 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="text-[13px] font-bold" style={{ color: theme.accent }}>함께할 친구</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {friendUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: theme.accentBg }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: theme.accent }}>
                    {u.name}
                  </span>
                </div>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/friends')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed"
                style={{ borderColor: theme.accentLight, color: theme.accent }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-[12px] font-semibold">
                  {friendUsers.length > 0 ? '더 추가' : '친구 추가'}
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* -- CTA 카드 2개 -- */}
        <div className="px-5 pt-4 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chat')}
            className="flex-1 rounded-2xl p-5 text-left"
            style={{ background: 'white', border: `1.5px solid ${theme.cardBorder}` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ background: theme.accentBg }}
            >
              <MessageCircle className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <p className="text-[15px] font-bold text-neutral-900">AI에게 물어보기</p>
            <p className="text-[12px] text-neutral-400 mt-0.5">맞춤 코스 상담</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/course/generate')}
            className="flex-1 rounded-2xl p-5 text-left"
            style={{ background: theme.ctaGradient }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-white/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-[15px] font-bold text-white">코스 만들기</p>
            <p className="text-[12px] text-white/70 mt-0.5">AI 실시간 생성</p>
          </motion.button>
        </div>

        {/* -- 추천 코스 -- */}
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="text-[16px]">✨</span> 추천 코스
            </h2>
            <button
              onClick={() => router.push('/course')}
              className="flex items-center gap-0.5 text-[13px] font-medium"
              style={{ color: theme.accent }}
            >
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 예산 필터 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBudgetFilter(null)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{
                background: !budgetFilter ? theme.accent : 'white',
                color: !budgetFilter ? 'white' : '#9CA3AF',
                border: !budgetFilter ? 'none' : '1px solid #E5E7EB',
              }}
            >
              전체
            </button>
            {(['budget', 'moderate', 'premium'] as BudgetLevel[]).map((b) => (
              <button
                key={b}
                onClick={() => setBudgetFilter(budgetFilter === b ? null : b)}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1"
                style={{
                  background: budgetFilter === b ? theme.accent : 'white',
                  color: budgetFilter === b ? 'white' : '#9CA3AF',
                  border: budgetFilter === b ? 'none' : '1px solid #E5E7EB',
                }}
              >
                <Wallet className="w-3 h-3" />
                {BUDGET_RANGES[b].label}
              </button>
            ))}
          </div>

          {/* 코스 리스트 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${budgetFilter}`}
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
                        className="flex gap-4 p-3.5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] cursor-pointer active:shadow-md transition-all"
                        style={{ border: `1px solid ${theme.cardBorder}` }}
                      >
                        {/* 썸네일 */}
                        <div className="w-[80px] h-[80px] rounded-xl flex-shrink-0 relative overflow-hidden bg-neutral-100">
                          {course.heroImageUrl && (
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                            />
                          )}
                          <div
                            className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: theme.accent }}
                          >
                            {matchPercent}%
                          </div>
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-[15px] font-bold text-neutral-900 truncate">
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
                              <span className="flex items-center gap-1 font-medium" style={{ color: theme.accent }}>
                                <Wallet className="w-3 h-3" />
                                {formatCost(course.totalEstimatedCost ?? 0)}
                              </span>
                            )}
                          </div>
                          {/* 태그 */}
                          {course.tags && course.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2">
                              {course.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  style={{ background: theme.accentBg, color: theme.accent }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveCourse(course.id) }}
                          className="self-center flex-shrink-0 w-8 h-8 flex items-center justify-center"
                        >
                          <Bookmark
                            className="w-4.5 h-4.5"
                            style={{
                              color: savedCourseIds.includes(course.id) ? theme.accent : '#D1D5DB',
                              fill: savedCourseIds.includes(course.id) ? theme.accent : 'none',
                            }}
                          />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl" style={{ border: `1px solid ${theme.cardBorder}` }}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: theme.accentBg }}
                  >
                    <span className="text-2xl">{theme.emoji}</span>
                  </div>
                  <p className="text-[15px] font-bold text-neutral-700 mb-1">
                    아직 코스가 없어요
                  </p>
                  <p className="text-[13px] text-neutral-400 mb-5">
                    AI에게 물어보면 바로 만들어줘요
                  </p>
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-6 py-3 text-white rounded-full text-[14px] font-bold active:opacity-80 transition-opacity"
                    style={{ background: theme.ctaGradient }}
                  >
                    AI에게 코스 요청하기
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </PageTransition>
  )
}
