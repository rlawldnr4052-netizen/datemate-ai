import { create } from 'zustand'
import { QuestMission } from '@/types/course'

interface Quest {
  id: string
  courseId: string
  missions: QuestMission[]
  isActive: boolean
}

interface QuestState {
  activeQuest: Quest | null
  isQuestEnabled: boolean
  completedCount: number
  totalCourses: number
  totalPlaces: number
  totalShortForms: number
  toggleQuest: () => void
  completeMission: (missionId: string) => void
  startQuest: (courseId: string, missions: QuestMission[]) => void
}

export const useQuestStore = create<QuestState>()((set) => ({
  activeQuest: null,
  isQuestEnabled: true,
  completedCount: 12,
  totalCourses: 12,
  totalPlaces: 47,
  totalShortForms: 8,

  toggleQuest: () => set((s) => ({ isQuestEnabled: !s.isQuestEnabled })),

  completeMission: (missionId: string) =>
    set((s) => ({
      activeQuest: s.activeQuest
        ? {
            ...s.activeQuest,
            missions: s.activeQuest.missions.map((m) =>
              m.id === missionId ? { ...m, isCompleted: true, photoUrl: '/images/places/sample.jpg' } : m,
            ),
          }
        : null,
    })),

  startQuest: (courseId, missions) =>
    set({
      activeQuest: {
        id: `quest-${courseId}`,
        courseId,
        missions,
        isActive: true,
      },
    }),
}))
