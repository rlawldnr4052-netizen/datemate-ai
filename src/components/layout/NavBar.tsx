'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, MessageCircle, Navigation, User } from 'lucide-react'
import { motion, PanInfo } from 'framer-motion'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCallback, useRef } from 'react'

const tabs = [
  { id: 'home', icon: Home, path: '/home', label: '홈' },
  { id: 'friends', icon: Users, path: '/friends', label: '친구' },
  { id: 'chat', icon: MessageCircle, path: '/chat', label: '채팅' },
  { id: 'course', icon: Navigation, path: '/course', label: '코스' },
  { id: 'profile', icon: User, path: '/profile', label: '프로필' },
]

const modeColors: Record<string, {
  pill: string
  border: string
  glow: string
  navBg: string
  navBorder: string
}> = {
  couple: {
    pill: 'linear-gradient(135deg, rgba(232,69,124,0.75), rgba(255,126,179,0.6))',
    border: 'rgba(255,126,179,0.2)',
    glow: 'rgba(232,69,124,0.12)',
    navBg: 'rgba(18,8,14,0.45)',
    navBorder: 'rgba(232,69,124,0.08)',
  },
  solo: {
    pill: 'linear-gradient(135deg, rgba(124,58,237,0.75), rgba(167,139,250,0.6))',
    border: 'rgba(167,139,250,0.2)',
    glow: 'rgba(124,58,237,0.12)',
    navBg: 'rgba(14,10,22,0.45)',
    navBorder: 'rgba(124,58,237,0.08)',
  },
  friends: {
    pill: 'linear-gradient(135deg, rgba(212,137,11,0.75), rgba(255,208,96,0.6))',
    border: 'rgba(255,208,96,0.2)',
    glow: 'rgba(212,137,11,0.12)',
    navBg: 'rgba(16,14,8,0.45)',
    navBorder: 'rgba(212,137,11,0.08)',
  },
}

const defaultColors = modeColors.couple

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const dateType = useOnboardingStore((s) => s.dateType)
  const colors = modeColors[dateType || 'couple'] || defaultColors
  const isNavigating = useRef(false)

  const getActiveIndex = () => {
    for (let i = 0; i < tabs.length; i++) {
      if (pathname.startsWith(tabs[i].path)) return i
    }
    return 0
  }

  const activeIndex = getActiveIndex()

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isNavigating.current) return

    const threshold = 40
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 250) {
      const direction = offset > 0 ? -1 : 1
      const nextIndex = Math.max(0, Math.min(tabs.length - 1, activeIndex + direction))

      if (nextIndex !== activeIndex) {
        isNavigating.current = true
        router.push(tabs[nextIndex].path)
        setTimeout(() => { isNavigating.current = false }, 400)
      }
    }
  }, [activeIndex, router])

  // 네비바 숨길 페이지
  const hideOnPaths = ['/profile/edit', '/course/']
  if (hideOnPaths.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(8px,env(safe-area-inset-bottom))]">
      <motion.nav
        className="relative flex items-center gap-0.5 px-2 py-2 rounded-[26px]"
        style={{
          background: colors.navBg,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${colors.navBorder}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
      >
        {/* Active pill */}
        <motion.div
          className="absolute top-2 bottom-2 rounded-[22px] overflow-hidden"
          style={{
            width: 52,
            background: colors.pill,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${colors.border}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.15), 0 0 10px ${colors.glow}`,
          }}
          animate={{ left: activeIndex * 54 + 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.75 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.25) 50%, transparent 90%)' }} />
        </motion.div>

        {tabs.map((tab, i) => {
          const isActive = i === activeIndex
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className="relative z-10 w-[52px] h-10 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.65 }}
              >
                <Icon
                  className="transition-colors duration-300"
                  style={{
                    width: 20,
                    height: 20,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.28)',
                  }}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
              </motion.div>
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
