import React from 'react'
import { AlertCircle } from 'lucide-react'
import SituationSummary from '../mission/SituationSummary'
import DecisionSupport from '../mission/DecisionSupport'
import { PipelineResponse } from '../../api/pipeline'

interface RightPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
  onSimulate: (title: string) => void
  onApprove: (title: string) => void
  onViewEvidence: (title: string) => void
}

const RightPanel: React.FC<RightPanelProps> = ({
  pipelineData,
  loading,
  error,
  onSimulate,
  onApprove,
  onViewEvidence,
}) => {
  if (error) {
    return (
      <aside className="bg-mission-panel border-l border-mission-border flex flex-col p-3">
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="w-8 h-8 text-mission-danger" />
          <div className="text-xs text-mission-danger">{error}</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="bg-mission-panel border-l border-mission-border flex flex-col overflow-hidden">
      <div className="p-3 space-y-3 overflow-y-auto scrollbar-thin flex-1">
        <SituationSummary pipelineData={pipelineData} loading={loading} />
        <div className="flex-1 min-h-0">
          <DecisionSupport
            pipelineData={pipelineData}
            loading={loading}
            onSimulate={onSimulate}
            onApprove={onApprove}
            onViewEvidence={onViewEvidence}
          />
        </div>
      </div>
    </aside>
  )
}

export default RightPanel
