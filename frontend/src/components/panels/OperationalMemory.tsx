import React from 'react'
import { Archive, MapPin, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import { getSimilarIncidents } from '../../data/operationalMemory'

interface OperationalMemoryProps {
  pipelineData: PipelineResponse | null
}

const OperationalMemory: React.FC<OperationalMemoryProps> = ({ pipelineData }) => {
  const records = getSimilarIncidents(pipelineData?.scenario)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Archive className="w-3 h-3 text-mission-info" />
          <span className="text-[10px] font-semibold text-gray-500 tracking-wide">
            OPERATIONAL MEMORY — SIMILAR INCIDENTS
          </span>
        </div>
        <span className="text-[10px] text-gray-600">reference archive</span>
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-gray-600">No comparable incidents on record.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 min-h-0">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center gap-2 bg-mission-dark border border-mission-border rounded px-2 py-1"
            >
              <span className="text-[10px] font-mono text-gray-500 flex-shrink-0 w-16">{rec.date}</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0 w-28 truncate">
                <MapPin className="w-2.5 h-2.5 text-mission-info flex-shrink-0" />
                {rec.location}
              </span>
              <span className="text-[10px] text-gray-300 flex-1 truncate" title={rec.decision}>
                {rec.decision}
              </span>
              <span
                className={`flex items-center gap-1 text-[10px] flex-shrink-0 w-44 truncate ${
                  rec.outcomePositive ? 'text-mission-accent' : 'text-mission-warning'
                }`}
                title={rec.outcome}
              >
                {rec.outcomePositive ? (
                  <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-2.5 h-2.5 flex-shrink-0" />
                )}
                {rec.outcome}
              </span>
              <button
                disabled
                aria-label={`Replay incident ${rec.id} (coming soon)`}
                title="Replay (coming soon)"
                className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-mission-border text-gray-500 opacity-50 cursor-not-allowed flex-shrink-0"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                REPLAY
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OperationalMemory
