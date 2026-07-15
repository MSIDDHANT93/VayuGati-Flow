import React from 'react'
import { Activity, AlertTriangle, Clock, MapPin, Server, RefreshCw } from 'lucide-react'

interface TopBarProps {
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  loading: boolean
}

const TopBar: React.FC<TopBarProps> = ({ currentScenario, onScenarioChange, loading }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  })

  const scenarios = [
    { id: 'morning_rush', label: 'Morning Rush' },
    { id: 'school_zone', label: 'School Zone' },
    { id: 'accident', label: 'Accident' },
    { id: 'illegal_parking', label: 'Illegal Parking' },
    { id: 'emergency_vehicle', label: 'Emergency Vehicle' },
  ]

  return (
    <div className="h-12 bg-mission-panel border-b border-mission-border flex items-center justify-between px-4">
      {/* Left - System Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-mission-accent" />
          <span className="text-xs font-mono text-mission-accent">SYSTEM ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-mono text-gray-400">LATENCY: 12ms</span>
        </div>
      </div>

      {/* Center - Scenario Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">SCENARIO:</span>
        <select
          value={currentScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={loading}
          className="bg-mission-dark border border-mission-border rounded px-3 py-1 text-xs text-gray-300 focus:border-mission-accent focus:outline-none disabled:opacity-50"
        >
          {scenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>{scenario.label}</option>
          ))}
        </select>
        {loading && (
          <RefreshCw className="w-4 h-4 text-mission-info animate-spin" />
        )}
      </div>

      {/* Right - Time and Alerts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-mission-danger" />
          <span className="text-xs font-mono text-mission-danger">3 ACTIVE ALERTS</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-mono text-gray-300">{currentTime}</span>
        </div>
      </div>
    </div>
  )
}

export default TopBar
