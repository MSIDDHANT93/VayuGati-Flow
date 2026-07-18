import React from 'react'

interface MetricRowProps {
  label: string
  value: string
  tone?: 'default' | 'accent' | 'warning' | 'danger' | 'info'
  className?: string
}

const toneClasses: Record<string, string> = {
  default: 'text-gray-300',
  accent: 'text-mission-accent',
  warning: 'text-mission-warning',
  danger: 'text-mission-danger',
  info: 'text-mission-info',
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, tone = 'default', className = '' }) => {
  return (
    <div className={`flex items-center justify-between py-1 text-xs ${className}`}>
      <span className="text-gray-500">{label}</span>
      <span className={`font-mono font-medium ${toneClasses[tone]}`}>{value}</span>
    </div>
  )
}

export default MetricRow
