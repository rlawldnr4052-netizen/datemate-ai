export interface RouteSegment {
  coordinates: [number, number][] // [lat, lng] pairs for Leaflet
  distanceMeters: number
  durationSeconds: number
}

const routeCache = new Map<string, RouteSegment>()

function cacheKey(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  return `${fromLat},${fromLng}->${toLat},${toLng}`
}

export async function fetchRouteSegment(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteSegment | null> {
  const key = cacheKey(fromLat, fromLng, toLat, toLng)
  const cached = routeCache.get(key)
  if (cached) return cached

  const url =
    `https://router.project-osrm.org/route/v1/foot/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&geometries=geojson`

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) return null

    const route = data.routes[0]
    // GeoJSON [lng, lat] → Leaflet [lat, lng]
    const coordinates: [number, number][] =
      route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])

    const segment: RouteSegment = {
      coordinates,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    }

    routeCache.set(key, segment)
    return segment
  } catch {
    return null
  }
}

export async function fetchAllRouteSegments(
  stops: { latitude: number; longitude: number }[],
): Promise<(RouteSegment | null)[]> {
  if (stops.length < 2) return []

  return Promise.all(
    stops.slice(0, -1).map((from, i) => {
      const to = stops[i + 1]
      return fetchRouteSegment(from.latitude, from.longitude, to.latitude, to.longitude)
    })
  )
}
