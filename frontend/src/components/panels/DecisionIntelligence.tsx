import React, { useEffect, useMemo, useState } from 'react'
import { Compass } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import {
  buildCoursesOfAction,
  computeDecisionScore,
  CoAStatus,
} from '../../lib/decisionIntelligence'
import CourseOfActionCard from './CourseOfActionCard'
import DecisionScore from './DecisionScore'
import MissionLog, { MissionLogEntry } from './MissionLog'

interface DecisionIntelligenceProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false })

const DecisionIntelligence: React.FC<DecisionIntelligenceProps> = ({ pipelineData, loading }) => {
  const [statuses, setStatuses] = useState<Record<string, CoAStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [log, setLog] = useState<MissionLogEntry[]>([])

  const coas = useMemo(() => (pipelineData ? buildCoursesOfAction(pipelineData) : []), [pipelineData])

  // Reset decision-support state when the underlying intersection/scenario changes.
  useEffect(() => {
    setStatuses({})
    setNotes({})
    setFocusedId(null)
  }, [pipelineData?.intersection_id, pipelineData?.scenario])

  const appendLog = (message: string, level: MissionLogEntry['level'] = 'info') => {
    setLog((prev) => [{ id: `${Date.now()}-${Math.random()}`, timestamp: timestamp(), message, level }, ...prev].slice(0, 50))
  }

  const handleSimulate = (coaId: string) => {
    const coa = coas.find((c) => c.id === coaId)
    if (!coa) return
    setFocusedId(coaId)
    appendLog(
      `SIMULATION RUN — ${coa.title} — Queue ${coa.expected.queueDeltaPct.toFixed(0)}% / Speed +${coa.expected.speedDeltaPct.toFixed(0)}% / Risk ${coa.expected.riskDeltaPct.toFixed(0)}%`,
      'info'
    )
  }

  const handleStatusChange = (coaId: string, status: CoAStatus, note?: string) => {
    const coa = coas.find((c) => c.id === coaId)
    setStatuses((prev) => ({ ...prev, [coaId]: status }))
    if (note !== undefined) setNotes((prev) => ({ ...prev, [coaId]: note }))
    if (status === 'approved') {
      setFocusedId(coaId)
      appendLog(`COA APPROVED — ${coa?.title}`, 'success')
    } else if (status === 'rejected') {
      appendLog(`COA REJECTED — ${coa?.title}`, 'danger')
    } else if (status === 'modified') {
      appendLog(`COA MODIFIED — ${coa?.title}${note ? ` — note: ${note}` : ''}`, 'warning')
    }
  }

  const decisionScore = computeDecisionScore(pipelineData, coas, focusedId)
  const focusedTitle = focusedId ? coas.find((c) => c.id === focusedId)?.title || null : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs text-gray-500">Generating courses of action...</div>
      </div>
    )
  }

  if (!pipelineData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs text-gray-500">No pipeline data available.</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-mission-warning" />
        <span className="text-[10px] font-semibold text-gray-400">AI COURSES OF ACTION</span>
      </div>

      <DecisionScore score={decisionScore} focusedTitle={focusedTitle} />

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 min-h-0">
        {coas.map((coa) => (
          <CourseOfActionCard
            key={coa.id}
            coa={coa}
            pipelineData={pipelineData}
            status={statuses[coa.id] || 'pending'}
            note={notes[coa.id] || ''}
            onSimulate={handleSimulate}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <div className="h-24 border-t border-mission-border pt-2 flex-shrink-0">
        <MissionLog entries={log} />
      </div>
    </div>
  )
}

export default DecisionIntelligence
