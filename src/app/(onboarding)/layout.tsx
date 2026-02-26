'use client'

import { useAuthGuard } from '@/lib/useAuthGuard'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ready = useAuthGuard('onboarding')

  if (!ready) {
    return <div className="min-h-screen bg-white" />
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
