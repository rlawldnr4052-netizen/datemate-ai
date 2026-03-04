export type DateType = 'couple' | 'solo' | 'friends'

export type MBTIType =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ'

export interface KoreanRegion {
  city: string
  district: string
}

export interface PreferenceTag {
  id: string
  label: string
  description: string
  category: 'vibe' | 'place' | 'food' | 'activity' | 'style' | 'time'
  gradient: string
  emoji: string
}

export type Vibe = 'romantic' | 'hip' | 'chill' | 'adventure' | 'emotional' | 'foodie'

export interface VibeOption {
  id: Vibe
  label: string
  emoji: string
  gradient: string
  description: string
}

export type BudgetLevel = 'budget' | 'moderate' | 'premium'

export interface BudgetOption {
  id: BudgetLevel
  label: string
  emoji: string
  gradient: string
  description: string
  range: string
}
