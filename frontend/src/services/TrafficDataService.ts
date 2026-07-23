import { PipelineResponse } from '../api/pipeline'
import { TrafficRepository } from '../repositories/TrafficRepository'

export class TrafficDataService {
  constructor(private readonly repository: TrafficRepository) {}

  async loadScenario(scenario: string): Promise<PipelineResponse | null> {
    const response = await this.repository.loadDemoScenario({
      scenario,
      intersection_id: 'INT-001',
      camera_id: 'CAM-001',
      frame_id: 'FRM-001',
    })
    return response.success && response.data ? response.data : null
  }
}
