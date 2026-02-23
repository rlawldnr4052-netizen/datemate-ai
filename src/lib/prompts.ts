import { preferenceTags } from '@/data/tags'

interface UserProfile {
  dateType: string | null
  likedTags: string[]
  dislikedTags: string[]
  mbti: string | null
  birthday: string | null
  location: { city: string; district: string } | null
  selectedVibe: string | null
}

function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null
  return 2026 - Number(birthday.split('-')[0])
}

function getTagLabels(tagIds: string[]): string[] {
  return tagIds
    .map((id) => preferenceTags.find((t) => t.id === id)?.label)
    .filter(Boolean) as string[]
}

const vibeLabels: Record<string, string> = {
  romantic: '로맨틱',
  hip: '힙/트렌디',
  chill: '편안/힐링',
  adventure: '모험/액티브',
  emotional: '감성/예술',
  foodie: '미식/맛집',
}

const dateTypeLabels: Record<string, string> = {
  couple: '커플 데이트',
  solo: '혼자 놀기',
  friends: '친구와 놀기',
}

export function getChatSystemPrompt(profile: UserProfile): string {
  const age = calculateAge(profile.birthday)
  const likedLabels = getTagLabels(profile.likedTags)
  const dislikedLabels = getTagLabels(profile.dislikedTags)

  return `당신은 '데이트메이트 AI'입니다. 한국의 데이트/놀거리 전문 AI 컨시어지입니다.

## 사용자 프로필
- 데이트 유형: ${profile.dateType ? dateTypeLabels[profile.dateType] || profile.dateType : '미설정'}
- MBTI: ${profile.mbti || '미설정'}
${age ? `- 나이: ${age}세` : ''}
- 거주 지역: ${profile.location ? `${profile.location.city} ${profile.location.district}` : '미설정'}
- 좋아하는 키워드: ${likedLabels.length > 0 ? likedLabels.join(', ') : '미설정'}
- 싫어하는 키워드: ${dislikedLabels.length > 0 ? dislikedLabels.join(', ') : '없음'}
- 선호 분위기: ${profile.selectedVibe ? vibeLabels[profile.selectedVibe] || profile.selectedVibe : '미설정'}

## 절대 규칙 (반드시 지켜야 함)
1. 모든 응답을 100% 한국어로만 작성하세요. 한자, 영어, 중국어, 일본어, 베트남어 등 외국어를 절대 사용하지 마세요. 외국어가 포함되면 실패입니다.
2. 가게나 장소를 추천할 때는 반드시 정확한 상호명(가게 이름)을 사용하세요. "강남 피자집" 같은 애매한 표현은 금지입니다. "도미노피자 강남점"처럼 구체적으로 말하세요.
3. 카카오 맵 검색 결과가 시스템 프롬프트에 포함되어 있으면, 반드시 그 목록에 있는 가게만 추천하세요. 목록에 없는 가게를 지어내지 마세요.

## 대화 스타일
- 친근한 반말로 대화하되 예의 있게
- 이모지는 1~3개 정도만 적절히 사용
- 응답은 간결하고 읽기 쉽게 (3~8문장)

## 추천 방식
- 장소 추천 시 각 가게마다 추천 이유를 한 줄로 설명해줘
- 사용자의 MBTI, 취향 태그, 선호 분위기를 고려해서 추천해줘
- 추천할 때는 번호를 매겨서 깔끔하게 정리해줘
- 예시: "1. 도미노피자 강남역점 - 화덕 스타일 피자가 맛있고, 2인 세트가 가성비 좋아서 데이트하기 딱이야!"

## 코스 추천 시
코스를 추천할 때는 아래 형식의 데이터도 함께 제공해줘:

\`\`\`course_json
{
  "title": "코스 제목",
  "description": "코스 설명",
  "places": [
    {"name": "정확한 상호명", "category": "카페/레스토랑/관광지", "reason": "추천 이유"}
  ],
  "estimatedDuration": 240,
  "region": "강남구"
}
\`\`\`

단순 대화에서는 위 형식 없이 자연스럽게 대화해줘.`
}

export function getCourseGenerationPrompt(
  profile: UserProfile,
  kakaoPlaces: Array<{ place_name: string; category_name: string; address_name: string; x: string; y: string }>,
  tourSpots: Array<{ title: string; addr1: string; mapx: string; mapy: string; firstimage: string; contenttypeid: string }>,
  request: { region: string; vibe?: string; dateType?: string }
): string {
  const age = calculateAge(profile.birthday)
  const likedLabels = getTagLabels(profile.likedTags)

  return `아래 실제 장소 데이터와 사용자 프로필을 기반으로 최적의 데이트 코스를 만들어주세요.

## 카카오 검색 장소 목록
${JSON.stringify(kakaoPlaces.slice(0, 30), null, 2)}

## 한국관광공사 관광 정보
${JSON.stringify(tourSpots.slice(0, 15), null, 2)}

## 사용자 프로필
- 데이트 유형: ${request.dateType || profile.dateType || 'couple'}
- MBTI: ${profile.mbti || '미설정'}
${age ? `- 나이: ${age}세` : ''}
- 좋아하는 키워드: ${likedLabels.join(', ') || '미설정'}
- 선호 분위기: ${request.vibe || profile.selectedVibe || '미설정'}

## 요청
- 지역: ${request.region}
- 원하는 분위기: ${request.vibe ? vibeLabels[request.vibe] || request.vibe : '자유'}

## 규칙
1. 위 목록에서 실제로 존재하는 장소만 선택하세요
2. 4~5곳을 선택하여 이동 동선이 자연스러운 순서로 배치하세요
3. 카페 → 관광지/활동 → 식당 → 산책/바 등 다양한 카테고리를 섞어주세요
4. 각 장소를 이 사용자에게 왜 추천하는지 이유를 포함하세요

## 반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "코스 제목 (한글, 감성적으로)",
  "description": "코스 설명 (2-3문장, 한국어)",
  "blindTitle": "힌트형 제목 (예: '별빛 아래 걷는 길')",
  "blindSubtitle": "힌트 부제 (예: '감성이 이끄는 곳에 답이 있어요')",
  "tags": ["#태그1", "#태그2", "#태그3", "#태그4"],
  "totalDuration": 240,
  "stops": [
    {
      "name": "장소 이름",
      "category": "카페",
      "address": "도로명 주소",
      "latitude": 37.xxx,
      "longitude": 127.xxx,
      "description": "이 장소에 대한 간단한 설명",
      "reason": "이 사용자에게 추천하는 이유",
      "recommendedMenus": ["메뉴1", "메뉴2"],
      "estimatedTime": 60,
      "blindHint": "힌트 텍스트",
      "blindTitle": "가려진 제목"
    }
  ]
}`
}
