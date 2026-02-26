const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1'

export interface TourSpot {
  contentid: string
  contenttypeid: string
  title: string
  addr1: string
  addr2: string
  areacode: string
  sigungucode: string
  mapx: string // longitude
  mapy: string // latitude
  firstimage: string
  firstimage2: string
  tel: string
  cat1: string
  cat2: string
  cat3: string
}

interface TourApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string }
    body: {
      items: { item: TourSpot[] }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

function getBaseParams(): URLSearchParams {
  return new URLSearchParams({
    serviceKey: process.env.TOUR_API_KEY!,
    MobileOS: 'ETC',
    MobileApp: 'DateMateAI',
    _type: 'json',
    numOfRows: '20',
    pageNo: '1',
  })
}

// 지역 코드 매핑 (시/도)
export const areaCodes: Record<string, number> = {
  서울특별시: 1,
  인천광역시: 2,
  대전광역시: 3,
  대구광역시: 4,
  광주광역시: 5,
  부산광역시: 6,
  울산광역시: 7,
  세종특별자치시: 8,
  경기도: 31,
  강원특별자치도: 32,
  충청북도: 33,
  충청남도: 34,
  경상북도: 35,
  경상남도: 36,
  전북특별자치도: 37,
  전라남도: 38,
  제주특별자치도: 39,
}

// contentTypeId: 12(관광지), 14(문화시설), 15(축제/행사), 25(여행코스), 28(레포츠), 32(숙박), 38(쇼핑), 39(음식점)
export async function searchByArea(
  areaCode: number,
  options?: {
    contentTypeId?: number
    sigunguCode?: number
    numOfRows?: number
  }
): Promise<TourSpot[]> {
  const params = getBaseParams()
  params.set('areaCode', String(areaCode))

  if (options?.contentTypeId) params.set('contentTypeId', String(options.contentTypeId))
  if (options?.sigunguCode) params.set('sigunguCode', String(options.sigunguCode))
  if (options?.numOfRows) params.set('numOfRows', String(options.numOfRows))

  const res = await fetch(
    `${TOUR_BASE_URL}/areaBasedList1?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error(`TourAPI error: ${res.status}`)
  }

  const data: TourApiResponse = await res.json()
  const items = data?.response?.body?.items?.item
  return Array.isArray(items) ? items : []
}

export async function searchByKeyword(
  keyword: string,
  options?: {
    areaCode?: number
    contentTypeId?: number
    numOfRows?: number
  }
): Promise<TourSpot[]> {
  const params = getBaseParams()
  params.set('keyword', keyword)

  if (options?.areaCode) params.set('areaCode', String(options.areaCode))
  if (options?.contentTypeId) params.set('contentTypeId', String(options.contentTypeId))
  if (options?.numOfRows) params.set('numOfRows', String(options.numOfRows))

  const res = await fetch(
    `${TOUR_BASE_URL}/searchKeyword1?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error(`TourAPI error: ${res.status}`)
  }

  const data: TourApiResponse = await res.json()
  const items = data?.response?.body?.items?.item
  return Array.isArray(items) ? items : []
}

export async function getFestivals(
  options?: {
    areaCode?: number
    eventStartDate?: string
    numOfRows?: number
  }
): Promise<TourSpot[]> {
  const params = getBaseParams()
  params.set('eventStartDate', options?.eventStartDate || new Date().toISOString().slice(0, 10).replace(/-/g, ''))

  if (options?.areaCode) params.set('areaCode', String(options.areaCode))
  if (options?.numOfRows) params.set('numOfRows', String(options.numOfRows))

  const res = await fetch(
    `${TOUR_BASE_URL}/searchFestival1?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error(`TourAPI error: ${res.status}`)
  }

  const data: TourApiResponse = await res.json()
  const items = data?.response?.body?.items?.item
  return Array.isArray(items) ? items : []
}
