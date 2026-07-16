// Mock GIS / digital-twin reference data for the Operational Map.
// Backend does not expose geospatial endpoints, so this file provides
// stable coordinates for intersections, cameras, incidents and roads
// used purely for map rendering. Live operational metrics (queue, LOS,
// risk, vehicle count) still come from the real pipeline API for the
// active intersection.

export interface MapIntersection {
  id: string
  name: string
  lat: number
  lon: number
  isPrimary: boolean
}

export interface MapCamera {
  id: string
  intersectionId: string
  lat: number
  lon: number
  status: 'online' | 'offline'
}

export interface MapIncident {
  id: string
  intersectionId: string
  lat: number
  lon: number
  type: string
  severity: 'low' | 'medium' | 'high'
}

export interface ConnectorStatus {
  id: string
  name: string
  status: 'online' | 'degraded' | 'offline'
}

// Center of operational area (used for demo purposes)
export const MAP_CENTER: [number, number] = [77.5946, 12.9716]

export const MOCK_INTERSECTIONS: MapIntersection[] = [
  { id: 'INT-001', name: 'MG Road Junction', lat: 12.9716, lon: 77.5946, isPrimary: true },
  { id: 'INT-002', name: 'Brigade Road Cross', lat: 12.9756, lon: 77.6006, isPrimary: false },
  { id: 'INT-003', name: 'Residency Circle', lat: 12.9682, lon: 77.5996, isPrimary: false },
  { id: 'INT-004', name: 'Trinity Junction', lat: 12.9736, lon: 77.5886, isPrimary: false },
  { id: 'INT-005', name: 'Church Street Node', lat: 12.9682, lon: 77.5896, isPrimary: false },
  { id: 'INT-006', name: 'Cubbon Gate', lat: 12.9776, lon: 77.5936, isPrimary: false },
]

export const MOCK_CAMERAS: MapCamera[] = MOCK_INTERSECTIONS.map((i, idx) => ({
  id: `CAM-00${idx + 1}`,
  intersectionId: i.id,
  lat: i.lat + 0.0006,
  lon: i.lon + 0.0006,
  status: idx === 4 ? 'offline' : 'online',
}))

export const MOCK_INCIDENTS: MapIncident[] = [
  {
    id: 'INC-001',
    intersectionId: 'INT-001',
    lat: 12.9718,
    lon: 77.5952,
    type: 'accident',
    severity: 'high',
  },
]

// Simple GeoJSON road network connecting intersections (grid pattern)
export const ROAD_NETWORK: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    ['INT-001', 'INT-002'],
    ['INT-001', 'INT-003'],
    ['INT-001', 'INT-004'],
    ['INT-001', 'INT-005'],
    ['INT-001', 'INT-006'],
    ['INT-002', 'INT-006'],
    ['INT-003', 'INT-005'],
  ].map(([fromId, toId]) => {
    const from = MOCK_INTERSECTIONS.find((i) => i.id === fromId)!
    const to = MOCK_INTERSECTIONS.find((i) => i.id === toId)!
    return {
      type: 'Feature',
      properties: { fromId, toId },
      geometry: {
        type: 'LineString',
        coordinates: [
          [from.lon, from.lat],
          [to.lon, to.lat],
        ],
      },
    } as GeoJSON.Feature
  }),
}

export const CONNECTOR_STATUSES: ConnectorStatus[] = [
  { id: 'cctv', name: 'CCTV', status: 'online' },
  { id: 'traffic_engine', name: 'Traffic Engine', status: 'online' },
  { id: 'ai_reasoning', name: 'AI Reasoning', status: 'online' },
  { id: 'weather', name: 'Weather', status: 'degraded' },
  { id: 'pm_gatishakti', name: 'PM GatiShakti', status: 'offline' },
  { id: 'satellite', name: 'Satellite', status: 'offline' },
  { id: 'iot', name: 'IoT Sensors', status: 'offline' },
  { id: 'anpr', name: 'ANPR', status: 'offline' },
]

export type MapLayerId =
  | 'traffic'
  | 'cameras'
  | 'incidents'
  | 'weather'
  | 'construction'
  | 'pm_gatishakti'
  | 'emergency'

export interface MapLayerConfig {
  id: MapLayerId
  label: string
  defaultOn: boolean
  placeholder?: boolean
}

export const MAP_LAYERS: MapLayerConfig[] = [
  { id: 'traffic', label: 'Traffic', defaultOn: true },
  { id: 'cameras', label: 'Cameras', defaultOn: true },
  { id: 'incidents', label: 'Incidents', defaultOn: true },
  { id: 'weather', label: 'Weather', defaultOn: false, placeholder: true },
  { id: 'construction', label: 'Construction', defaultOn: false, placeholder: true },
  { id: 'pm_gatishakti', label: 'PM GatiShakti', defaultOn: false, placeholder: true },
  { id: 'emergency', label: 'Emergency Assets', defaultOn: false, placeholder: true },
]
