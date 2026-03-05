'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  UserPlus,
  Clock,
  UserMinus,
  Check,
  X,
  Camera,
  Image as ImageIcon,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedStore } from '@/stores/useFeedStore'
import { useFriendStore, RelationType } from '@/stores/useFriendStore'
import PageTransition from '@/components/motion/PageTransition'
import FeedScrollView from '@/components/feed/FeedScrollView'

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

interface UserProfile {
  id: string
  name: string
  email: string
  profile_image_url?: string | null
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const currentUser = useAuthStore((s) => s.currentUser)
  const myId = currentUser?.id || ''

  const {
    friends, receivedRequests, sentRequests,
    fetchFriends, fetchRequests,
    sendRequest, acceptRequest, rejectRequest, cancelRequest,
    removeFriend, setPartner, getPartner, getPartnerType,
  } = useFriendStore()
  const posts = useFeedStore((s) => s.posts)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [friendCount, setFriendCount] = useState(0)

  const userPosts = posts.filter((p) => p.userId === userId)
  const partnerId = getPartner(myId)
  const gradient = getAvatarGradient(userId)

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${userId}`)
        const data = await res.json()
        if (data.user) setProfile(data.user)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  // Fetch friend data
  useEffect(() => {
    if (!myId) return
    fetchFriends(myId)
    fetchRequests(myId)
  }, [myId, fetchFriends, fetchRequests])

  // Fetch target user's friend count
  useEffect(() => {
    async function fetchTargetFriends() {
      const res = await fetch(`/api/friends/list?userId=${userId}`)
      const data = await res.json()
      if (data.friends) setFriendCount(data.friends.length)
    }
    fetchTargetFriends()
  }, [userId])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchFriends(myId), fetchRequests(myId)])
  }, [myId, fetchFriends, fetchRequests])

  // Friend status
  const status = (() => {
    if (friends.some((f) => f.friend_id === userId)) return 'friend' as const
    if (receivedRequests.some((r) => r.from_user_id === userId)) return 'pending_received' as const
    if (sentRequests.some((r) => r.to_user_id === userId)) return 'pending_sent' as const
    return 'none' as const
  })()

  const requestId = (() => {
    const received = receivedRequests.find((r) => r.from_user_id === userId)
    if (received) return received.id
    const sent = sentRequests.find((r) => r.to_user_id === userId)
    return sent?.id
  })()

  const isPartner = partnerId === userId
  const partnerType = getPartnerType(myId)

  const handleSetRelation = (type: RelationType) => {
    if (isPartner && partnerType === type) {
      setPartner(myId, null)
    } else {
      setPartner(myId, userId, type)
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    setActionLoading(true)
    await action()
    await refreshAll()
    setActionLoading(false)
  }

  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </PageTransition>
    )
  }

  if (!profile) {
    return (
      <PageTransition className="min-h-screen bg-[#0B0B12] flex flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-neutral-500">사용자를 찾을 수 없어요</p>
        <button onClick={() => router.back()} className="text-[14px] text-primary-500 font-semibold">
          돌아가기
        </button>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-[#0B0B12] pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0B0B12]/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-800" />
          </motion.button>
          <h1 className="text-[18px] font-bold text-neutral-900">{profile.name}</h1>
        </div>
      </div>

      {/* Profile header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className={`w-[80px] h-[80px] rounded-full bg-gradient-to-br ${gradient} p-[3px] flex-shrink-0`}>
            {profile.profile_image_url ? (
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.profile_image_url})` }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#0B0B12] flex items-center justify-center">
                <span className="text-[28px] font-bold text-primary-500">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-[18px] font-bold text-neutral-900">{userPosts.length}</p>
              <p className="text-[12px] text-neutral-500">게시물</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-neutral-900">{friendCount}</p>
              <p className="text-[12px] text-neutral-500">친구</p>
            </div>
          </div>
        </div>

        {/* Name + relationship badge */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold text-neutral-900">{profile.name}</p>
            {isPartner && partnerType === 'lover' && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 text-[11px] font-semibold">
                <Heart className="w-3 h-3 fill-pink-500" /> 연인
              </span>
            )}
            {isPartner && partnerType === 'friend' && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-semibold">
                <Users className="w-3 h-3" /> 친구
              </span>
            )}
          </div>
          <p className="text-[12px] text-neutral-400 mt-0.5">{profile.email}</p>
        </div>

        {/* Action buttons */}
        <div className={`flex gap-2 mt-4 ${actionLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {status === 'none' && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleAction(() => sendRequest(myId, userId))}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              친구 추가
            </motion.button>
          )}

          {status === 'pending_sent' && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => requestId && handleAction(() => cancelRequest(requestId, myId))}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-neutral-400 text-[13px] font-semibold flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              요청 취소
            </motion.button>
          )}

          {status === 'pending_received' && (
            <>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => requestId && handleAction(() => acceptRequest(requestId, myId))}
                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                수락
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => requestId && handleAction(() => rejectRequest(requestId, myId))}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-neutral-400 text-[13px] font-semibold flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                거절
              </motion.button>
            </>
          )}

          {status === 'friend' && (
            <>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSetRelation('friend')}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 ${
                  isPartner && partnerType === 'friend'
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    : 'bg-white/[0.06] text-neutral-400'
                }`}
              >
                <Users className={`w-4 h-4`} />
                친구
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSetRelation('lover')}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 ${
                  isPartner && partnerType === 'lover'
                    ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                    : 'bg-white/[0.06] text-neutral-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isPartner && partnerType === 'lover' ? 'fill-pink-500' : ''}`} />
                연인
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAction(() => removeFriend(myId, userId))}
                className="py-2.5 px-4 rounded-xl bg-white/[0.06] text-neutral-400 text-[13px] font-semibold flex items-center justify-center gap-1.5"
              >
                <UserMinus className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-white/[0.06]" />

      {/* Posts grid */}
      {userPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-neutral-200" />
          </div>
          <p className="text-[16px] font-bold text-neutral-900 mb-1">아직 게시물이 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {userPosts.map((post) => (
            <motion.button
              key={post.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPostId(post.id)}
              className="relative"
              style={{ aspectRatio: '4/5' }}
            >
              <div
                className="w-full h-full bg-cover bg-center bg-white/[0.06]"
                style={{ backgroundImage: `url(${post.photos[0]?.imageUrl})` }}
              />
              {post.photos.length > 1 && (
                <div className="absolute top-2 right-2">
                  <ImageIcon className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Feed scroll view */}
      <AnimatePresence>
        {selectedPostId && (
          <FeedScrollView
            posts={userPosts}
            startPostId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
