import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredResponse } from '@/lib/api/gemini'
import { searchPlacesByKeyword, searchImages, searchBlogReviews } from '@/lib/api/naver'
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
    const { userProfile, region, dateType, vibe, budget, gachaContext } = body

    if (!region) {
      return NextResponse.json({ error: '지역을 지정해주세요.' }, { status: 400 })
    }

    // 1. 네이버 API로 장소 검색 (가챠 모드면 가챠 키워드 기반 검색)
    let searchTerms: string[]
    if (gachaContext) {
      const station = gachaContext.station || region
      searchTerms = [
        `${station} ${gachaContext.meal || '맛집'}`,
        `${station} 카페`,
        `${station} ${gachaContext.activity || '놀거리'}`,
      ]
    } else {
      searchTerms = regionSearchTerms[region] || [`${region} 카페`, `${region} 맛집`, `${region} 관광`]
    }

    const naverResults = await Promise.allSettled(
      searchTerms.map((term) => searchPlacesByKeyword(term, { size: 5 }))
    )

    const naverPlaces = naverResults
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
    const naverForPrompt = naverPlaces.map((p) => ({
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
      naverForPrompt,
      tourForPrompt,
      { region, vibe, dateType, budget, gachaContext }
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

    // 5. 각 장소별 이미지 + 블로그 리뷰 검색 (병렬)
    const stopsRaw = courseData.stops || []
    const [imageResults, blogResults] = await Promise.all([
      Promise.allSettled(
        stopsRaw.map((stop: Record<string, unknown>) =>
          searchImages(String(stop.name), 3)
        )
      ),
      Promise.allSettled(
        stopsRaw.map((stop: Record<string, unknown>) =>
          searchBlogReviews(String(stop.name), 3)
        )
      ),
    ])

    // 5-1. 블로그 리뷰 기반으로 blindHint 정제
    const stopsWithReviews = stopsRaw.map((stop: Record<string, unknown>, i: number) => {
      const blogResult = blogResults[i]
      const reviews = blogResult.status === 'fulfilled' ? blogResult.value : []
      const reviewSnippets = reviews
        .map((r: { description: string }) => r.description)
        .join(' ')
        .slice(0, 300)
      return { ...stop, reviewSnippets }
    })

    // 리뷰가 있는 장소가 하나라도 있으면 blindHint 정제 요청
    const hasReviews = stopsWithReviews.some((s: { reviewSnippets: string }) => s.reviewSnippets.length > 20)
    if (hasReviews) {
      try {
        const refinePrompt = `아래 장소들의 블로그 리뷰 요약을 참고하여, 각 장소의 blindHint를 더 실감나고 은유적으로 다시 작성해줘.

규칙:
- 리뷰에서 언급된 실제 특징(분위기, 인테리어, 맛, 뷰, 감성)을 반영해
- 장소명, 주소는 절대 노출하지 마
- 오감을 활용한 문학적 표현으로, 15~25자 내외
- 방문객이 실제로 느낀 감성을 녹여내

장소 데이터:
${stopsWithReviews.map((s: { name: unknown; category: unknown; blindHint: unknown; reviewSnippets: string }, i: number) => `
${i + 1}. ${s.name} (${s.category})
현재 blindHint: "${s.blindHint}"
리뷰 요약: "${s.reviewSnippets || '리뷰 없음'}"
`).join('')}

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이):
[${stopsRaw.map((_: unknown, i: number) => `"${i + 1}번 장소의 새로운 blindHint"`).join(', ')}]`

        const refineResponse = await generateStructuredResponse(
          refinePrompt,
          '당신은 감성적인 한국어 카피라이터입니다. 장소의 분위기를 은유적으로 표현하는 전문가입니다. JSON 배열만 출력하세요.'
        )

        const hintsMatch = refineResponse.match(/\[[\s\S]*\]/)
        if (hintsMatch) {
          const refinedHints = JSON.parse(hintsMatch[0])
          if (Array.isArray(refinedHints) && refinedHints.length === stopsRaw.length) {
            stopsRaw.forEach((stop: Record<string, unknown>, i: number) => {
              if (typeof refinedHints[i] === 'string' && refinedHints[i].length > 3) {
                stop.blindHint = refinedHints[i]
              }
            })
          }
        }
      } catch (e) {
        console.error('BlindHint refinement failed (using original):', e)
      }
    }

    // 6. Course 형식으로 변환
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
      stops: stopsRaw.map((stop: Record<string, unknown>, i: number) => {
        const imgResult = imageResults[i]
        const images = imgResult.status === 'fulfilled' ? imgResult.value : []
        const imageUrls = images.map((img: { image_url: string }) => img.image_url).filter(Boolean)

        return {
          order: i + 1,
          place: {
            id: `ai-place-${Date.now()}-${i}`,
            name: stop.name,
            category: stop.category,
            imageUrls,
            rating: 4.5,
            description: stop.description || '',
            address: stop.address || '',
            latitude: Number(stop.latitude) || 0,
            longitude: Number(stop.longitude) || 0,
            recommendedMenus: (stop.recommendedMenus as string[]) || [],
            estimatedTime: Number(stop.estimatedTime) || 60,
            blindHint: (stop.blindHint as string) || '문을 열면 새로운 감각이 시작되는 곳',
            blindTitle: (stop.blindTitle as string) || '비밀의 문',
            estimatedCost: Number(stop.estimatedCost) || 10000,
          },
          walkingMinutesFromPrev: i === 0 ? null : 10,
          questMission: null,
          alternatives: [],
          isUnlocked: true,
        }
      }),
      vibe: vibe || userProfile?.selectedVibe || 'romantic',
      dateType: dateType || userProfile?.dateType || 'couple',
      region,
      createdAt: new Date().toISOString(),
      totalEstimatedCost: 0,
    }

    // Calculate total estimated cost
    course.totalEstimatedCost = course.stops.reduce(
      (sum: number, s: { place: { estimatedCost: number } }) => sum + (s.place.estimatedCost || 0),
      0
    )

    // Use first place image as hero if available
    if (course.stops.length > 0 && course.stops[0].place.imageUrls.length > 0) {
      course.heroImageUrl = course.stops[0].place.imageUrls[0]
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
