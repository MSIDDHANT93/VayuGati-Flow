import React from 'react'
import { Brain, CheckCircle, AlertCircle } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface AIReasoningProps {
  pipelineData: PipelineResponse | null
}

const AIReasoning: React.FC<AIReasoningProps> = ({ pipelineData }) => {
  const data = pipelineData

  return (
    <div className="space-y-3">
      {/* Congestion Explanation */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3 h-3 text-mission-accent" />
          <span className="text-xs font-semibold text-gray-400">CONGESTION EXPLANATION</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {data ? data.congestion_explanation : 'Loading AI explanation...'}
        </p>
      </div>

      {/* Probable Root Causes */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-3 h-3 text-mission-warning" />
          <span className="text-xs font-semibold text-gray-400">PROBABLE ROOT CAUSES</span>
        </div>
        <ul className="space-y-1">
          {data ? (
            data.probable_root_causes.map((cause, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-mission-warning">•</span>
                {cause}
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500">Loading root causes...</li>
          )}
        </ul>
      </div>

      {/* Traffic Recommendations */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-3 h-3 text-mission-accent" />
          <span className="text-xs font-semibold text-gray-400">RECOMMENDATIONS</span>
        </div>
        <ul className="space-y-1">
          {data ? (
            data.traffic_recommendations.map((recommendation, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-mission-accent">✓</span>
                {recommendation}
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500">Loading recommendations...</li>
          )}
        </ul>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">AI CONFIDENCE</span>
        <span className="font-mono text-mission-accent">
          {data ? `${(data.ai_confidence * 100).toFixed(0)}%` : '...'}
        </span>
      </div>
    </div>
  )
}

export default AIReasoning
