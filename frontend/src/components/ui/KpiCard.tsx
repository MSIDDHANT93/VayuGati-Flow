import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  icon?: LucideIcon
  tone?: 'default' | 'accent' | 'warning' | 'danger' | 'info'
  className?: string
}

const toneClasses: Record<string, string> = {
  default: 'text-gray-200',
  accent: 'text-mission-accent',
  warning: 'text-mission-warning',
  danger: 'text-mission-danger',
  info: 'text-mission-info',
}

const iconToneClasses: Record<string, string> = {
  default: 'text-gray-400',
  accent: 'text-mission-accent',
  warning: 'text-mission-warning',
  danger: 'text-mission-danger',
  info: 'text-mission-info',
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, tone = 'default', className = '' }) => {
  return (
    <div className={`bg-mission-dark border border-mission-border rounded p-3 flex items-center gap-3 ${className}`}>
      {Icon && (
        <div className="p-1.5 rounded bg-mission-panel">
          <Icon className={`w-4 h-4 ${iconToneClasses[tone]}`} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-mono font-semibold truncate ${toneClasses[tone]}`}>{value}</div>
      </div>
    </div>
  )
}

export default KpiCard
