import React from 'react'
import { Brain, TrendingUp, AlertCircle, Target, CheckCircle, ArrowRight } from 'lucide-react'
import TrafficIntelligence from '../panels/TrafficIntelligence'
import AIReasoning from '../panels/AIReasoning'
import DecisionImpact from '../panels/DecisionImpact'
import ConfidenceIndicators from '../panels/ConfidenceIndicators'
import { PipelineResponse } from '../../api/pipeline'

interface RightPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const RightPanel: React.FC<RightPanelProps> = ({ pipelineData, loading, error }) => {
  const getPriorityLevel = (data: PipelineResponse | null) => {
    if (!data) return 'unknown'
    if (data.risk_score > 0.7) return 'critical'
    if (data.risk_score > 0.4) return 'high'
    return 'normal'
  }

  const priority = getPriorityLevel(pipelineData)

  return (
    <div className="w-[420px] bg-mission-panel border-l border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-mission-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-mission-accent" />
          <span className="text-xs font-semibold text-gray-300">DECISION SUPPORT</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
          priority === 'critical' ? 'bg-mission-danger/20 text-mission-danger' :
          priority === 'high' ? 'bg-mission-warning/20 text-mission-warning' :
          'bg-mission-accent/20 text-mission-accent'
        }`}>
          <Target className="w-3 h-3" />
          {priority.toUpperCase()} PRIORITY
        </div>
      </div>

      {/* Confidence Indicators */}
      <div className="px-3 py-2 border-b border-mission-border">
        <ConfidenceIndicators pipelineData={pipelineData} />
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
            <div className="text-xs text-gray-500">Processing intelligence data...</div>
          </div>
        ) : (
          <TrafficIntelligence pipelineData={pipelineData} />
        )}
      </div>

      {/* AI Reasoning Panel */}
      <div className="h-44 border-t border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-mission-info" />
            <span className="text-xs font-semibold text-gray-400">AI ANALYSIS</span>
          </div>
          {pipelineData && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <CheckCircle className="w-3 h-3 text-mission-accent" />
              {(pipelineData.ai_confidence * 100).toFixed(0)}% CONFIDENCE
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Analyzing patterns...</div>
          </div>
        ) : (
          <AIReasoning pipelineData={pipelineData} />
        )}
      </div>

      {/* Decision Impact Panel */}
      <div className="h-56 border-t border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-mission-warning" />
            <span className="text-xs font-semibold text-gray-400">RECOMMENDED ACTIONS</span>
          </div>
          {pipelineData && pipelineData.traffic_recommendations.length > 0 && (
            <div className="text-[10px] text-mission-accent font-mono">
              {pipelineData.traffic_recommendations.length} OPTIONS
            </div>
          )}
        </div>
        <DecisionImpact 
          recommendations={pipelineData?.traffic_recommendations || []}
          confidence={pipelineData?.ai_confidence || 0}
          loading={loading}
          pipelineData={pipelineData}
        />
      </div>
    </div>
  )
}

export default RightPanel
