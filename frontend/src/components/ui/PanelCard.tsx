import React from 'react'

interface PanelCardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

const PanelCard: React.FC<PanelCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-mission-panel border border-mission-border rounded-lg shadow-sm ${noPadding ? '' : 'p-3'} ${className}`}>
      {children}
    </div>
  )
}

export default PanelCard
