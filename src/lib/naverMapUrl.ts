export type NaverTransportMode = 'walk' | 'transit' | 'car'

export interface NaverMapPoint {
  lng: number
  lat: number
  name: string
}

/** 출발지 → 도착지 길찾기 URL */
export function buildNaverDirectionsUrl(
  start: NaverMapPoint,
  end: NaverMapPoint,
  mode: NaverTransportMode = 'walk'
): string {
  const s = `${start.lng},${start.lat},${encodeURIComponent(start.name)}`
  const e = `${end.lng},${end.lat},${encodeURIComponent(end.name)}`
  return `https://map.naver.com/p/directions/${s}/${e}/-/${mode}`
}

/** 도착지만 지정 (출발지 = 현위치) */
export function buildNaverDestinationOnlyUrl(
  end: NaverMapPoint,
  mode: NaverTransportMode = 'walk'
): string {
  const e = `${end.lng},${end.lat},${encodeURIComponent(end.name)}`
  return `https://map.naver.com/p/directions/-/${e}/-/${mode}`
}

/** 장소 검색 URL */
export function buildNaverSearchUrl(name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`
}

/** 거리 기반 교통수단 추천 */
export function suggestTransportMode(distanceKm: number): NaverTransportMode {
  if (distanceKm < 1.0) return 'walk'
  if (distanceKm < 5.0) return 'transit'
  return 'car'
}

export const transportModeLabels: Record<NaverTransportMode, string> = {
  walk: '도보',
  transit: '대중교통',
  car: '자동차',
}
