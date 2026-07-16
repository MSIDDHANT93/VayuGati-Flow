import React from 'react'
import { AlertTriangle, Clock, Server, RefreshCw, Shield, Database, Network } from 'lucide-react'

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

  return (
    <div className="h-14 bg-mission-panel border-b border-mission-border flex items-center justify-between px-4">
      {/* Left - System Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-mission-accent" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-accent">SYSTEM ONLINE</span>
            <span className="text-[10px] text-gray-500">UPTIME: 14d 7h 23m</span>
          </div>
        </div>
        <div className="w-px h-8 bg-mission-border" />
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-mission-info" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-info">NETWORK STABLE</span>
            <span className="text-[10px] text-gray-500">BANDWIDTH: 847 Mbps</span>
          </div>
        </div>
        <div className="w-px h-8 bg-mission-border" />
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-mission-warning" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-warning">DATA FLOW ACTIVE</span>
            <span className="text-[10px] text-gray-500">PIPELINE: 12ms</span>
          </div>
        </div>
      </div>

      {/* Center - Scenario Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-mission-accent" />
          <span className="text-xs text-gray-400">OPERATIONAL MODE:</span>
        </div>
        <select
          value={currentScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={loading}
          className="bg-mission-dark border border-mission-border rounded px-3 py-1.5 text-xs text-gray-300 focus:border-mission-accent focus:outline-none disabled:opacity-50 font-mono"
        >
          {scenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>{scenario.label.toUpperCase()}</option>
          ))}
        </select>
        {loading && (
          <RefreshCw className="w-4 h-4 text-mission-info animate-spin" />
        )}
      </div>

      {/* Right - Time and Alerts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-mission-danger animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-mission-danger">3 ACTIVE ALERTS</span>
            <span className="text-[10px] text-gray-500">PRIORITY: HIGH</span>
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
