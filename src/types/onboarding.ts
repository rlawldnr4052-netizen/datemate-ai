export type DateType = 'couple' | 'solo' | 'friends'

export interface PreferenceTag {
  id: string
  label: string
  imageUrl: string
  category: 'vibe' | 'place' | 'food' | 'activity'
}

export interface BalanceOption {
  id: string
  imageUrl: string
  label: string
}

export interface BalanceQuestion {
  id: string
  optionA: BalanceOption
  optionB: BalanceOption
}

export type Vibe = 'romantic' | 'hip' | 'chill' | 'adventure' | 'emotional' | 'foodie'

export interface VibeOption {
  id: Vibe
  label: string
  emoji: string
  gradient: string
  description: string
}
