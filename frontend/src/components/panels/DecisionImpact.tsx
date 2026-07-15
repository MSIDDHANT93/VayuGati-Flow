import React from 'react'
import { TrendingUp, ArrowUp, ArrowDown, Minus, Zap } from 'lucide-react'

interface DecisionImpactProps {
  recommendations: string[]
  confidence: number
  loading?: boolean
}

interface ImpactMetric {
  label: string
  value: string
  change: number
  icon: 'up' | 'down' | 'neutral'
}

const DecisionImpact: React.FC<DecisionImpactProps> = ({ recommendations, confidence, loading }) => {
  const mockImpacts: ImpactMetric[] = [
    { label: 'Queue Length', value: '-45%', change: -45, icon: 'down' },
    { label: 'Avg Speed', value: '+32%', change: 32, icon: 'up' },
    { label: 'Throughput', value: '+18%', change: 18, icon: 'up' },
    { label: 'Risk Score', value: '-28%', change: -28, icon: 'down' },
  ]

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-mission-warning" />
          <span className="text-xs font-semibold text-gray-400">DECISION IMPACT</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500">Loading impact analysis...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-mission-warning" />
        <span className="text-xs font-semibold text-gray-400">DECISION IMPACT</span>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {mockImpacts.map((metric, index) => (
          <div
            key={index}
            className="bg-mission-dark rounded border border-mission-border p-2"
          >
            <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-semibold text-gray-200">
                {metric.value}
              </span>
              {metric.icon === 'up' && (
                <ArrowUp className="w-4 h-4 text-mission-accent" />
              )}
              {metric.icon === 'down' && (
                <ArrowDown className="w-4 h-4 text-mission-accent" />
              )}
              {metric.icon === 'neutral' && (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expected Outcomes */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3 h-3 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">EXPECTED OUTCOMES</span>
        </div>
        <ul className="space-y-1">
          {recommendations.slice(0, 3).map((rec, index) => (
            <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
              <span className="text-mission-accent">→</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Confidence Bar */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">IMPLEMENTATION CONFIDENCE</span>
          <span className="text-xs font-mono text-mission-accent">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mission-warning to-mission-accent rounded transition-all duration-500"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default DecisionImpact
