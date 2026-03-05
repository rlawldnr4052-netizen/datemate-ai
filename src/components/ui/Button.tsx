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
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-button relative overflow-hidden'

  const variants = {
    primary: 'text-white',
    secondary: 'text-neutral-300 backdrop-blur-md border border-white/[0.10] hover:border-white/[0.16]',
    ghost: 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06]',
  }

  const sizes = {
    sm: 'h-9 px-4 text-body-2',
    md: 'h-12 px-6 text-button',
    lg: 'h-14 px-8 text-button',
  }

  const getStyle = (): React.CSSProperties | undefined => {
    if (variant === 'primary') {
      return {
        background: 'linear-gradient(135deg, rgba(255,107,82,0.9), rgba(255,138,117,0.85))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }
    }
    if (variant === 'secondary') {
      return {
        background: 'rgba(255,255,255,0.06)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }
    }
    return undefined
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 18, mass: 0.8 }}
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
      style={getStyle()}
    >
      {/* top highlight line */}
      {variant === 'primary' && (
        <span className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.35) 50%, transparent 90%)' }} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}
