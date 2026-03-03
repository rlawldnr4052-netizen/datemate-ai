'use client'

import { cn } from '@/lib/cn'
import { motion } from 'framer-motion'

interface TagProps {
  label: string
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

export default function Tag({ label, active = false, onClick, size = 'md', className }: TagProps) {
  const sizes = {
    sm: 'px-2.5 py-1 text-caption',
    md: 'px-3.5 py-1.5 text-body-2',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'rounded-pill font-medium transition-all duration-200',
        sizes[size],
        active
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
        className,
      )}
    >
      {label}
    </motion.button>
  )
}
