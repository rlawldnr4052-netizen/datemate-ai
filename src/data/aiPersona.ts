import { DateType } from '@/types/onboarding'
import { QuickReply } from '@/types/chat'

export interface AIPersona {
  name: string
  label: string
  emoji: string
  welcome: string
  gradientFrom: string
  gradientTo: string
  accentColor: string
  bgTint: string
  userBubbleBg: string
  quickReplies: QuickReply[]
}

export const aiPersonas: Record<DateType, AIPersona> = {
  couple: {
    name: '러브메이트',
    label: '연인 모드',
    emoji: '',
    welcome:
      '안녕! 나는 러브메이트야\n오늘 둘만의 특별한 데이트를 계획해볼까? 로맨틱한 코스를 만들어 줄게!',
    gradientFrom: '#FF6B82',
    gradientTo: '#FF8FA0',
    accentColor: '#FF6B82',
    bgTint: 'rgba(255, 107, 130, 0.02)',
    userBubbleBg: 'linear-gradient(135deg, #FF6B82, #FF8FA0)',
    quickReplies: [
      { id: 'c1', label: '오늘 데이트 코스 추천해줘', action: 'recommend' },
      { id: 'c2', label: '로맨틱한 레스토랑 알려줘', action: 'food' },
      { id: 'c3', label: '분위기 좋은 카페 추천', action: 'vibe' },
      { id: 'c4', label: '기념일 데이트 어떡하지?', action: 'special' },
    ],
  },
  solo: {
    name: '솔로메이트',
    label: '혼놀 모드',
    emoji: '',
    welcome:
      '안녕! 나는 솔로메이트야\n오늘 나만의 시간을 알차게 보내볼까? 혼자서도 즐거운 코스를 만들어 줄게!',
    gradientFrom: '#8B5CF6',
    gradientTo: '#A78BFA',
    accentColor: '#8B5CF6',
    bgTint: 'rgba(139, 92, 246, 0.02)',
    userBubbleBg: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    quickReplies: [
      { id: 's1', label: '오늘 혼자 갈만한 곳 추천해줘', action: 'recommend' },
      { id: 's2', label: '혼밥하기 좋은 맛집 알려줘', action: 'food' },
      { id: 's3', label: '조용한 카페 추천', action: 'vibe' },
      { id: 's4', label: '주말에 혼자 뭐하지?', action: 'weekend' },
    ],
  },
  friends: {
    name: '프렌즈메이트',
    label: '친구 모드',
    emoji: '',
    welcome:
      '안녕! 나는 프렌즈메이트야\n오늘 친구들이랑 뭐 할지 고민이야? 같이 놀기 딱 좋은 코스를 만들어 줄게!',
    gradientFrom: '#F59E0B',
    gradientTo: '#FBBF24',
    accentColor: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.02)',
    userBubbleBg: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    quickReplies: [
      { id: 'f1', label: '오늘 친구들이랑 놀 곳 추천해줘', action: 'recommend' },
      { id: 'f2', label: '단체로 가기 좋은 맛집', action: 'food' },
      { id: 'f3', label: '같이 놀기 좋은 활동 추천', action: 'activity' },
      { id: 'f4', label: '주말에 친구랑 뭐하지?', action: 'weekend' },
    ],
  },
}

export function getPersona(dateType: DateType | null): AIPersona {
  return aiPersonas[dateType || 'couple']
}
