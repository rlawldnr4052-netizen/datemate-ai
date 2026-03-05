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
    primary: 'text-white shadow-inner-glow',
    secondary: 'glass-pill text-primary-400 hover:bg-white/[0.10]',
    ghost: 'text-neutral-600 hover:text-neutral-800 hover:bg-white/[0.06]',
  }

  const sizes = {
    sm: 'h-9 px-4 text-body-2',
    md: 'h-12 px-6 text-button',
    lg: 'h-14 px-8 text-button',
  }

  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #FF6B52, #FF8A75)',
    boxShadow: '0 0 20px rgba(255,107,82,0.3), 0 4px 12px rgba(255,107,82,0.2)',
  } : undefined

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
      style={primaryStyle}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}
