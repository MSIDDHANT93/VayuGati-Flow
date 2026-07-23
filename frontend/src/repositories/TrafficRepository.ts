import { PipelineRequest, pipelineApi } from '../api/pipeline'

export interface PipelineClient {
  runDemo(request: PipelineRequest): ReturnType<typeof pipelineApi.runDemo>
}

export class TrafficRepository {
  constructor(private readonly client: PipelineClient = pipelineApi) {}

  loadDemoScenario(request: PipelineRequest): ReturnType<PipelineClient['runDemo']> {
    return this.client.runDemo(request)
  }
}
