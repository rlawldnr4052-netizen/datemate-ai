'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, MapPin, MessageCircle, Trophy, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const tabs = [
  { id: 'home', label: '홈', icon: Home, path: '/home' },
  { id: 'course', label: '코스', icon: MapPin, path: '/course' },
  { id: 'chat', label: '채팅', icon: MessageCircle, path: '/chat' },
  { id: 'quest', label: '퀘스트', icon: Trophy, path: '/quest' },
  { id: 'profile', label: '프로필', icon: User, path: '/profile' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()

  const getActiveTab = () => {
    for (const tab of tabs) {
      if (pathname.startsWith(tab.path)) return tab.id
    }
    return 'home'
  }

  const activeTab = getActiveTab()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/90 backdrop-blur-xl border-t border-neutral-100 z-50">
      <div className="flex items-center justify-around h-16 px-2 safe-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1 : 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary-500' : 'text-neutral-400',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-primary-500' : 'text-neutral-400',
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
