import React from 'react'
import { AlertTriangle, Clock, Server, RefreshCw, WifiOff } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface TopBarProps {
  currentScenario: string
  loading: boolean
  error?: string | null
  pipelineData?: PipelineResponse | null
  onRetry?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ currentScenario, loading, error, pipelineData, onRetry }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  })

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const hasAlert = !!pipelineData && pipelineData.risk_score > 0.5
  const pipelineLatencyMs = pipelineData ? pipelineData.pipeline_duration_ms.toFixed(0) : '--'

  return (
    <div className="h-14 bg-mission-panel border-b border-mission-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="text-base font-semibold tracking-tight text-gray-100">VayuGati <span className="text-mission-accent">Flow</span></div>
        <div className="h-5 w-px bg-mission-border" />
        <div className="text-xs text-gray-400 font-mono uppercase">{currentScenario.replace('_', ' ')}</div>
      </div>

      <div className="flex items-center gap-6">
        {error ? (
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-mission-danger" />
            <span className="text-xs font-mono text-mission-danger">CONNECTION LOST</span>
            <span className="text-[10px] text-gray-500 truncate max-w-[180px]">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={loading}
                aria-label="Retry connecting to backend"
                className="ml-2 flex items-center gap-1 px-2 py-1 bg-mission-dark border border-mission-danger rounded text-[10px] text-mission-danger hover:bg-mission-danger/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'motion-safe:animate-spin' : ''}`} />
                RETRY
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-mission-accent" />
            <span className="text-xs font-mono text-mission-accent">SYSTEM ONLINE</span>
            <span className="text-[10px] text-gray-500">{pipelineData ? `${pipelineLatencyMs}ms` : 'INITIALIZING'}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${hasAlert ? 'text-mission-danger motion-safe:animate-pulse' : 'text-gray-600'}`} />
          <span className={`text-xs font-mono ${hasAlert ? 'text-mission-danger' : 'text-gray-500'}`}>
            {hasAlert ? (pipelineData!.risk_score > 0.75 ? 'CRITICAL' : 'HIGH PRIORITY') : 'NOMINAL'}
          </span>
        </div>

        <div className="h-5 w-px bg-mission-border" />

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-300">{currentTime}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">{currentDate}</span>
        </div>
      </div>
    </div>
  )
}

export default TopBar
