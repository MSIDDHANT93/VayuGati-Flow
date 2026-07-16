import React from 'react'
import { PipelineResponse } from '../../api/pipeline'

interface ConfidenceIndicatorsProps {
  pipelineData: PipelineResponse | null
}

const barColor = (v: number) => (v > 0.75 ? 'bg-mission-accent' : v > 0.5 ? 'bg-mission-warning' : 'bg-mission-danger')

const ConfidenceIndicators: React.FC<ConfidenceIndicatorsProps> = ({ pipelineData }) => {
  const data = pipelineData
  const vision = data ? Math.min(0.95, 0.75 + (data.vision_detections > 0 ? 0.15 : 0)) : 0
  const traffic = data ? Math.max(0.4, 1 - data.risk_score * 0.5) : 0
  const reasoning = data?.ai_confidence ?? 0
  const simulation = data ? 0.88 : 0
  const overall = data ? (vision + traffic + reasoning + simulation) / 4 : 0

  const metrics = [
    { label: 'VISION', value: vision },
    { label: 'TRAFFIC', value: traffic },
    { label: 'REASONING', value: reasoning },
    { label: 'SIMULATION', value: simulation },
    { label: 'OVERALL', value: overall },
  ]

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {metrics.map((m) => (
        <div key={m.label} className="bg-mission-dark rounded border border-mission-border px-1.5 py-1">
          <div className="text-[10px] text-gray-500 mb-0.5">{m.label}</div>
          <div className="text-[10px] font-mono font-semibold text-gray-200 mb-1">
            {data ? `${(m.value * 100).toFixed(0)}%` : '--'}
          </div>
          <div className="h-1 bg-mission-panel rounded overflow-hidden">
            <div
              className={`h-full rounded transition-all duration-500 ${barColor(m.value)}`}
              style={{ width: `${m.value * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ConfidenceIndicators
