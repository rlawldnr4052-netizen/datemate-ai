'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ children, className, onClick, hover = false, padding = 'md' }: CardProps) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-card shadow-card',
        paddings[padding],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
