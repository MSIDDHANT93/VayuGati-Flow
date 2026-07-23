import { MissionLogEntry } from '../../components/panels/MissionLog'
import { AppContext } from '../AppContext'

export class EventManager {
  constructor(private readonly context: AppContext) {}

  log(entry: MissionLogEntry): void {
    this.context.update((state) => ({
      ...state,
      missionLog: [entry, ...state.missionLog].slice(0, 50),
    }))
  }
}
