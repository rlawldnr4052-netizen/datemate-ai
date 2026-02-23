import { create } from 'zustand'
import { Course, CourseMode } from '@/types/course'
import { mockCourses } from '@/data/courses'

interface CourseState {
  courses: Course[]
  activeCourseId: string | null
  mode: CourseMode
  setMode: (mode: CourseMode) => void
  setActiveCourse: (id: string) => void
  unlockStop: (courseId: string, stopOrder: number) => void
  getActiveCourse: () => Course | null
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  courses: mockCourses,
  activeCourseId: null,
  mode: 'standard',

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
}))
