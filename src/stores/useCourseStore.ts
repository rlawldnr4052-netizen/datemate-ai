import { create } from 'zustand'
import { Course, CourseMode } from '@/types/course'
import { mockCourses } from '@/data/courses'

interface CourseState {
  courses: Course[]
  activeCourseId: string | null
  mode: CourseMode
  isGenerating: boolean
  setMode: (mode: CourseMode) => void
  setActiveCourse: (id: string) => void
  unlockStop: (courseId: string, stopOrder: number) => void
  getActiveCourse: () => Course | null
  addCourse: (course: Course) => void
  generateCourse: (params: {
    userProfile: Record<string, unknown>
    region: string
    dateType?: string
    vibe?: string
  }) => Promise<Course | null>
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  courses: mockCourses,
  activeCourseId: null,
  mode: 'standard',
  isGenerating: false,

  setMode: (mode) => set({ mode }),
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
}))
