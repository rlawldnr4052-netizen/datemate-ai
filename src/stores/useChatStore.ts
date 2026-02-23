import { create } from 'zustand'
import { ChatMessage, QuickReply, CourseRecommendation } from '@/types/chat'

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
}

function parseCourseRecommendation(text: string): CourseRecommendation | null {
  const match = text.match(/```course_json\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}

function stripCourseJson(text: string): string {
  return text.replace(/```course_json\s*[\s\S]*?```/g, '').trim()
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
      const cleanContent = stripCourseJson(responseText)

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: cleanContent,
        timestamp: new Date().toISOString(),
        courseRecommendation: courseRecommendation || undefined,
      }

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isTyping: false,
      }))
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
