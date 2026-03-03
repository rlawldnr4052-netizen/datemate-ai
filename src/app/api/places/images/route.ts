import { NextRequest, NextResponse } from 'next/server'
import { searchImages } from '@/lib/api/naver'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const size = Number(searchParams.get('size') || '3')

    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Naver API keys not configured' }, { status: 500 })
    }

    if (!query) {
      return NextResponse.json({ error: 'query parameter is required' }, { status: 400 })
    }

    const images = await searchImages(query, size)
    const imageUrls = images.map((img) => img.link)

    return NextResponse.json(
      { imageUrls },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    )
  } catch (error) {
    console.error('Image search API error:', error)
    return NextResponse.json({ error: 'Image search failed' }, { status: 500 })
  }
}
