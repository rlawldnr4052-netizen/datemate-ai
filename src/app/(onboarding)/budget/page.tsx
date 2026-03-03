'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { budgetOptions } from '@/data/tags'
import { BudgetLevel } from '@/types/onboarding'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function BudgetPage() {
  const router = useRouter()
  const { selectedBudget, setBudget } = useOnboardingStore()
  const [selected, setSelected] = useState<BudgetLevel | null>(selectedBudget)

  const handleSelect = (budget: BudgetLevel) => {
    setSelected(budget)
    setBudget(budget)
  }

  const handleNext = () => {
    if (selected) {
      router.push('/complete')
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar title="예산 설정" />
      <ProgressBar progress={5 / 5} className="mx-5" />

      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-title-1 text-neutral-900 mb-2">
            예산은 어느 정도?
          </h1>
          <p className="text-body-2 text-neutral-500 mb-6">
            1인 기준 예산에 맞는 코스를 추천해 드려요
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 flex-1">
          {budgetOptions.map((option, i) => {
            const isSelected = selected === option.id
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(option.id)}
                className={`
                  relative rounded-3xl overflow-hidden transition-all duration-200
                  ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2 shadow-card-hover' : 'shadow-card'}
                `}
              >
                <div
                  className="flex items-center gap-4 p-5"
                  style={{ background: option.gradient, opacity: 0.9 }}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <div className="flex-1 text-left">
                    <span className="text-white font-bold text-title-2 block">{option.label}</span>
                    <span className="text-white/80 text-caption block mt-0.5">{option.description}</span>
                  </div>
                  <span className="text-white font-bold text-body-2 bg-white/20 px-3 py-1.5 rounded-full">
                    {option.range}
                  </span>
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
