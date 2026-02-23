import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  users: User[]
  _hasHydrated: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [],
      _hasHydrated: false,

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        )
        if (!user) {
          return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' }
        }
        set({ currentUser: user, isAuthenticated: true })
        return { success: true }
      },

      signup: (name, email, password) => {
        const exists = get().users.some((u) => u.email === email)
        if (exists) {
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
        }))
        return { success: true }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false })
      },
    }),
    {
      name: 'datemate-auth',
      onRehydrateStorage: () => {
        return () => {
          useAuthStore.setState({ _hasHydrated: true })
        }
      },
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
    },
  ),
)
