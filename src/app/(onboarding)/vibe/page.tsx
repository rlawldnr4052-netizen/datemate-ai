'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { vibeOptions } from '@/data/tags'
import { Vibe } from '@/types/onboarding'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function VibePage() {
  const router = useRouter()
  const { selectedVibe, setVibe } = useOnboardingStore()
  const [selected, setSelected] = useState<Vibe | null>(selectedVibe)

  const handleSelect = (vibe: Vibe) => {
    setSelected(vibe)
    setVibe(vibe)
  }

  const handleNext = () => {
    if (selected) {
      router.push('/complete')
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar title="무드 선택" />
      <ProgressBar progress={3 / 3} className="mx-5" />

      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-title-1 text-neutral-900 mb-2">
            오늘의 무드는?
          </h1>
          <p className="text-body-2 text-neutral-500 mb-6">
            원하는 분위기를 선택하면 맞춤 코스를 만들어 드려요
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {vibeOptions.map((vibe, i) => {
            const isSelected = selected === vibe.id

            return (
              <motion.button
                key={vibe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleSelect(vibe.id)}
                className={`
                  relative aspect-square rounded-3xl overflow-hidden transition-all duration-200
                  ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2 shadow-card-hover' : 'shadow-card'}
                `}
              >
                <div className="absolute inset-0" style={{ background: vibe.gradient, opacity: 0.9 }} />
                <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                  <span className="text-4xl">{vibe.emoji}</span>
                  <span className="text-white font-bold text-title-2">{vibe.label}</span>
                  <span className="text-white/80 text-caption">{vibe.description}</span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="pt-4">
          <Button
            fullWidth
            size="lg"
            disabled={!selected}
            onClick={handleNext}
          >
            코스 만들기
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
