'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideUpProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function SlideUp({ children, delay = 0, className }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
