import { AppContext } from '../AppContext'
import { DataPipelineManager } from './DataPipelineManager'
import { EventManager } from './EventManager'

export class TrafficDataManager {
  constructor(
    private readonly context: AppContext,
    private readonly events: EventManager,
    private readonly pipeline: DataPipelineManager,
  ) {}

  async loadScenario(scenario: string): Promise<void> {
    this.context.update((state) => ({ ...state, loading: true, error: null }))
    try {
      const data = await this.pipeline.loadTrafficScenario(scenario)
      if (!data) {
        this.context.update((state) => ({ ...state, error: 'Failed to load pipeline data' }))
        return
      }
      this.context.update((state) => ({
        ...state,
        pipelineData: data,
        selectedIntersectionId: data.intersection_id,
      }))
      this.events.log({
        id: `pipeline-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: `PIPELINE COMPLETE — ${data.intersection_id} (${data.scenario.replace(/_/g, ' ')})`,
        level: data.risk_score > 0.5 ? 'warning' : 'success',
      })
    } catch {
      this.context.update((state) => ({ ...state, error: 'Error connecting to backend' }))
    } finally {
      this.context.update((state) => ({ ...state, loading: false }))
    }
  }
}
