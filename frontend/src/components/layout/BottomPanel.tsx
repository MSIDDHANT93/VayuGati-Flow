import React from 'react'
import { BarChart3, Play, Pause, RotateCcw } from 'lucide-react'
import HistoricalTrends from '../panels/HistoricalTrends'
import { PipelineResponse } from '../../api/pipeline'

interface BottomPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const BottomPanel: React.FC<BottomPanelProps> = ({ pipelineData, loading }) => {
  return (
    <div className="h-48 bg-mission-panel border-t border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-mission-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-mission-warning" />
          <span className="text-xs font-semibold text-gray-300">HISTORICAL TRENDS</span>
          {pipelineData && (
            <span className="text-xs text-gray-500 ml-2">
              Scenario: {pipelineData.scenario.replace('_', ' ').toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-accent transition-colors">
            <Play className="w-3 h-3 text-mission-accent" />
            <span className="text-xs text-gray-300">PLAY</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-warning transition-colors">
            <Pause className="w-3 h-3 text-mission-warning" />
            <span className="text-xs text-gray-300">PAUSE</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-info transition-colors">
            <RotateCcw className="w-3 h-3 text-mission-info" />
            <span className="text-xs text-gray-300">RESET</span>
          </button>
        </div>
      </div>

      {/* Historical Trends */}
      <div className="flex-1 p-3 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Loading historical trends...</div>
          </div>
        ) : (
          <HistoricalTrends />
        )}
      </div>
    </div>
  )
}

export default BottomPanel
