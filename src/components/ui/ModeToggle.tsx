'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { CourseMode } from '@/types/course'

interface ModeToggleProps {
  mode: CourseMode
  onChange: (mode: CourseMode) => void
  className?: string
}

export default function ModeToggle({ mode, onChange, className }: ModeToggleProps) {
  return (
    <div className={cn('relative flex bg-neutral-100 rounded-pill p-1', className)}>
      <motion.div
        className="absolute top-1 bottom-1 rounded-pill bg-white shadow-card"
        initial={false}
        animate={{
          left: mode === 'standard' ? '4px' : '50%',
          right: mode === 'standard' ? '50%' : '4px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <button
        onClick={() => onChange('standard')}
        className={cn(
          'relative z-10 flex-1 py-2 px-4 text-body-2 font-medium rounded-pill transition-colors',
          mode === 'standard' ? 'text-primary-500' : 'text-neutral-400',
        )}
      >
        스탠다드
      </button>
      <button
        onClick={() => onChange('blind')}
        className={cn(
          'relative z-10 flex-1 py-2 px-4 text-body-2 font-medium rounded-pill transition-colors',
          mode === 'blind' ? 'text-primary-500' : 'text-neutral-400',
        )}
      >
        블라인드
      </button>
    </div>
  )
}
