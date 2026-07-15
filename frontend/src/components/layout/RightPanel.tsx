import React from 'react'
import { Brain, TrendingUp, AlertCircle } from 'lucide-react'
import TrafficIntelligence from '../panels/TrafficIntelligence'
import AIReasoning from '../panels/AIReasoning'
import DecisionImpact from '../panels/DecisionImpact'
import { PipelineResponse } from '../../api/pipeline'

interface RightPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const RightPanel: React.FC<RightPanelProps> = ({ pipelineData, loading, error }) => {
  return (
    <div className="w-96 bg-mission-panel border-l border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-mission-border flex items-center px-4 gap-2">
        <Brain className="w-4 h-4 text-mission-accent" />
        <span className="text-xs font-semibold text-gray-300">TRAFFIC INTELLIGENCE</span>
      </div>

      {/* Traffic Intelligence Panel */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-mission-danger mx-auto mb-2" />
              <div className="text-xs text-mission-danger">{error}</div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Loading traffic intelligence...</div>
          </div>
        ) : (
          <TrafficIntelligence pipelineData={pipelineData} />
        )}
      </div>

      {/* AI Reasoning Panel */}
      <div className="h-48 border-t border-mission-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">AI REASONING</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Loading AI reasoning...</div>
          </div>
        ) : (
          <AIReasoning pipelineData={pipelineData} />
        )}
      </div>

      {/* Decision Impact Panel */}
      <div className="h-64 border-t border-mission-border p-3">
        <DecisionImpact 
          recommendations={pipelineData?.traffic_recommendations || []}
          confidence={pipelineData?.ai_confidence || 0}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default RightPanel
