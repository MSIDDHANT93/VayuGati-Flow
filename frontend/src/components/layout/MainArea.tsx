import React, { Suspense, lazy } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import LayerControls from '../map/LayerControls'
import { MapLayerId } from '../../data/gisData'

// Code-split the MapLibre-backed map: it is the single largest dependency in
// the bundle, so defer loading it until MainArea actually mounts.
const OperationalMap = lazy(() => import('../map/OperationalMap'))

interface MainAreaProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error?: string | null
  selectedIntersectionId: string
  visibleLayers: Set<MapLayerId>
  onSelectIntersection: (intersectionId: string) => void
  onToggleLayer: (layerId: MapLayerId) => void
}

const MainArea: React.FC<MainAreaProps> = ({
  pipelineData,
  loading,
  error,
  selectedIntersectionId,
  visibleLayers,
  onSelectIntersection,
  onToggleLayer,
}) => {

  return (
    <main className="relative bg-mission-dark overflow-hidden h-full w-full">
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-mission-dark">
              <span className="text-xs font-mono text-gray-500">Loading operational map...</span>
            </div>
          }
        >
          <OperationalMap
            pipelineData={pipelineData}
            selectedIntersectionId={selectedIntersectionId}
            onSelectIntersection={onSelectIntersection}
            visibleLayers={visibleLayers}
          />
        </Suspense>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <LayerControls visibleLayers={visibleLayers} onToggle={onToggleLayer} />
      </div>

      {pipelineData && pipelineData.risk_score > 0.5 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-mission-danger/15 border border-mission-danger rounded px-3 py-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-mission-danger" />
            <span className="text-[10px] font-semibold text-mission-danger">
              ELEVATED RISK — {pipelineData.intersection_id}
            </span>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-mission-black/40 pointer-events-none z-20">
          <span className="text-xs font-mono text-mission-accent animate-pulse">SYNCING OPERATIONAL DATA...</span>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-mission-black/60 z-20">
          <div className="flex items-center gap-2 bg-mission-panel border border-mission-danger rounded px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-mission-danger" />
            <span className="text-xs font-semibold text-mission-danger">OPERATIONAL FEED UNAVAILABLE — {error}</span>
          </div>
        </div>
      )}
    </main>
  )
}

export default MainArea
