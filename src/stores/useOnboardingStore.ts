import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DateType, MBTIType, KoreanRegion, Vibe, BudgetLevel } from '@/types/onboarding'

interface OnboardingState {
  dateType: DateType | null
  mbti: MBTIType | null
  birthday: string | null
  location: KoreanRegion | null
  likedTags: string[]
  dislikedTags: string[]
  selectedVibe: Vibe | null
  selectedBudget: BudgetLevel | null
  isComplete: boolean
  setDateType: (type: DateType) => void
  setMBTI: (mbti: MBTIType) => void
  setBirthday: (date: string) => void
  setLocation: (region: KoreanRegion) => void
  addLikedTag: (tagId: string) => void
  addDislikedTag: (tagId: string) => void
  toggleLikedTag: (tagId: string) => void
  setLikedTags: (tags: string[]) => void
  setVibe: (vibe: Vibe) => void
  setBudget: (budget: BudgetLevel) => void
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
      selectedVibe: null,
      selectedBudget: null,
      isComplete: false,

      setDateType: (type) => set({ dateType: type }),
      setMBTI: (mbti) => set({ mbti }),
      setBirthday: (date) => set({ birthday: date }),
      setLocation: (region) => set({ location: region }),
      addLikedTag: (tagId) => set((s) => ({ likedTags: [...s.likedTags, tagId] })),
      addDislikedTag: (tagId) => set((s) => ({ dislikedTags: [...s.dislikedTags, tagId] })),
      toggleLikedTag: (tagId) => set((s) => ({
        likedTags: s.likedTags.includes(tagId)
          ? s.likedTags.filter((id) => id !== tagId)
          : [...s.likedTags, tagId],
      })),
      setLikedTags: (tags) => set({ likedTags: tags }),
      setVibe: (vibe) => set({ selectedVibe: vibe }),
      setBudget: (budget) => set({ selectedBudget: budget }),
      completeOnboarding: () => set({ isComplete: true }),
      reset: () => set({
        dateType: null,
        mbti: null,
        birthday: null,
        location: null,
        likedTags: [],
        dislikedTags: [],
        selectedVibe: null,
        selectedBudget: null,
        isComplete: false,
      }),
    }),
    { name: 'datemate-onboarding' },
  ),
)
