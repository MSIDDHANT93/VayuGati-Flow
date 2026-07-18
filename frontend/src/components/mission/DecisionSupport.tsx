import React, { useMemo } from 'react'
import { buildCoursesOfAction, CourseOfAction } from '../../lib/decisionIntelligence'
import { PipelineResponse } from '../../api/pipeline'
import { MissionLogEntry } from '../panels/MissionLog'
import DecisionCard from '../ui/DecisionCard'

interface DecisionSupportProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  onLog?: (entry: MissionLogEntry) => void
}

const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false })

const DecisionSupport: React.FC<DecisionSupportProps> = ({ pipelineData, loading, onLog }) => {
  const topCoa: CourseOfAction | null = useMemo(() => {
    if (!pipelineData) return null
    const coas = buildCoursesOfAction(pipelineData)
    return coas[0] || null
  }, [pipelineData])

  const handleSimulate = () => {
    if (onLog && topCoa) {
      onLog({
        id: `${Date.now()}-sim`,
        timestamp: timestamp(),
        message: `SIMULATED — ${topCoa.title}`,
        level: 'info',
      })
    }
  }

  const handleApprove = () => {
    if (onLog && topCoa) {
      onLog({
        id: `${Date.now()}-app`,
        timestamp: timestamp(),
        message: `APPROVED — ${topCoa.title}`,
        level: 'success',
      })
    }
  }

  const handleViewEvidence = () => {
    // Placeholder — the expanded DecisionCard already surfaces evidence.
    if (onLog && topCoa) {
      onLog({
        id: `${Date.now()}-ev`,
        timestamp: timestamp(),
        message: `EVIDENCE REVIEW — ${topCoa.title}`,
        level: 'info',
      })
    }
  }

  return (
    <DecisionCard
      coa={topCoa}
      loading={loading}
      onSimulate={handleSimulate}
      onApprove={handleApprove}
      onViewEvidence={handleViewEvidence}
      className="h-full"
    />
  )
}

export default DecisionSupport
