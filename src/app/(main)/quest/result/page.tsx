'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Download, Share2, Music, Trophy } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useQuestStore } from '@/stores/useQuestStore'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

const samplePhotos = [
  'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=700&fit=crop',
]

export default function ShortFormResultPage() {
  const { courses } = useCourseStore()
  const { activeQuest } = useQuestStore()
  const course = activeQuest ? courses.find((c) => c.id === activeQuest.courseId) : courses[0]
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showQuestClear, setShowQuestClear] = useState(false)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => {
        const next = (prev + 1) % samplePhotos.length
        if (next === samplePhotos.length - 1) {
          setTimeout(() => setShowQuestClear(true), 800)
        }
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <PageTransition className="h-screen bg-neutral-900 flex flex-col">
      <TopBar title="숏폼 미리보기" transparent className="text-white [&_*]:text-white" />

      <div className="flex-1 relative overflow-hidden mx-4 rounded-3xl">
        {/* Photo Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhotoIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${samplePhotos[currentPhotoIndex]})` }}
          />
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Progress bar */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {samplePhotos.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: i < currentPhotoIndex ? '100%' : i === currentPhotoIndex ? '100%' : '0%',
                }}
                transition={{ duration: i === currentPhotoIndex ? 2 : 0 }}
              />
            </div>
          ))}
        </div>

        {/* Location text overlay */}
        <AnimatePresence mode="wait">
          {course && (
            <motion.div
              key={currentPhotoIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-20 left-6 right-6"
            >
              {course.stops[currentPhotoIndex % course.stops.length] && (
                <p className="text-white text-title-2 font-bold drop-shadow-lg">
                  {course.stops[currentPhotoIndex % course.stops.length].place.name}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Music indicator */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2">
          <Music className="w-4 h-4 text-white/70" />
          <span className="text-caption text-white/70">Sunset Lover - Petit Biscuit</span>
          <div className="flex gap-0.5 items-end h-3 ml-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-white/60 rounded-full"
                animate={{ height: [4, 8 + Math.random() * 4, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Play/Pause control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Quest Clear Overlay */}
        <AnimatePresence>
          {showQuestClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.8, times: [0, 0.6, 1] }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,107,82,0.4)',
                      '0 0 80px rgba(255,107,82,0.7)',
                      '0 0 20px rgba(255,107,82,0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-display text-white tracking-wider">QUEST CLEAR</h2>
                <p className="text-body-1 text-white/80 mt-1">{course?.title}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="p-5 flex gap-3">
        <Button
          variant="secondary"
          className="flex-1 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
          icon={<Download className="w-5 h-5" />}
        >
          저장하기
        </Button>
        <Button
          className="flex-1"
          icon={<Share2 className="w-5 h-5" />}
        >
          공유하기
        </Button>
      </div>
    </PageTransition>
  )
}
