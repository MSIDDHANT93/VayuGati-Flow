import React from 'react'

type StatusTone = 'healthy' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  pulse?: boolean
  className?: string
}

const toneMap: Record<StatusTone, string> = {
  healthy: 'bg-mission-accent/10 text-mission-accent border-mission-accent/30',
  warning: 'bg-mission-warning/10 text-mission-warning border-mission-warning/30',
  danger: 'bg-mission-danger/10 text-mission-danger border-mission-danger/30',
  info: 'bg-mission-info/10 text-mission-info border-mission-info/30',
  neutral: 'bg-mission-dark text-gray-400 border-mission-border',
}

const dotMap: Record<StatusTone, string> = {
  healthy: 'bg-mission-accent',
  warning: 'bg-mission-warning',
  danger: 'bg-mission-danger',
  info: 'bg-mission-info',
  neutral: 'bg-gray-500',
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'neutral', pulse = false, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${toneMap[tone]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[tone]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </div>
  )
}

export default StatusBadge
