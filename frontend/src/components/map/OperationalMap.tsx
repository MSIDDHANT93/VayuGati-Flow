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
      map.addLayer({
        id: 'road-network-line',
        type: 'line',
        source: 'road-network',
        paint: {
          'line-color': '#00aaff',
          'line-width': 2,
          'line-opacity': 0.35,
        },
      })

      // Intersection markers
      MOCK_INTERSECTIONS.forEach((intersection) => {
        const el = document.createElement('div')
        el.className = 'op-map-intersection-marker'
        el.dataset.intersectionId = intersection.id
        el.style.cursor = 'pointer'
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

      refreshIntersectionStyles()
      refreshLayerVisibility()
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    incidentMarkersRef.current.forEach((m) => {
      m.getElement().style.display = visibleLayers.has('incidents') ? 'block' : 'none'
    })
    const map = mapRef.current
    if (map && map.getLayer('road-network-line')) {
      map.setLayoutProperty(
        'road-network-line',
        'visibility',
        visibleLayers.has('traffic') ? 'visible' : 'none'
      )
    }
  }

  useEffect(() => {
    refreshIntersectionStyles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIntersectionId, pipelineData?.congestion_score])

  useEffect(() => {
    refreshLayerVisibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLayers])

  return <div ref={containerRef} className="w-full h-full" />
}

export default OperationalMap
