import React from 'react'
import { X, MapPin, Camera, Activity, AlertTriangle, Cpu, Compass, History } from 'lucide-react'
import { MOCK_INTERSECTIONS, MOCK_CAMERAS, MOCK_INCIDENTS } from '../../data/gisData'
import { PipelineResponse } from '../../api/pipeline'
import { buildCoursesOfAction } from '../../lib/decisionIntelligence'
import { getMissionsForIntersection } from '../../data/operationalMemory'

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
  const cameras = MOCK_CAMERAS.filter((c) => c.intersectionId === intersectionId)
  const incidents = MOCK_INCIDENTS.filter((i) => i.intersectionId === intersectionId)
  const missions = getMissionsForIntersection(intersectionId)
  const isLive = intersectionId === pipelineData?.intersection_id
  const topCoa = isLive && pipelineData ? buildCoursesOfAction(pipelineData)[0] : null

  return (
    <div className="bg-mission-panel/95 border border-mission-border rounded p-3 w-64">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-mission-border">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-mission-accent" />
          <span className="text-xs font-semibold text-gray-200">{intersectionId}</span>
        </div>
        <button onClick={onClose} aria-label="Close intersection panel" className="text-gray-500 hover:text-gray-300">
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
          <Row icon={<Cpu className="w-3 h-3 text-gray-400" />} label="SIMULATION" value="READY" valueClass="text-mission-accent" />
        </div>
      ) : (
        <div className="text-[10px] text-gray-500 mb-1">
          No live pipeline data for this node. Select the primary intersection for real-time metrics.
        </div>
      )}

      {/* Connected cameras */}
      <Section icon={<Camera className="w-3 h-3 text-mission-info" />} title="CONNECTED CAMERAS">
        {cameras.length === 0 ? (
          <div className="text-[10px] text-gray-600">No cameras registered.</div>
        ) : (
          cameras.map((cam) => (
            <div key={cam.id} className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-mono">{cam.id}</span>
              <span className={cam.status === 'online' ? 'text-mission-accent' : 'text-mission-danger'}>
                {cam.status.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </Section>

      {/* Active incidents */}
      <Section icon={<AlertTriangle className="w-3 h-3 text-mission-danger" />} title="ACTIVE INCIDENTS">
        {incidents.length === 0 ? (
          <div className="text-[10px] text-gray-600">No active incidents.</div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">{inc.type.toUpperCase()}</span>
              <span className={inc.severity === 'high' ? 'text-mission-danger' : inc.severity === 'medium' ? 'text-mission-warning' : 'text-gray-400'}>
                {inc.severity.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </Section>

      {/* Current course of action */}
      <Section icon={<Compass className="w-3 h-3 text-mission-warning" />} title="CURRENT COA">
        {topCoa ? (
          <div className="text-[10px]">
            <div className="text-gray-300 truncate" title={topCoa.title}>{topCoa.title}</div>
            <div className="text-gray-500 font-mono">
              CONF {(topCoa.confidence * 100).toFixed(0)}% · Q{topCoa.expected.queueDeltaPct.toFixed(0)}%
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-gray-600">No COA generated for this node.</div>
        )}
      </Section>

      {/* Historical missions */}
      <Section icon={<History className="w-3 h-3 text-mission-info" />} title="HISTORICAL MISSIONS">
        {missions.length === 0 ? (
          <div className="text-[10px] text-gray-600">No missions on record.</div>
        ) : (
          missions.map((m) => (
            <div key={m.id} className="text-[10px]">
              <span className="text-gray-500 font-mono">{m.date}</span>{' '}
              <span className="text-gray-400 truncate" title={`${m.decision} — ${m.outcome}`}>
                {m.decision}
              </span>
            </div>
          ))
        )}
      </Section>
    </div>
  )
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="mt-2 pt-2 border-t border-mission-border">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-[10px] font-semibold text-gray-500">{title}</span>
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
)

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
