'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

type GuardType = 'auth' | 'onboarding' | 'main'

export function useAuthGuard(type: GuardType) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    const isComplete = useOnboardingStore.getState().isComplete

    if (type === 'auth') {
      // Auth pages: if already logged in, redirect away
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
      // Onboarding pages: must be authenticated
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }
    }

    if (type === 'main') {
      // Main pages: must be authenticated + onboarding complete
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
  }, [type, router])

  return ready
}
