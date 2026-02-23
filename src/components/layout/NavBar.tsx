'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, MapPin, MessageCircle, Trophy, User } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { id: 'home', icon: Home, path: '/home' },
  { id: 'course', icon: MapPin, path: '/course' },
  { id: 'chat', icon: MessageCircle, path: '/chat' },
  { id: 'quest', icon: Trophy, path: '/quest' },
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(10px,env(safe-area-inset-bottom))]">
      <nav
        className="relative flex items-center gap-0.5 px-1.5 py-1.5 rounded-[26px]"
        style={{
          background: 'rgba(20, 20, 25, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Active pill indicator */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-[22px]"
          style={{
            width: 52,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.1)',
          }}
          animate={{ left: activeIndex * 54 + 6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

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
                animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -0.5 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: 21,
                    height: 21,
                    color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                  }}
                  strokeWidth={isActive ? 2.4 : 1.7}
                />
              </motion.div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
