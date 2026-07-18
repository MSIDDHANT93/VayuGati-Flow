import React from 'react'
import { Info } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'No data available', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full gap-2 text-xs text-gray-500 ${className}`}>
      <Info className="w-5 h-5 text-gray-600" />
      <span>{message}</span>
    </div>
  )
}

export default EmptyState
