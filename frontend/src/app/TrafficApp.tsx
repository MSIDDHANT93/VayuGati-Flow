import React from 'react'
import ReactDOM, { Root } from 'react-dom/client'
import App from '../App'
import { MissionLogEntry } from '../components/panels/MissionLog'
import { MapRepository } from '../repositories/MapRepository'
import { PipelineClient, TrafficRepository } from '../repositories/TrafficRepository'
import { AIReasoningService } from '../services/AIReasoningService'
import { MapService } from '../services/MapService'
import { ReplayService } from '../services/ReplayService'
import { ReportService } from '../services/ReportService'
import { SimulationService } from '../services/SimulationService'
import { TrafficDataService } from '../services/TrafficDataService'
import { AppContext, AppState } from './AppContext'
import {
  AIReasoningManager,
  DashboardLayoutManager,
  DataPipelineManager,
  EventManager,
  MapManager,
  ReplayManager,
  ReportManager,
  SimulationManager,
  TrafficDataManager,
} from './managers/index'

export interface TrafficAppDependencies {
  pipelineClient?: PipelineClient
}

export class TrafficApp {
  readonly context: AppContext
  readonly layout: DashboardLayoutManager
  readonly map: MapManager
  readonly events: EventManager
  readonly simulation: SimulationManager
  readonly reasoning: AIReasoningManager
  readonly replay: ReplayManager
  readonly reports: ReportManager
  readonly trafficData: TrafficDataManager
  readonly dataPipeline: DataPipelineManager

  private initPromise: Promise<void> | null = null
  private root: Root | null = null
  private unsubscribeReplay: (() => void) | null = null
  private lastRecordedPipeline = null as AppState['pipelineData']

  constructor({ pipelineClient }: TrafficAppDependencies = {}) {
    const mapRepository = new MapRepository()
    const trafficRepository = new TrafficRepository(pipelineClient)
    const mapService = new MapService(mapRepository)
    const trafficDataService = new TrafficDataService(trafficRepository)
    const simulationService = new SimulationService()
    const reasoningService = new AIReasoningService()
    const replayService = new ReplayService()
    const reportService = new ReportService()

    this.context = new AppContext(mapService.getDefaultVisibleLayers())
    this.events = new EventManager(this.context)
    this.layout = new DashboardLayoutManager(this.context)
    this.map = new MapManager(this.context, mapService)
    this.simulation = new SimulationManager(this.events, simulationService)
    this.reasoning = new AIReasoningManager(this.events, reasoningService)
    this.replay = new ReplayManager(replayService)
    this.reports = new ReportManager(this.context, reportService)
    this.dataPipeline = new DataPipelineManager(trafficDataService)
    this.trafficData = new TrafficDataManager(this.context, this.events, this.dataPipeline)
  }

  getState = (): AppState => this.context.getState()

  subscribe = (listener: () => void): (() => void) => this.context.subscribe(listener)

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise

    this.layout.initialize()
    this.unsubscribeReplay = this.context.subscribe(() => {
      const pipelineData = this.context.getState().pipelineData
      if (pipelineData && pipelineData !== this.lastRecordedPipeline) {
        this.lastRecordedPipeline = pipelineData
        this.replay.record(pipelineData)
      }
    })
    this.initPromise = this.trafficData.loadScenario(this.getState().currentScenario)
    return this.initPromise
  }

  setScenario(scenario: string): void {
    if (scenario === this.getState().currentScenario) return
    this.context.update((state) => ({ ...state, currentScenario: scenario }))
    void this.trafficData.loadScenario(scenario)
  }

  retry(): void {
    void this.trafficData.loadScenario(this.getState().currentScenario)
  }

  log(entry: MissionLogEntry): void {
    this.events.log(entry)
  }

  bootstrap(container: HTMLElement): void {
    if (this.root) return
    this.root = ReactDOM.createRoot(container)
    this.root.render(
      <React.StrictMode>
        <App app={this} />
      </React.StrictMode>,
    )
    void this.init()
  }

  dispose(): void {
    this.unsubscribeReplay?.()
    this.unsubscribeReplay = null
    this.root?.unmount()
    this.root = null
  }
}
