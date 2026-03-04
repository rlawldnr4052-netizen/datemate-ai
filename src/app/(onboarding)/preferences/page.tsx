'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { preferenceTags } from '@/data/tags'
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
  const { likedTags, toggleLikedTag } = useOnboardingStore()
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(likedTags))

  const groupedTags = useMemo(() => {
    const groups: Record<string, typeof preferenceTags> = {}
    for (const tag of preferenceTags) {
      if (!groups[tag.category]) groups[tag.category] = []
      groups[tag.category].push(tag)
    }
    return groups
  }, [])

  const handleToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      return next
    })
    toggleLikedTag(tagId)
  }

  const handleNext = () => {
    if (selectedTags.size >= 3) {
      router.push('/vibe')
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar title="취향 선택" />
      <ProgressBar progress={3 / 5} className="mx-5" />

      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-title-1 text-neutral-900 mb-1">
            관심 있는 키워드를 골라주세요
          </h1>
          <p className="text-body-2 text-neutral-500 mb-6">
            3개 이상 선택하면 취향에 맞는 코스를 추천해드려요
          </p>
        </motion.div>

        <div className="flex-1 overflow-y-auto space-y-5 pb-4">
          {categoryOrder.map((category) => {
            const tags = groupedTags[category]
            if (!tags) return null

            return (
              <div key={category}>
                <p className="text-caption font-semibold text-neutral-400 mb-2.5">
                  {categoryLabels[category]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => {
                    const isSelected = selectedTags.has(tag.id)

                    return (
                      <motion.button
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => handleToggle(tag.id)}
                        className={`
                          relative flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-body-2 font-medium transition-all
                          ${isSelected
                            ? 'text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }
                        `}
                        style={isSelected ? { background: tag.gradient } : undefined}
                      >
                        <span className="text-base">{tag.emoji}</span>
                        <span>{tag.label}</span>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-0.5"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <p className="text-center text-caption text-neutral-400 mb-3">
            {selectedTags.size}개 선택됨 {selectedTags.size < 3 && `(최소 3개)`}
          </p>
          <Button
            fullWidth
            size="lg"
            disabled={selectedTags.size < 3}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
