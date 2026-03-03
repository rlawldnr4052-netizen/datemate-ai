'use client'

import NavBar from '@/components/layout/NavBar'
import { useAuthGuard } from '@/lib/useAuthGuard'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ready = useAuthGuard('main')

  if (!ready) {
    return <div className="min-h-screen bg-neutral-50" />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
      <NavBar />
    </div>
  )
}
