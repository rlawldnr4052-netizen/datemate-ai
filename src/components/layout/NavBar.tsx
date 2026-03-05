'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, MessageCircle, Navigation, User } from 'lucide-react'
import { motion, PanInfo } from 'framer-motion'
import { useCallback, useRef } from 'react'

const tabs = [
  { id: 'home', icon: Home, path: '/home' },
  { id: 'friends', icon: Users, path: '/friends' },
  { id: 'chat', icon: MessageCircle, path: '/chat' },
  { id: 'course', icon: Navigation, path: '/course' },
  { id: 'profile', icon: User, path: '/profile' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
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
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 250) {
      const direction = info.offset.x > 0 ? -1 : 1
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
        className="flex items-center gap-[6px] px-1"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex
          const Icon = tab.icon

          return (
            <motion.button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.6 }}
              className="relative flex items-center justify-center rounded-2xl"
              style={{
                width: isActive ? 56 : 48,
                height: isActive ? 44 : 40,
                background: isActive
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                border: isActive
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(255,255,255,0.05)',
                boxShadow: isActive
                  ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 12px rgba(0,0,0,0.15)'
                  : '0 1px 4px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease, border-color 0.3s ease',
              }}
            >
              {/* top highlight */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-px rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -0.5 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25, mass: 0.5 }}
              >
                <Icon
                  style={{
                    width: isActive ? 21 : 19,
                    height: isActive ? 21 : 19,
                    color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)',
                    transition: 'color 0.3s ease, width 0.3s ease, height 0.3s ease',
                  }}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </motion.div>

              {/* active dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    background: 'rgba(255,255,255,0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </motion.nav>
    </div>
  )
}
