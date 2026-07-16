// Deterministic decision-intelligence derivations.
// All values are computed from real PipelineResponse fields (no invented
// backend calls, no randomness) so recommendations are explainable and
// reproducible from the underlying traffic/vision/reasoning metrics.

import { PipelineResponse } from '../api/pipeline'

export type CostTag = 'LOW' | 'MEDIUM' | 'HIGH'
export type ImplementationTag = 'FAST' | 'MEDIUM' | 'SLOW'
export type CoAStatus = 'pending' | 'approved' | 'rejected' | 'modified'

export interface CourseOfAction {
  id: string
  title: string
  description: string
  costTag: CostTag
  implementationTag: ImplementationTag
  confidence: number
  expected: {
    queueDeltaPct: number // negative = reduction
    speedDeltaPct: number // positive = improvement
    riskDeltaPct: number // negative = reduction
  }
  evidence: string[]
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function mapCongestionToLOS(score: number): string {
  if (score < 0.2) return 'LOS_A'
  if (score < 0.4) return 'LOS_B'
  if (score < 0.6) return 'LOS_C'
  if (score < 0.75) return 'LOS_D'
  if (score < 0.9) return 'LOS_E'
  return 'LOS_F'
}

export function buildCoursesOfAction(data: PipelineResponse): CourseOfAction[] {
  const recs = data.traffic_recommendations || []
  const causes = data.probable_root_causes || []

  const signalRetiming: CourseOfAction = {
    id: 'signal-retiming',
    title: 'Adaptive Signal Retiming',
    description:
      recs[0] ||
      'Adjust signal phase timing to match current demand pattern and reduce queue buildup.',
    costTag: 'LOW',
    implementationTag: 'FAST',
    confidence: clamp01(data.ai_confidence * 0.95),
    expected: {
      queueDeltaPct: -Math.min(60, 30 + data.congestion_score * 40),
      speedDeltaPct: Math.min(45, 15 + (1 - Math.min(data.average_speed_kmh, 60) / 60) * 40),
      riskDeltaPct: -Math.min(35, data.risk_score * 40),
    },
    evidence: [
      `Queue length ${data.queue_length_meters.toFixed(1)}m observed at ${data.intersection_id}`,
      `Level of service currently ${data.level_of_service.replace('LOS_', '')}`,
      causes[0] ? `Root cause: ${causes[0]}` : `Congestion score: ${data.congestion_score.toFixed(2)}`,
    ],
  }

  const laneReallocation: CourseOfAction = {
    id: 'lane-reallocation',
    title: 'Dynamic Lane Reallocation',
    description:
      recs[1] ||
      'Reassign lane usage (e.g. temporary contraflow or turn-lane conversion) to relieve saturated approaches.',
    costTag: 'MEDIUM',
    implementationTag: 'MEDIUM',
    confidence: clamp01(data.ai_confidence * 0.85),
    expected: {
      queueDeltaPct: -Math.min(40, data.occupancy_rate * 40),
      speedDeltaPct: Math.min(30, data.occupancy_rate * 30),
      riskDeltaPct: -Math.min(25, data.occupancy_rate * 25),
    },
    evidence: [
      `Occupancy rate ${(data.occupancy_rate * 100).toFixed(0)}% at monitored approach`,
      `Vehicle density ${data.vehicle_density_vehicles_per_km.toFixed(0)} veh/km`,
      causes[1] ? `Root cause: ${causes[1]}` : `Total vehicles analyzed: ${data.total_vehicles}`,
    ],
  }

  const riskMitigation: CourseOfAction = {
    id: 'risk-mitigation',
    title: 'Upstream Demand Metering',
    description:
      recs[2] ||
      'Meter upstream inflow to prevent further risk escalation at the affected intersection.',
    costTag: 'LOW',
    implementationTag: 'FAST',
    confidence: clamp01(data.ai_confidence * 0.9),
    expected: {
      queueDeltaPct: -Math.min(30, data.risk_score * 30),
      speedDeltaPct: Math.min(20, data.risk_score * 20),
      riskDeltaPct: -Math.min(50, data.risk_score * 55),
    },
    evidence: [
      `Risk score ${data.risk_score.toFixed(2)} flags elevated incident probability`,
      data.congestion_explanation,
      causes[2] ? `Root cause: ${causes[2]}` : `Scenario: ${data.scenario.replace('_', ' ')}`,
    ],
  }

  return [signalRetiming, laneReallocation, riskMitigation]
}

export interface DecisionScoreBreakdown {
  traffic: number
  safety: number
  cost: number
  implementationTime: number
  overall: number
}

const costScore = (tag: CostTag) => (tag === 'LOW' ? 0.9 : tag === 'MEDIUM' ? 0.6 : 0.3)
const implScore = (tag: ImplementationTag) => (tag === 'FAST' ? 0.9 : tag === 'MEDIUM' ? 0.6 : 0.3)

export function computeDecisionScore(
  data: PipelineResponse | null,
  coas: CourseOfAction[],
  focusedId: string | null
): DecisionScoreBreakdown {
  if (!data) return { traffic: 0, safety: 0, cost: 0, implementationTime: 0, overall: 0 }

  const traffic = clamp01(1 - data.congestion_score)
  const safety = clamp01(1 - data.risk_score)

  const focused = focusedId ? coas.find((c) => c.id === focusedId) : null
  const cost = focused
    ? costScore(focused.costTag)
    : coas.reduce((sum, c) => sum + costScore(c.costTag), 0) / Math.max(coas.length, 1)
  const implementationTime = focused
    ? implScore(focused.implementationTag)
    : coas.reduce((sum, c) => sum + implScore(c.implementationTag), 0) / Math.max(coas.length, 1)

  const overall = (traffic + safety + cost + implementationTime) / 4

  return { traffic, safety, cost, implementationTime, overall }
}
