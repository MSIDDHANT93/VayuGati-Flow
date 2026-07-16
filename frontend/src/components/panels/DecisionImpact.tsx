import React, { useEffect, useState } from 'react'
import { TrendingUp, ArrowRight, Zap, PlayCircle } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface DecisionImpactProps {
  recommendations: string[]
  confidence: number
  loading?: boolean
  pipelineData?: PipelineResponse | null
}

interface SimMetric {
  label: string
  before: number
  after: number
  unit: string
  format: (v: number) => string
  lowerIsBetter: boolean
}

const DecisionImpact: React.FC<DecisionImpactProps> = ({ recommendations, confidence, loading, pipelineData }) => {
  const [applied, setApplied] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setApplied(false)
    setProgress(0)
  }, [pipelineData?.intersection_id, pipelineData?.congestion_score])

  const data = pipelineData

  const metrics: SimMetric[] = data
    ? [
        {
          label: 'Queue Length',
          before: data.queue_length_meters,
          after: Math.max(data.queue_length_meters * 0.55, 5),
          unit: 'm',
          format: (v) => `${v.toFixed(1)}m`,
          lowerIsBetter: true,
        },
        {
          label: 'Avg Speed',
          before: data.average_speed_kmh,
          after: data.average_speed_kmh * 1.32,
          unit: 'km/h',
          format: (v) => `${v.toFixed(1)}`,
          lowerIsBetter: false,
        },
        {
          label: 'Level of Service',
          before: data.risk_score,
          after: data.risk_score * 0.6,
          unit: '',
          format: () => data.level_of_service,
          lowerIsBetter: true,
        },
        {
          label: 'Risk Score',
          before: data.risk_score,
          after: data.risk_score * 0.72,
          unit: '',
          format: (v) => v.toFixed(2),
          lowerIsBetter: true,
        },
      ]
    : []

  const runSimulation = () => {
    setApplied(true)
    setProgress(0)
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const pct = Math.min((now - start) / duration, 1)
      setProgress(pct)
      if (pct < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500">Loading impact analysis...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Run simulation control */}
      <button
        onClick={runSimulation}
        disabled={!data}
        className="w-full flex items-center justify-center gap-2 bg-mission-dark hover:bg-mission-border disabled:opacity-40 border border-mission-border rounded py-1.5 text-[11px] text-mission-accent font-semibold transition-colors"
      >
        <PlayCircle className="w-3.5 h-3.5" />
        {applied ? 'RE-RUN SIMULATION' : 'RUN BEFORE / AFTER SIMULATION'}
      </button>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => {
          const interpolated = applied
            ? metric.before + (metric.after - metric.before) * progress
            : metric.before
          const pctOfRange = metric.before === 0 ? 0 : Math.min(interpolated / (metric.before * 1.2 || 1), 1)
          const improved = applied && progress > 0.05
          return (
            <div key={index} className="bg-mission-dark rounded border border-mission-border p-2">
              <div className="text-[10px] text-gray-500 mb-1">{metric.label}</div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-semibold text-gray-200">
                  {metric.format(interpolated)}
                </span>
                {applied && (
                  <span
                    className={`text-[10px] font-mono ${
                      metric.lowerIsBetter ? 'text-mission-accent' : 'text-mission-accent'
                    }`}
                  >
                    → {metric.format(metric.after)}
                  </span>
                )}
              </div>
              <div className="h-1.5 bg-mission-panel rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-150 ${
                    improved ? 'bg-mission-accent' : 'bg-mission-warning'
                  }`}
                  style={{ width: `${pctOfRange * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Expected Outcomes */}
      <div className="bg-mission-dark rounded border border-mission-border p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp className="w-3 h-3 text-mission-info" />
          <span className="text-[10px] font-semibold text-gray-400">EXPECTED OUTCOMES</span>
        </div>
        <ul className="space-y-1">
          {recommendations.slice(0, 3).map((rec, index) => (
            <li key={index} className="text-[11px] text-gray-300 flex items-start gap-2">
              <ArrowRight className="w-3 h-3 text-mission-accent flex-shrink-0 mt-0.5" />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Confidence Bar */}
      <div className="bg-mission-dark rounded border border-mission-border p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-mission-warning" />
            IMPLEMENTATION CONFIDENCE
          </span>
          <span className="text-[10px] font-mono text-mission-accent">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 bg-mission-panel rounded overflow-hidden">
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
