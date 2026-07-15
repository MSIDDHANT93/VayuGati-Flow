import React from 'react'
import { Map } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface MainAreaProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const MainArea: React.FC<MainAreaProps> = ({ pipelineData, loading }) => {
  return (
    <div className="flex-1 bg-mission-dark relative overflow-hidden">
      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Map className="w-16 h-16 text-mission-border mx-auto mb-4" />
          <div className="text-sm text-gray-500 font-mono">INTERACTIVE CITY MAP</div>
          <div className="text-xs text-gray-600 mt-1">
            {loading ? 'Loading intersection data...' : `${pipelineData?.intersection_id || 'INT-001'} ACTIVE`}
          </div>
        </div>
      </div>

      {/* Intersection Markers (Mock) */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-mission-accent rounded-full animate-pulse" />
      <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-mission-warning rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-mission-danger rounded-full animate-pulse" />
      <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-mission-accent rounded-full animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-mission-info rounded-full animate-pulse" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-mission-panel border border-mission-border rounded p-3">
        <div className="text-xs font-semibold text-gray-400 mb-2">INTERSECTION STATUS</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-accent rounded-full" />
            <span className="text-xs text-gray-300">FREE FLOW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-warning rounded-full" />
            <span className="text-xs text-gray-300">MODERATE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-danger rounded-full" />
            <span className="text-xs text-gray-300">CONGESTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mission-info rounded-full" />
            <span className="text-xs text-gray-300">OFFLINE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainArea
