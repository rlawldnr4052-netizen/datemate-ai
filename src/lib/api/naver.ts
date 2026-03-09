const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search'

export interface NaverPlace {
  title: string // HTML 태그 제거된 장소명
  link: string
  category: string
  description: string
  telephone: string
  address: string // 지번 주소
  roadAddress: string // 도로명 주소
  mapx: string // 경도 (WGS84 변환 전 원본)
  mapy: string // 위도 (WGS84 변환 전 원본)
  // 변환된 좌표
  x: string // 경도 (WGS84)
  y: string // 위도 (WGS84)
  // 호환성 필드
  place_name: string
  category_name: string
  phone: string
  address_name: string
  road_address_name: string
  place_url: string
  id: string
  distance: string
}

interface NaverSearchResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: Array<{
    title: string
    link: string
    category: string
    description: string
    telephone: string
    address: string
    roadAddress: string
    mapx: string
    mapy: string
  }>
}

function getHeaders(): Record<string, string> {
  return {
    'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || '',
  }
}

function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

function convertCoordinate(value: string): string {
  const num = Number(value)
  if (num > 1000000) {
    return String(num / 10_000_000)
  }
  return value
}

function toNaverPlace(item: NaverSearchResponse['items'][0], index: number): NaverPlace {
  const cleanTitle = stripHtmlTags(item.title)
  const x = convertCoordinate(item.mapx)
  const y = convertCoordinate(item.mapy)
  const placeUrl = `https://map.naver.com/p/search/${encodeURIComponent(cleanTitle)}`

  return {
    title: cleanTitle,
    link: item.link,
    category: item.category,
    description: item.description,
    telephone: item.telephone,
    address: item.address,
    roadAddress: item.roadAddress,
    mapx: item.mapx,
    mapy: item.mapy,
    x,
    y,
    // 호환성 필드 (기존 카카오 인터페이스와 동일하게)
    place_name: cleanTitle,
    category_name: item.category,
    phone: item.telephone,
    address_name: item.address,
    road_address_name: item.roadAddress,
    place_url: placeUrl,
    id: `naver-${item.mapx}-${item.mapy}-${index}`,
    distance: '',
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
): Promise<NaverPlace[]> {
  const display = Math.min(options?.size || 5, 5) // 네이버 최대 5개
  const start = options?.page ? (options.page - 1) * display + 1 : 1
  const sort = options?.sort === 'distance' ? 'comment' : 'random'

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: String(start),
    sort,
  })

  const res = await fetch(
    `${NAVER_SEARCH_URL}/local.json?${params.toString()}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Naver API error: ${res.status}`)
  }

  const data: NaverSearchResponse = await res.json()
  return data.items.map((item, i) => toNaverPlace(item, i))
}

// 카테고리 코드 → 키워드 매핑
const categoryKeywordMap: Record<string, string> = {
  CE7: '카페',
  FD6: '음식점',
  CT1: '문화시설',
  AT4: '관광명소',
  AD5: '숙박',
  SW8: '지하철역',
}

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
): Promise<NaverPlace[]> {
  // 네이버는 카테고리 검색 미지원 → 키워드 조합으로 대체
  const categoryKeyword = categoryKeywordMap[categoryCode] || categoryCode
  return searchPlacesByKeyword(categoryKeyword, options)
}

// 네이버 블로그 검색 API (장소 리뷰 수집용)
export interface NaverBlogResult {
  title: string
  description: string
  link: string
}

export async function searchBlogReviews(placeName: string, count: number = 5): Promise<NaverBlogResult[]> {
  const params = new URLSearchParams({
    query: `${placeName} 후기`,
    display: String(Math.min(count, 10)),
    sort: 'sim',
  })

  try {
    const res = await fetch(
      `${NAVER_SEARCH_URL}/blog.json?${params.toString()}`,
      { headers: getHeaders() }
    )

    if (!res.ok) return []

    const data = await res.json()
    return (data.items || []).map((item: { title: string; description: string; link: string }) => ({
      title: stripHtmlTags(item.title),
      description: stripHtmlTags(item.description),
      link: item.link,
    }))
  } catch {
    return []
  }
}

// 네이버 이미지 검색 API
export interface NaverImage {
  title: string
  link: string // 원본 이미지 URL
  thumbnail: string
  sizeheight: string
  sizewidth: string
  // 호환성 필드
  image_url: string
}

export async function searchImages(query: string, size: number = 3): Promise<NaverImage[]> {
  const params = new URLSearchParams({
    query,
    sort: 'sim',
    display: String(Math.min(size, 100)),
    filter: 'large',
  })

  const res = await fetch(
    `${NAVER_SEARCH_URL}/image?${params.toString()}`,
    { headers: getHeaders() }
  )

  if (!res.ok) return []

  const data = await res.json()
  return (data.items || []).map((item: { title: string; link: string; thumbnail: string; sizeheight: string; sizewidth: string }) => ({
    ...item,
    title: stripHtmlTags(item.title),
    image_url: item.link, // 호환성
  }))
}
