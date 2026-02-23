'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { preferenceTags, vibeOptions } from '@/data/tags'
import { Vibe } from '@/types/onboarding'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

const categoryLabels: Record<string, string> = {
  vibe: '분위기',
  place: '장소',
  food: '음식',
  activity: '활동',
  style: '스타일',
  time: '시간대',
}

const categoryOrder = ['vibe', 'place', 'food', 'activity', 'style', 'time']

export default function PreferencesPage() {
  const router = useRouter()
  const { setVibe } = useOnboardingStore()
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      return next
    })
  }

  const handleNext = () => {
    const store = useOnboardingStore.getState()
    preferenceTags.forEach((tag) => {
      if (selectedTags.has(tag.id)) {
        store.addLikedTag(tag.id)
      }
    })
    if (selectedVibe) {
      setVibe(selectedVibe)
    }
    router.push('/complete')
  }

  const tagsByCategory = categoryOrder.map((cat) => ({
    key: cat,
    label: categoryLabels[cat],
    tags: preferenceTags.filter((t) => t.category === cat),
  }))

  const canProceed = selectedTags.size >= 3 && selectedVibe

  return (
    <PageTransition className="min-h-screen flex flex-col bg-neutral-50">
      <TopBar title="취향 선택" />
      <ProgressBar progress={2 / 3} className="mx-5" />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-title-1 text-neutral-900 mb-1">
            관심 키워드를 골라주세요
          </h1>
          <p className="text-body-2 text-neutral-500">
            3개 이상 선택하면 맞춤 코스를 추천해드려요
          </p>
        </motion.div>

        {tagsByCategory.map((group, gi) => (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
            className="mb-5"
          >
            <p className="text-caption font-semibold text-neutral-400 mb-2">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const isSelected = selectedTags.has(tag.id)
                return (
                  <motion.button
                    key={tag.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleTag(tag.id)}
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      background: isSelected ? tag.gradient : 'white',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(0,0,0,0.12)'
                        : '0 1px 4px rgba(0,0,0,0.06)',
                      border: isSelected ? 'none' : '1px solid #e5e7eb',
                    }}
                  >
                    <div className="flex items-center gap-1.5 px-3.5 py-2.5">
                      <span className="text-base">{tag.emoji}</span>
                      <span
                        className="text-body-2 font-semibold"
                        style={{ color: isSelected ? 'white' : '#374151' }}
                      >
                        {tag.label}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <p className="text-caption font-semibold text-neutral-400 mb-2">오늘의 무드</p>
          <div className="grid grid-cols-3 gap-2">
            {vibeOptions.map((vibe) => {
              const isSelected = selectedVibe === vibe.id
              return (
                <motion.button
                  key={vibe.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className="relative rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: isSelected ? vibe.gradient : 'white',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(0,0,0,0.12)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                    border: isSelected ? 'none' : '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex flex-col items-center gap-1 py-3 px-2">
                    <span className="text-2xl">{vibe.emoji}</span>
                    <span
                      className="text-caption font-bold"
                      style={{ color: isSelected ? 'white' : '#374151' }}
                    >
                      {vibe.label}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/40 flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-neutral-50 via-neutral-50 to-neutral-50/0">
        <div className="max-w-app mx-auto">
          <Button
            fullWidth
            size="lg"
            disabled={!canProceed}
            onClick={handleNext}
          >
            {selectedTags.size > 0
              ? `${selectedTags.size}개 선택 · 다음`
              : '3개 이상 선택해주세요'
            }
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
