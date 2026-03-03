'use client'

import { useState, useEffect, useRef } from 'react'
import { fetchAllRouteSegments, RouteSegment } from '@/lib/api/osrm'

interface StopCoord {
  latitude: number
  longitude: number
}

export function useRouteGeometry(stops: StopCoord[]) {
  const [segments, setSegments] = useState<(RouteSegment | null)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const prevKey = useRef('')

  useEffect(() => {
    const key = stops.map(s => `${s.latitude},${s.longitude}`).join('|')
    if (key === prevKey.current) return
    prevKey.current = key

    if (stops.length < 2) {
      setSegments([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchAllRouteSegments(stops).then((result) => {
      if (!cancelled) {
        setSegments(result)
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [stops])

  return { segments, isLoading }
}
