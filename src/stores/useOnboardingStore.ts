import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DateType, MBTIType, KoreanRegion, Vibe } from '@/types/onboarding'

interface OnboardingState {
  dateType: DateType | null
  mbti: MBTIType | null
  birthday: string | null
  location: KoreanRegion | null
  likedTags: string[]
  dislikedTags: string[]
  balanceAnswers: Record<string, string>
  selectedVibe: Vibe | null
  isComplete: boolean
  setDateType: (type: DateType) => void
  setMBTI: (mbti: MBTIType) => void
  setBirthday: (date: string) => void
  setLocation: (region: KoreanRegion) => void
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
      mbti: null,
      birthday: null,
      location: null,
      likedTags: [],
      dislikedTags: [],
      balanceAnswers: {},
      selectedVibe: null,
      isComplete: false,

      setDateType: (type) => set({ dateType: type }),
      setMBTI: (mbti) => set({ mbti }),
      setBirthday: (date) => set({ birthday: date }),
      setLocation: (region) => set({ location: region }),
      addLikedTag: (tagId) => set((s) => ({ likedTags: [...s.likedTags, tagId] })),
      addDislikedTag: (tagId) => set((s) => ({ dislikedTags: [...s.dislikedTags, tagId] })),
      setBalanceAnswer: (questionId, optionId) =>
        set((s) => ({ balanceAnswers: { ...s.balanceAnswers, [questionId]: optionId } })),
      setVibe: (vibe) => set({ selectedVibe: vibe }),
      completeOnboarding: () => set({ isComplete: true }),
      reset: () => set({
        dateType: null,
        mbti: null,
        birthday: null,
        location: null,
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
