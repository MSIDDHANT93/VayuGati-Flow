import { describe, expect, it } from 'vitest'
import { PipelineResponse } from '../api/pipeline'
import { TrafficApp } from './TrafficApp'

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

describe('TrafficApp', () => {
  it('initializes its managers and loads the current scenario into shared context', async () => {
    const runDemo = async () => ({
      success: true,
      timestamp: '2026-01-01T00:00:00Z',
      data: pipelineData,
      errors: null,
    })
    const app = new TrafficApp({ pipelineClient: { runDemo } })

    await app.init()

    expect(app.getState().pipelineData).toEqual(pipelineData)
    expect(app.getState().loading).toBe(false)
    expect(app.getState().missionLog[0]?.message).toContain('PIPELINE COMPLETE')
    expect(app.replay.getSnapshots()).toEqual([pipelineData])
    expect(app.dataPipeline.getSources()).toHaveLength(9)
  })

  it('coordinates map, simulation, and reasoning actions through shared context', async () => {
    const app = new TrafficApp({
      pipelineClient: { runDemo: async () => ({ success: true, timestamp: '', data: pipelineData, errors: null }) },
    })
    await app.init()

    app.map.selectIntersection('INT-002')
    app.map.toggleLayer('incidents')
    app.simulation.recordSimulation('Optimize phase timing')
    app.reasoning.recordApproval('Optimize phase timing')

    expect(app.getState().selectedIntersectionId).toBe('INT-002')
    expect(app.getState().visibleLayers.has('incidents')).toBe(false)
    expect(app.getState().missionLog.map((entry) => entry.message)).toEqual(
      expect.arrayContaining(['SIMULATED — Optimize phase timing', 'APPROVED — Optimize phase timing']),
    )
  })
})
