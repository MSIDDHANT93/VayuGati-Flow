import React from 'react'
import { ScrollText } from 'lucide-react'

export interface MissionLogEntry {
  id: string
  timestamp: string
  message: string
  level: 'info' | 'success' | 'warning' | 'danger'
}

interface MissionLogProps {
  entries: MissionLogEntry[]
}

const levelColor: Record<MissionLogEntry['level'], string> = {
  info: 'text-mission-info',
  success: 'text-mission-accent',
  warning: 'text-mission-warning',
  danger: 'text-mission-danger',
}

const MissionLog: React.FC<MissionLogProps> = ({ entries }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-1.5">
        <ScrollText className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400">MISSION LOG</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
        {entries.length === 0 ? (
          <div className="text-[10px] text-gray-600">No events logged this session.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-[10px]">
              <span className="font-mono text-gray-500 flex-shrink-0">{entry.timestamp}</span>
              <span className={levelColor[entry.level]}>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MissionLog
