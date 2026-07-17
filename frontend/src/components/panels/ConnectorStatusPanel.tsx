import React from 'react'
import { Plug } from 'lucide-react'
import { CONNECTOR_HEALTH } from '../../data/gisData'

const statusDot = (status: string) => {
  if (status === 'online') return 'bg-mission-accent'
  if (status === 'degraded') return 'bg-mission-warning'
  return 'bg-gray-600'
}

const ConnectorStatusPanel: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Plug className="w-3.5 h-3.5 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">CONNECTOR HEALTH</span>
        </div>
        <span className="text-[10px] text-gray-600">
          {CONNECTOR_HEALTH.filter((c) => c.status === 'online').length}/{CONNECTOR_HEALTH.length} ONLINE
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CONNECTOR_HEALTH.map((c) => (
          <div
            key={c.id}
            title={c.detail}
            className="flex items-center gap-1.5 bg-mission-dark rounded border border-mission-border px-2 py-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(c.status)}`} />
            <span className="text-[10px] text-gray-300 truncate flex-1">{c.name}</span>
            {c.source === 'planned' ? (
              <span className="text-[10px] text-gray-600 flex-shrink-0">PLANNED</span>
            ) : (
              <span className="text-[10px] font-mono text-gray-500 flex-shrink-0">
                {c.latencyMs !== null ? `${c.latencyMs}ms` : '—'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectorStatusPanel
