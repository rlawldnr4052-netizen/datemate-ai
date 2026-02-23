import { PreferenceTag, BalanceQuestion, VibeOption } from '@/types/onboarding'

export const preferenceTags: PreferenceTag[] = [
  { id: 't1', label: '#모노톤', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop', category: 'vibe' },
  { id: 't2', label: '#LP바', imageUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=600&h=800&fit=crop', category: 'place' },
  { id: 't3', label: '#루프탑', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=800&fit=crop', category: 'place' },
  { id: 't4', label: '#빈티지', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop', category: 'vibe' },
  { id: 't5', label: '#오마카세', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=800&fit=crop', category: 'food' },
  { id: 't6', label: '#자연', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800&fit=crop', category: 'vibe' },
  { id: 't7', label: '#야경', imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=800&fit=crop', category: 'vibe' },
  { id: 't8', label: '#전시', imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=800&fit=crop', category: 'activity' },
  { id: 't9', label: '#와인', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop', category: 'food' },
  { id: 't10', label: '#한옥', imageUrl: 'https://images.unsplash.com/photo-1583167615645-8e72a0c34a96?w=600&h=800&fit=crop', category: 'place' },
  { id: 't11', label: '#카페', imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=800&fit=crop', category: 'place' },
  { id: 't12', label: '#브런치', imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=800&fit=crop', category: 'food' },
  { id: 't13', label: '#피크닉', imageUrl: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&h=800&fit=crop', category: 'activity' },
  { id: 't14', label: '#북카페', imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=800&fit=crop', category: 'place' },
  { id: 't15', label: '#스트릿푸드', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=800&fit=crop', category: 'food' },
]

export const balanceQuestions: BalanceQuestion[] = [
  {
    id: 'bq1',
    optionA: { id: 'bq1a', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', label: '조용한 골목 카페' },
    optionB: { id: 'bq1b', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=500&fit=crop', label: '활기찬 루프탑 바' },
  },
  {
    id: 'bq2',
    optionA: { id: 'bq2a', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=500&fit=crop', label: '노을 지는 한강' },
    optionB: { id: 'bq2b', imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=500&fit=crop', label: '반짝이는 도시 야경' },
  },
  {
    id: 'bq3',
    optionA: { id: 'bq3a', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=500&fit=crop', label: '분위기 있는 파인다이닝' },
    optionB: { id: 'bq3b', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=500&fit=crop', label: '정겨운 포장마차' },
  },
]

export const vibeOptions: VibeOption[] = [
  { id: 'romantic', label: '로맨틱', emoji: '💕', gradient: 'linear-gradient(135deg, #fb7185, #f9a8d4)', description: '설렘 가득한 하루' },
  { id: 'hip', label: '힙한', emoji: '🔥', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', description: '트렌디한 핫플 투어' },
  { id: 'chill', label: '여유로운', emoji: '🌿', gradient: 'linear-gradient(135deg, #34d399, #5eead4)', description: '느긋한 힐링 코스' },
  { id: 'adventure', label: '모험적인', emoji: '🗺️', gradient: 'linear-gradient(135deg, #fbbf24, #fb923c)', description: '새로운 발견의 연속' },
  { id: 'emotional', label: '감성적인', emoji: '🎨', gradient: 'linear-gradient(135deg, #f472b6, #fda4af)', description: '감성 충전 코스' },
  { id: 'foodie', label: '맛집 투어', emoji: '🍽️', gradient: 'linear-gradient(135deg, #f87171, #fdba74)', description: '미식가의 하루' },
]
