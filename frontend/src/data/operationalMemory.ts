// Operational Memory — mock archive of previous similar incidents.
// The backend does not expose a historical incidents endpoint, so this
// reference data is clearly synthetic and used for UI purposes only.
// Records are keyed by scenario so the panel can surface incidents
// similar to the currently loaded situation.

export interface MemoryRecord {
  id: string
  date: string
  location: string
  intersectionId: string
  scenario: string
  incident: string
  decision: string
  outcome: string
  outcomePositive: boolean
}

export const OPERATIONAL_MEMORY: MemoryRecord[] = [
  {
    id: 'MEM-001',
    date: '2026-06-03',
    location: 'MG Road Junction',
    intersectionId: 'INT-001',
    scenario: 'morning_rush',
    incident: 'Sustained AM peak congestion, LOS E',
    decision: 'Signal retiming +15s green on primary axis',
    outcome: 'Queue -32%, LOS improved to C within 25 min',
    outcomePositive: true,
  },
  {
    id: 'MEM-002',
    date: '2026-05-21',
    location: 'MG Road Junction',
    intersectionId: 'INT-001',
    scenario: 'accident',
    incident: 'Two-vehicle collision blocking curb lane',
    decision: 'Lane closure + dynamic reroute via Brigade Rd',
    outcome: 'Cleared in 18 min, risk score fell 0.81 → 0.34',
    outcomePositive: true,
  },
  {
    id: 'MEM-003',
    date: '2026-05-09',
    location: 'Residency Circle',
    intersectionId: 'INT-003',
    scenario: 'illegal_parking',
    incident: 'Repeated curbside obstruction during retail hours',
    decision: 'Enforcement dispatch only (no signal change)',
    outcome: 'Recurred within 2 hrs — partial mitigation',
    outcomePositive: false,
  },
  {
    id: 'MEM-004',
    date: '2026-04-28',
    location: 'Trinity Junction',
    intersectionId: 'INT-004',
    scenario: 'school_zone',
    incident: 'School dismissal surge with pedestrian conflicts',
    decision: 'Temporary 20 km/h zone + crossing guard request',
    outcome: 'Zero conflicts recorded, speed compliance 94%',
    outcomePositive: true,
  },
  {
    id: 'MEM-005',
    date: '2026-04-12',
    location: 'MG Road Junction',
    intersectionId: 'INT-001',
    scenario: 'emergency_vehicle',
    incident: 'Ambulance transit blocked by saturated approach',
    decision: 'Emergency preemption corridor activated',
    outcome: 'Transit time cut 6.5 → 2.1 min through corridor',
    outcomePositive: true,
  },
  {
    id: 'MEM-006',
    date: '2026-03-30',
    location: 'Cubbon Gate',
    intersectionId: 'INT-006',
    scenario: 'morning_rush',
    incident: 'Peak spillback from arterial onto feeder roads',
    decision: 'Metered feeder entry (trial)',
    outcome: 'Spillback contained, arterial speed +11%',
    outcomePositive: true,
  },
]

/** Returns records most similar to the active scenario first. */
export function getSimilarIncidents(scenario: string | undefined, limit = 4): MemoryRecord[] {
  if (!scenario) return OPERATIONAL_MEMORY.slice(0, limit)
  const same = OPERATIONAL_MEMORY.filter((m) => m.scenario === scenario)
  const rest = OPERATIONAL_MEMORY.filter((m) => m.scenario !== scenario)
  return [...same, ...rest].slice(0, limit)
}

/** Returns records for a given intersection (historical missions). */
export function getMissionsForIntersection(intersectionId: string, limit = 3): MemoryRecord[] {
  return OPERATIONAL_MEMORY.filter((m) => m.intersectionId === intersectionId).slice(0, limit)
}
