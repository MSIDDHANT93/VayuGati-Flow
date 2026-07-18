import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  label?: string
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center h-full gap-2 text-xs text-gray-500 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
