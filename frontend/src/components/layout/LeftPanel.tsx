import React from 'react'
import MissionStatus from '../mission/MissionStatus'
import { PipelineResponse } from '../../api/pipeline'

interface LeftPanelProps {
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  currentScenario,
  onScenarioChange,
  pipelineData,
  loading,
  error,
}) => {
  return (
    <aside className="bg-mission-panel border-r border-mission-border flex flex-col overflow-hidden">
      <div className="p-3 space-y-3 overflow-y-auto scrollbar-thin flex-1">
        <MissionStatus
          currentScenario={currentScenario}
          onScenarioChange={onScenarioChange}
          pipelineData={pipelineData}
          loading={loading}
          error={error}
        />
      </div>
    </aside>
  )
}

export default LeftPanel
