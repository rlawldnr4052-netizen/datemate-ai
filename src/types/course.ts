import { DateType, Vibe } from './onboarding'

export type CourseMode = 'standard' | 'blind'

export interface Place {
  id: string
  name: string
  category: string
  imageUrls: string[]
  rating: number
  description: string
  address: string
  latitude: number
  longitude: number
  recommendedMenus: string[]
  estimatedTime: number
  blindHint: string
  blindTitle: string
}

export interface QuestMission {
  id: string
  placeId: string
  description: string
  isCompleted: boolean
  photoUrl: string | null
}

export interface CourseStop {
  order: number
  place: Place
  walkingMinutesFromPrev: number | null
  questMission: QuestMission | null
  alternatives: Place[]
  isUnlocked: boolean
}

export interface Course {
  id: string
  title: string
  blindTitle: string
  blindSubtitle: string
  description: string
  tags: string[]
  heroImageUrl: string
  totalDuration: number
  totalDistance: number
  stops: CourseStop[]
  vibe: Vibe
  dateType: DateType
  region: string
  createdAt: string
}
