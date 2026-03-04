import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  users: User[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  updateProfileImage: (imageUrl: string) => void
  updateName: (name: string) => Promise<{ success: boolean; error?: string }>
  syncToSupabase: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [],
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()

          if (!res.ok) {
            set({ isLoading: false })
            return { success: false, error: data.error }
          }

          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            password: '',
            profileImageUrl: data.user.profile_image_url || undefined,
            createdAt: data.user.created_at,
          }
          set({ currentUser: user, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch {
          // Fallback to local users if server is unreachable
          const user = get().users.find(
            (u) => u.email === email && u.password === password
          )
          if (user) {
            set({ currentUser: user, isAuthenticated: true, isLoading: false })
            return { success: true }
          }
          set({ isLoading: false })
          return { success: false, error: '서버 연결에 실패했습니다' }
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          })
          const data = await res.json()

          if (!res.ok) {
            set({ isLoading: false })
            return { success: false, error: data.error }
          }

          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            password: '',
            profileImageUrl: data.user.profile_image_url || undefined,
            createdAt: data.user.created_at,
          }
          set((s) => ({
            users: [...s.users, user],
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
          }))
          return { success: true }
        } catch {
          // Fallback to local signup if server is unreachable
          const exists = get().users.some((u) => u.email === email)
          if (exists) {
            set({ isLoading: false })
            return { success: false, error: '이미 등록된 이메일입니다' }
          }
          const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            createdAt: new Date().toISOString(),
          }
          set((s) => ({
            users: [...s.users, newUser],
            currentUser: newUser,
            isAuthenticated: true,
            isLoading: false,
          }))
          return { success: true }
        }
      },

      updateProfileImage: (imageUrl) => {
        const { currentUser } = get()
        if (!currentUser) return
        const updated = { ...currentUser, profileImageUrl: imageUrl }
        set({ currentUser: updated })
      },

      updateName: async (name) => {
        const { currentUser } = get()
        if (!currentUser) return { success: false, error: '로그인이 필요합니다' }
        try {
          const res = await fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, name }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.error }
          set({ currentUser: { ...currentUser, name: data.user.name } })
          return { success: true }
        } catch {
          return { success: false, error: '서버 연결에 실패했습니다' }
        }
      },

      syncToSupabase: async () => {
        const { currentUser, isAuthenticated } = get()
        if (!currentUser || !isAuthenticated) return
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              password: currentUser.password || 'synced',
            }),
          })
        } catch { /* silent */ }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false })
      },
    }),
    {
      name: 'datemate-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
    },
  ),
)
