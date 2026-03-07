'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import Logo from '@/components/ui/Logo'

export default function SplashPage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const timer = setTimeout(() => setShowContent(true), 600)
    return () => clearTimeout(timer)
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
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,58,237,0.08) 0%, transparent 60%), linear-gradient(180deg, #0D0B14 0%, #0B0B12 100%)' }}
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
                ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
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

      {/* 메인 콘텐츠: 클라이언트 하이드레이션 후에만 렌더 (SSR시 initial 스타일로 안보이는 문제 방지) */}
      {hydrated && (
        <>
          <motion.div className="relative z-10 flex flex-col items-center gap-8 px-8">
            {/* Logo */}
            <Logo size={108} animate />

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center"
            >
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, color: 'rgba(255,255,255,0.92)', marginBottom: '8px' }}>
                데이트메이트
              </h1>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)' }}>
                AI가 만드는 나만의 맞춤 코스
              </p>
            </motion.div>

            {/* CTA */}
            <AnimatePresence>
              {showContent && !isReturningUser && (
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push('/signup')}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 350, damping: 18, mass: 0.8 }}
                  style={{
                    marginTop: '16px',
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(124,58,237,0.8))',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: 'white',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.2)',
                    position: 'relative' as const,
                    overflow: 'hidden',
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
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#818CF8' }}
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
            style={{ position: 'absolute', bottom: 40, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}
          >
            결정 피로는 끝, AI가 코스를 결정합니다
          </motion.p>
        </>
      )}
    </div>
  )
}
