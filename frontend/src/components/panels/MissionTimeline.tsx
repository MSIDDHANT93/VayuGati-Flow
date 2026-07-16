import React from 'react'
import { Image, Scan, BarChart3, Brain, PlayCircle, UserCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface MissionTimelineProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

interface Stage {
  id: string
  label: string
  icon: React.ReactNode
  latencyMs: number
  confidence: number
}

const MissionTimeline: React.FC<MissionTimelineProps> = ({ pipelineData, loading }) => {
  const data = pipelineData
  const visionMs = data?.vision_inference_time_ms ?? 0
  const totalMs = data?.pipeline_duration_ms ?? 0
  // Distribute remaining pipeline time across downstream stages proportionally.
  const remaining = Math.max(totalMs - visionMs, 0)

  const stages: Stage[] = [
    { id: 'image', label: 'IMAGE', icon: <Image className="w-3.5 h-3.5" />, latencyMs: 0, confidence: 1 },
    { id: 'yolo', label: 'YOLO', icon: <Scan className="w-3.5 h-3.5" />, latencyMs: visionMs, confidence: data ? Math.min(0.95, 0.7 + (data.total_vehicles > 0 ? 0.2 : 0)) : 0 },
    { id: 'traffic', label: 'TRAFFIC INTEL', icon: <BarChart3 className="w-3.5 h-3.5" />, latencyMs: remaining * 0.35, confidence: data ? 1 - data.risk_score * 0.15 : 0 },
    { id: 'reasoning', label: 'AI REASONING', icon: <Brain className="w-3.5 h-3.5" />, latencyMs: remaining * 0.4, confidence: data?.ai_confidence ?? 0 },
    { id: 'simulation', label: 'SIMULATION', icon: <PlayCircle className="w-3.5 h-3.5" />, latencyMs: remaining * 0.25, confidence: data ? 0.9 : 0 },
    { id: 'decision', label: 'COMMANDER', icon: <UserCheck className="w-3.5 h-3.5" />, latencyMs: 0, confidence: data ? 1 : 0 },
  ]

  return (
    <div className="flex items-center h-full gap-1">
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.id}>
          <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                loading
                  ? 'border-mission-border text-gray-600'
                  : data
                  ? 'border-mission-accent text-mission-accent bg-mission-accent/10'
                  : 'border-mission-border text-gray-600'
              }`}
            >
              {loading && idx === 1 ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : data ? (
                stage.icon
              ) : (
                stage.icon
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 truncate">{stage.label}</span>
            {stage.id !== 'image' && stage.id !== 'decision' && (
              <span className="text-[10px] font-mono text-gray-500">
                {data ? `${stage.latencyMs.toFixed(0)}ms` : '--'}
              </span>
            )}
            {stage.id !== 'image' && (
              <span
                className={`text-[10px] font-mono ${
                  data && stage.confidence > 0.7 ? 'text-mission-accent' : 'text-gray-500'
                }`}
              >
                {data ? `${(stage.confidence * 100).toFixed(0)}%` : ''}
              </span>
            )}
          </div>
          {idx < stages.length - 1 && (
            <div className={`h-px flex-shrink-0 w-3 ${data ? 'bg-mission-accent/40' : 'bg-mission-border'}`} />
          )}
        </React.Fragment>
      ))}
      {data && (
        <div className="flex items-center gap-1 ml-2 flex-shrink-0 text-[10px] text-mission-accent">
          <CheckCircle2 className="w-3 h-3" />
          {totalMs.toFixed(0)}ms
        </div>
      )}
    </div>
  )
}

export default MissionTimeline
