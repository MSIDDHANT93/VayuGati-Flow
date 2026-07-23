import { describe, expect, it } from 'vitest'
import { PipelineResponse } from '../api/pipeline'
import { TrafficRepository } from '../repositories/TrafficRepository'
import { TrafficDataService } from './TrafficDataService'

const pipelineData: PipelineResponse = {
  scenario: 'morning_rush',
  intersection_id: 'INT-001',
  total_vehicles: 42,
  vision_detections: 42,
  vision_inference_time_ms: 10,
  queue_length_meters: 25,
  vehicle_density_vehicles_per_km: 60,
  average_speed_kmh: 24,
  occupancy_rate: 0.6,
  congestion_score: 0.4,
  level_of_service: 'D',
  risk_score: 0.3,
  congestion_explanation: 'Moderate congestion',
  probable_root_causes: ['Peak demand'],
  traffic_recommendations: ['Optimize phase timing'],
  ai_confidence: 0.9,
  pipeline_duration_ms: 30,
}

describe('TrafficDataService', () => {
  it('translates a scenario request into the demo pipeline repository request', async () => {
    const runDemo = async () => ({ success: true, timestamp: '', data: pipelineData, errors: null })
    const service = new TrafficDataService(new TrafficRepository({ runDemo }))

    await expect(service.loadScenario('morning_rush')).resolves.toEqual(pipelineData)
  })

  it('returns null when the repository reports an unsuccessful response', async () => {
    const runDemo = async () => ({ success: false, timestamp: '', data: pipelineData, errors: ['Unavailable'] })
    const service = new TrafficDataService(new TrafficRepository({ runDemo }))

    await expect(service.loadScenario('morning_rush')).resolves.toBeNull()
  })
})
