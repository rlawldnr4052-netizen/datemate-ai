'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ProgressBarProps {
  progress: number // 0-1
  className?: string
}

export default function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn('h-1 bg-white/[0.08] rounded-full overflow-hidden', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full shadow-[0_0_8px_rgba(255,107,82,0.4)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}
