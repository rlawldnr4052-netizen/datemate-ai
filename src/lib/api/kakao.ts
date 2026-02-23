const KAKAO_BASE_URL = 'https://dapi.kakao.com/v2/local'

export interface KakaoPlace {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  category_group_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string // longitude
  y: string // latitude
  place_url: string
  distance: string
}

interface KakaoSearchResponse {
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
  documents: KakaoPlace[]
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
  }
}

export async function searchPlacesByKeyword(
  query: string,
  options?: {
    x?: number
    y?: number
    radius?: number
    page?: number
    size?: number
    sort?: 'accuracy' | 'distance'
  }
): Promise<KakaoPlace[]> {
  const params = new URLSearchParams({ query })

  if (options?.x) params.set('x', String(options.x))
  if (options?.y) params.set('y', String(options.y))
  if (options?.radius) params.set('radius', String(options.radius))
  if (options?.page) params.set('page', String(options.page))
  if (options?.size) params.set('size', String(options.size))
  if (options?.sort) params.set('sort', options.sort)

  const res = await fetch(
    `${KAKAO_BASE_URL}/search/keyword.json?${params.toString()}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status}`)
  }

  const data: KakaoSearchResponse = await res.json()
  return data.documents
}

// 카테고리 코드: CE7(카페), FD6(음식점), CT1(문화시설), AT4(관광명소), AD5(숙박), SW8(지하철역)
export async function searchPlacesByCategory(
  categoryCode: string,
  x: number,
  y: number,
  options?: {
    radius?: number
    page?: number
    size?: number
    sort?: 'accuracy' | 'distance'
  }
): Promise<KakaoPlace[]> {
  const params = new URLSearchParams({
    category_group_code: categoryCode,
    x: String(x),
    y: String(y),
    radius: String(options?.radius || 2000),
    sort: options?.sort || 'distance',
  })

  if (options?.page) params.set('page', String(options.page))
  if (options?.size) params.set('size', String(options.size))

  const res = await fetch(
    `${KAKAO_BASE_URL}/search/category.json?${params.toString()}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status}`)
  }

  const data: KakaoSearchResponse = await res.json()
  return data.documents
}
