import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini, type GeminiMessage } from '@/lib/api/gemini'
import { searchPlacesByKeyword } from '@/lib/api/naver'
import { fetchWeather, getWeatherPromptContext } from '@/lib/api/weather'
import { getChatSystemPrompt } from '@/lib/prompts'

// AI 응답에서 외국어 문자를 제거하는 후처리 함수
// JSON 키(title, name 등)는 ASCII라 영향 없음 → 전체 텍스트에 적용
function cleanForeignCharacters(text: string): string {
  return text.replace(/[\u0E00-\u0E7F\u0300-\u036F\u0250-\u02AF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0900-\u097F\u0400-\u04FF]/g, '')
}

// GPS 좌표 → 정확한 주소 (역지오코딩)
// 반환: { full: "용인시 기흥구 구갈동", dong: "구갈동", gu: "기흥구", city: "용인시" }
interface ReverseGeocodeResult {
  full: string
  dong: string | null  // 동/읍/면 레벨
  gu: string | null     // 구/군 레벨
  city: string | null
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'DateMateAI/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address
    if (!addr) return null

    // 한국 주소 체계: 시/도 → 시/군/구 → 동/읍/면
    const city = addr.city || addr.town || addr.county || null
    const gu = addr.borough || null  // 구/군 레벨
    const dong = addr.suburb || addr.quarter || addr.neighbourhood || null  // 동/읍/면 레벨

    const parts = [city, gu, dong].filter(Boolean)
    if (parts.length === 0) {
      // display_name에서 fallback 추출 (예: "구갈동, 기흥구, 용인시, 대한민국")
      const displayParts = (data.display_name || '').split(',').map((s: string) => s.trim())
      const koreaIdx = displayParts.findIndex((p: string) => p === '대한민국')
      if (koreaIdx > 0) {
        const addressParts = displayParts.slice(0, koreaIdx).filter((p: string) => !/^\d+$/.test(p)).reverse()
        return { full: addressParts.join(' '), dong: null, gu: null, city: addressParts[0] || null }
      }
      return null
    }

    return { full: parts.join(' '), dong, gu, city }
  } catch {
    return null
  }
}

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

    // GPS 좌표로 정확한 위치 파악
    const geoLocation = userProfile?.geoLocation as { lat: number; lng: number } | null | undefined
    let geoResult: ReverseGeocodeResult | null = null
    if (geoLocation?.lat && geoLocation?.lng) {
      geoResult = await reverseGeocode(geoLocation.lat, geoLocation.lng)
    }

    // 가장 정밀한 검색용 지역명 결정: 동 > 구 > 시 > onboarding 위치
    // 네이버 검색에 "구갈동 맛집" 처럼 동 레벨로 검색해야 가까운 결과가 나옴
    const dongName = geoResult?.dong // "구갈동"
    const guName = geoResult?.gu     // "기흥구"
    const cityName = geoResult?.city // "용인시"
    const preciseSearchArea = dongName
      ? `${guName ? guName + ' ' : ''}${dongName}`  // "기흥구 구갈동"
      : guName || cityName || null

    // 마지막 사용자 메시지 가져오기
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')

    // "내 주변", "근처", "주변" 등 현위치 기반 키워드 감지
    const nearbyKeywords = ['내 주변', '근처', '주변', '가까운', '여기', '지금 위치', '현재 위치', '이 근방', '이 동네']
    const isNearbyRequest = lastUserMessage ? nearbyKeywords.some(kw => lastUserMessage.content.includes(kw)) : false

    // 검색 지역: GPS 기반 정확한 주소 우선, 없으면 onboarding 위치
    const searchQuery = lastUserMessage ? extractSearchQuery(
      lastUserMessage.content,
      preciseSearchArea ? null : userProfile?.location, // GPS 주소 있으면 onboarding 위치 무시
    ) : null

    // GPS 정밀 지역명으로 검색어 보강
    let effectiveQuery = searchQuery
    if (effectiveQuery && preciseSearchArea && !effectiveQuery.includes(preciseSearchArea)) {
      // 검색어에 onboarding 지역이 들어있으면 GPS 지역으로 교체
      const queryParts = effectiveQuery.split(' ')
      const category = queryParts[queryParts.length - 1] // 마지막이 카테고리 (맛집, 카페 등)
      effectiveQuery = `${preciseSearchArea} ${category}`
    }

    // "내 주변" 요청인데 effectiveQuery가 null이면 강제로 검색 실행
    if (!effectiveQuery && isNearbyRequest && preciseSearchArea) {
      effectiveQuery = `${preciseSearchArea} 맛집`
    }

    // 추천 요청이면 네이버 API로 실제 장소 검색 (코스용으로 다양한 카테고리)
    let placeContext = ''
    if (effectiveQuery && process.env.NAVER_CLIENT_ID) {
      try {
        // 검색 지역: 동 레벨이면 동으로, 아니면 구로
        const searchRegion = preciseSearchArea || effectiveQuery.split(' ')[0]

        // 메인 검색어로 검색
        const mainPlaces = await searchPlacesByKeyword(effectiveQuery, { size: 5 })

        // 코스를 위해 추가 카테고리도 검색 - 동 레벨로 정밀 검색
        const extraSearches = []
        if (searchRegion) {
          extraSearches.push(
            searchPlacesByKeyword(`${searchRegion} 카페`, { size: 5 }).catch(() => []),
            searchPlacesByKeyword(`${searchRegion} 관광지`, { size: 5 }).catch(() => []),
            searchPlacesByKeyword(`${searchRegion} 디저트`, { size: 5 }).catch(() => []),
            searchPlacesByKeyword(`${searchRegion} 맛집`, { size: 5 }).catch(() => []),
          )
        }
        // 동 레벨 검색 결과가 적을 수 있으니 구 레벨로도 추가 검색
        if (dongName && guName) {
          extraSearches.push(
            searchPlacesByKeyword(`${guName} 맛집`, { size: 5 }).catch(() => []),
            searchPlacesByKeyword(`${guName} 카페`, { size: 5 }).catch(() => []),
          )
        }
        const extraResults = await Promise.all(extraSearches)
        const allExtraPlaces = extraResults.flat()

        // 중복 제거
        const seenNames = new Set(mainPlaces.map(p => p.place_name))
        const uniqueExtras = allExtraPlaces.filter(p => {
          if (seenNames.has(p.place_name)) return false
          seenNames.add(p.place_name)
          return true
        })

        const allPlaces = [...mainPlaces, ...uniqueExtras]

        if (allPlaces.length > 0) {
          const placeList = allPlaces.map((p, i) =>
            `${i + 1}. ${p.place_name} | 카테고리: ${p.category_name} | 주소: ${p.road_address_name || p.address_name}${p.phone ? ` | 전화: ${p.phone}` : ''}`
          ).join('\n')
          placeContext = `\n\n## 네이버 실제 검색 결과\n아래는 "${searchRegion}" 근처의 실제 가게들이야. 반드시 이 목록에서만 골라서 추천해줘:\n${placeList}\n\n중요: 단순히 가게 목록만 나열하지 말고, 위 목록에서 다양한 카테고리(카페, 식당, 관광지, 디저트 등)를 골라서 시간 순서대로 **완전한 데이트 코스**를 만들어줘! 각 장소의 방문 시간, 추천 메뉴, 이동 방법을 포함해줘.`
        }
      } catch (e) {
        console.error('Naver search error in chat:', e)
      }
    }

    const baseSystemPrompt = getChatSystemPrompt(
      userProfile || {
        dateType: null,
        likedTags: [],
        dislikedTags: [],
        mbti: null,
        birthday: null,
        location: null,
        selectedVibe: null,
      },
      geoResult?.full || null,
      geoLocation ? { lat: geoLocation.lat, lng: geoLocation.lng } : undefined,
    )

    // 날씨 정보 추가
    let weatherContext = ''
    if (geoLocation?.lat && geoLocation?.lng) {
      const weather = await fetchWeather(geoLocation.lat, geoLocation.lng)
      if (weather) {
        weatherContext = getWeatherPromptContext(weather)
      }
    }

    const systemPrompt = baseSystemPrompt + weatherContext + placeContext

    // Convert chat messages to API format
    const geminiMessages: GeminiMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const rawResponse = await chatWithGemini(geminiMessages, systemPrompt)
    const response = cleanForeignCharacters(rawResponse)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
