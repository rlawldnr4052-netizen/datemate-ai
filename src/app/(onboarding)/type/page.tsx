'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, User, Users, Check } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { DateType } from '@/types/onboarding'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'
import StaggerChildren, { staggerItem } from '@/components/motion/StaggerChildren'

const typeOptions: { type: DateType; label: string; description: string; icon: typeof Heart; gradient: string }[] = [
  {
    type: 'couple',
    label: '연인과 함께',
    description: '로맨틱한 데이트 코스를 찾고 있어요',
    icon: Heart,
    gradient: 'from-rose-400 to-pink-400',
  },
  {
    type: 'solo',
    label: '나 혼자서',
    description: '나만의 아지트와 힐링 코스가 필요해요',
    icon: User,
    gradient: 'from-violet-400 to-purple-400',
  },
  {
    type: 'friends',
    label: '친구들과',
    description: '결정 고민 없이 빠르게 놀고 싶어요',
    icon: Users,
    gradient: 'from-amber-400 to-orange-400',
  },
]

export default function TypePage() {
  const router = useRouter()
  const { dateType, setDateType } = useOnboardingStore()
  const [selected, setSelected] = useState<DateType | null>(dateType)

  const handleSelect = (type: DateType) => {
    setSelected(type)
    setDateType(type)
  }

  const handleNext = () => {
    if (selected) {
      router.push('/preferences')
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar showBack={true} onBack={() => router.push('/')} />
      <ProgressBar progress={1 / 3} className="mx-5" />

      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-title-1 text-neutral-900 mb-2">
            누구와 함께하시나요?
          </h1>
          <p className="text-body-2 text-neutral-500 mb-8">
            함께하는 사람에 맞춰 코스를 추천해 드릴게요
          </p>
        </motion.div>

        <StaggerChildren staggerDelay={0.1} className="flex flex-col gap-3 flex-1">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selected === option.type

            return (
              <motion.div
                key={option.type}
                variants={staggerItem}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.type)}
                className={`
                  relative p-5 rounded-card border-2 cursor-pointer transition-all duration-200
                  ${isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-card'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.gradient}
                    ${isSelected ? 'shadow-md' : ''}
                  `}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-2 text-neutral-900">{option.label}</h3>
                    <p className="text-body-2 text-neutral-500 mt-0.5">{option.description}</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </StaggerChildren>

        <div className="pt-4">
          <Button
            fullWidth
            size="lg"
            disabled={!selected}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
