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
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Active pill */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-[24px]"
          style={{
            width: 52,
            background: 'linear-gradient(135deg, #FF6B52, #FF8A75)',
            boxShadow: '0 2px 12px rgba(255, 107, 82, 0.3)',
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
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: 21,
                    height: 21,
                    color: isActive ? '#ffffff' : 'rgba(60, 60, 67, 0.3)',
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
