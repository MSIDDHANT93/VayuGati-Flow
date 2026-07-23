import { AppState } from '../app/AppContext'

export interface RuntimeSummary {
  scenario: string
  hasPipelineData: boolean
  eventCount: number
}

export class ReportService {
  createRuntimeSummary(state: AppState): RuntimeSummary {
    return {
      scenario: state.currentScenario,
      hasPipelineData: state.pipelineData !== null,
      eventCount: state.missionLog.length,
    }
  }
}
