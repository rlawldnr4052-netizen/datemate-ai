import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredResponse } from '@/lib/api/gemini'
import { searchPlacesByKeyword } from '@/lib/api/kakao'
import { searchByArea, searchByKeyword, areaCodes, type TourSpot } from '@/lib/api/tourApi'
import { getCourseGenerationPrompt } from '@/lib/prompts'

// 지역명 → 검색 키워드 매핑
const regionSearchTerms: Record<string, string[]> = {
  성동구: ['성수동 카페', '성수동 맛집', '서울숲'],
  종로구: ['북촌 한옥마을', '삼청동 카페', '익선동 맛집'],
  마포구: ['연남동 카페', '홍대 맛집', '망원동'],
  용산구: ['이태원 맛집', '한남동 카페', '용산 관광'],
  강남구: ['강남 맛집', '압구정 카페', '강남 관광'],
  서초구: ['서래마을 카페', '반포 한강공원'],
  송파구: ['잠실 놀거리', '석촌호수'],
  중구: ['을지로 카페', '명동 맛집', '남산'],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userProfile, region, dateType, vibe } = body

    if (!region) {
      return NextResponse.json({ error: '지역을 지정해주세요.' }, { status: 400 })
    }

    // 1. 카카오 API로 장소 검색
    const searchTerms = regionSearchTerms[region] || [`${region} 카페`, `${region} 맛집`, `${region} 관광`]

    const kakaoResults = await Promise.allSettled(
      searchTerms.map((term) => searchPlacesByKeyword(term, { size: 10 }))
    )

    const kakaoPlaces = kakaoResults
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof searchPlacesByKeyword>>> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .filter((place, index, self) => self.findIndex((p) => p.id === place.id) === index) // 중복 제거

    // 2. 관광공사 TourAPI로 관광 데이터 조회
    const cityName = userProfile?.location?.city || '서울특별시'
    const areaCode = areaCodes[cityName] || 1 // 기본값: 서울

    const tourResults = await Promise.allSettled([
      searchByArea(areaCode, { contentTypeId: 12, numOfRows: 10 }), // 관광지
      searchByArea(areaCode, { contentTypeId: 39, numOfRows: 10 }), // 음식점
      searchByKeyword(region, { areaCode, numOfRows: 10 }),
    ])

    const tourSpots = tourResults
      .filter((r): r is PromiseFulfilledResult<TourSpot[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .filter((spot, index, self) => self.findIndex((s) => s.contentid === spot.contentid) === index)

    // 3. Gemini에 코스 생성 요청
    const kakaoForPrompt = kakaoPlaces.map((p) => ({
      place_name: p.place_name,
      category_name: p.category_name,
      address_name: p.road_address_name || p.address_name,
      x: p.x,
      y: p.y,
    }))

    const tourForPrompt = tourSpots.map((s) => ({
      title: s.title,
      addr1: s.addr1,
      mapx: s.mapx,
      mapy: s.mapy,
      firstimage: s.firstimage,
      contenttypeid: s.contenttypeid,
    }))

    const prompt = getCourseGenerationPrompt(
      userProfile || {
        dateType: null,
        likedTags: [],
        dislikedTags: [],
        mbti: null,
        birthday: null,
        location: null,
        selectedVibe: null,
      },
      kakaoForPrompt,
      tourForPrompt,
      { region, vibe, dateType }
    )

    const systemPrompt = '당신은 한국 데이트 코스 전문가입니다. 주어진 장소 데이터를 분석하여 최적의 코스를 JSON 형식으로 만들어주세요. JSON만 출력하고 다른 텍스트는 포함하지 마세요.'

    const aiResponse = await generateStructuredResponse(prompt, systemPrompt)

    // 4. JSON 파싱
    let courseData
    try {
      // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiResponse]
      const jsonStr = (jsonMatch[1] || aiResponse).trim()
      courseData = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse AI course response:', aiResponse)
      return NextResponse.json(
        { error: 'AI 코스 생성 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 5. Course 형식으로 변환
    const course = {
      id: `ai-${Date.now()}`,
      title: courseData.title,
      blindTitle: courseData.blindTitle || '새로운 모험이 기다려요',
      blindSubtitle: courseData.blindSubtitle || '감성이 이끄는 곳으로',
      description: courseData.description,
      tags: courseData.tags || [],
      heroImageUrl: tourSpots[0]?.firstimage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
      totalDuration: courseData.totalDuration || 240,
      totalDistance: 0,
      stops: (courseData.stops || []).map((stop: Record<string, unknown>, i: number) => ({
        order: i + 1,
        place: {
          id: `ai-place-${Date.now()}-${i}`,
          name: stop.name,
          category: stop.category,
          imageUrls: [],
          rating: 4.5,
          description: stop.description || '',
          address: stop.address || '',
          latitude: Number(stop.latitude) || 0,
          longitude: Number(stop.longitude) || 0,
          recommendedMenus: (stop.recommendedMenus as string[]) || [],
          estimatedTime: Number(stop.estimatedTime) || 60,
          blindHint: (stop.blindHint as string) || '숨겨진 매력이 있는 곳',
          blindTitle: (stop.blindTitle as string) || '???',
        },
        walkingMinutesFromPrev: i === 0 ? null : 10,
        questMission: null,
        alternatives: [],
        isUnlocked: true,
      })),
      vibe: vibe || userProfile?.selectedVibe || 'romantic',
      dateType: dateType || userProfile?.dateType || 'couple',
      region,
      createdAt: new Date().toISOString(),
    }

    // Calculate approximate distance from coordinates
    if (course.stops.length >= 2) {
      let totalDist = 0
      for (let i = 1; i < course.stops.length; i++) {
        const prev = course.stops[i - 1].place
        const curr = course.stops[i].place
        if (prev.latitude && curr.latitude) {
          totalDist += haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
        }
      }
      course.totalDistance = Math.round(totalDist * 10) / 10
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Course generate API error:', error)
    return NextResponse.json(
      { error: 'AI 코스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
