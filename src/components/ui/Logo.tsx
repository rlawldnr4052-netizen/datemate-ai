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
          {/* Background gradient */}
          <linearGradient id="logo-bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#13121d" />
            <stop offset="100%" stopColor="#0B0B12" />
          </linearGradient>

          {/* Route path gradient: indigo → violet → cyan */}
          <linearGradient id="logo-route" x1="25" y1="85" x2="95" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="40%" stopColor="#7C3AED" />
            <stop offset="70%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* AI core glow */}
          <radialGradient id="logo-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#A5B4FC" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>

          {/* Ambient background glow */}
          <radialGradient id="logo-ambient" cx="55%" cy="42%" r="45%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>

          {/* Shadow filter */}
          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.25" />
          </filter>

          {/* Sparkle glow */}
          <filter id="logo-sparkle" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="60" cy="60" r="56" fill="url(#logo-bg)" filter="url(#logo-shadow)" />
        <circle cx="60" cy="60" r="55.5" stroke="white" strokeOpacity="0.06" strokeWidth="1" fill="none" />

        {/* Ambient glow */}
        <circle cx="63" cy="48" r="35" fill="url(#logo-ambient)" />

        {/* Route path - elegant S-curve connecting 4 waypoints */}
        {/* Glow layer */}
        <path
          d="M 30 82 C 36 68 40 60 46 55 C 54 48 58 45 63 42 C 70 38 78 35 90 28"
          stroke="url(#logo-route)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.12"
        />
        {/* Main line */}
        <path
          d="M 30 82 C 36 68 40 60 46 55 C 54 48 58 45 63 42 C 70 38 78 35 90 28"
          stroke="url(#logo-route)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Branch path - secondary route option */}
        <path
          d="M 46 55 C 50 62 58 68 68 70"
          stroke="url(#logo-route)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />

        {/* Node A (start) - indigo */}
        <circle cx="30" cy="82" r="4.5" fill="#4338CA" />
        <circle cx="30" cy="82" r="2.8" fill="#818CF8" />

        {/* Node B (mid) - violet */}
        <circle cx="46" cy="55" r="5" fill="#7C3AED" />
        <circle cx="46" cy="55" r="3" fill="#A78BFA" />

        {/* Node C (AI core) - main, with glow */}
        <circle cx="63" cy="42" r="14" fill="url(#logo-core-glow)" />
        <circle cx="63" cy="42" r="7" fill="#6366F1" />
        <circle cx="63" cy="42" r="4.5" fill="#A5B4FC" />
        <circle cx="63" cy="42" r="2.5" fill="white" />

        {/* AI Sparkle on core */}
        <path
          d="M 63 31 L 64.2 38.5 L 71.5 40 L 64.2 41.5 L 63 50 L 61.8 41.5 L 54.5 40 L 61.8 38.5 Z"
          fill="white"
          fillOpacity="0.85"
          filter="url(#logo-sparkle)"
        />

        {/* Mini sparkle */}
        <path
          d="M 77 33 L 77.6 35.5 L 80 36 L 77.6 36.5 L 77 39 L 76.4 36.5 L 74 36 L 76.4 35.5 Z"
          fill="#C4B5FD"
          fillOpacity="0.55"
        />

        {/* Node D (destination) - cyan */}
        <circle cx="90" cy="28" r="4.5" fill="#0891B2" />
        <circle cx="90" cy="28" r="2.8" fill="#22D3EE" />

        {/* Branch destination */}
        <circle cx="68" cy="70" r="3.5" fill="#7C3AED" fillOpacity="0.5" />
        <circle cx="68" cy="70" r="2" fill="#A78BFA" fillOpacity="0.7" />

        {/* Ambient decoration dots */}
        <circle cx="80" cy="65" r="1.5" fill="#4338CA" fillOpacity="0.25" />
        <circle cx="35" cy="38" r="1.2" fill="#6366F1" fillOpacity="0.2" />
        <circle cx="88" cy="50" r="1" fill="#0891B2" fillOpacity="0.2" />
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
        <linearGradient id="mark-route" x1="6" y1="24" x2="26" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <radialGradient id="mark-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background */}
      <circle cx="16" cy="16" r="15" fill="#0B0B12" />
      {/* Route */}
      <path
        d="M 8 23 C 10 18 12 15 14 13 C 16 11 20 9 24 7"
        stroke="url(#mark-route)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Nodes */}
      <circle cx="8" cy="23" r="2" fill="#4338CA" />
      <circle cx="14" cy="13" r="2.5" fill="#7C3AED" />
      <circle cx="24" cy="7" r="2" fill="#06B6D4" />
      {/* AI core glow */}
      <circle cx="14" cy="13" r="5" fill="url(#mark-glow)" />
      {/* Sparkle */}
      <path
        d="M 14 9.5 L 14.5 12 L 17 12.5 L 14.5 13 L 14 16 L 13.5 13 L 11 12.5 L 13.5 12 Z"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  )
}
