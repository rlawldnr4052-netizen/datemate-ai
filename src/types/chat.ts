export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  tmiData?: TMIData
  courseRecommendation?: CourseRecommendation
  generatedCourseId?: string
  isGeneratingCourse?: boolean
}

export interface TMIData {
  type: 'local_knowledge' | 'nearby_people' | 'fun_fact'
  title: string
  content: string
  icon: string
}

export interface CourseRecommendation {
  title: string
  description: string
  places: { name: string; category: string; reason: string }[]
  estimatedDuration: number
  region: string
}

export interface QuickReply {
  id: string
  label: string
  action: string
}
