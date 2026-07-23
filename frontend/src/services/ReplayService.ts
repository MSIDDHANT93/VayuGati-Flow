import { PipelineResponse } from '../api/pipeline'

export class ReplayService {
  private snapshots: PipelineResponse[] = []

  record(data: PipelineResponse): void {
    this.snapshots = [data, ...this.snapshots].slice(0, 100)
  }

  getSnapshots(): readonly PipelineResponse[] {
    return this.snapshots
  }
}
