import { PipelineResponse } from '../../api/pipeline'
import { ReplayService } from '../../services/ReplayService'

export class ReplayManager {
  constructor(private readonly service: ReplayService) {}

  record(data: PipelineResponse): void {
    this.service.record(data)
  }

  getSnapshots(): readonly PipelineResponse[] {
    return this.service.getSnapshots()
  }
}
