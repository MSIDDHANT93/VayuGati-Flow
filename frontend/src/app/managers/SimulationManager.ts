import { SimulationService } from '../../services/SimulationService'
import { EventManager } from './EventManager'

export class SimulationManager {
  constructor(
    private readonly events: EventManager,
    private readonly service: SimulationService,
  ) {}

  recordSimulation(title: string): void {
    this.events.log(this.service.createSimulationEvent(title))
  }
}
