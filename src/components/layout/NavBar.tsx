'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, MessageCircle, Navigation, User } from 'lucide-react'
import { motion } from 'framer-motion'

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

  const getActiveIndex = () => {
    for (let i = 0; i < tabs.length; i++) {
      if (pathname.startsWith(tabs[i].path)) return i
    }
    return 0
  }

  const activeIndex = getActiveIndex()

  // 네비바 숨길 페이지
  const hideOnPaths = ['/profile/edit', '/course/']
  if (hideOnPaths.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(10px,env(safe-area-inset-bottom))]">
      <nav
        className="relative flex items-center gap-0.5 px-1.5 py-1.5 rounded-[28px]"
        style={{
          background: 'rgba(11,11,18,0.90)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Active pill */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-[24px] overflow-hidden"
          style={{
            width: 52,
            background: 'linear-gradient(135deg, rgba(255,107,82,0.85), rgba(255,138,117,0.75))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 10px rgba(0,0,0,0.3)',
          }}
          animate={{ left: activeIndex * 54 + 6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.9 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.3) 50%, transparent 90%)' }} />
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
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20, mass: 0.8 }}
              >
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: 21,
                    height: 21,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  }}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
              </motion.div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
