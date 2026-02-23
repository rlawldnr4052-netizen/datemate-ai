import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini, type GeminiMessage } from '@/lib/api/gemini'
import { searchPlacesByKeyword } from '@/lib/api/kakao'
import { getChatSystemPrompt } from '@/lib/prompts'

// 추천 요청인지 판별하는 키워드
const RECOMMENDATION_KEYWORDS = [
  '추천', '맛집', '카페', '레스토랑', '식당', '밥', '먹',
  '피자', '파스타', '치킨', '고기', '초밥', '라멘', '국밥',
  '브런치', '디저트', '빵', '케이크', '술집', '바', '와인',
  '놀거리', '갈만한', '데이트', '코스', '어디', '뭐하',
  '관광', '구경', '산책', '공원', '미술관', '전시',
]

// 사용자 메시지에서 검색 키워드를 추출
function extractSearchQuery(message: string, location?: { city: string; district: string } | null): string | null {
  const lower = message.toLowerCase()
  const isRecommendation = RECOMMENDATION_KEYWORDS.some((kw) => lower.includes(kw))
  if (!isRecommendation) return null

  // 지역명이 메시지에 있으면 그대로 사용
  const regionMatch = message.match(/(강남|홍대|이태원|성수|연남|망원|을지로|익선동|삼청동|북촌|한남|잠실|신촌|건대|합정|상수|연희|서래마을|압구정|청담|가로수길|종로|명동|동대문|서울숲|여의도|판교|분당|수원|인천|부산|대구|제주)/)

  const region = regionMatch ? regionMatch[1] : (location?.district || '')

  // 음식 카테고리 추출
  const foodMatch = message.match(/(피자|파스타|치킨|고기|초밥|라멘|국밥|브런치|디저트|빵|케이크|한식|중식|일식|양식|분식|족발|삼겹살|스테이크|햄버거|타코|쌀국수|떡볶이)/)

  // 장소 카테고리 추출
  const placeMatch = message.match(/(카페|맛집|식당|레스토랑|술집|바|와인바|이자카야|펍|미술관|갤러리|공원|전시|영화관|볼링|노래방)/)

  const category = foodMatch ? foodMatch[1] : (placeMatch ? placeMatch[1] : '맛집')

  return `${region} ${category}`.trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userProfile } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages 배열이 필요합니다.' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
    }

    // 마지막 사용자 메시지 가져오기
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const searchQuery = lastUserMessage ? extractSearchQuery(lastUserMessage.content, userProfile?.location) : null

    // 추천 요청이면 카카오 API로 실제 장소 검색
    let placeContext = ''
    if (searchQuery && process.env.KAKAO_REST_API_KEY) {
      try {
        const places = await searchPlacesByKeyword(searchQuery, { size: 15 })
        if (places.length > 0) {
          const placeList = places.map((p, i) =>
            `${i + 1}. ${p.place_name} | 카테고리: ${p.category_name} | 주소: ${p.road_address_name || p.address_name}${p.phone ? ` | 전화: ${p.phone}` : ''}`
          ).join('\n')
          placeContext = `\n\n## 카카오 맵 실제 검색 결과 (검색어: "${searchQuery}")\n아래는 실제로 존재하는 가게들이야. 반드시 이 목록에서만 골라서 추천해줘:\n${placeList}\n\n위 목록에서 사용자 취향에 맞는 곳을 3~5개 골라서, 각 가게의 이름과 추천 이유를 구체적으로 설명해줘.`
        }
      } catch (e) {
        console.error('Kakao search error in chat:', e)
      }
    }

    const baseSystemPrompt = getChatSystemPrompt(userProfile || {
      dateType: null,
      likedTags: [],
      dislikedTags: [],
      mbti: null,
      birthday: null,
      location: null,
      selectedVibe: null,
    })

    const systemPrompt = baseSystemPrompt + placeContext

    // Convert chat messages to API format
    const geminiMessages: GeminiMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const response = await chatWithGemini(geminiMessages, systemPrompt)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
