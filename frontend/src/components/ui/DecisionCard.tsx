import React from 'react'
import { Play, Check, FileText } from 'lucide-react'
import { CourseOfAction } from '../../lib/decisionIntelligence'
import ActionButton from './ActionButton'
import PanelCard from './PanelCard'
import SectionHeader from './SectionHeader'

interface DecisionCardProps {
  coa: CourseOfAction | null
  loading?: boolean
  onSimulate?: () => void
  onApprove?: () => void
  onViewEvidence?: () => void
  className?: string
}

const tagTone = (tag: string): 'healthy' | 'warning' | 'danger' => {
  if (tag === 'LOW' || tag === 'FAST') return 'healthy'
  if (tag === 'MEDIUM') return 'warning'
  return 'danger'
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  coa,
  loading = false,
  onSimulate,
  onApprove,
  onViewEvidence,
  className = '',
}) => {
  if (loading || !coa) {
    return (
      <PanelCard className={`h-full flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-500">Generating recommendation...</span>
      </PanelCard>
    )
  }

  const impact = coa.expected

  return (
    <PanelCard className={`flex flex-col gap-3 ${className}`}>
      <SectionHeader title="Recommended Action" icon={FileText} />

      <div>
        <div className="text-sm font-semibold text-gray-100 leading-snug">{coa.title}</div>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-3">{coa.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-mission-dark border border-mission-border rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
          <div className="text-sm font-mono font-semibold text-mission-accent">{(coa.confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-mission-dark border border-mission-border rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase">Risk</div>
          <div className={`text-sm font-mono font-semibold ${tagTone(coa.costTag) === 'healthy' ? 'text-mission-accent' : 'text-mission-warning'}`}>{coa.costTag}</div>
        </div>
      </div>

      <div className="bg-mission-dark border border-mission-border rounded p-2">
        <div className="text-[10px] text-gray-500 uppercase mb-1.5">Expected Impact</div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-xs font-mono font-semibold text-mission-accent">{impact.queueDeltaPct.toFixed(0)}%</div>
            <div className="text-[9px] text-gray-500">Queue</div>
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-mission-accent">+{impact.speedDeltaPct.toFixed(0)}%</div>
            <div className="text-[9px] text-gray-500">Speed</div>
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-mission-accent">{impact.riskDeltaPct.toFixed(0)}%</div>
            <div className="text-[9px] text-gray-500">Risk</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <ActionButton variant="outline" size="sm" onClick={onSimulate} className="flex-1">
          <Play className="w-3 h-3" /> Simulate
        </ActionButton>
        <ActionButton variant="primary" size="sm" onClick={onApprove} className="flex-1">
          <Check className="w-3 h-3" /> Approve
        </ActionButton>
        <ActionButton variant="ghost" size="sm" onClick={onViewEvidence} className="flex-1">
          Evidence
        </ActionButton>
      </div>
    </PanelCard>
  )
}

export default DecisionCard
