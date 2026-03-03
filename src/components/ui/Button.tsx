'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  icon?: ReactNode
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className,
  icon,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-colors rounded-button relative overflow-hidden'

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-inner-glow',
    secondary: 'bg-primary-50 text-primary-500 hover:bg-primary-100 border border-primary-200',
    ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
  }

  const sizes = {
    sm: 'h-9 px-4 text-body-2',
    md: 'h-12 px-6 text-button',
    lg: 'h-14 px-8 text-button',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}
