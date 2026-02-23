'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Heart, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { preferenceTags, balanceQuestions } from '@/data/tags'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

type Phase = 'swipe' | 'balance'

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
      <ProgressBar progress={2 / 3} className="mx-5" />

      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col">
        {phase === 'swipe' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-title-2 text-neutral-900 mb-1">좋아하는 분위기를 골라주세요</h2>
              <p className="text-body-2 text-neutral-500">
                오른쪽으로 밀면 좋아요, 왼쪽으로 밀면 패스
              </p>
            </div>

            {/* Card Stack */}
            <div className="relative flex-1 flex items-center justify-center mb-6">
              <div className="relative w-full max-w-[320px] aspect-[3/4]">
                {/* Background cards */}
                {preferenceTags.slice(currentCardIndex + 1, currentCardIndex + 3).reverse().map((tag, i) => (
                  <motion.div
                    key={tag.id}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-card"
                    style={{
                      scale: 0.95 - (1 - i) * 0.03,
                      y: (1 - i) * 8,
                    }}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${tag.imageUrl})` }}
                    />
                  </motion.div>
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
                      style={{ rotate: dragX * 0.05 }}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${currentTag.imageUrl})` }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Swipe indicators */}
                        <motion.div
                          className="absolute top-6 left-6 px-4 py-2 rounded-pill border-2 border-red-400 bg-red-400/20"
                          style={{ opacity: Math.min(Math.max(-dragX / 100, 0), 1) }}
                        >
                          <span className="text-red-400 font-bold text-lg">NOPE</span>
                        </motion.div>
                        <motion.div
                          className="absolute top-6 right-6 px-4 py-2 rounded-pill border-2 border-green-400 bg-green-400/20"
                          style={{ opacity: Math.min(Math.max(dragX / 100, 0), 1) }}
                        >
                          <span className="text-green-400 font-bold text-lg">LIKE</span>
                        </motion.div>

                        {/* Tag info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-pill text-white font-semibold text-title-2">
                            {currentTag.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {direction && currentTag && (
                    <motion.div
                      key={`exit-${currentTag.id}`}
                      className="absolute inset-0 rounded-3xl overflow-hidden shadow-float"
                      initial={{ x: 0, rotate: 0 }}
                      animate={{
                        x: direction === 'right' ? 400 : -400,
                        rotate: direction === 'right' ? 20 : -20,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentTag.imageUrl})` }}
                      />
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
                        onClick={() => handleBalanceSelect(option.id)}
                        className="flex-1 relative rounded-3xl overflow-hidden shadow-card group"
                      >
                        <div
                          className="w-full h-full bg-cover bg-center min-h-[180px]"
                          style={{ backgroundImage: `url(${option.imageUrl})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all" />
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <span className="text-white font-semibold text-title-2">{option.label}</span>
                          </div>
                        </div>
                        {i === 0 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[calc(100%+8px)] z-10">
                            <span className="text-body-2 font-bold text-neutral-400">VS</span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentBalanceIndex >= balanceQuestions.length - 1 && (
              <div className="pt-4">
                <Button fullWidth size="lg" onClick={() => router.push('/vibe')} icon={<ArrowRight className="w-5 h-5" />}>
                  다음으로
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
