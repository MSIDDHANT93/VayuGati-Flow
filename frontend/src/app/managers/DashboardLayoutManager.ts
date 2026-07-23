import { AppContext } from '../AppContext'

export class DashboardLayoutManager {
  constructor(private readonly context: AppContext) {}

  initialize(): void {
    this.context.update((state) => ({ ...state }))
  }
}
