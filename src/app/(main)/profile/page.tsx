'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, Bell, MapPin, Palette, RotateCcw, Heart, LogOut, Calendar, Brain } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { preferenceTags } from '@/data/tags'
import { mbtiOptions } from '@/data/mbti'
import TopBar from '@/components/ui/TopBar'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import PageContainer from '@/components/layout/PageContainer'
import PageTransition from '@/components/motion/PageTransition'
import StaggerChildren, { staggerItem } from '@/components/motion/StaggerChildren'

const dateTypeLabels = {
  couple: '커플',
  solo: '솔로',
  friends: '친구',
}

export default function ProfilePage() {
  const router = useRouter()
  const { currentUser, logout } = useAuthStore()
  const { dateType, likedTags, mbti, birthday, location, reset } = useOnboardingStore()
  const { totalCourses, totalPlaces, totalShortForms } = useQuestStore()

  const userName = currentUser?.name || '사용자'

  const likedTagLabels = preferenceTags
    .filter((t) => likedTags.includes(t.id))
    .map((t) => t.label)

  const mbtiInfo = mbti ? mbtiOptions.find((o) => o.type === mbti) : null

  const age = birthday ? (2026 - Number(birthday.split('-')[0])) : null

  const handleReset = () => {
    reset()
    router.push('/type')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const stats = [
    { label: '완료한 코스', value: totalCourses, color: 'from-primary-400 to-primary-500' },
    { label: '방문한 장소', value: totalPlaces, color: 'from-accent-300 to-accent-500' },
    { label: '숏폼 생성', value: totalShortForms, color: 'from-secondary-300 to-secondary-500' },
  ]

  const settings = [
    { icon: Bell, label: '알림', hasToggle: true },
    { icon: MapPin, label: '위치 서비스', hasToggle: true },
    { icon: Palette, label: '다크 모드', badge: 'Coming Soon' },
  ]

  return (
    <PageTransition>
      <TopBar title="프로필" showBack={false} />

      <PageContainer>
        <StaggerChildren staggerDelay={0.08}>
          {/* Profile Header */}
          <motion.div variants={staggerItem} className="flex items-center gap-4 py-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-300 via-primary-400 to-secondary-400 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary-500" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-title-1 text-neutral-900">{userName}님</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {dateType && (
                  <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-caption font-medium rounded-pill">
                    {dateTypeLabels[dateType]}
                  </span>
                )}
                {mbtiInfo && (
                  <span className="inline-block px-3 py-1 bg-violet-50 text-violet-500 text-caption font-medium rounded-pill">
                    {mbtiInfo.emoji} {mbtiInfo.type}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div variants={staggerItem} className="mb-6">
            <Card padding="sm">
              <div className="flex flex-col gap-3 py-2 px-2">
                {mbtiInfo && (
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-body-2 text-neutral-600">
                      {mbtiInfo.type} · {mbtiInfo.label} · {mbtiInfo.description}
                    </span>
                  </div>
                )}
                {birthday && age && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    <span className="text-body-2 text-neutral-600">
                      {birthday.replace(/-/g, '.')} ({age}세)
                    </span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-body-2 text-neutral-600">
                      {location.city} {location.district}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Taste Tags */}
          {likedTagLabels.length > 0 && (
            <motion.div variants={staggerItem} className="mb-6">
              <h2 className="text-title-2 text-neutral-900 mb-3">내 취향 태그</h2>
              <div className="flex gap-2 flex-wrap">
                {likedTagLabels.map((label) => (
                  <Tag key={label} label={label} active size="sm" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div variants={staggerItem} className="mb-6">
            <h2 className="text-title-2 text-neutral-900 mb-3">통계</h2>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <Card key={stat.label} className="text-center py-5" padding="sm">
                  <motion.p
                    className="text-display text-neutral-900 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-caption text-neutral-500">{stat.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div variants={staggerItem} className="mb-6">
            <h2 className="text-title-2 text-neutral-900 mb-3">설정</h2>
            <Card padding="sm">
              {settings.map((setting, i) => {
                const Icon = setting.icon
                return (
                  <div
                    key={setting.label}
                    className={`flex items-center gap-3 py-3.5 px-2 ${
                      i < settings.length - 1 ? 'border-b border-neutral-100' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 text-neutral-500" />
                    <span className="flex-1 text-body-1 text-neutral-800">{setting.label}</span>
                    {setting.badge && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-400 text-caption rounded-pill">
                        {setting.badge}
                      </span>
                    )}
                    {setting.hasToggle && (
                      <div className="w-11 h-6 bg-primary-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                      </div>
                    )}
                    {!setting.hasToggle && !setting.badge && (
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                )
              })}
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div variants={staggerItem} className="pb-8 flex flex-col gap-2">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-4 text-body-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              온보딩 다시하기
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-body-2 text-red-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </motion.div>
        </StaggerChildren>
      </PageContainer>
    </PageTransition>
  )
}
