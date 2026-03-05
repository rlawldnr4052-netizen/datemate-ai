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
    return <div className="min-h-screen bg-[#0B0B12]" />
  }

  return (
    <div className="min-h-screen bg-[#0B0B12]">
      {children}
      <NavBar />
    </div>
  )
}
