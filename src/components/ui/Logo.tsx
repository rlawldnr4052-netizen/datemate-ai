'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  size?: number
  animate?: boolean
  className?: string
}

export default function Logo({ size = 96, animate = false, className }: LogoProps) {
  const Wrapper = animate ? motion.div : 'div'
  const animateProps = animate
    ? {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.2 },
      }
    : {}

  return (
    <Wrapper className={className} {...animateProps}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main heart gradient */}
          <linearGradient id="logo-heart" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9A85" />
            <stop offset="50%" stopColor="#FF6B52" />
            <stop offset="100%" stopColor="#E8453A" />
          </linearGradient>

          {/* Subtle inner glow */}
          <radialGradient id="logo-glow" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Glass highlight gradient */}
          <linearGradient id="logo-glass" x1="30" y1="15" x2="70" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#E8453A" floodOpacity="0.3" />
          </filter>

          {/* Sparkle glow */}
          <filter id="sparkle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Heart-pin shape: heart with elongated bottom point (location pin) */}
        <path
          d="
            M60 102
            C58 99 16 66 16 40
            C16 22 28 13 42 13
            C50 13 55 18 60 26
            C65 18 70 13 78 13
            C92 13 104 22 104 40
            C104 66 62 99 60 102
            Z
          "
          fill="url(#logo-heart)"
          filter="url(#logo-shadow)"
        />

        {/* Inner glow overlay */}
        <path
          d="
            M60 102
            C58 99 16 66 16 40
            C16 22 28 13 42 13
            C50 13 55 18 60 26
            C65 18 70 13 78 13
            C92 13 104 22 104 40
            C104 66 62 99 60 102
            Z
          "
          fill="url(#logo-glow)"
        />

        {/* Glass highlight on top-left lobe */}
        <path
          d="
            M42 17
            C30 17 20 25 20 40
            C20 50 30 60 38 65
            C28 52 24 42 24 36
            C24 26 32 19 42 17
            Z
          "
          fill="url(#logo-glass)"
        />

        {/* Route line - subtle path through the heart */}
        <path
          d="M38 42 C42 38 48 44 52 40 C56 36 60 42 64 38 C68 34 74 40 78 38"
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Route dots - waypoints */}
        <circle cx="38" cy="42" r="2.5" fill="white" fillOpacity="0.6" />
        <circle cx="52" cy="40" r="2" fill="white" fillOpacity="0.5" />
        <circle cx="64" cy="38" r="2" fill="white" fillOpacity="0.5" />
        <circle cx="78" cy="38" r="2.5" fill="white" fillOpacity="0.6" />

        {/* AI Sparkle - 4-point star */}
        <path
          d="M60 52 L62.5 59.5 L70 62 L62.5 64.5 L60 72 L57.5 64.5 L50 62 L57.5 59.5 Z"
          fill="white"
          fillOpacity="0.9"
          filter="url(#sparkle-glow)"
        />

        {/* Small secondary sparkle */}
        <path
          d="M80 52 L81 55 L84 56 L81 57 L80 60 L79 57 L76 56 L79 55 Z"
          fill="white"
          fillOpacity="0.5"
        />

        {/* Pin dot at bottom */}
        <circle cx="60" cy="94" r="3" fill="white" fillOpacity="0.7" />
      </svg>
    </Wrapper>
  )
}

/** Compact version for favicon/small contexts */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mark-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9A85" />
          <stop offset="100%" stopColor="#E8453A" />
        </linearGradient>
      </defs>
      <path
        d="
          M16 28
          C15.5 27.2 4 18 4 11
          C4 6 7.5 3.5 11.2 3.5
          C13.5 3.5 15 5 16 7
          C17 5 18.5 3.5 20.8 3.5
          C24.5 3.5 28 6 28 11
          C28 18 16.5 27.2 16 28
          Z
        "
        fill="url(#mark-grad)"
      />
      <path
        d="M16 15 L17 17.5 L19.5 18.5 L17 19.5 L16 22 L15 19.5 L12.5 18.5 L15 17.5 Z"
        fill="white"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="25.5" r="1" fill="white" fillOpacity="0.6" />
    </svg>
  )
}
