import { NextRequest, NextResponse } from 'next/server'
import { searchByArea, searchByKeyword, getFestivals, areaCodes } from '@/lib/api/tourApi'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'area' | 'keyword' | 'festival'
    const keyword = searchParams.get('keyword')
    const city = searchParams.get('city')
    const contentTypeId = searchParams.get('contentTypeId')

    if (!process.env.TOUR_API_KEY || process.env.TOUR_API_KEY === 'your_tour_api_key') {
      return NextResponse.json({ error: 'TOUR_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
    }

    const areaCode = city ? (areaCodes[city] || 1) : 1

    if (type === 'festival') {
      const festivals = await getFestivals({ areaCode })
      return NextResponse.json({ spots: festivals })
    }

    if (type === 'keyword' && keyword) {
      const spots = await searchByKeyword(keyword, {
        areaCode,
        contentTypeId: contentTypeId ? Number(contentTypeId) : undefined,
      })
      return NextResponse.json({ spots })
    }

    // Default: area-based search
    const spots = await searchByArea(areaCode, {
      contentTypeId: contentTypeId ? Number(contentTypeId) : undefined,
    })
    return NextResponse.json({ spots })
  } catch (error) {
    console.error('Tour API error:', error)
    return NextResponse.json(
      { error: '관광 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
