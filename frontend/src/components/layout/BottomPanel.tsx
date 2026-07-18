import React from 'react'
import { Activity, AlertCircle, Shield } from 'lucide-react'
import MissionPipeline from '../ui/MissionPipeline'
import RecentMissions from '../mission/RecentMissions'
import ConnectorStatusPanel from '../panels/ConnectorStatusPanel'
import { MissionLogEntry } from '../panels/MissionLog'
import { PipelineResponse } from '../../api/pipeline'

interface BottomPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error?: string | null
  logEntries?: MissionLogEntry[]
}

const BottomPanel: React.FC<BottomPanelProps> = ({ pipelineData, loading, error, logEntries = [] }) => {
  const activeStage = loading ? 1 : pipelineData ? 5 : -1

  if (error) {
    return (
      <footer className="bg-mission-panel border-t border-mission-border flex items-center justify-center gap-2 px-4 py-2">
        <AlertCircle className="w-4 h-4 text-mission-danger" />
        <span className="text-xs text-mission-danger">Pipeline data unavailable — {error}</span>
      </footer>
    )
  }

  return (
    <footer className="bg-mission-panel border-t border-mission-border flex flex-col">
      <div className="px-4 py-2 border-b border-mission-border">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-mission-accent" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mission Pipeline</span>
        </div>
        <MissionPipeline activeStage={activeStage} loading={loading} />
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-0">
        <div className="border-r border-mission-border p-3 overflow-hidden">
          <RecentMissions entries={logEntries} />
        </div>
        <div className="p-3 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-mission-info" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">System Health</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <ConnectorStatusPanel />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default BottomPanel
