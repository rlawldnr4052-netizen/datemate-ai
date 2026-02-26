import { create } from 'zustand'
import { ChatMessage, QuickReply, CourseRecommendation } from '@/types/chat'
import { useCourseStore } from '@/stores/useCourseStore'

const defaultQuickReplies: QuickReply[] = [
  { id: 'q1', label: '오늘 데이트 코스 추천해줘', action: 'recommend' },
  { id: 'q2', label: '근처 맛집 알려줘', action: 'food' },
  { id: 'q3', label: '분위기 좋은 카페 추천', action: 'vibe' },
  { id: 'q4', label: '주말에 뭐하지?', action: 'weekend' },
]

interface UserProfileForChat {
  dateType: string | null
  likedTags: string[]
  dislikedTags: string[]
  mbti: string | null
  birthday: string | null
  location: { city: string; district: string } | null
  selectedVibe: string | null
  selectedBudget?: string | null
  geoLocation?: { lat: number; lng: number } | null
}

function parseCourseRecommendation(text: string): CourseRecommendation | null {
  // 1) ```course_json ... ``` (정상 포맷)
  const fenced = text.match(/```course_json\s*([\s\S]*?)```/)
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()) } catch { /* fallthrough */ }
  }
  // 2) course_json { ... } (백틱 없이 출력된 경우)
  const bare = text.match(/course_json\s*(\{[\s\S]*\})/)
  if (bare) {
    try { return JSON.parse(bare[1].trim()) } catch { /* fallthrough */ }
  }
  return null
}

function stripCourseJson(text: string): string {
  return text
    .replace(/```course_json\s*[\s\S]*?```/g, '')  // 백틱 포맷
    .replace(/course_json\s*\{[\s\S]*\}/g, '')       // 백틱 없는 포맷
    .trim()
}

function stripHumanReadableCourse(text: string): string {
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim()
      return !t.match(/^📍\s*\d+번째/) &&
             !(t.startsWith('→') && !t.includes('→ ')) &&
             !t.match(/^총 소요시간/) &&
             !t.match(/^이동은 전부/)
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  isTMIEnabled: boolean
  quickReplies: QuickReply[]
  sendMessage: (content: string, userProfile?: UserProfileForChat) => void
  toggleTMI: () => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'ai',
      content: '안녕! 나는 데이트메이트 AI야 💕\n오늘 어떤 데이트를 계획하고 있어? 내가 딱 맞는 코스를 만들어 줄게!',
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
  isTMIEnabled: false,
  quickReplies: defaultQuickReplies,

  sendMessage: async (content: string, userProfile?: UserProfileForChat) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    set((s) => ({
      messages: [...s.messages, userMsg],
      isTyping: true,
    }))

    try {
      // Prepare messages for API (exclude welcome, limit history)
      const allMessages = [...get().messages, userMsg]
      const chatHistory = allMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-20)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'ai',
          content: m.content,
        }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userProfile: userProfile || null,
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      const responseText = data.message || '죄송해요, 잠시 후 다시 시도해주세요!'

      const courseRecommendation = parseCourseRecommendation(responseText)
      let cleanContent = stripCourseJson(responseText)
      if (courseRecommendation) {
        cleanContent = stripHumanReadableCourse(cleanContent)
      }

      const aiMsgId = `ai-${Date.now()}`
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'ai',
        content: cleanContent,
        timestamp: new Date().toISOString(),
        courseRecommendation: courseRecommendation || undefined,
        isGeneratingCourse: !!courseRecommendation,
      }

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isTyping: false,
      }))

      // 코스 추천이 있으면 실제 코스 생성
      if (courseRecommendation) {
        try {
          const courseRes = await fetch('/api/course/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userProfile: userProfile || null,
              region: courseRecommendation.region || userProfile?.location?.district || '강남구',
              dateType: userProfile?.dateType || 'couple',
              vibe: userProfile?.selectedVibe || 'romantic',
            }),
          })

          if (courseRes.ok) {
            const courseData = await courseRes.json()
            const course = courseData.course
            useCourseStore.getState().addCourse(course)
            useCourseStore.getState().setActiveCourse(course.id)

            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? { ...m, generatedCourseId: course.id, isGeneratingCourse: false }
                  : m
              ),
            }))
          } else {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === aiMsgId ? { ...m, isGeneratingCourse: false } : m
              ),
            }))
          }
        } catch {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === aiMsgId ? { ...m, isGeneratingCourse: false } : m
            ),
          }))
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: '앗, 지금 잠시 연결이 불안정해요 😅\n잠시 후에 다시 말해줄래? 바로 답해줄게!',
        timestamp: new Date().toISOString(),
      }

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isTyping: false,
      }))
    }
  },

  toggleTMI: () => set((s) => ({ isTMIEnabled: !s.isTMIEnabled })),

  clearMessages: () =>
    set({
      messages: [
        {
          id: 'welcome',
          role: 'ai',
          content: '안녕! 나는 데이트메이트 AI야 💕\n오늘 어떤 데이트를 계획하고 있어? 내가 딱 맞는 코스를 만들어 줄게!',
          timestamp: new Date().toISOString(),
        },
      ],
    }),
}))
