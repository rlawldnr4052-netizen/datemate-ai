'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle2, Circle, Trophy, ChevronRight, Film, Zap } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useQuestStore } from '@/stores/useQuestStore'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import PageContainer from '@/components/layout/PageContainer'
import PageTransition from '@/components/motion/PageTransition'

export default function QuestPage() {
  const router = useRouter()
  const { activeQuest, isQuestEnabled, toggleQuest, completeMission } = useQuestStore()
  const { courses } = useCourseStore()
  const [showClearAnimation, setShowClearAnimation] = useState(false)

  const course = activeQuest ? courses.find((c) => c.id === activeQuest.courseId) : null
  const completedMissions = activeQuest?.missions.filter((m) => m.isCompleted).length || 0
  const totalMissions = activeQuest?.missions.length || 0
  const progress = totalMissions > 0 ? completedMissions / totalMissions : 0


  const handleCompleteMission = (missionId: string) => {
    completeMission(missionId)

    // Check if all complete after this
    const newCompleted = (activeQuest?.missions.filter((m) => m.isCompleted || m.id === missionId).length || 0)
    if (newCompleted === totalMissions) {
      setTimeout(() => setShowClearAnimation(true), 500)
    }
  }

  return (
    <PageTransition>
      <TopBar
        title="퀘스트"
        showBack={false}
        rightAction={
          <button
            onClick={toggleQuest}
            className={`
              px-3 py-1.5 rounded-pill text-caption font-medium transition-colors
              ${isQuestEnabled ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-500'}
            `}
          >
            {isQuestEnabled ? 'ON' : 'OFF'}
          </button>
        }
      />

      <PageContainer>
        {activeQuest && course ? (
          <div className="py-4">
            {/* Course info */}
            <Card className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-title-2 text-neutral-900">{course.title}</h2>
                  <p className="text-caption text-neutral-400">진행중인 퀘스트</p>
                </div>
              </div>
              <ProgressBar progress={progress} className="mb-2" />
              <p className="text-caption text-neutral-500 text-right">
                {completedMissions} / {totalMissions} 완료
              </p>
            </Card>

            {/* Missions */}
            <h3 className="text-title-2 text-neutral-900 mb-4">미션 목록</h3>
            <div className="flex flex-col gap-3">
              {activeQuest.missions.map((mission, i) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`flex items-center gap-4 ${mission.isCompleted ? 'bg-primary-50/50' : ''}`}
                    onClick={() => !mission.isCompleted && handleCompleteMission(mission.id)}
                  >
                    <div className="flex-shrink-0">
                      {mission.isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle2 className="w-8 h-8 text-primary-500" />
                        </motion.div>
                      ) : (
                        <Circle className="w-8 h-8 text-neutral-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-body-2 font-medium ${mission.isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                        {mission.description}
                      </p>
                    </div>
                    {!mission.isCompleted && (
                      <button className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-primary-500" />
                      </button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Short form preview */}
            {completedMissions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-title-2 text-neutral-900 mb-4">숏폼 미리보기</h3>
                <Card
                  hover
                  onClick={() => router.push('/quest/result')}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-300 flex items-center justify-center">
                    <Film className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-1 font-semibold text-neutral-900">오늘의 숏폼 만들기</p>
                    <p className="text-caption text-neutral-400">{completedMissions}장의 사진으로 영상 생성</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Card>
              </motion.div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-neutral-300" />
              </div>
            </motion.div>
            <h2 className="text-title-2 text-neutral-700 mb-2">아직 진행중인 퀘스트가 없어요</h2>
            <p className="text-body-2 text-neutral-400 text-center mb-6">
              코스를 시작하면 퀘스트가 자동으로 생성돼요
            </p>
            <Button onClick={() => router.push('/course')}>
              코스 둘러보기
            </Button>
          </div>
        )}
      </PageContainer>

      {/* Quest Clear Overlay */}
      <AnimatePresence>
        {showClearAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center"
            onClick={() => setShowClearAnimation(false)}
          >
            {/* Confetti */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#FF6B52', '#FFB4B4', '#FFA726', '#FF6B8A', '#FFCC80', '#4CAF50'][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                }}
                animate={{
                  y: ['0vh', '120vh'],
                  x: [0, (Math.random() - 0.5) * 300],
                  rotate: [0, Math.random() * 1080],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.7, 1] }}
              className="text-center"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,107,82,0.3)',
                    '0 0 60px rgba(255,107,82,0.6)',
                    '0 0 20px rgba(255,107,82,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-14 h-14 text-white" />
              </motion.div>
              <h1 className="text-display text-white mb-2">QUEST CLEAR!</h1>
              <p className="text-body-1 text-white/80">{course?.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
