import React from 'react'
import { DecisionScoreBreakdown } from '../../lib/decisionIntelligence'

interface DecisionScoreProps {
  score: DecisionScoreBreakdown
  focusedTitle?: string | null
}

const barColor = (v: number) => (v > 0.7 ? 'bg-mission-accent' : v > 0.45 ? 'bg-mission-warning' : 'bg-mission-danger')

const DecisionScore: React.FC<DecisionScoreProps> = ({ score, focusedTitle }) => {
  const metrics = [
    { label: 'TRAFFIC', value: score.traffic },
    { label: 'SAFETY', value: score.safety },
    { label: 'COST', value: score.cost },
    { label: 'IMPL. TIME', value: score.implementationTime },
    { label: 'OVERALL', value: score.overall },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-gray-400">DECISION SCORE</span>
        {focusedTitle && (
          <span className="text-[10px] text-gray-500 truncate max-w-[140px]">FOCUS: {focusedTitle}</span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-mission-dark rounded border border-mission-border px-1.5 py-1">
            <div className="text-[10px] text-gray-500 mb-0.5 truncate">{m.label}</div>
            <div className="text-[10px] font-mono font-semibold text-gray-200 mb-1">
              {(m.value * 100).toFixed(0)}%
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
    </div>
  )
}

export default DecisionScore
