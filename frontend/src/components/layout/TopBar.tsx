import React from 'react'
import { AlertTriangle, Clock, Server, RefreshCw, Shield, Database, Network, WifiOff } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface TopBarProps {
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  loading: boolean
  error?: string | null
  pipelineData?: PipelineResponse | null
  onRetry?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ currentScenario, onScenarioChange, loading, error, pipelineData, onRetry }) => {
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

  const scenarios = [
    { id: 'morning_rush', label: 'Morning Rush' },
    { id: 'school_zone', label: 'School Zone' },
    { id: 'accident', label: 'Accident' },
    { id: 'illegal_parking', label: 'Illegal Parking' },
    { id: 'emergency_vehicle', label: 'Emergency Vehicle' },
  ]

  const hasAlert = !!pipelineData && pipelineData.risk_score > 0.5
  const pipelineLatencyMs = pipelineData ? pipelineData.pipeline_duration_ms.toFixed(0) : '--'

  return (
    <div className="h-14 bg-mission-panel border-b border-mission-border flex items-center justify-between px-4">
      {/* Left - System Status */}
      <div className="flex items-center gap-6">
        {error ? (
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-mission-danger" />
            <div className="flex flex-col">
              <span className="text-xs font-mono text-mission-danger">CONNECTION LOST</span>
              <span className="text-[10px] text-gray-500 truncate max-w-[220px]">{error}</span>
            </div>
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
            <div className="flex flex-col">
              <span className="text-xs font-mono text-mission-accent">SYSTEM ONLINE</span>
              <span className="text-[10px] text-gray-500">PIPELINE API CONNECTED</span>
            </div>
          </div>
        )}
        <div className="w-px h-8 bg-mission-border" />
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-mission-info" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-info">
              {pipelineData ? pipelineData.intersection_id : 'AWAITING DATA'}
            </span>
            <span className="text-[10px] text-gray-500">
              SCENARIO: {pipelineData ? pipelineData.scenario.replace('_', ' ').toUpperCase() : '--'}
            </span>
          </div>
        </div>
        <div className="w-px h-8 bg-mission-border" />
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-mission-warning" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-warning">
              {loading ? 'PIPELINE RUNNING' : 'PIPELINE IDLE'}
            </span>
            <span className="text-[10px] text-gray-500">LATENCY: {pipelineLatencyMs}ms</span>
          </div>
        </div>
      </div>

      {/* Center - Scenario Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-mission-accent" aria-hidden="true" />
          <label htmlFor="scenario-select" className="text-xs text-gray-400">
            OPERATIONAL MODE:
          </label>
        </div>
        <select
          id="scenario-select"
          value={currentScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={loading}
          aria-label="Select operational scenario"
          className="bg-mission-dark border border-mission-border rounded px-3 py-1.5 text-xs text-gray-300 focus:border-mission-accent focus:outline-none disabled:opacity-50 font-mono"
        >
          {scenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>{scenario.label.toUpperCase()}</option>
          ))}
        </select>
        {loading && (
          <RefreshCw className="w-4 h-4 text-mission-info motion-safe:animate-spin" aria-label="Loading" />
        )}
      </div>

      {/* Right - Time and Alerts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${hasAlert ? 'text-mission-danger motion-safe:animate-pulse' : 'text-gray-600'}`} />
          <div className="flex flex-col">
            <span className={`text-xs font-mono ${hasAlert ? 'text-mission-danger' : 'text-gray-500'}`}>
              {hasAlert ? '1 ACTIVE ALERT' : 'NO ACTIVE ALERTS'}
            </span>
            <span className="text-[10px] text-gray-500">
              {hasAlert ? `PRIORITY: ${pipelineData!.risk_score > 0.75 ? 'CRITICAL' : 'HIGH'}` : 'PRIORITY: NORMAL'}
            </span>
          </div>
        </div>
        <div className="w-px h-8 bg-mission-border" />
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
