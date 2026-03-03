'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, UserPlus, Bell, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFriendStore, FriendUser } from '@/stores/useFriendStore'
import FriendCard from '@/components/friend/FriendCard'
import PageTransition from '@/components/motion/PageTransition'

type Tab = 'friends' | 'requests'

export default function FriendsPage() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const {
    friends, receivedRequests, sentRequests,
    fetchFriends, fetchRequests, searchUsers,
    sendRequest, acceptRequest, rejectRequest, cancelRequest,
    removeFriend, setPartner, getPartner,
  } = useFriendStore()

  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('friends')
  const [searchResults, setSearchResults] = useState<FriendUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const searchTimerRef = useRef<NodeJS.Timeout>()

  const myId = currentUser?.id || ''
  const partnerId = getPartner(myId)

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

  // 액션 후 데이터 새로고침
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

  // 검색 결과에서 각 유저의 상태
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

  const friendUsers = friends.map((f) => f.friend).filter(Boolean)
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
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <p className="text-[13px] font-semibold">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 */}
      <div className="pt-14 px-5 pb-3">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-neutral-900">친구</h1>
          {requestCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary-500 text-white text-[11px] font-bold">
              {requestCount}
            </span>
          )}
        </div>

        {/* 검색바 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 text-[14px] text-neutral-900 placeholder:text-neutral-300 outline-none focus:ring-2 focus:ring-primary-200 transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 animate-spin" />
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      {query.trim() ? (
        <div className="px-5">
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
          {/* 탭 */}
          <div className="px-5 flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                activeTab === 'friends'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 text-neutral-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              내 친구 {friendUsers.length > 0 && `(${friendUsers.length})`}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 text-neutral-400'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              요청
              {requestCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {requestCount}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'friends' ? (
              <motion.div
                key="friends"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="px-5"
              >
                {friendUsers.length > 0 ? (
                  <div className="divide-y divide-neutral-50">
                    {friendUsers.map((user) => (
                      <div key={user.id} className={actionLoading === user.id ? 'opacity-50 pointer-events-none' : ''}>
                        <FriendCard
                          user={{ id: user.id, name: user.name, email: user.email, password: '', createdAt: '' }}
                          status="friend"
                          isPartner={partnerId === user.id}
                          onRemove={() => handleRemove(user.id)}
                          onTogglePartner={() =>
                            setPartner(myId, partnerId === user.id ? null : user.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-7 h-7 text-neutral-300" />
                    </div>
                    <p className="text-[15px] font-semibold text-neutral-700 mb-1">
                      아직 친구가 없어요
                    </p>
                    <p className="text-[13px] text-neutral-400">
                      위 검색창에서 친구를 찾아보세요
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="px-5"
              >
                {receivedRequests.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[13px] font-semibold text-neutral-500 mb-2">
                      받은 요청 ({receivedRequests.length})
                    </p>
                    <div className="divide-y divide-neutral-50">
                      {receivedRequests.map((req) => {
                        const fromUser = req.from_user
                        if (!fromUser) return null
                        return (
                          <div key={req.id} className={actionLoading === req.id ? 'opacity-50 pointer-events-none' : ''}>
                            <FriendCard
                              user={{ id: fromUser.id, name: fromUser.name, email: fromUser.email, password: '', createdAt: '' }}
                              status="pending_received"
                              isPartner={false}
                              onAccept={() => handleAccept(req.id)}
                              onReject={() => handleReject(req.id)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {sentRequests.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[13px] font-semibold text-neutral-500 mb-2">
                      보낸 요청 ({sentRequests.length})
                    </p>
                    <div className="divide-y divide-neutral-50">
                      {sentRequests.map((req) => {
                        const toUser = req.to_user
                        if (!toUser) return null
                        return (
                          <div key={req.id} className={actionLoading === req.id ? 'opacity-50 pointer-events-none' : ''}>
                            <FriendCard
                              user={{ id: toUser.id, name: toUser.name, email: toUser.email, password: '', createdAt: '' }}
                              status="pending_sent"
                              isPartner={false}
                              onCancel={() => handleCancel(req.id)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {receivedRequests.length === 0 && sentRequests.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-7 h-7 text-neutral-300" />
                    </div>
                    <p className="text-[15px] font-semibold text-neutral-700 mb-1">
                      요청이 없어요
                    </p>
                    <p className="text-[13px] text-neutral-400">
                      친구를 검색해서 요청을 보내보세요
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </PageTransition>
  )
}
