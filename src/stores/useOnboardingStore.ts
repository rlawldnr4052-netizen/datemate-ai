import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DateType, Vibe } from '@/types/onboarding'

interface OnboardingState {
  dateType: DateType | null
  likedTags: string[]
  dislikedTags: string[]
  balanceAnswers: Record<string, string>
  selectedVibe: Vibe | null
  isComplete: boolean
  userName: string
  setDateType: (type: DateType) => void
  addLikedTag: (tagId: string) => void
  addDislikedTag: (tagId: string) => void
  setBalanceAnswer: (questionId: string, optionId: string) => void
  setVibe: (vibe: Vibe) => void
  completeOnboarding: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      dateType: null,
      likedTags: [],
      dislikedTags: [],
      balanceAnswers: {},
      selectedVibe: null,
      isComplete: false,
      userName: '지욱',

      setDateType: (type) => set({ dateType: type }),
      addLikedTag: (tagId) => set((s) => ({ likedTags: [...s.likedTags, tagId] })),
      addDislikedTag: (tagId) => set((s) => ({ dislikedTags: [...s.dislikedTags, tagId] })),
      setBalanceAnswer: (questionId, optionId) =>
        set((s) => ({ balanceAnswers: { ...s.balanceAnswers, [questionId]: optionId } })),
      setVibe: (vibe) => set({ selectedVibe: vibe }),
      completeOnboarding: () => set({ isComplete: true }),
      reset: () => set({
        dateType: null,
        likedTags: [],
        dislikedTags: [],
        balanceAnswers: {},
        selectedVibe: null,
        isComplete: false,
      }),
    }),
    { name: 'datemate-onboarding' },
  ),
)
