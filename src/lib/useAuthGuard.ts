'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

type GuardType = 'auth' | 'onboarding' | 'main'

export function useAuthGuard(type: GuardType) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isComplete = useOnboardingStore((s) => s.isComplete)

  // 클라이언트 마운트 감지 - useEffect 시점에 localStorage rehydrate 완료됨
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (type === 'auth') {
      if (isAuthenticated && isComplete) {
        router.replace('/home')
        return
      }
      if (isAuthenticated && !isComplete) {
        router.replace('/type')
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
        router.replace('/type')
        return
      }
    }

    setReady(true)
  }, [type, router, mounted, isAuthenticated, isComplete])

  return ready
}
