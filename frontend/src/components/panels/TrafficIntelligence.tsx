import React from 'react'
import { Gauge, AlertTriangle, TrendingDown, Activity } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface TrafficIntelligenceProps {
  pipelineData: PipelineResponse | null
}

const TrafficIntelligence: React.FC<TrafficIntelligenceProps> = ({ pipelineData }) => {
  const data = pipelineData

  return (
    <div className="space-y-3">
      {/* Queue Length */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-mission-info" />
            <span className="text-xs text-gray-400">QUEUE LENGTH</span>
          </div>
          <span className="text-lg font-mono font-semibold text-gray-200">
            {data ? `${data.queue_length_meters.toFixed(1)}m` : '...'}
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div 
            className="h-full bg-mission-warning rounded transition-all duration-500" 
            style={{ width: data ? `${Math.min(data.queue_length_meters, 100)}%` : '0%' }} 
          />
        </div>
      </div>

      {/* Vehicle Density */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-mission-accent" />
            <span className="text-xs text-gray-400">DENSITY</span>
          </div>
          <span className="text-lg font-mono font-semibold text-gray-200">
            {data ? `${data.vehicle_density_vehicles_per_km.toFixed(0)}/km` : '...'}
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div 
            className="h-full bg-mission-accent rounded transition-all duration-500" 
            style={{ width: data ? `${Math.min(data.vehicle_density_vehicles_per_km / 2, 100)}%` : '0%' }} 
          />
        </div>
      </div>

      {/* Average Speed */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-mission-info" />
            <span className="text-xs text-gray-400">AVG SPEED</span>
          </div>
          <span className="text-lg font-mono font-semibold text-gray-200">
            {data ? `${data.average_speed_kmh.toFixed(1)} km/h` : '...'}
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div 
            className="h-full bg-mission-info rounded transition-all duration-500" 
            style={{ width: data ? `${Math.min(data.average_speed_kmh / 1.2, 100)}%` : '0%' }} 
          />
        </div>
      </div>

      {/* Level of Service */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-mission-warning" />
            <span className="text-xs text-gray-400">LEVEL OF SERVICE</span>
          </div>
          <span className="text-lg font-mono font-semibold text-mission-warning">
            {data ? data.level_of_service : '...'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {data ? data.level_of_service.replace('LOS_', '').replace('_', ' ').toUpperCase() : '...'}
        </div>
      </div>

      {/* Risk Score */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-mission-danger" />
            <span className="text-xs text-gray-400">RISK SCORE</span>
          </div>
          <span className="text-lg font-mono font-semibold text-mission-danger">
            {data ? data.risk_score.toFixed(2) : '...'}
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div 
            className="h-full bg-mission-danger rounded transition-all duration-500" 
            style={{ width: data ? `${data.risk_score * 100}%` : '0%' }} 
          />
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-mission-dark rounded border border-mission-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-mission-info" />
            <span className="text-xs text-gray-400">OCCUPANCY</span>
          </div>
          <span className="text-lg font-mono font-semibold text-gray-200">
            {data ? `${(data.occupancy_rate * 100).toFixed(0)}%` : '...'}
          </span>
        </div>
        <div className="h-2 bg-mission-panel rounded overflow-hidden">
          <div 
            className="h-full bg-mission-info rounded transition-all duration-500" 
            style={{ width: data ? `${data.occupancy_rate * 100}%` : '0%' }} 
          />
        </div>
      </div>
    </div>
  )
}

export default TrafficIntelligence
