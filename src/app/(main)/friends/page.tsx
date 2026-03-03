'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, Bell, Loader2, AlertCircle, Check, X, Camera } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFriendStore, FriendUser } from '@/stores/useFriendStore'
import { useFeedStore } from '@/stores/useFeedStore'
import FriendCard from '@/components/friend/FriendCard'
import { FeedItem } from '@/components/feed/FeedScrollView'
import PageTransition from '@/components/motion/PageTransition'

export default function FriendsPage() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const {
    friends, receivedRequests, sentRequests,
    fetchFriends, fetchRequests, searchUsers,
    sendRequest, acceptRequest, rejectRequest, cancelRequest,
    removeFriend, setPartner, getPartner,
  } = useFriendStore()
  const posts = useFeedStore((s) => s.posts)

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FriendUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showRequests, setShowRequests] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout>()

  const myId = currentUser?.id || ''
  const partnerId = getPartner(myId)

  // 친구 피드: 내 포스트 + 친구 포스트를 최신순 정렬
  const friendIds = useMemo(() => friends.map((f) => f.friend_id), [friends])
  const feedPosts = useMemo(() => {
    const relevantIds = new Set([myId, ...friendIds])
    return posts
      .filter((p) => relevantIds.has(p.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [posts, myId, friendIds])

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // 데이터 로드
  useEffect(() => {
    if (!myId) return
    fetchFriends(myId)
    fetchRequests(myId)
  }, [myId, fetchFriends, fetchRequests])

  // 검색 함수
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || !myId) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const results = await searchUsers(q, myId)
    setSearchResults(results)
    setIsSearching(false)
  }, [myId, searchUsers])

  // 검색 (debounce)
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => doSearch(query), 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [query, doSearch])

  // 액션 후 새로고침
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchFriends(myId), fetchRequests(myId)])
  }, [myId, fetchFriends, fetchRequests])

  const handleSendRequest = async (toUserId: string) => {
    setActionLoading(toUserId)
    const result = await sendRequest(myId, toUserId)
    if (result.success) {
      setToast({ message: '친구 요청을 보냈어요!', type: 'success' })
    } else {
      setToast({ message: result.error || '요청에 실패했어요', type: 'error' })
    }
    await refreshAll()
    if (query.trim()) await doSearch(query)
    setActionLoading(null)
  }

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId)
    const ok = await acceptRequest(requestId, myId)
    if (ok) setToast({ message: '친구가 되었어요!', type: 'success' })
    await refreshAll()
    setActionLoading(null)
  }

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId)
    await rejectRequest(requestId, myId)
    await refreshAll()
    setActionLoading(null)
  }

  const handleCancel = async (requestId: string) => {
    setActionLoading(requestId)
    await cancelRequest(requestId, myId)
    await refreshAll()
    if (query.trim()) await doSearch(query)
    setActionLoading(null)
  }

  const handleRemove = async (friendId: string) => {
    setActionLoading(friendId)
    await removeFriend(myId, friendId)
    await refreshAll()
    setActionLoading(null)
  }

  const getUserStatus = useCallback((userId: string): 'none' | 'pending_sent' | 'pending_received' | 'friend' => {
    if (friends.some((f) => f.friend_id === userId)) return 'friend'
    if (receivedRequests.some((r) => r.from_user_id === userId)) return 'pending_received'
    if (sentRequests.some((r) => r.to_user_id === userId)) return 'pending_sent'
    return 'none'
  }, [friends, receivedRequests, sentRequests])

  const getRequestId = useCallback((userId: string): string | undefined => {
    const received = receivedRequests.find((r) => r.from_user_id === userId)
    if (received) return received.id
    const sent = sentRequests.find((r) => r.to_user_id === userId)
    return sent?.id
  }, [receivedRequests, sentRequests])

  const requestCount = receivedRequests.length

  return (
    <PageTransition className="min-h-screen pb-28 bg-white">
      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-12 left-4 right-4 z-[100]"
          >
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <p className="text-[13px] font-semibold">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 + 검색바 */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-neutral-50">
        <div className="pt-14 px-5 pb-3">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="친구 검색"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-100 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-primary-200 transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* 검색 모드 */}
      {query.trim() ? (
        <div className="px-5 pt-3">
          <p className="text-[13px] text-neutral-400 mb-2">
            검색 결과 ({searchResults.length}명)
          </p>
          {searchResults.length > 0 ? (
            <div className="divide-y divide-neutral-50">
              {searchResults.map((user) => {
                const status = getUserStatus(user.id)
                const reqId = getRequestId(user.id)
                const loading = actionLoading === user.id || actionLoading === reqId
                return (
                  <div key={user.id} className={loading ? 'opacity-50 pointer-events-none' : ''}>
                    <FriendCard
                      user={{ id: user.id, name: user.name, email: user.email, password: '', createdAt: '' }}
                      status={status}
                      isPartner={partnerId === user.id}
                      onAdd={() => handleSendRequest(user.id)}
                      onCancel={() => reqId && handleCancel(reqId)}
                      onAccept={() => reqId && handleAccept(reqId)}
                      onReject={() => reqId && handleReject(reqId)}
                      onRemove={() => handleRemove(user.id)}
                      onTogglePartner={() =>
                        setPartner(myId, partnerId === user.id ? null : user.id)
                      }
                    />
                  </div>
                )
              })}
            </div>
          ) : !isSearching ? (
            <div className="text-center py-16">
              <Search className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
              <p className="text-[14px] text-neutral-400">검색 결과가 없어요</p>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {/* 친구 요청 배너 */}
          {requestCount > 0 && (
            <div className="px-5 pt-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRequests(!showRequests)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-primary-50 border border-primary-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-primary-700">
                      친구 요청 {requestCount}개
                    </p>
                    <p className="text-[11px] text-primary-400">
                      탭해서 확인하기
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: showRequests ? 180 : 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-400">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </motion.button>

              {/* 요청 목록 (확장) */}
              <AnimatePresence>
                {showRequests && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      {receivedRequests.map((req) => {
                        const fromUser = req.from_user
                        if (!fromUser) return null
                        const loading = actionLoading === req.id
                        return (
                          <div
                            key={req.id}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-neutral-100 ${loading ? 'opacity-50' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[13px] font-bold">{fromUser.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-neutral-900 truncate">{fromUser.name}</p>
                              <p className="text-[11px] text-neutral-400 truncate">{fromUser.email}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAccept(req.id)}
                                className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center"
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReject(req.id)}
                                className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        )
                      })}
                      {sentRequests.length > 0 && (
                        <p className="text-[11px] text-neutral-400 px-1 pt-1">
                          보낸 요청 {sentRequests.length}개 대기 중
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 피드 */}
          {feedPosts.length > 0 ? (
            <div className="mt-3">
              {feedPosts.map((post) => (
                <FeedItem key={post.id} postId={post.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-5">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-neutral-200" />
              </div>
              <p className="text-[16px] font-bold text-neutral-800 mb-1">
                피드가 비어있어요
              </p>
              <p className="text-[13px] text-neutral-400 leading-relaxed">
                {friends.length === 0
                  ? '위 검색창에서 친구를 찾아 추가해보세요'
                  : '프로필에서 코스 사진을 공유해보세요'}
              </p>
              {friends.length === 0 && (
                <div className="mt-6 flex justify-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement
                      input?.focus()
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-[13px] font-bold"
                  >
                    <UserPlus className="w-4 h-4" />
                    친구 찾기
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageTransition>
  )
}
