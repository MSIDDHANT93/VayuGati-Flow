import { ReportService, RuntimeSummary } from '../../services/ReportService'
import { AppContext } from '../AppContext'

export class ReportManager {
  constructor(
    private readonly context: AppContext,
    private readonly service: ReportService,
  ) {}

  createRuntimeSummary(): RuntimeSummary {
    return this.service.createRuntimeSummary(this.context.getState())
  }
}
