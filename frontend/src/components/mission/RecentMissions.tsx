import React from 'react'
import { ScrollText } from 'lucide-react'
import { MissionLogEntry } from '../panels/MissionLog'
import PanelCard from '../ui/PanelCard'
import SectionHeader from '../ui/SectionHeader'
import EmptyState from '../ui/EmptyState'

interface RecentMissionsProps {
  entries: MissionLogEntry[]
  className?: string
}

const levelColor: Record<MissionLogEntry['level'], string> = {
  info: 'text-mission-info',
  success: 'text-mission-accent',
  warning: 'text-mission-warning',
  danger: 'text-mission-danger',
}

const RecentMissions: React.FC<RecentMissionsProps> = ({ entries, className = '' }) => {
  return (
    <PanelCard className={`h-full flex flex-col ${className}`}>
      <SectionHeader title="Recent Missions" icon={ScrollText} />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin -mr-1 pr-1">
        {entries.length === 0 ? (
          <EmptyState message="No recent mission events" className="h-24" />
        ) : (
          <div className="space-y-1.5">
            {entries.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-[10px]">
                <span className="font-mono text-gray-500 flex-shrink-0">{entry.timestamp}</span>
                <span className={levelColor[entry.level]}>{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelCard>
  )
}

export default RecentMissions
