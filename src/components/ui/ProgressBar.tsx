'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ProgressBarProps {
  progress: number // 0-1
  className?: string
}

export default function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn('h-1 bg-neutral-100 rounded-full overflow-hidden', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}
