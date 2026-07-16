import React, { useState } from 'react'
import { Target, AlertTriangle, Activity } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import OperationalMap from '../map/OperationalMap'
import LayerControls from '../map/LayerControls'
import IntersectionPanel from '../map/IntersectionPanel'
import { MOCK_INTERSECTIONS, MOCK_CAMERAS, MAP_LAYERS, MapLayerId } from '../../data/gisData'

interface MainAreaProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const defaultLayers = new Set<MapLayerId>(
  MAP_LAYERS.filter((l) => l.defaultOn).map((l) => l.id)
)

const MainArea: React.FC<MainAreaProps> = ({ pipelineData, loading }) => {
  const [selectedIntersectionId, setSelectedIntersectionId] = useState(
    pipelineData?.intersection_id || 'INT-001'
  )
  const [visibleLayers, setVisibleLayers] = useState<Set<MapLayerId>>(defaultLayers)

  const toggleLayer = (id: MapLayerId) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onlineCameras = MOCK_CAMERAS.filter((c) => c.status === 'online').length

  return (
    <div className="flex-1 bg-mission-dark relative overflow-hidden">
      {/* Operational Map */}
      <div className="absolute inset-0">
        <OperationalMap
          pipelineData={pipelineData}
          selectedIntersectionId={selectedIntersectionId}
          onSelectIntersection={setSelectedIntersectionId}
          visibleLayers={visibleLayers}
        />
      </div>

      {/* Top Left - Operational Status */}
      <div className="absolute top-4 left-4 space-y-2 pointer-events-none">
        <div className="bg-mission-panel/95 border border-mission-border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-mission-accent" />
            <span className="text-xs font-semibold text-gray-300">OPERATIONAL VIEW</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">INTERSECTIONS</div>
            <div className="text-gray-300 font-mono">{MOCK_INTERSECTIONS.length} ACTIVE</div>
            <div className="text-gray-500">CAMERAS</div>
            <div className="text-gray-300 font-mono">{onlineCameras} ONLINE</div>
            <div className="text-gray-500">ALERTS</div>
            <div className={`font-mono ${pipelineData && pipelineData.risk_score > 0.5 ? 'text-mission-danger' : 'text-gray-300'}`}>
              {pipelineData && pipelineData.risk_score > 0.5 ? '1 ACTIVE' : '0 ACTIVE'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Right - Layer Controls */}
      <div className="absolute top-4 right-4">
        <LayerControls visibleLayers={visibleLayers} onToggle={toggleLayer} />
      </div>

      {/* Bottom Left - Current Situation */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-mission-panel/95 border border-mission-border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-mission-warning" />
            <span className="text-xs font-semibold text-gray-300">CURRENT SITUATION</span>
          </div>
          {pipelineData ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Queue Length</span>
                <span className="text-gray-300 font-mono">{pipelineData.queue_length_meters.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Avg Speed</span>
                <span className="text-gray-300 font-mono">{pipelineData.average_speed_kmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Risk Score</span>
                <span className={`font-mono ${pipelineData.risk_score > 0.5 ? 'text-mission-danger' : 'text-mission-accent'}`}>
                  {pipelineData.risk_score.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">Loading situation data...</div>
          )}
        </div>
      </div>

      {/* Bottom Right - Intersection Panel (interactive operational object) */}
      <div className="absolute bottom-4 right-4">
        <IntersectionPanel
          intersectionId={selectedIntersectionId}
          pipelineData={pipelineData}
          onClose={() => setSelectedIntersectionId(pipelineData?.intersection_id || 'INT-001')}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-mission-black/40 pointer-events-none">
          <span className="text-xs font-mono text-mission-accent animate-pulse">SYNCING OPERATIONAL DATA...</span>
        </div>
      )}

      {/* Active Alert Banner */}
      {pipelineData && pipelineData.risk_score > 0.5 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-mission-danger/20 border border-mission-danger rounded px-4 py-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-mission-danger" />
            <span className="text-xs font-semibold text-mission-danger">
              ELEVATED RISK DETECTED - INTERSECTION {pipelineData.intersection_id}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainArea
