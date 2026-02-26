import { NextRequest, NextResponse } from 'next/server'
import { searchPlacesByKeyword, searchPlacesByCategory } from '@/lib/api/naver'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const x = searchParams.get('x')
    const y = searchParams.get('y')
    const radius = searchParams.get('radius')

    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      return NextResponse.json({ error: 'NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.' }, { status: 500 })
    }

    if (category && x && y) {
      const places = await searchPlacesByCategory(category, Number(x), Number(y), {
        radius: radius ? Number(radius) : 2000,
      })
      return NextResponse.json({ places })
    }

    if (query) {
      const places = await searchPlacesByKeyword(query, {
        x: x ? Number(x) : undefined,
        y: y ? Number(y) : undefined,
        radius: radius ? Number(radius) : undefined,
      })
      return NextResponse.json({ places })
    }

    return NextResponse.json({ error: 'query 또는 category 파라미터가 필요합니다.' }, { status: 400 })
  } catch (error) {
    console.error('Places search API error:', error)
    return NextResponse.json(
      { error: '장소 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
