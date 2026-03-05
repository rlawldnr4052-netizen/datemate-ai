'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-caption font-medium text-neutral-600 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3.5 rounded-2xl glass-surface text-body-2 text-neutral-900',
            'placeholder:text-neutral-400 outline-none transition-all duration-200',
            error
              ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
              : 'focus:border-white/20 focus:ring-2 focus:ring-white/10',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 ml-1">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
