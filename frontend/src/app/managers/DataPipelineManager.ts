import { PipelineResponse } from '../../api/pipeline'
import { TrafficDataService } from '../../services/TrafficDataService'

export type ExternalDataSourceId =
  | 'camera-feeds'
  | 'google-maps'
  | 'weather'
  | 'road-works'
  | 'signals'
  | 'iot'
  | 'historical-traffic'
  | 'simulation-outputs'
  | 'ai-reasoning-outputs'

export interface ExternalDataSource {
  id: ExternalDataSourceId
  available: boolean
}

const externalDataSources: readonly ExternalDataSource[] = [
  { id: 'camera-feeds', available: false },
  { id: 'google-maps', available: false },
  { id: 'weather', available: false },
  { id: 'road-works', available: false },
  { id: 'signals', available: false },
  { id: 'iot', available: false },
  { id: 'historical-traffic', available: false },
  { id: 'simulation-outputs', available: false },
  { id: 'ai-reasoning-outputs', available: false },
]

export class DataPipelineManager {
  constructor(private readonly trafficData: TrafficDataService) {}

  getSources(): readonly ExternalDataSource[] {
    return externalDataSources
  }

  loadTrafficScenario(scenario: string): Promise<PipelineResponse | null> {
    return this.trafficData.loadScenario(scenario)
  }
}
