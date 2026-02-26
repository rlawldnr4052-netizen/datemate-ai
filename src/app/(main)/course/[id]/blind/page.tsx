'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Unlock, Eye, Sparkles, Navigation } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useQuestStore } from '@/stores/useQuestStore'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function BlindCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { courses, unlockStop, setMode } = useCourseStore()
  const { startQuest } = useQuestStore()
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
    const missions = course.stops
      .filter((s) => s.questMission)
      .map((s) => s.questMission!)
    startQuest(course.id, missions)
    router.push('/quest')
  }

  return (
    <PageTransition className="min-h-screen pb-32">
      {/* Blind Hero */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-secondary-300 to-accent-300" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, rgba(255,107,82,0.3) 0%, transparent 60%)',
              'radial-gradient(circle at 70% 60%, rgba(255,107,138,0.3) 0%, transparent 60%)',
              'radial-gradient(circle at 30% 40%, rgba(255,107,82,0.3) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute top-0 left-0 right-0 z-10">
          <TopBar transparent rightAction={
            <button onClick={handleSwitchToStandard} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md">
              <Eye className="w-5 h-5 text-white" />
            </button>
          } />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-white px-8"
          >
            <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h1 className="text-display mb-2">{course.blindTitle}</h1>
            <p className="text-body-1 opacity-80">{course.blindSubtitle}</p>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Blind Timeline */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-neutral-400" />
          <p className="text-body-2 text-neutral-500">GPS 도착 시 다음 장소가 공개됩니다</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-neutral-200" />

          {course.stops.map((stop, i) => (
            <motion.div
              key={stop.place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex gap-4 mb-6 last:mb-0"
            >
              {/* Timeline node */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-md
                ${stop.isUnlocked
                  ? 'bg-gradient-to-br from-primary-400 to-primary-500'
                  : 'bg-neutral-200'
                }
              `}>
                {stop.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                {stop.isUnlocked ? (
                  /* Unlocked: show real info */
                  <motion.div
                    initial={{ filter: 'blur(10px)', scale: 0.95 }}
                    animate={{ filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <div
                      className="h-[120px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${stop.place.imageUrls[0]})` }}
                    />
                    <div className="p-4">
                      <h3 className="text-title-2 text-neutral-900">{stop.place.name}</h3>
                      <p className="text-body-2 text-neutral-500 mt-1">{stop.place.description}</p>
                    </div>
                  </motion.div>
                ) : (
                  /* Locked: show hint */
                  <div className="bg-neutral-100 rounded-2xl p-5 border border-neutral-200 border-dashed">
                    <p className="text-title-2 text-neutral-700 mb-2">{stop.place.blindTitle}</p>
                    <p className="text-body-2 text-neutral-500 italic mb-4">
                      &ldquo;{stop.place.blindHint}&rdquo;
                    </p>

                    {/* Simulate GPS unlock */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnlock(stop.order)}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-pill shadow-sm text-body-2 font-medium text-primary-500 border border-primary-200"
                    >
                      <Navigation className="w-4 h-4" />
                      잠금 해제 (시뮬레이션)
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-5 bg-gradient-to-t from-white via-white to-white/0">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleSwitchToStandard}>
            스탠다드로 전환
          </Button>
          <Button className="flex-1" onClick={handleStartAdventure}>
            모험 시작
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
