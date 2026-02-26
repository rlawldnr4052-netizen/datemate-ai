'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { preferenceTags, balanceQuestions } from '@/data/tags'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import PageTransition from '@/components/motion/PageTransition'

type Phase = 'swipe' | 'balance'

const categoryLabels: Record<string, string> = {
  vibe: '분위기',
  place: '장소',
  food: '음식',
  activity: '활동',
  style: '스타일',
  time: '시간대',
}

export default function PreferencesPage() {
  const router = useRouter()
  const { addLikedTag, addDislikedTag, setBalanceAnswer } = useOnboardingStore()
  const [phase, setPhase] = useState<Phase>('swipe')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [currentBalanceIndex, setCurrentBalanceIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [dragX, setDragX] = useState(0)

  const currentTag = preferenceTags[currentCardIndex]
  const currentBalance = balanceQuestions[currentBalanceIndex]
  const totalCards = preferenceTags.length
  const isLastCard = currentCardIndex >= totalCards - 1

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (!currentTag) return
    setDirection(dir)
    if (dir === 'right') {
      addLikedTag(currentTag.id)
    } else {
      addDislikedTag(currentTag.id)
    }

    setTimeout(() => {
      if (isLastCard) {
        setPhase('balance')
      } else {
        setCurrentCardIndex((prev) => prev + 1)
      }
      setDirection(null)
      setDragX(0)
    }, 300)
  }, [currentTag, isLastCard, addLikedTag, addDislikedTag])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right')
    } else if (info.offset.x < -100) {
      handleSwipe('left')
    }
    setDragX(0)
  }

  const handleBalanceSelect = (optionId: string) => {
    setBalanceAnswer(currentBalance.id, optionId)
    if (currentBalanceIndex >= balanceQuestions.length - 1) {
      router.push('/vibe')
    } else {
      setCurrentBalanceIndex((prev) => prev + 1)
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar title="취향 스캔" />
      <ProgressBar progress={3 / 4} className="mx-5" />

      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col">
        {phase === 'swipe' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-title-2 text-neutral-900 mb-1">좋아하는 키워드를 골라주세요</h2>
              <p className="text-body-2 text-neutral-500">
                오른쪽 = 좋아요, 왼쪽 = 별로예요
              </p>
            </div>

            {/* Card Stack */}
            <div className="relative flex-1 flex items-center justify-center mb-6">
              <div className="relative w-full max-w-[300px] aspect-[3/4]">
                {/* Background cards */}
                {preferenceTags.slice(currentCardIndex + 1, currentCardIndex + 3).reverse().map((tag, i) => (
                  <motion.div
                    key={tag.id}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-card"
                    style={{
                      scale: 0.95 - (1 - i) * 0.03,
                      y: (1 - i) * 8,
                      background: tag.gradient,
                      opacity: 0.6,
                    }}
                  />
                ))}

                {/* Current card */}
                <AnimatePresence>
                  {currentTag && !direction && (
                    <motion.div
                      key={currentTag.id}
                      className="absolute inset-0 rounded-3xl overflow-hidden shadow-float cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.8}
                      onDrag={(_, info) => setDragX(info.offset.x)}
                      onDragEnd={handleDragEnd}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        x: direction === 'right' ? 300 : -300,
                        opacity: 0,
                        rotate: direction === 'right' ? 15 : -15,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{ rotate: dragX * 0.05, background: currentTag.gradient }}
                    >
                      <div className="w-full h-full relative flex flex-col items-center justify-center p-6">
                        {/* Category badge */}
                        <div className="absolute top-5 left-5">
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium">
                            {categoryLabels[currentTag.category] || currentTag.category}
                          </span>
                        </div>

                        {/* Swipe indicators */}
                        <motion.div
                          className="absolute top-5 right-5 px-3 py-1.5 rounded-full border-2 border-red-300 bg-red-400/20"
                          style={{ opacity: Math.min(Math.max(-dragX / 100, 0), 1) }}
                        >
                          <span className="text-red-300 font-bold text-sm">NOPE</span>
                        </motion.div>
                        <motion.div
                          className="absolute top-5 left-5 px-3 py-1.5 rounded-full border-2 border-green-300 bg-green-400/20"
                          style={{ opacity: Math.min(Math.max(dragX / 100, 0), 1) }}
                        >
                          <span className="text-green-300 font-bold text-sm">LIKE</span>
                        </motion.div>

                        {/* Main content */}
                        <motion.span
                          className="text-6xl mb-4"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {currentTag.emoji}
                        </motion.span>
                        <h3 className="text-white font-bold text-2xl mb-2 text-center">
                          {currentTag.label}
                        </h3>
                        <p className="text-white/80 text-sm text-center">
                          {currentTag.description}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {direction && currentTag && (
                    <motion.div
                      key={`exit-${currentTag.id}`}
                      className="absolute inset-0 rounded-3xl overflow-hidden shadow-float flex items-center justify-center"
                      style={{ background: currentTag.gradient }}
                      initial={{ x: 0, rotate: 0 }}
                      animate={{
                        x: direction === 'right' ? 400 : -400,
                        rotate: direction === 'right' ? 20 : -20,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-6xl">{currentTag.emoji}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center border border-neutral-200"
              >
                <X className="w-7 h-7 text-neutral-400" />
              </motion.button>

              <div className="text-caption text-neutral-400">
                {currentCardIndex + 1} / {totalCards}
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 shadow-card flex items-center justify-center"
              >
                <Heart className="w-7 h-7 text-white" />
              </motion.button>
            </div>
          </>
        ) : (
          /* Balance Game Phase */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-6">
              <h2 className="text-title-2 text-neutral-900 mb-1">밸런스 게임</h2>
              <p className="text-body-2 text-neutral-500">
                끌리는 쪽을 선택해주세요 ({currentBalanceIndex + 1}/{balanceQuestions.length})
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {currentBalance && (
                  <motion.div
                    key={currentBalance.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex-1 flex flex-col gap-4"
                  >
                    {[currentBalance.optionA, currentBalance.optionB].map((option, i) => (
                      <motion.button
                        key={option.id}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleBalanceSelect(option.id)}
                        className="flex-1 relative rounded-3xl overflow-hidden shadow-card group"
                        style={{ background: option.gradient }}
                      >
                        <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-3 p-6">
                          <span className="text-5xl">{option.emoji}</span>
                          <span className="text-white font-bold text-xl">{option.label}</span>
                        </div>
                        {i === 0 && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                            <span className="text-body-2 font-bold text-neutral-300 bg-white px-3 py-1 rounded-full shadow-sm text-xs">VS</span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
