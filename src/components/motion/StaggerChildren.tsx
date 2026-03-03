'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const container = {
  hidden: { opacity: 0 },
  show: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

export default function StaggerChildren({ children, staggerDelay = 0.1, className }: StaggerChildrenProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  )
}
