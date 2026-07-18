import React, { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  MOCK_INTERSECTIONS,
  MOCK_CAMERAS,
  MOCK_INCIDENTS,
  MAP_CENTER,
  MapLayerId,
} from '../../data/gisData'
import { PipelineResponse } from '../../api/pipeline'

const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface OperationalMapProps {
  pipelineData: PipelineResponse | null
  selectedIntersectionId: string
  onSelectIntersection: (id: string) => void
  visibleLayers: Set<MapLayerId>
}

interface Vehicle {
  ring: [number, number][]
  pointIndex: number
  t: number
  direction: 1 | -1
  marker: maplibregl.Marker
  speedJitter: number
}

const congestionColor = (score: number | undefined) => {
  if (score === undefined) return '#00ff88'
  if (score > 0.6) return '#ff4444'
  if (score > 0.3) return '#ffaa00'
  return '#00ff88'
}

const rad = (deg: number) => (deg * Math.PI) / 180

const bearing = (a: [number, number], b: [number, number]) => {
  const [lon1, lat1] = a
  const [lon2, lat2] = b
  const dLon = rad(lon2 - lon1)
  const x = Math.sin(dLon) * Math.cos(rad(lat2))
  const y =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon)
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
}

const approxDistance = (a: [number, number], b: [number, number]) => {
  const dx = (b[0] - a[0]) * 111320 * Math.cos(rad(a[1]))
  const dy = (b[1] - a[1]) * 111320
  return Math.sqrt(dx * dx + dy * dy)
}

const nearestPointOnSegment = (p: [number, number], a: [number, number], b: [number, number]) => {
  const [px, py] = p
  const [ax, ay] = a
  const [bx, by] = b
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return { point: a, t: 0 }
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return { point: [ax + t * dx, ay + t * dy] as [number, number], t }
}

const extractRings = (features: GeoJSON.Feature[]): [number, number][][] => {
  const rings: [number, number][][] = []
  for (const f of features) {
    const geom = f.geometry
    if (!geom) continue
    if (geom.type === 'LineString') {
      rings.push(geom.coordinates as [number, number][])
    } else if (geom.type === 'MultiLineString') {
      const lines = geom.coordinates as [number, number][][]
      for (const line of lines) rings.push(line)
    }
  }
  return rings
}

const snapToRoad = (
  rings: [number, number][][],
  target: [number, number]
): { point: [number, number]; heading: number } | null => {
  let best: { point: [number, number]; heading: number; dist: number } | null = null
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i]
      const b = ring[i + 1]
      const { point } = nearestPointOnSegment(target, a, b)
      const dist = approxDistance(point, target)
      if (!best || dist < best.dist) {
        best = { point, dist, heading: bearing(a, b) }
      }
    }
  }
  return best
}

const trafficRoadFilter = [
  'all',
  ['!has', 'brunnel'],
  [
    'match',
    ['get', 'class'],
    ['primary', 'secondary', 'tertiary', 'minor', 'service', 'residential', 'living_street'],
    true,
    false,
  ],
]

const widthByClass = (base: number, ratio: number) => [
  'match',
  ['get', 'class'],
  ['primary', 'trunk', 'motorway'],
  base * ratio * ratio * ratio,
  ['secondary', 'tertiary'],
  base * ratio * ratio,
  ['minor', 'residential', 'living_street'],
  base * ratio,
  ['service', 'path', 'track'],
  base,
  base,
]

const roadWidth = (base: number) => [
  'interpolate',
  ['linear'],
  ['zoom'],
  13,
  widthByClass(base, 0.7),
  17,
  widthByClass(base, 1.4),
]

const OperationalMap: React.FC<OperationalMapProps> = ({
  pipelineData,
  selectedIntersectionId,
  onSelectIntersection,
  visibleLayers,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Record<string, maplibregl.Marker>>({})
  const cameraMarkersRef = useRef<maplibregl.Marker[]>([])
  const incidentMarkersRef = useRef<maplibregl.Marker[]>([])
  const vehiclesRef = useRef<Vehicle[]>([])
  const queueRingRef = useRef<maplibregl.Marker | null>(null)
  const rafRef = useRef<number | null>(null)
  const speedFactorRef = useRef(1)
  const congestionRef = useRef(0)
  const roadRingsRef = useRef<[number, number][][]>([])
  const visibleLayersRef = useRef(visibleLayers)

  useEffect(() => {
    visibleLayersRef.current = visibleLayers
  }, [visibleLayers])

  const isVisible = (id: MapLayerId) => visibleLayersRef.current.has(id)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: MAP_CENTER,
      zoom: 14.5,
      attributionControl: false,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map

    const findRoadLabelLayerId = () => {
      const style = map.getStyle()
      const layer = style.layers?.find((l: any) => {
        if (l.id.startsWith('roadname')) return true
        if (l.id.startsWith('road_label')) return true
        return l['source-layer'] === 'transportation_name'
      })
      return layer?.id
    }

    map.on('load', () => {
      const beforeId = findRoadLabelLayerId()

      // Traffic highlight layers use the same vector tile source and source-layer
      // as the basemap road network. They are inserted just before road labels so
      // the highlight sits on top of the road fill/casing but under labels.
      const glowLayer = {
        id: 'traffic-road-glow',
        type: 'line',
        source: 'carto',
        'source-layer': 'transportation',
        filter: trafficRoadFilter,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: isVisible('traffic') ? 'visible' : 'none',
        },
        paint: {
          'line-color': 'rgba(0, 170, 255, 0.35)',
          'line-width': roadWidth(14),
          'line-blur': 12,
          'line-opacity': 0.2,
        },
      } as any

      const softLayer = {
        id: 'traffic-road-soft',
        type: 'line',
        source: 'carto',
        'source-layer': 'transportation',
        filter: trafficRoadFilter,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: isVisible('traffic') ? 'visible' : 'none',
        },
        paint: {
          'line-color': 'rgba(0, 170, 255, 0.55)',
          'line-width': roadWidth(6),
          'line-blur': 4,
          'line-opacity': 0.35,
        },
      } as any

      const coreLayer = {
        id: 'traffic-road-core',
        type: 'line',
        source: 'carto',
        'source-layer': 'transportation',
        filter: trafficRoadFilter,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: isVisible('traffic') ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#00ff88',
          'line-width': roadWidth(2),
          'line-opacity': 0.8,
        },
      } as any

      if (beforeId) {
        map.addLayer(glowLayer, beforeId)
        map.addLayer(softLayer, beforeId)
        map.addLayer(coreLayer, beforeId)
      } else {
        map.addLayer(glowLayer)
        map.addLayer(softLayer)
        map.addLayer(coreLayer)
      }

      // Intersection markers
      MOCK_INTERSECTIONS.forEach((intersection) => {
        const el = document.createElement('div')
        el.className = 'op-map-intersection-marker'
        el.dataset.intersectionId = intersection.id
        el.style.cursor = 'pointer'
        el.style.transition = 'width 150ms ease, height 150ms ease, box-shadow 150ms ease, border 150ms ease, background 600ms ease'
        el.onclick = () => onSelectIntersection(intersection.id)
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([intersection.lon, intersection.lat])
          .addTo(map)
        markersRef.current[intersection.id] = marker
      })

      // Incident markers
      MOCK_INCIDENTS.forEach((incident) => {
        const el = document.createElement('div')
        el.className = 'op-map-incident-marker'
        el.style.width = '10px'
        el.style.height = '10px'
        el.style.borderRadius = '50%'
        el.style.background = incident.severity === 'high' ? '#ff4444' : '#ffaa00'
        el.style.border = '2px solid #0a0a0a'
        el.style.boxShadow = '0 0 6px 1px rgba(255, 68, 68, 0.6)'
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([incident.lon, incident.lat])
          .addTo(map)
        incidentMarkersRef.current.push(marker)
      })

      // Queue ring at the primary intersection
      const primary = MOCK_INTERSECTIONS.find((i) => i.isPrimary)
      if (primary) {
        const ringEl = document.createElement('div')
        ringEl.className = 'op-map-queue-ring'
        ringEl.style.borderRadius = '50%'
        ringEl.style.border = '1.5px solid rgba(255, 170, 0, 0.55)'
        ringEl.style.background = 'rgba(255, 170, 0, 0.08)'
        ringEl.style.pointerEvents = 'none'
        ringEl.style.transition = 'width 900ms ease, height 900ms ease, border-color 600ms ease, background 600ms ease'
        ringEl.style.width = '0px'
        ringEl.style.height = '0px'
        queueRingRef.current = new maplibregl.Marker({ element: ringEl, anchor: 'center' })
          .setLngLat([primary.lon, primary.lat])
          .addTo(map)
      }

      refreshIntersectionStyles()

      // Wait for all visible tiles before extracting road geometry.
      map.once('idle', () => {
        const roadFeatures = map.queryRenderedFeatures(undefined, {
          layers: ['traffic-road-core'],
        })
        const combined: GeoJSON.Feature[] = roadFeatures.map((f) => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: f.properties || {},
        }) as unknown as GeoJSON.Feature)
        roadRingsRef.current = extractRings(combined)

        // Snap cameras to nearest road and align their heading.
        MOCK_CAMERAS.forEach((camera) => {
          const snap = snapToRoad(roadRingsRef.current, [camera.lon, camera.lat])
          if (!snap) return
          const el = document.createElement('div')
          el.style.width = '12px'
          el.style.height = '12px'
          el.style.borderRadius = '50%'
          el.style.background = camera.status === 'online' ? '#00aaff' : '#555555'
          el.style.border = '2px solid #0a0a0a'
          el.style.boxShadow = '0 0 6px 1px rgba(0, 170, 255, 0.6)'
          el.style.pointerEvents = 'none'
          const arrow = document.createElement('div')
          arrow.style.position = 'absolute'
          arrow.style.top = '-8px'
          arrow.style.left = '50%'
          arrow.style.width = '0'
          arrow.style.height = '0'
          arrow.style.borderLeft = '3px solid transparent'
          arrow.style.borderRight = '3px solid transparent'
          arrow.style.borderBottom = `5px solid ${camera.status === 'online' ? '#00aaff' : '#555555'}`
          arrow.style.transform = `translateX(-50%) rotate(${snap.heading}deg)`
          el.appendChild(arrow)
          const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat(snap.point)
            .addTo(map)
          marker.getElement().style.display = isVisible('cameras') ? 'block' : 'none'
          cameraMarkersRef.current.push(marker)
        })

        createVehicles()
        if (!prefersReducedMotion()) startVehicleLoop()
      })
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      roadRingsRef.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startVehicleLoop = () => {
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const baseSpeed = 12 * speedFactorRef.current // meters per second
      vehiclesRef.current.forEach((v) => {
        const ring = v.ring
        if (ring.length < 2) return
        const a = ring[v.pointIndex]
        const b = ring[v.pointIndex + 1]
        if (!a || !b) return
        const segLen = approxDistance(a, b)
        if (segLen === 0) {
          v.pointIndex += v.direction
          if (v.pointIndex >= ring.length - 1) {
            v.pointIndex = ring.length - 2
            v.direction = -1
          }
          if (v.pointIndex < 0) {
            v.pointIndex = 0
            v.direction = 1
          }
          return
        }
        const delta = (baseSpeed * v.speedJitter * dt) / segLen
        v.t += delta * v.direction
        while (v.t > 1 && v.pointIndex < ring.length - 2) {
          v.t -= 1
          v.pointIndex += 1
        }
        while (v.t < 0 && v.pointIndex > 0) {
          v.t += 1
          v.pointIndex -= 1
        }
        if (v.pointIndex >= ring.length - 1) {
          v.pointIndex = ring.length - 2
          v.t = 1
          v.direction = -1
        }
        if (v.pointIndex < 0) {
          v.pointIndex = 0
          v.t = 0
          v.direction = 1
        }
        const a2 = ring[v.pointIndex]
        const b2 = ring[v.pointIndex + 1]
        const lon = a2[0] + (b2[0] - a2[0]) * v.t
        const lat = a2[1] + (b2[1] - a2[1]) * v.t
        v.marker.setLngLat([lon, lat])
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const createVehicles = () => {
    const map = mapRef.current
    const rings = roadRingsRef.current
    if (!map || rings.length === 0) return
    for (let i = 0; i < 80; i++) {
      const ring = rings[i % rings.length]
      if (ring.length < 2) continue
      const pointIndex = Math.floor(Math.random() * (ring.length - 1))
      const el = document.createElement('div')
      el.style.width = '5px'
      el.style.height = '5px'
      el.style.borderRadius = '50%'
      el.style.background = '#7fd4ff'
      el.style.boxShadow = '0 0 4px 1px rgba(127, 212, 255, 0.6)'
      el.style.pointerEvents = 'none'
      el.style.transition = 'background 600ms ease, box-shadow 600ms ease'
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(ring[pointIndex])
        .addTo(map)
      marker.getElement().style.display = isVisible('traffic') ? 'block' : 'none'
      vehiclesRef.current.push({
        marker,
        ring,
        pointIndex,
        t: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        speedJitter: 0.7 + Math.random() * 0.6,
      })
    }
  }

  const refreshVehicleTint = () => {
    const congestion = congestionRef.current
    const color = congestion > 0.6 ? '#ffb3a7' : congestion > 0.3 ? '#ffe0a3' : '#7fd4ff'
    const glow =
      congestion > 0.6
        ? 'rgba(255, 100, 80, 0.6)'
        : congestion > 0.3
        ? 'rgba(255, 190, 80, 0.55)'
        : 'rgba(127, 212, 255, 0.6)'
    vehiclesRef.current.forEach((v) => {
      const el = v.marker.getElement()
      el.style.background = color
      el.style.boxShadow = `0 0 4px 1px ${glow}`
    })
  }

  const refreshRoadColor = () => {
    const map = mapRef.current
    if (!map) return
    const color = congestionColor(congestionRef.current)
    const layers = ['traffic-road-glow', 'traffic-road-soft', 'traffic-road-core'] as const
    for (const id of layers) {
      if (!map.getLayer(id)) continue
      if (id === 'traffic-road-glow') {
        map.setPaintProperty(
          id,
          'line-color',
          color === '#ff4444'
            ? 'rgba(255, 68, 68, 0.35)'
            : color === '#ffaa00'
            ? 'rgba(255, 170, 0, 0.35)'
            : 'rgba(0, 170, 255, 0.35)'
        )
      } else if (id === 'traffic-road-soft') {
        map.setPaintProperty(
          id,
          'line-color',
          color === '#ff4444'
            ? 'rgba(255, 68, 68, 0.55)'
            : color === '#ffaa00'
            ? 'rgba(255, 170, 0, 0.55)'
            : 'rgba(0, 170, 255, 0.55)'
        )
      } else {
        map.setPaintProperty(id, 'line-color', color)
      }
    }
  }

  const refreshQueueRing = () => {
    const ring = queueRingRef.current
    if (!ring) return
    const el = ring.getElement()
    const queue = pipelineData?.queue_length_meters ?? 0
    const diameter = Math.min(Math.max(queue * 0.9, 0), 120)
    el.style.width = `${diameter}px`
    el.style.height = `${diameter}px`
    const congestion = pipelineData?.congestion_score ?? 0
    const rgb = congestion > 0.6 ? '255, 68, 68' : congestion > 0.3 ? '255, 170, 0' : '0, 255, 136'
    el.style.borderColor = `rgba(${rgb}, 0.55)`
    el.style.background = `rgba(${rgb}, 0.08)`
  }

  const refreshIntersectionStyles = () => {
    MOCK_INTERSECTIONS.forEach((intersection) => {
      const marker = markersRef.current[intersection.id]
      if (!marker) return
      const el = marker.getElement()
      const isSelected = intersection.id === selectedIntersectionId
      const score =
        intersection.id === pipelineData?.intersection_id ? pipelineData?.congestion_score : undefined
      const color = intersection.isPrimary ? congestionColor(score) : '#3a86ff'
      el.style.width = isSelected ? '18px' : '13px'
      el.style.height = isSelected ? '18px' : '13px'
      el.style.borderRadius = '50%'
      el.style.transition =
        'width 150ms ease, height 150ms ease, box-shadow 600ms ease, border 150ms ease, background 600ms ease'
      el.style.background = color
      el.style.border = isSelected ? '2px solid #ffffff' : '2px solid #0a0a0a'
      el.style.boxShadow = isSelected ? `0 0 10px 3px ${color}` : `0 0 6px 1px ${color}80`
    })
  }

  const refreshLayerVisibility = () => {
    const map = mapRef.current
    if (!map) return
    const showTraffic = isVisible('traffic')
    const showCameras = isVisible('cameras')
    const showIncidents = isVisible('incidents')
    const layerIds = ['traffic-road-glow', 'traffic-road-soft', 'traffic-road-core']
    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', showTraffic ? 'visible' : 'none')
    })
    cameraMarkersRef.current.forEach((m) => {
      m.getElement().style.display = showCameras ? 'block' : 'none'
    })
    vehiclesRef.current.forEach((v) => {
      v.marker.getElement().style.display = showTraffic ? 'block' : 'none'
    })
    incidentMarkersRef.current.forEach((m) => {
      m.getElement().style.display = showIncidents ? 'block' : 'none'
    })
  }

  useEffect(() => {
    refreshIntersectionStyles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIntersectionId, pipelineData?.congestion_score])

  useEffect(() => {
    const speed = pipelineData?.average_speed_kmh ?? 30
    speedFactorRef.current = Math.min(Math.max(speed / 30, 0.25), 2)
    congestionRef.current = pipelineData?.congestion_score ?? 0
    refreshVehicleTint()
    refreshRoadColor()
    refreshQueueRing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineData?.average_speed_kmh, pipelineData?.congestion_score, pipelineData?.queue_length_meters])

  useEffect(() => {
    refreshLayerVisibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLayers])

  return <div ref={containerRef} className="w-full h-full" />
}

export default OperationalMap
