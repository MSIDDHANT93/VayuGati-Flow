import React from 'react'
import { Target, Activity, Wifi, Cpu, Brain, Zap, AlertTriangle } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import PanelCard from '../ui/PanelCard'
import SectionHeader from '../ui/SectionHeader'
import StatusBadge from '../ui/StatusBadge'
import KpiCard from '../ui/KpiCard'

interface MissionStatusProps {
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const scenarios = [
  { id: 'morning_rush', label: 'Morning Rush' },
  { id: 'school_zone', label: 'School Zone' },
  { id: 'accident', label: 'Accident' },
  { id: 'illegal_parking', label: 'Illegal Parking' },
  { id: 'emergency_vehicle', label: 'Emergency Vehicle' },
]

const MissionStatus: React.FC<MissionStatusProps> = ({
  currentScenario,
  onScenarioChange,
  pipelineData,
  loading,
  error,
}) => {
  const connectionTone = error ? 'danger' : 'healthy'
  const pipelineTone = loading ? 'warning' : pipelineData ? 'healthy' : 'neutral'
  const visionTone = pipelineData ? 'healthy' : 'neutral'
  const aiTone = pipelineData && pipelineData.ai_confidence > 0 ? 'healthy' : 'neutral'

  const hasAlert = pipelineData && pipelineData.risk_score > 0.5

  return (
    <div className="space-y-3">
      {/* Scenario control */}
      <PanelCard className="space-y-2">
        <SectionHeader title="Mission" icon={Target} />
        <select
          id="scenario-select"
          value={currentScenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={loading}
          aria-label="Select operational scenario"
          className="w-full bg-mission-dark border border-mission-border rounded px-2.5 py-1.5 text-xs text-gray-300 focus:border-mission-accent focus:outline-none disabled:opacity-50 font-mono"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label.toUpperCase()}
            </option>
          ))}
        </select>
        {hasAlert && (
          <div className="flex items-center gap-2 text-[10px] text-mission-danger">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-medium">ELEVATED RISK DETECTED</span>
          </div>
        )}
      </PanelCard>

      {/* System status */}
      <PanelCard className="space-y-2">
        <SectionHeader title="System Status" icon={Cpu} />
        <div className="grid grid-cols-2 gap-2">
          <StatusBadge label="Connection" tone={connectionTone} pulse={!!error} />
          <StatusBadge label="Pipeline" tone={pipelineTone} />
          <StatusBadge label="Vision" tone={visionTone} />
          <StatusBadge label="AI" tone={aiTone} />
        </div>
        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          LATENCY {pipelineData ? `${pipelineData.pipeline_duration_ms.toFixed(0)}ms` : '--'}
        </div>
      </PanelCard>

      {/* Live metrics */}
      <PanelCard className="space-y-2">
        <SectionHeader title="Live Metrics" icon={Activity} />
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            label="Vehicles"
            value={pipelineData ? `${pipelineData.total_vehicles}` : '--'}
            icon={Wifi}
            tone="info"
          />
          <KpiCard
            label="Queue"
            value={pipelineData ? `${pipelineData.queue_length_meters.toFixed(1)}m` : '--'}
            icon={Activity}
            tone={pipelineData && pipelineData.queue_length_meters > 40 ? 'warning' : 'default'}
          />
          <KpiCard
            label="Speed"
            value={pipelineData ? `${pipelineData.average_speed_kmh.toFixed(1)} km/h` : '--'}
            icon={Cpu}
            tone="info"
          />
          <KpiCard
            label="Risk"
            value={pipelineData ? `${pipelineData.risk_score.toFixed(2)}` : '--'}
            icon={Brain}
            tone={pipelineData && pipelineData.risk_score > 0.5 ? 'danger' : 'accent'}
          />
        </div>
      </PanelCard>
    </div>
  )
}

export default MissionStatus
