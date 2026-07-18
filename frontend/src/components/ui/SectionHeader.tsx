import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, action, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-mission-accent" />}
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      {action && <div className="flex items-center gap-1">{action}</div>}
    </div>
  )
}

export default SectionHeader
