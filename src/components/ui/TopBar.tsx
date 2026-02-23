'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface TopBarProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
  transparent?: boolean
  className?: string
  onBack?: () => void
}

export default function TopBar({ title, showBack = true, rightAction, transparent = false, className, onBack }: TopBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className={cn(
      'sticky top-0 z-50 flex items-center justify-between h-14 px-5',
      transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-neutral-100',
      className,
    )}>
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-700" />
          </button>
        )}
      </div>
      {title && (
        <h1 className="text-title-2 text-neutral-900 absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>
      )}
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </div>
  )
}
