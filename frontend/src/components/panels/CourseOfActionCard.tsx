import React, { useEffect, useRef, useState } from 'react'
import { PlayCircle, Check, X, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import { CourseOfAction, CoAStatus, mapCongestionToLOS } from '../../lib/decisionIntelligence'

interface CourseOfActionCardProps {
  coa: CourseOfAction
  pipelineData: PipelineResponse
  status: CoAStatus
  note: string
  onSimulate: (coaId: string, applied: boolean) => void
  onStatusChange: (coaId: string, status: CoAStatus, note?: string) => void
}

const tagColor = (tag: string) =>
  tag === 'LOW' || tag === 'FAST'
    ? 'text-mission-accent'
    : tag === 'MEDIUM'
    ? 'text-mission-warning'
    : 'text-mission-danger'

const statusStyle: Record<CoAStatus, string> = {
  pending: 'border-mission-border text-gray-400',
  approved: 'border-mission-accent text-mission-accent bg-mission-accent/10',
  rejected: 'border-mission-danger text-mission-danger bg-mission-danger/10',
  modified: 'border-mission-info text-mission-info bg-mission-info/10',
}

const CourseOfActionCard: React.FC<CourseOfActionCardProps> = ({
  coa,
  pipelineData,
  status,
  note,
  onSimulate,
  onStatusChange,
}) => {
  const [applied, setApplied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [draftNote, setDraftNote] = useState(note)
  const rafRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const before = {
    queue: pipelineData.queue_length_meters,
    speed: pipelineData.average_speed_kmh,
    risk: pipelineData.risk_score,
    congestion: pipelineData.congestion_score,
  }
  const after = {
    queue: Math.max(before.queue * (1 + coa.expected.queueDeltaPct / 100), 2),
    speed: before.speed * (1 + coa.expected.speedDeltaPct / 100),
    risk: Math.max(before.risk * (1 + coa.expected.riskDeltaPct / 100), 0),
    congestion: Math.max(before.congestion * (1 + coa.expected.queueDeltaPct / 100), 0),
  }

  const runSimulation = () => {
    setApplied(true)
    setProgress(0)
    onSimulate(coa.id, true)
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const pct = Math.min((now - start) / duration, 1)
      setProgress(pct)
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const lerp = (a: number, b: number) => (applied ? a + (b - a) * progress : a)
  const qNow = lerp(before.queue, after.queue)
  const sNow = lerp(before.speed, after.speed)
  const rNow = lerp(before.risk, after.risk)
  const cNow = lerp(before.congestion, after.congestion)
  const losNow = applied ? mapCongestionToLOS(cNow) : pipelineData.level_of_service

  const submitModify = () => {
    onStatusChange(coa.id, 'modified', draftNote)
    setModifying(false)
  }

  return (
    <div className={`rounded border p-2.5 bg-mission-dark ${statusStyle[status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-200 truncate">{coa.title}</span>
            <span className={`text-[9px] font-mono ${tagColor(coa.costTag)}`}>{coa.costTag}</span>
            <span className={`text-[9px] font-mono ${tagColor(coa.implementationTag)}`}>
              {coa.implementationTag}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{coa.description}</p>
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="text-gray-500 hover:text-gray-300 flex-shrink-0">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          CONFIDENCE
          <span className="font-mono text-mission-accent">{(coa.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          EXPECTED
          <span className="font-mono text-mission-accent">
            Q{coa.expected.queueDeltaPct.toFixed(0)}% / S+{coa.expected.speedDeltaPct.toFixed(0)}% / R{coa.expected.riskDeltaPct.toFixed(0)}%
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2">
          {/* Simulate control */}
          <button
            onClick={runSimulation}
            className="w-full flex items-center justify-center gap-2 bg-mission-panel hover:bg-mission-border border border-mission-border rounded py-1 text-[11px] text-mission-accent font-semibold transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {applied ? 'RE-RUN SIMULATION' : 'SIMULATE'}
          </button>

          {/* Animated metrics */}
          <div className="grid grid-cols-4 gap-1.5">
            <MiniMetric label="QUEUE" value={`${qNow.toFixed(1)}m`} />
            <MiniMetric label="SPEED" value={`${sNow.toFixed(1)}`} />
            <MiniMetric label="LOS" value={losNow.replace('LOS_', '')} accent={applied} />
            <MiniMetric label="RISK" value={rNow.toFixed(2)} />
          </div>

          {/* Evidence / explainability */}
          <div className="bg-mission-panel rounded border border-mission-border p-2">
            <div className="text-[9px] font-semibold text-gray-500 mb-1">EVIDENCE</div>
            <ul className="space-y-0.5">
              {coa.evidence.map((e, i) => (
                <li key={i} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                  <span className="text-mission-info">•</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {/* Commander actions */}
          {!modifying ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStatusChange(coa.id, 'approved')}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded border border-mission-accent text-mission-accent hover:bg-mission-accent/10"
              >
                <Check className="w-3 h-3" /> APPROVE
              </button>
              <button
                onClick={() => onStatusChange(coa.id, 'rejected')}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded border border-mission-danger text-mission-danger hover:bg-mission-danger/10"
              >
                <X className="w-3 h-3" /> REJECT
              </button>
              <button
                onClick={() => setModifying(true)}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded border border-mission-info text-mission-info hover:bg-mission-info/10"
              >
                <Pencil className="w-3 h-3" /> MODIFY
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Modification note for commander log..."
                className="w-full text-[10px] bg-mission-panel border border-mission-border rounded p-1.5 text-gray-300 resize-none"
                rows={2}
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={submitModify}
                  className="flex-1 text-[10px] font-semibold py-1 rounded border border-mission-info text-mission-info hover:bg-mission-info/10"
                >
                  SAVE MODIFICATION
                </button>
                <button
                  onClick={() => setModifying(false)}
                  className="flex-1 text-[10px] font-semibold py-1 rounded border border-mission-border text-gray-400 hover:bg-mission-border"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {status !== 'pending' && note && status === 'modified' && (
            <div className="text-[10px] text-mission-info italic">Note: {note}</div>
          )}
        </div>
      )}
    </div>
  )
}

const MiniMetric: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="bg-mission-panel rounded border border-mission-border px-1.5 py-1 text-center">
    <div className="text-[8px] text-gray-500">{label}</div>
    <div className={`text-[10px] font-mono font-semibold ${accent ? 'text-mission-accent' : 'text-gray-200'}`}>
      {value}
    </div>
  </div>
)

export default CourseOfActionCard
