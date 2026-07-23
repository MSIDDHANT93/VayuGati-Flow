import { PipelineResponse } from '../api/pipeline'
import { MapLayerId } from '../data/gisData'
import { MissionLogEntry } from '../components/panels/MissionLog'

export interface AppState {
  currentScenario: string
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
  missionLog: MissionLogEntry[]
  selectedIntersectionId: string
  visibleLayers: Set<MapLayerId>
}

type AppStateListener = () => void

export class AppContext {
  private state: AppState
  private listeners = new Set<AppStateListener>()

  constructor(visibleLayers: Set<MapLayerId>) {
    this.state = {
      currentScenario: 'morning_rush',
      pipelineData: null,
      loading: true,
      error: null,
      missionLog: [],
      selectedIntersectionId: 'INT-001',
      visibleLayers,
    }
  }

  getState = (): AppState => this.state

  subscribe = (listener: AppStateListener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  update(updater: (state: AppState) => AppState): void {
    this.state = updater(this.state)
    this.listeners.forEach((listener) => listener())
  }
}
