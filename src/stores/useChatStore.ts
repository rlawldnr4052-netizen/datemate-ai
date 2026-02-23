import { create } from 'zustand'
import { ChatMessage, QuickReply } from '@/types/chat'

const defaultQuickReplies: QuickReply[] = [
  { id: 'q1', label: '코스 추천해줘', action: 'recommend' },
  { id: 'q2', label: '다른 장소 보여줘', action: 'alternative' },
  { id: 'q3', label: '근처 맛집 알려줘', action: 'food' },
  { id: 'q4', label: '분위기 좋은 곳', action: 'vibe' },
]

const aiResponses: Record<string, string[]> = {
  recommend: [
    '오늘 기분에 딱 맞는 코스를 찾았어! 성수동 감성 투어 어때요? 빈티지 카페에서 시작해서 서울숲 산책, 그리고 분위기 좋은 와인바로 마무리하는 코스에요 🌿',
    '혹시 오늘 날씨 좋은 거 알아요? 야외 활동 포함된 코스를 추천할게요. 한강 피크닉 → 망원시장 먹방 → 연남동 카페 루트가 딱이에요!',
  ],
  alternative: [
    '다른 코스도 있어요! 북촌 한옥마을 산책 → 삼청동 갤러리 → 이태원 루프탑 바 코스는 어떨까요? 감성 충전 보장이에요 ✨',
    '이번엔 좀 더 힙한 코스 어때요? 을지로 공장 카페 → 종로 빈티지 샵 → 익선동 한옥 와인바! 레트로 무드 가득한 하루가 될 거예요.',
  ],
  food: [
    '맛집이라면 제가 전문이죠! 지금 위치 기준으로 500m 내에 평점 4.5 이상 맛집이 3개나 있어요. 특히 수제 파스타집이 대기 없이 바로 갈 수 있어요 🍝',
  ],
  vibe: [
    '분위기 좋은 곳이요? 지금 시간대면 노을 지는 한강뷰 카페를 추천해요. 창가 자리에서 보는 석양이 정말 예술이에요! 예약도 가능하니까 바로 잡아줄까요? 🌅',
  ],
  default: [
    '좋은 질문이에요! 더 자세히 알려주면 딱 맞는 코스를 찾아줄게요. 오늘 어떤 분위기를 원하세요?',
    '오 재밌겠다! 혹시 특별히 가고 싶은 지역이 있어요? 아니면 제가 취향에 맞춰서 골라줄게요 😊',
    '알겠어요! 조금만 기다려주세요, 최적의 코스를 만들어볼게요... 🎯',
  ],
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  isTMIEnabled: boolean
  quickReplies: QuickReply[]
  sendMessage: (content: string) => void
  toggleTMI: () => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'ai',
      content: '안녕하세요! 저는 데이트메이트 AI예요 💕\n오늘 어떤 데이트를 계획하고 있나요? 제가 완벽한 코스를 만들어 드릴게요!',
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
  isTMIEnabled: false,
  quickReplies: defaultQuickReplies,

  sendMessage: (content: string) => {
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

    // Find matching response category
    const lowerContent = content.toLowerCase()
    let responseCategory = 'default'
    if (lowerContent.includes('추천') || lowerContent.includes('코스')) {
      responseCategory = 'recommend'
    } else if (lowerContent.includes('다른') || lowerContent.includes('대안')) {
      responseCategory = 'alternative'
    } else if (lowerContent.includes('맛집') || lowerContent.includes('먹')) {
      responseCategory = 'food'
    } else if (lowerContent.includes('분위기') || lowerContent.includes('감성')) {
      responseCategory = 'vibe'
    }

    const responses = aiResponses[responseCategory] || aiResponses.default
    const response = responses[Math.floor(Math.random() * responses.length)]

    const isTMI = get().isTMIEnabled

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
        tmiData: isTMI
          ? {
              type: 'fun_fact',
              title: '알고 계셨나요?',
              content: '이 근처에는 1960년대 인쇄소를 개조한 카페가 있어요. 오래된 활판인쇄기가 인테리어로 남아있답니다!',
              icon: '💡',
            }
          : undefined,
      }

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isTyping: false,
      }))
    }, 1200 + Math.random() * 800)
  },

  toggleTMI: () => set((s) => ({ isTMIEnabled: !s.isTMIEnabled })),
}))
