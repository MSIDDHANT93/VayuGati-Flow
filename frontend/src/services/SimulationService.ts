import { MissionLogEntry } from '../components/panels/MissionLog'

export class SimulationService {
  createSimulationEvent(title: string): MissionLogEntry {
    return {
      id: `${Date.now()}-sim`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `SIMULATED — ${title}`,
      level: 'info',
    }
  }
}
