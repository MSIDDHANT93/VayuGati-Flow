import React, { useMemo } from 'react'
import { buildCoursesOfAction, CourseOfAction } from '../../lib/decisionIntelligence'
import { PipelineResponse } from '../../api/pipeline'
import DecisionCard from '../ui/DecisionCard'

interface DecisionSupportProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  onSimulate: (title: string) => void
  onApprove: (title: string) => void
  onViewEvidence: (title: string) => void
}

const DecisionSupport: React.FC<DecisionSupportProps> = ({
  pipelineData,
  loading,
  onSimulate,
  onApprove,
  onViewEvidence,
}) => {
  const topCoa: CourseOfAction | null = useMemo(() => {
    if (!pipelineData) return null
    const coas = buildCoursesOfAction(pipelineData)
    return coas[0] || null
  }, [pipelineData])

  const handleSimulate = () => {
    if (topCoa) onSimulate(topCoa.title)
  }

  const handleApprove = () => {
    if (topCoa) onApprove(topCoa.title)
  }

  const handleViewEvidence = () => {
    if (topCoa) onViewEvidence(topCoa.title)
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
