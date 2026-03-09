'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Unlock, Eye, Sparkles, Navigation, MapPin, Clock } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import PageTransition from '@/components/motion/PageTransition'

export default function BlindCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { courses, unlockStop, setMode } = useCourseStore()
  const course = courses.find((c) => c.id === params.id)

  if (!course) return null

  const handleUnlock = (stopOrder: number) => {
    unlockStop(course.id, stopOrder)
  }

  const handleSwitchToStandard = () => {
    setMode('standard')
    router.push(`/course/${course.id}`)
  }

  const handleStartAdventure = () => {
    router.push(`/course/${course.id}/map`)
  }

  const glass = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  // Only first stop is initially unlocked; rest stay locked until GPS arrival
  const unlockedCount = course.stops.filter((s) => s.isUnlocked).length

  return (
    <PageTransition className="min-h-screen bg-[#0B0B12] pb-32">
      {/* Hero */}
      <div className="relative h-[280px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e1b4b 100%)' }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.25) 0%, transparent 60%)',
              'radial-gradient(circle at 70% 60%, rgba(124,58,237,0.25) 0%, transparent 60%)',
              'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.25) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: 'rgba(165,180,252,0.4)',
              left: `${10 + i * 15}%`,
              top: `${25 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={handleSwitchToStandard}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
          >
            <Eye className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center px-8"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-300/80" />
            <h1 className="text-[22px] font-bold text-white mb-1.5">{course.blindTitle}</h1>
            <p className="text-[14px] text-white/60">{course.blindSubtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Course info bar */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[12px] text-neutral-500">
          <Clock className="w-3.5 h-3.5" />
          {Math.floor(course.totalDuration / 60)}시간
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-neutral-500">
          <MapPin className="w-3.5 h-3.5" />
          {course.stops.length}곳
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-indigo-400">
          <Unlock className="w-3.5 h-3.5" />
          {unlockedCount}/{course.stops.length} 공개
        </span>
      </div>

      {/* Notice */}
      <div className="px-5 pb-4">
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}
        >
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <p className="text-[12px] text-indigo-300/80">GPS 도착 시 다음 장소가 공개됩니다</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5">
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[23px] top-6 bottom-6 w-[1px]"
            style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.3), rgba(255,255,255,0.06))' }}
          />

          {course.stops.map((stop, i) => (
            <motion.div
              key={stop.place.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex gap-4 mb-5 last:mb-0"
            >
              {/* Timeline node */}
              <div
                className="flex-shrink-0 w-[48px] h-[48px] rounded-full flex items-center justify-center z-10"
                style={
                  stop.isUnlocked
                    ? { background: 'linear-gradient(135deg, #6366F1, #7C3AED)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {stop.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                {stop.isUnlocked ? (
                  /* Unlocked: show real info */
                  <motion.div
                    initial={{ filter: 'blur(8px)', scale: 0.97 }}
                    animate={{ filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ ...glass, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                  >
                    {stop.place.imageUrls[0] && (
                      <div
                        className="h-[130px] bg-cover bg-center"
                        style={{ backgroundImage: `url(${stop.place.imageUrls[0]})` }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-[14px] font-bold text-neutral-200">{stop.place.name}</h3>
                      <p className="text-[12px] text-neutral-500 mt-1 line-clamp-2">{stop.place.description}</p>
                    </div>
                  </motion.div>
                ) : (
                  /* Locked: no image, only hint */
                  <div
                    className="rounded-2xl p-4"
                    style={{ ...glass }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                        Stop {stop.order}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-neutral-400 mb-1">
                      {stop.place.blindTitle || '???'}
                    </p>
                    <p className="text-[12px] text-neutral-600 italic">
                      &ldquo;{stop.place.blindHint || '도착하면 공개됩니다'}&rdquo;
                    </p>

                    {/* Simulate GPS unlock (dev only) */}
                    <button
                      onClick={() => handleUnlock(stop.order)}
                      className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.15)' }}
                    >
                      <Navigation className="w-3 h-3" />
                      잠금 해제
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-5 z-20"
        style={{ background: 'linear-gradient(to top, #0B0B12 60%, transparent)' }}
      >
        <div className="flex gap-3">
          <button
            onClick={handleSwitchToStandard}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            스탠다드 보기
          </button>
          <button
            onClick={handleStartAdventure}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
          >
            모험 시작
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
