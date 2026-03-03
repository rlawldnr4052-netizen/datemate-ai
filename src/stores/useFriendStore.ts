import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FriendUser {
  id: string
  name: string
  email: string
  profile_image_url?: string | null
}

interface FriendWithUser {
  id: string
  friend_id: string
  connected_at: string
  friend: FriendUser
}

interface FriendRequestWithUser {
  id: string
  from_user_id?: string
  to_user_id?: string
  status: string
  created_at: string
  from_user?: FriendUser
  to_user?: FriendUser
}

interface FriendState {
  partners: Record<string, string | null>
  friends: FriendWithUser[]
  receivedRequests: FriendRequestWithUser[]
  sentRequests: FriendRequestWithUser[]
  isLoading: boolean

  fetchFriends: (userId: string) => Promise<void>
  fetchRequests: (userId: string) => Promise<void>
  searchUsers: (query: string, userId: string) => Promise<FriendUser[]>
  sendRequest: (fromUserId: string, toUserId: string) => Promise<{ success: boolean; error?: string }>
  acceptRequest: (requestId: string, userId: string) => Promise<boolean>
  rejectRequest: (requestId: string, userId: string) => Promise<boolean>
  cancelRequest: (requestId: string, userId: string) => Promise<boolean>
  removeFriend: (userId: string, friendId: string) => Promise<boolean>
  setPartner: (currentUserId: string, partnerId: string | null) => void

  getPartner: (userId: string) => string | null
  getFriendUsers: () => FriendUser[]
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      partners: {},
      friends: [],
      receivedRequests: [],
      sentRequests: [],
      isLoading: false,

      fetchFriends: async (userId) => {
        try {
          const res = await fetch(`/api/friends/list?userId=${userId}&type=friends`)
          const data = await res.json()
          if (res.ok) {
            set({ friends: data.friends || [] })
          }
        } catch { /* ignore */ }
      },

      fetchRequests: async (userId) => {
        try {
          const [receivedRes, sentRes] = await Promise.all([
            fetch(`/api/friends/list?userId=${userId}&type=received`),
            fetch(`/api/friends/list?userId=${userId}&type=sent`),
          ])
          const received = await receivedRes.json()
          const sent = await sentRes.json()
          set({
            receivedRequests: received.requests || [],
            sentRequests: sent.requests || [],
          })
        } catch { /* ignore */ }
      },

      searchUsers: async (query, userId) => {
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&userId=${userId}`)
          const data = await res.json()
          return data.users || []
        } catch {
          return []
        }
      },

      sendRequest: async (fromUserId, toUserId) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/friends/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUserId, toUserId }),
          })
          const data = await res.json()
          if (res.ok) {
            await get().fetchRequests(fromUserId)
            set({ isLoading: false })
            return { success: true }
          }
          set({ isLoading: false })
          return { success: false, error: data.error || '요청에 실패했습니다' }
        } catch (e) {
          set({ isLoading: false })
          return { success: false, error: String(e) }
        }
      },

      acceptRequest: async (requestId, userId) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/friends/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
          })
          if (res.ok) {
            await Promise.all([get().fetchFriends(userId), get().fetchRequests(userId)])
            set({ isLoading: false })
            return true
          }
          set({ isLoading: false })
          return false
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      rejectRequest: async (requestId, userId) => {
        try {
          const res = await fetch('/api/friends/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
          })
          if (res.ok) {
            await get().fetchRequests(userId)
            return true
          }
          return false
        } catch { return false }
      },

      cancelRequest: async (requestId, userId) => {
        try {
          const res = await fetch('/api/friends/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
          })
          if (res.ok) {
            await get().fetchRequests(userId)
            return true
          }
          return false
        } catch { return false }
      },

      removeFriend: async (userId, friendId) => {
        try {
          const res = await fetch('/api/friends/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, friendId }),
          })
          if (res.ok) {
            await get().fetchFriends(userId)
            return true
          }
          return false
        } catch { return false }
      },

      setPartner: (currentUserId, partnerId) => {
        set((s) => ({ partners: { ...s.partners, [currentUserId]: partnerId } }))
      },

      getPartner: (userId) => get().partners[userId] || null,
      getFriendUsers: () => get().friends.map((f) => f.friend),
    }),
    {
      name: 'datemate-friends',
      partialize: (state) => ({
        partners: state.partners,
      }),
    }
  )
)
