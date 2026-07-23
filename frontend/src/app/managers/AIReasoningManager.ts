import { AIReasoningService } from '../../services/AIReasoningService'
import { EventManager } from './EventManager'

export class AIReasoningManager {
  constructor(
    private readonly events: EventManager,
    private readonly service: AIReasoningService,
  ) {}

  recordApproval(title: string): void {
    this.events.log(this.service.createApprovalEvent(title))
  }

  recordEvidenceReview(title: string): void {
    this.events.log(this.service.createEvidenceReviewEvent(title))
  }
}
