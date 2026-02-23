import { MBTIType } from '@/types/onboarding'

export interface MBTIOption {
  type: MBTIType
  label: string
  description: string
  emoji: string
}

export const mbtiOptions: MBTIOption[] = [
  { type: 'ISTJ', label: '현실주의자', description: '책임감 있고 신중한', emoji: '📋' },
  { type: 'ISFJ', label: '수호자', description: '따뜻하고 헌신적인', emoji: '🛡️' },
  { type: 'INFJ', label: '옹호자', description: '통찰력 있는 이상주의자', emoji: '🔮' },
  { type: 'INTJ', label: '전략가', description: '독립적인 전략적 사고가', emoji: '♟️' },
  { type: 'ISTP', label: '장인', description: '대담하고 실용적인', emoji: '🔧' },
  { type: 'ISFP', label: '모험가', description: '유연하고 매력적인', emoji: '🎨' },
  { type: 'INFP', label: '중재자', description: '이상주의적 감성파', emoji: '🌙' },
  { type: 'INTP', label: '논리술사', description: '혁신적인 발명가', emoji: '💡' },
  { type: 'ESTP', label: '사업가', description: '에너지 넘치는 모험가', emoji: '⚡' },
  { type: 'ESFP', label: '연예인', description: '자유로운 영혼의 엔터테이너', emoji: '🎭' },
  { type: 'ENFP', label: '활동가', description: '열정적인 자유영혼', emoji: '🦋' },
  { type: 'ENTP', label: '변론가', description: '대담한 발명가', emoji: '🚀' },
  { type: 'ESTJ', label: '경영자', description: '체계적이고 결단력 있는', emoji: '📊' },
  { type: 'ESFJ', label: '집정관', description: '사교적이고 배려 깊은', emoji: '🤝' },
  { type: 'ENFJ', label: '선도자', description: '카리스마 넘치는 리더', emoji: '✨' },
  { type: 'ENTJ', label: '통솔자', description: '대담하고 상상력 풍부한', emoji: '👑' },
]
