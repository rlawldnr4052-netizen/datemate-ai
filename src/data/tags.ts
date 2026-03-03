import { PreferenceTag, BalanceQuestion, VibeOption, BudgetOption } from '@/types/onboarding'

export const preferenceTags: PreferenceTag[] = [
  // Vibe (분위기)
  { id: 't1', label: '#모노톤', description: '차분하고 세련된 분위기', category: 'vibe', gradient: 'linear-gradient(135deg, #374151, #6b7280)', emoji: '🖤' },
  { id: 't2', label: '#빈티지', description: '레트로 감성이 물씬', category: 'vibe', gradient: 'linear-gradient(135deg, #92400e, #d97706)', emoji: '📻' },
  { id: 't3', label: '#자연', description: '초록빛 힐링 스팟', category: 'vibe', gradient: 'linear-gradient(135deg, #059669, #34d399)', emoji: '🌿' },
  { id: 't4', label: '#야경', description: '반짝이는 밤의 낭만', category: 'vibe', gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', emoji: '🌃' },
  { id: 't5', label: '#레트로', description: '과거로 떠나는 타임슬립', category: 'vibe', gradient: 'linear-gradient(135deg, #b45309, #f59e0b)', emoji: '🎞️' },
  { id: 't6', label: '#미니멀', description: '군더더기 없는 깔끔함', category: 'vibe', gradient: 'linear-gradient(135deg, #d1d5db, #9ca3af)', emoji: '◻️' },

  // Place (장소)
  { id: 't7', label: '#LP바', description: '아날로그 감성 한 잔', category: 'place', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', emoji: '🎵' },
  { id: 't8', label: '#루프탑', description: '하늘 가까운 핫플', category: 'place', gradient: 'linear-gradient(135deg, #0ea5e9, #67e8f9)', emoji: '🏙️' },
  { id: 't9', label: '#한옥', description: '전통과 현대의 만남', category: 'place', gradient: 'linear-gradient(135deg, #78350f, #b45309)', emoji: '🏛️' },
  { id: 't10', label: '#카페', description: '커피 한 잔의 여유', category: 'place', gradient: 'linear-gradient(135deg, #a16207, #eab308)', emoji: '☕' },
  { id: 't11', label: '#북카페', description: '책과 커피의 조합', category: 'place', gradient: 'linear-gradient(135deg, #166534, #4ade80)', emoji: '📚' },
  { id: 't12', label: '#갤러리', description: '예술 작품 속 데이트', category: 'place', gradient: 'linear-gradient(135deg, #9333ea, #c084fc)', emoji: '🖼️' },

  // Food (음식)
  { id: 't13', label: '#오마카세', description: '셰프가 이끄는 미식', category: 'food', gradient: 'linear-gradient(135deg, #dc2626, #f87171)', emoji: '🍣' },
  { id: 't14', label: '#와인', description: '한 잔에 담긴 로맨스', category: 'food', gradient: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', emoji: '🍷' },
  { id: 't15', label: '#브런치', description: '여유로운 아침 식사', category: 'food', gradient: 'linear-gradient(135deg, #ea580c, #fb923c)', emoji: '🥞' },
  { id: 't16', label: '#스트릿푸드', description: '길거리 먹방 투어', category: 'food', gradient: 'linear-gradient(135deg, #e11d48, #fb7185)', emoji: '🌮' },
  { id: 't17', label: '#파인다이닝', description: '특별한 날의 코스 요리', category: 'food', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)', emoji: '🍽️' },
  { id: 't18', label: '#이자카야', description: '일본식 감성 술집', category: 'food', gradient: 'linear-gradient(135deg, #c2410c, #f97316)', emoji: '🏮' },

  // Activity (활동)
  { id: 't19', label: '#전시', description: '문화 예술 나들이', category: 'activity', gradient: 'linear-gradient(135deg, #db2777, #f472b6)', emoji: '🎨' },
  { id: 't20', label: '#피크닉', description: '도시락 들고 공원으로', category: 'activity', gradient: 'linear-gradient(135deg, #16a34a, #86efac)', emoji: '🧺' },
  { id: 't21', label: '#영화', description: '팝콘과 함께하는 시간', category: 'activity', gradient: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', emoji: '🎬' },
  { id: 't22', label: '#공방체험', description: '함께 만드는 추억', category: 'activity', gradient: 'linear-gradient(135deg, #b45309, #fbbf24)', emoji: '🎭' },

  // Style (스타일)
  { id: 't23', label: '#사진맛집', description: '인스타 감성 폭발', category: 'style', gradient: 'linear-gradient(135deg, #ec4899, #f9a8d4)', emoji: '📸' },
  { id: 't24', label: '#힙플레이스', description: '트렌드 세터의 선택', category: 'style', gradient: 'linear-gradient(135deg, #f43f5e, #fda4af)', emoji: '🔥' },
  { id: 't25', label: '#로컬맛집', description: '현지인만 아는 숨은 맛집', category: 'style', gradient: 'linear-gradient(135deg, #d97706, #fde68a)', emoji: '📍' },

  // Time (시간대)
  { id: 't26', label: '#선셋', description: '노을 속 황금빛 데이트', category: 'time', gradient: 'linear-gradient(135deg, #ea580c, #fdba74)', emoji: '🌅' },
  { id: 't27', label: '#낮산책', description: '햇살 아래 여유 산책', category: 'time', gradient: 'linear-gradient(135deg, #0d9488, #5eead4)', emoji: '☀️' },
  { id: 't28', label: '#밤문화', description: '밤이 더 빛나는 도시', category: 'time', gradient: 'linear-gradient(135deg, #312e81, #818cf8)', emoji: '🌙' },
]

export const balanceQuestions: BalanceQuestion[] = [
  {
    id: 'bq1',
    optionA: { id: 'bq1a', label: '조용한 골목 카페', emoji: '☕', gradient: 'linear-gradient(135deg, #a16207, #eab308)' },
    optionB: { id: 'bq1b', label: '활기찬 루프탑 바', emoji: '🍸', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  },
  {
    id: 'bq2',
    optionA: { id: 'bq2a', label: '노을 지는 한강', emoji: '🌅', gradient: 'linear-gradient(135deg, #ea580c, #fdba74)' },
    optionB: { id: 'bq2b', label: '반짝이는 도시 야경', emoji: '🌃', gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)' },
  },
  {
    id: 'bq3',
    optionA: { id: 'bq3a', label: '분위기 있는 파인다이닝', emoji: '🍽️', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    optionB: { id: 'bq3b', label: '정겨운 포장마차', emoji: '🏮', gradient: 'linear-gradient(135deg, #c2410c, #f97316)' },
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

export const budgetOptions: BudgetOption[] = [
  { id: 'budget', label: '저예산', emoji: '💰', gradient: 'linear-gradient(135deg, #34d399, #6ee7b7)', description: '가성비 좋은 데이트', range: '~3만원' },
  { id: 'moderate', label: '보통', emoji: '💳', gradient: 'linear-gradient(135deg, #60a5fa, #93c5fd)', description: '적당한 가격의 데이트', range: '3~7만원' },
  { id: 'premium', label: '여유', emoji: '💎', gradient: 'linear-gradient(135deg, #f472b6, #fda4af)', description: '특별한 날 럭셔리 데이트', range: '7만원+' },
]
