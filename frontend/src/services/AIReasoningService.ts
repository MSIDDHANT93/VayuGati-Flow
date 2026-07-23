import { MissionLogEntry } from '../components/panels/MissionLog'

export class AIReasoningService {
  createApprovalEvent(title: string): MissionLogEntry {
    return this.createEvent(title, 'app', 'APPROVED', 'success')
  }

  createEvidenceReviewEvent(title: string): MissionLogEntry {
    return this.createEvent(title, 'ev', 'EVIDENCE REVIEW', 'info')
  }

  private createEvent(
    title: string,
    suffix: string,
    action: string,
    level: MissionLogEntry['level'],
  ): MissionLogEntry {
    return {
      id: `${Date.now()}-${suffix}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `${action} — ${title}`,
      level,
    }
  }
}
