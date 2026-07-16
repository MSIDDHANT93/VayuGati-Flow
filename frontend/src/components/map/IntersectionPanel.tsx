import React from 'react'
import { X, MapPin, Camera, Activity, AlertTriangle, Cpu } from 'lucide-react'
import { MOCK_INTERSECTIONS, MOCK_CAMERAS } from '../../data/gisData'
import { PipelineResponse } from '../../api/pipeline'

interface IntersectionPanelProps {
  intersectionId: string
  pipelineData: PipelineResponse | null
  onClose: () => void
}

const IntersectionPanel: React.FC<IntersectionPanelProps> = ({
  intersectionId,
  pipelineData,
  onClose,
}) => {
  const intersection = MOCK_INTERSECTIONS.find((i) => i.id === intersectionId)
  const camera = MOCK_CAMERAS.find((c) => c.intersectionId === intersectionId)
  const isLive = intersectionId === pipelineData?.intersection_id

  return (
    <div className="bg-mission-panel/95 border border-mission-border rounded p-3 w-64">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-mission-border">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-mission-accent" />
          <span className="text-xs font-semibold text-gray-200">{intersectionId}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-gray-500 mb-2">{intersection?.name || 'Unknown intersection'}</div>

      {isLive ? (
        <div className="space-y-1.5">
          <Row icon={<Activity className="w-3 h-3 text-mission-info" />} label="QUEUE" value={`${pipelineData!.queue_length_meters.toFixed(1)}m`} />
          <Row icon={<Cpu className="w-3 h-3 text-mission-warning" />} label="LOS" value={pipelineData!.level_of_service} valueClass="text-mission-warning" />
          <Row icon={<AlertTriangle className="w-3 h-3 text-mission-danger" />} label="RISK" value={pipelineData!.risk_score.toFixed(2)} valueClass="text-mission-danger" />
          <Row icon={<Activity className="w-3 h-3 text-mission-accent" />} label="VEHICLES" value={`${pipelineData!.total_vehicles}`} />
          <Row icon={<Camera className="w-3 h-3 text-mission-info" />} label="CAMERA" value={camera?.status === 'online' ? 'ONLINE' : 'OFFLINE'} valueClass={camera?.status === 'online' ? 'text-mission-accent' : 'text-mission-danger'} />
          <Row icon={<Cpu className="w-3 h-3 text-gray-400" />} label="SIMULATION" value="READY" valueClass="text-mission-accent" />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Row icon={<Camera className="w-3 h-3 text-mission-info" />} label="CAMERA" value={camera?.status === 'online' ? 'ONLINE' : 'OFFLINE'} valueClass={camera?.status === 'online' ? 'text-mission-accent' : 'text-mission-danger'} />
          <div className="text-[10px] text-gray-500 pt-1">
            No live pipeline data for this node. Select the primary intersection to view real-time metrics.
          </div>
        </div>
      )}
    </div>
  )
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: string; valueClass?: string }> = ({
  icon,
  label,
  value,
  valueClass,
}) => (
  <div className="flex items-center justify-between text-[11px]">
    <div className="flex items-center gap-1.5 text-gray-400">
      {icon}
      {label}
    </div>
    <span className={`font-mono font-semibold ${valueClass || 'text-gray-200'}`}>{value}</span>
  </div>
)

export default IntersectionPanel
