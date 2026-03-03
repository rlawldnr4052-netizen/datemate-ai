'use client'

import { motion } from 'framer-motion'
import { Heart, UserPlus, Clock, UserMinus, Check, X } from 'lucide-react'
import { User } from '@/types/auth'

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friend'

interface FriendCardProps {
  user: User
  status: FriendStatus
  isPartner: boolean
  onAdd?: () => void
  onCancel?: () => void
  onAccept?: () => void
  onReject?: () => void
  onRemove?: () => void
  onTogglePartner?: () => void
}

const avatarGradients = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-fuchsia-400 to-pink-500',
]

function getAvatarGradient(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

export default function FriendCard({
  user, status, isPartner,
  onAdd, onCancel, onAccept, onReject, onRemove, onTogglePartner,
}: FriendCardProps) {
  const gradient = getAvatarGradient(user.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3 px-1"
    >
      {/* 아바타 */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} p-[2px] flex-shrink-0`}>
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <span className="text-[15px] font-bold text-neutral-600">
            {user.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* 이름, 이메일 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] font-semibold text-neutral-900 truncate">{user.name}</p>
          {isPartner && (
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-neutral-400 truncate">{user.email}</p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {status === 'none' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-[13px] font-semibold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            추가
          </motion.button>
        )}

        {status === 'pending_sent' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-400 text-[13px] font-semibold"
          >
            <Clock className="w-3.5 h-3.5" />
            대기중
          </motion.button>
        )}

        {status === 'pending_received' && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onAccept}
              className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onReject}
              className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </>
        )}

        {status === 'friend' && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onTogglePartner}
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPartner ? 'bg-pink-50' : 'bg-neutral-50'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isPartner ? 'text-pink-500 fill-pink-500' : 'text-neutral-300'}`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="w-9 h-9 rounded-xl bg-neutral-50 text-neutral-300 flex items-center justify-center"
            >
              <UserMinus className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}
