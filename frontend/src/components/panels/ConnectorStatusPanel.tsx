import React from 'react'
import { Plug } from 'lucide-react'
import { CONNECTOR_STATUSES } from '../../data/gisData'

const statusDot = (status: string) => {
  if (status === 'online') return 'bg-mission-accent'
  if (status === 'degraded') return 'bg-mission-warning'
  return 'bg-gray-600'
}

const ConnectorStatusPanel: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Plug className="w-3.5 h-3.5 text-mission-info" />
        <span className="text-xs font-semibold text-gray-400">CONNECTOR STATUS</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CONNECTOR_STATUSES.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-1.5 bg-mission-dark rounded border border-mission-border px-2 py-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(c.status)}`} />
            <span className="text-[10px] text-gray-300 truncate">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectorStatusPanel
