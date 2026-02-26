import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Course, CourseMode } from '@/types/course'
import { BudgetLevel } from '@/types/onboarding'
import { mockCourses } from '@/data/courses'

interface CourseState {
  courses: Course[]
  activeCourseId: string | null
  mode: CourseMode
  isGenerating: boolean
  savedCourseIds: string[]
  budgetFilter: BudgetLevel | null
  setMode: (mode: CourseMode) => void
  setBudgetFilter: (budget: BudgetLevel | null) => void
  setActiveCourse: (id: string) => void
  unlockStop: (courseId: string, stopOrder: number) => void
  getActiveCourse: () => Course | null
  addCourse: (course: Course) => void
  toggleSaveCourse: (id: string) => void
  isSaved: (id: string) => boolean
  generateCourse: (params: {
    userProfile: Record<string, unknown>
    region: string
    dateType?: string
    vibe?: string
    budget?: string
  }) => Promise<Course | null>
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      activeCourseId: null,
      mode: 'standard',
      isGenerating: false,
      savedCourseIds: [],
      budgetFilter: null,

      setMode: (mode) => set({ mode }),
      setBudgetFilter: (budget) => set({ budgetFilter: budget }),
      setActiveCourse: (id) => set({ activeCourseId: id }),
      unlockStop: (courseId, stopOrder) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  stops: c.stops.map((stop) =>
                    stop.order === stopOrder ? { ...stop, isUnlocked: true } : stop,
                  ),
                }
              : c,
          ),
        })),
      getActiveCourse: () => {
        const state = get()
        return state.courses.find((c) => c.id === state.activeCourseId) || null
      },
      addCourse: (course) =>
        set((s) => ({
          courses: [course, ...s.courses],
        })),
      toggleSaveCourse: (id) =>
        set((s) => ({
          savedCourseIds: s.savedCourseIds.includes(id)
            ? s.savedCourseIds.filter((cid) => cid !== id)
            : [...s.savedCourseIds, id],
        })),
      isSaved: (id) => get().savedCourseIds.includes(id),
      generateCourse: async (params) => {
        set({ isGenerating: true })
        try {
          const res = await fetch('/api/course/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          })

          if (!res.ok) {
            throw new Error(`API error: ${res.status}`)
          }

          const data = await res.json()
          const course = data.course as Course

          set((s) => ({
            courses: [course, ...s.courses],
            activeCourseId: course.id,
            isGenerating: false,
          }))

          return course
        } catch (error) {
          console.error('Course generation error:', error)
          set({ isGenerating: false })
          return null
        }
      },
    }),
    {
      name: 'datemate-courses',
      partialize: (state) => ({
        courses: state.courses,
        savedCourseIds: state.savedCourseIds,
        mode: state.mode,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<CourseState>
        const persistedCourses = p.courses ?? []
        // 새로 추가된 기본 코스를 자동 병합
        const persistedIds = new Set(persistedCourses.map((c) => c.id))
        const newDefaults = mockCourses.filter((c) => !persistedIds.has(c.id))
        return {
          ...current,
          ...p,
          courses: [...persistedCourses, ...newDefaults],
        }
      },
    }
  )
)
