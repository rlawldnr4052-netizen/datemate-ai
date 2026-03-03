'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

export default function CompletePage() {
  const router = useRouter()
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    completeOnboarding()
    const textTimer = setTimeout(() => setShowText(true), 800)
    const redirectTimer = setTimeout(() => router.push('/home'), 2800)
    return () => {
      clearTimeout(textTimer)
      clearTimeout(redirectTimer)
    }
  }, [completeOnboarding, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-primary-50 relative overflow-hidden">
      {/* Confetti particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#FF6B52', '#FFB4B4', '#FFA726', '#FF6B8A', '#FFCC80'][i % 5],
            left: `${Math.random() * 100}%`,
            top: '-5%',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Check circle animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-float">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary-300"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
            transition={{
              duration: 1.5,
              delay: 0.5 + i * 0.3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="text-center"
        >
          <h1 className="text-display text-neutral-900 mb-3">완벽해요!</h1>
          <p className="text-body-1 text-neutral-500 mb-8">
            당신만의 데이트 코스를 준비 중이에요
          </p>

          {/* Loading dots */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-primary-400"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
