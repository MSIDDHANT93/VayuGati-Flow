import React, { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  MOCK_INTERSECTIONS,
  MOCK_CAMERAS,
  MOCK_INCIDENTS,
  ROAD_NETWORK,
  MAP_CENTER,
  MapLayerId,
} from '../../data/gisData'
import { PipelineResponse } from '../../api/pipeline'

const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Road segments (lon/lat endpoint pairs) used for vehicle animation.
// Each corridor polyline is flattened into its consecutive edges so
// vehicles follow every leg of the street-aligned path.
const ROAD_SEGMENTS: Array<{ from: [number, number]; to: [number, number] }> =
  ROAD_NETWORK.features.flatMap((f) => {
    const coords = (f.geometry as GeoJSON.LineString).coordinates
    const edges: Array<{ from: [number, number]; to: [number, number] }> = []
    for (let i = 0; i < coords.length - 1; i++) {
      edges.push({
        from: [coords[i][0], coords[i][1]],
        to: [coords[i + 1][0], coords[i + 1][1]],
      })
    }
    return edges
  })

interface AnimatedVehicle {
  marker: maplibregl.Marker
  segment: number
  t: number // 0..1 position along segment
  direction: 1 | -1
  speedJitter: number
}

interface OperationalMapProps {
  pipelineData: PipelineResponse | null
  selectedIntersectionId: string
  onSelectIntersection: (id: string) => void
  visibleLayers: Set<MapLayerId>
}

const congestionColor = (score: number | undefined) => {
  if (score === undefined) return '#666666'
  if (score > 0.6) return '#ff4444'
  if (score > 0.3) return '#ffaa00'
  return '#00ff88'
}

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
  const vehiclesRef = useRef<AnimatedVehicle[]>([])
  const queueRingRef = useRef<maplibregl.Marker | null>(null)
  const rafRef = useRef<number | null>(null)
  const speedFactorRef = useRef(1)
  const congestionRef = useRef(0)

  // Initialize map once
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

    map.on('load', () => {
      map.addSource('road-network', { type: 'geojson', data: ROAD_NETWORK })
      // Corridor casing + line — rendered like an operational route overlay
      map.addLayer({
        id: 'road-network-casing',
        type: 'line',
        source: 'road-network',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#003a5c',
          'line-width': 7,
          'line-opacity': 0.5,
        },
      })
      map.addLayer({
        id: 'road-network-line',
        type: 'line',
        source: 'road-network',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00aaff',
          'line-width': 2.5,
          'line-opacity': 0.55,
        },
      })

      // Intersection markers
      MOCK_INTERSECTIONS.forEach((intersection) => {
        const el = document.createElement('div')
        el.className = 'op-map-intersection-marker'
        el.dataset.intersectionId = intersection.id
        el.style.cursor = 'pointer'
        el.style.transition = 'width 150ms ease, height 150ms ease, box-shadow 150ms ease, border 150ms ease'
        el.onclick = () => onSelectIntersection(intersection.id)

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([intersection.lon, intersection.lat])
          .addTo(map)
        markersRef.current[intersection.id] = marker
      })

      // Camera markers
      MOCK_CAMERAS.forEach((camera) => {
        const el = document.createElement('div')
        el.className = 'op-map-camera-marker'
        el.style.background = camera.status === 'online' ? '#00aaff' : '#555555'
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([camera.lon, camera.lat])
          .addTo(map)
        cameraMarkersRef.current.push(marker)
      })

      // Incident markers
      MOCK_INCIDENTS.forEach((incident) => {
        const el = document.createElement('div')
        el.className = 'op-map-incident-marker'
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([incident.lon, incident.lat])
          .addTo(map)
        incidentMarkersRef.current.push(marker)
      })

      // Queue ring — expands/contracts with live queue length at the primary node
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

      // Animated vehicles distributed along the road network
      if (!prefersReducedMotion()) {
        ROAD_SEGMENTS.forEach((_, segIdx) => {
          const perSegment = segIdx % 2 === 0 ? 2 : 1
          for (let v = 0; v < perSegment; v++) {
            const el = document.createElement('div')
            el.className = 'op-map-vehicle-dot'
            el.style.width = '5px'
            el.style.height = '5px'
            el.style.borderRadius = '50%'
            el.style.background = '#7fd4ff'
            el.style.boxShadow = '0 0 4px 1px rgba(127, 212, 255, 0.6)'
            el.style.pointerEvents = 'none'
            el.style.transition = 'background 600ms ease, box-shadow 600ms ease'
            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
              .setLngLat(ROAD_SEGMENTS[segIdx].from)
              .addTo(map)
            vehiclesRef.current.push({
              marker,
              segment: segIdx,
              t: (v + 0.5) / (perSegment + 1) + Math.random() * 0.2,
              direction: v % 2 === 0 ? 1 : -1,
              speedJitter: 0.7 + Math.random() * 0.6,
            })
          }
        })
        startVehicleLoop()
      }

      refreshIntersectionStyles()
      refreshLayerVisibility()
      refreshQueueRing()
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      vehiclesRef.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // rAF loop moving vehicle dots along their road segments. Speed scales
  // with live average speed; congestion tints the dots toward amber/red.
  const startVehicleLoop = () => {
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const base = 0.05 * speedFactorRef.current // segment fraction per second
      vehiclesRef.current.forEach((v) => {
        v.t += base * v.speedJitter * dt * v.direction
        if (v.t > 1) {
          v.t = 1
          v.direction = -1
        } else if (v.t < 0) {
          v.t = 0
          v.direction = 1
        }
        const seg = ROAD_SEGMENTS[v.segment]
        const lon = seg.from[0] + (seg.to[0] - seg.from[0]) * v.t
        const lat = seg.from[1] + (seg.to[1] - seg.from[1]) * v.t
        v.marker.setLngLat([lon, lat])
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const refreshVehicleTint = () => {
    const congestion = congestionRef.current
    const color = congestion > 0.6 ? '#ffb3a7' : congestion > 0.3 ? '#ffe0a3' : '#7fd4ff'
    const glow = congestion > 0.6 ? 'rgba(255, 100, 80, 0.6)' : congestion > 0.3 ? 'rgba(255, 190, 80, 0.55)' : 'rgba(127, 212, 255, 0.6)'
    vehiclesRef.current.forEach((v) => {
      const el = v.marker.getElement()
      el.style.background = color
      el.style.boxShadow = `0 0 4px 1px ${glow}`
    })
  }

  const refreshQueueRing = () => {
    const ring = queueRingRef.current
    if (!ring) return
    const el = ring.getElement()
    const queue = pipelineData?.queue_length_meters ?? 0
    // Map queue length (m) to a ring diameter in px — grows/shrinks smoothly via CSS transition.
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
      const score = intersection.id === pipelineData?.intersection_id
        ? pipelineData?.congestion_score
        : undefined
      const color = intersection.isPrimary ? congestionColor(score) : '#3a86ff'
      el.style.width = isSelected ? '18px' : '13px'
      el.style.height = isSelected ? '18px' : '13px'
      el.style.borderRadius = '50%'
      el.style.transition =
        'width 150ms ease, height 150ms ease, box-shadow 600ms ease, border 150ms ease, background 600ms ease'
      el.style.background = color
      el.style.border = isSelected ? '2px solid #ffffff' : '2px solid #0a0a0a'
      el.style.boxShadow = isSelected
        ? `0 0 10px 3px ${color}`
        : `0 0 6px 1px ${color}80`
    })
  }

  const refreshLayerVisibility = () => {
    cameraMarkersRef.current.forEach((m) => {
      m.getElement().style.display = visibleLayers.has('cameras') ? 'block' : 'none'
    })
    vehiclesRef.current.forEach((v) => {
      v.marker.getElement().style.display = visibleLayers.has('traffic') ? 'block' : 'none'
    })
    if (queueRingRef.current) {
      queueRingRef.current.getElement().style.display = visibleLayers.has('traffic') ? 'block' : 'none'
    }
    incidentMarkersRef.current.forEach((m) => {
      m.getElement().style.display = visibleLayers.has('incidents') ? 'block' : 'none'
    })
    const map = mapRef.current
    if (map) {
      const vis = visibleLayers.has('traffic') ? 'visible' : 'none'
      if (map.getLayer('road-network-line')) map.setLayoutProperty('road-network-line', 'visibility', vis)
      if (map.getLayer('road-network-casing')) map.setLayoutProperty('road-network-casing', 'visibility', vis)
    }
  }

  useEffect(() => {
    refreshIntersectionStyles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIntersectionId, pipelineData?.congestion_score])

  // Keep animation parameters in sync with live pipeline metrics
  useEffect(() => {
    const speed = pipelineData?.average_speed_kmh ?? 30
    speedFactorRef.current = Math.min(Math.max(speed / 30, 0.25), 2)
    congestionRef.current = pipelineData?.congestion_score ?? 0
    refreshVehicleTint()
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
