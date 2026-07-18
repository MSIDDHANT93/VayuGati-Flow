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

// GeoJSON road network connecting intersections. Instead of straight
// diagonal lines (which cut across city blocks on the basemap), each
// corridor is routed as an L-shaped path following the street grid:
// east-west leg first, then north-south leg. This keeps animated
// vehicles visually aligned with plausible street geometry.
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
    const coordinates: [number, number][] = [[from.lon, from.lat]]
    // Insert a corner waypoint unless the nodes are already roughly aligned
    const alignedNS = Math.abs(from.lon - to.lon) < 0.0008
    const alignedEW = Math.abs(from.lat - to.lat) < 0.0008
    if (!alignedNS && !alignedEW) {
      coordinates.push([to.lon, from.lat])
    }
    coordinates.push([to.lon, to.lat])
    return {
      type: 'Feature',
      properties: { fromId, toId },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    } as GeoJSON.Feature
  }),
}

// Connector Health — richer view of the data ingestion layer.
// 'live' connectors are backed by the current demo pipeline;
// 'planned' connectors are future integrations shown clearly as placeholders.
export interface ConnectorHealth {
  id: string
  name: string
  status: 'online' | 'degraded' | 'offline'
  source: 'live' | 'planned'
  latencyMs: number | null
  detail: string
}

export const CONNECTOR_HEALTH: ConnectorHealth[] = [
  { id: 'cctv', name: 'CCTV', status: 'online', source: 'live', latencyMs: 42, detail: 'Vision feed via demo pipeline' },
  { id: 'weather', name: 'Weather', status: 'degraded', source: 'planned', latencyMs: 610, detail: 'Placeholder — IMD feed planned' },
  { id: 'pm_gatishakti', name: 'PM GatiShakti', status: 'offline', source: 'planned', latencyMs: null, detail: 'Placeholder — infra layer planned' },
  { id: 'satellite', name: 'Satellite', status: 'offline', source: 'planned', latencyMs: null, detail: 'Placeholder — imagery ingest planned' },
  { id: 'iot', name: 'IoT Sensors', status: 'offline', source: 'planned', latencyMs: null, detail: 'Placeholder — roadside sensors planned' },
  { id: 'emergency', name: 'Emergency Services', status: 'degraded', source: 'planned', latencyMs: 890, detail: 'Placeholder — dispatch API planned' },
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
