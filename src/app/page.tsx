'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { Heart, Sparkles } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600)
    return () => clearTimeout(timer)
  }, [])

  // persist hydration 대기
  useEffect(() => {
    const check = () => {
      if (useAuthStore.persist.hasHydrated() && useOnboardingStore.persist.hasHydrated()) {
        setHydrated(true)
      }
    }
    check()
    const unsub1 = useAuthStore.persist.onFinishHydration(check)
    const unsub2 = useOnboardingStore.persist.onFinishHydration(check)
    return () => { unsub1(); unsub2() }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    const isComplete = useOnboardingStore.getState().isComplete
    if (isAuthenticated && isComplete) {
      const timer = setTimeout(() => router.push('/home'), 1500)
      return () => clearTimeout(timer)
    }
    if (isAuthenticated && !isComplete) {
      const timer = setTimeout(() => router.push('/type'), 1500)
      return () => clearTimeout(timer)
    }
  }, [hydrated, router])

  const isAuthenticated = hydrated ? useAuthStore.getState().isAuthenticated : false
  const isComplete = hydrated ? useOnboardingStore.getState().isComplete : false
  const isReturningUser = isAuthenticated && isComplete

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #ffffff, #FFF5F3, #FFF5F7)' }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${60 + i * 40}px`,
              height: `${60 + i * 40}px`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, #FFE8E3 0%, transparent 70%)'
                : 'radial-gradient(circle, #FFD0C7 0%, transparent 70%)',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <motion.div className="relative z-10 flex flex-col items-center gap-8 px-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-float"
            style={{ background: 'linear-gradient(135deg, #FF8A75, #E8523A)' }}
          >
            <Heart className="w-12 h-12 text-white" fill="white" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: '#FFA726' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, color: '#1A1715', marginBottom: '8px' }}>
            데이트메이트
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, color: '#7D756E' }}>
            AI가 만드는 완벽한 데이트 코스
          </p>
        </motion.div>

        {/* CTA */}
        <AnimatePresence>
          {showContent && !isReturningUser && (
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/signup')}
              style={{
                marginTop: '16px',
                padding: '16px 40px',
                background: 'linear-gradient(90deg, #FF6B52, #FF8A75)',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 12px 40px rgba(255, 107, 82, 0.3)',
              }}
            >
              시작하기
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading indicator for returning users */}
        {isReturningUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1.5 mt-4"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8A75' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 40, fontSize: '0.75rem', color: '#A9A29B' }}
      >
        결정 피로는 끝, AI가 코스를 결정합니다
      </motion.p>
    </div>
  )
}
