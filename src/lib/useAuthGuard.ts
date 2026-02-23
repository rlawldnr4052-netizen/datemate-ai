'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

type GuardType = 'auth' | 'onboarding' | 'main'

export function useAuthGuard(type: GuardType) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isComplete = useOnboardingStore((s) => s.isComplete)

  // Zustand persist hydration 대기 (두 스토어 모두)
  useEffect(() => {
    const check = () => {
      if (useAuthStore.persist.hasHydrated() && useOnboardingStore.persist.hasHydrated()) {
        setHydrated(true)
      }
    }

    check()

    const unsub1 = useAuthStore.persist.onFinishHydration(check)
    const unsub2 = useOnboardingStore.persist.onFinishHydration(check)

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  // hydration 완료 후 라우팅 결정
  useEffect(() => {
    if (!hydrated) return

    if (type === 'auth') {
      if (isAuthenticated && isComplete) {
        router.replace('/home')
        return
      }
      if (isAuthenticated && !isComplete) {
        router.replace('/profile-details')
        return
      }
    }

    if (type === 'onboarding') {
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }
    }

    if (type === 'main') {
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }
      if (!isComplete) {
        router.replace('/profile-details')
        return
      }
    }

    setReady(true)
  }, [hydrated, type, router, isAuthenticated, isComplete])

  return ready
}
