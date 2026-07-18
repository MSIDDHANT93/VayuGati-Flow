import React from 'react'
import { Image, Scan, BarChart3, Brain, PlayCircle, UserCheck, Loader2 } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface PipelineStage {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
  completed?: boolean
}

interface MissionPipelineProps {
  activeStage?: number
  loading?: boolean
  className?: string
}

const STAGES: PipelineStage[] = [
  { id: 'image', label: 'IMAGE', icon: Image },
  { id: 'yolo', label: 'YOLO', icon: Scan },
  { id: 'traffic', label: 'TRAFFIC INTELLIGENCE', icon: BarChart3 },
  { id: 'reasoning', label: 'AI REASONING', icon: Brain },
  { id: 'simulation', label: 'SIMULATION', icon: PlayCircle },
  { id: 'commander', label: 'COMMANDER', icon: UserCheck },
]

const MissionPipeline: React.FC<MissionPipelineProps> = ({ activeStage = -1, loading = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {STAGES.map((stage, index) => {
        const isActive = loading ? index === 1 : activeStage === index
        const isCompleted = !loading && activeStage > index
        const Icon = stage.icon
        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                  isActive
                    ? 'border-mission-accent text-mission-accent bg-mission-accent/10 shadow-[0_0_10px_rgba(0,255,136,0.25)]'
                    : isCompleted
                    ? 'border-mission-accent/60 text-mission-accent/80 bg-mission-accent/5'
                    : 'border-mission-border text-gray-600 bg-mission-dark'
                }`}
              >
                {loading && index === 1 ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[9px] mt-1.5 truncate max-w-full ${
                  isActive ? 'text-mission-accent font-medium' : isCompleted ? 'text-mission-accent/80' : 'text-gray-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <div
                className={`h-px flex-1 min-w-[8px] mx-1 ${
                  isCompleted ? 'bg-mission-accent/40' : 'bg-mission-border'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default MissionPipeline
