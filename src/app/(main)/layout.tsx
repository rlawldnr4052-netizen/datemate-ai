'use client'

import NavBar from '@/components/layout/NavBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
      <NavBar />
    </div>
  )
}
