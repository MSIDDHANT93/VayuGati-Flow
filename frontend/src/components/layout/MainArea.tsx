import React from 'react'
import { Map, Layers, Target, AlertTriangle, Activity, Clock } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'

interface MainAreaProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const MainArea: React.FC<MainAreaProps> = ({ pipelineData, loading }) => {
  const getIntersectionStatus = (data: PipelineResponse | null) => {
    if (!data) return 'unknown'
    if (data.congestion_score > 0.7) return 'critical'
    if (data.congestion_score > 0.4) return 'moderate'
    return 'normal'
  }

  const status = getIntersectionStatus(pipelineData)

  return (
    <div className="flex-1 bg-mission-dark relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #2a2a2a 1px, transparent 1px),
            linear-gradient(to bottom, #2a2a2a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Operational Map Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Central Focus Intersection */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 rounded-full border-4 animate-pulse ${
              status === 'critical' ? 'bg-mission-danger border-mission-danger' :
              status === 'moderate' ? 'bg-mission-warning border-mission-warning' :
              'bg-mission-accent border-mission-accent'
            }`} />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-mission-panel border border-mission-border rounded px-2 py-1">
              <span className="text-xs font-mono text-gray-300">
                {pipelineData?.intersection_id || 'INT-001'}
              </span>
            </div>
          </div>

          {/* Surrounding Intersections */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-mission-accent rounded-full border-2 border-mission-accent" />
          <div className="absolute top-1/3 left-2/3 w-4 h-4 bg-mission-warning rounded-full border-2 border-mission-warning" />
          <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-mission-danger rounded-full border-2 border-mission-danger animate-pulse" />
          <div className="absolute top-3/4 left-3/4 w-4 h-4 bg-mission-accent rounded-full border-2 border-mission-accent" />
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-mission-info rounded-full border-2 border-mission-info" />

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <line x1="50%" y1="50%" x2="33%" y2="25%" stroke="#00ff88" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="66%" y2="33%" stroke="#ffaa00" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="25%" y2="66%" stroke="#ff4444" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#00ff88" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#00aaff" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Top Left - Operational Status */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-mission-panel border border-mission-border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-mission-accent" />
            <span className="text-xs font-semibold text-gray-300">OPERATIONAL VIEW</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">INTERSECTIONS</div>
            <div className="text-gray-300 font-mono">12 ACTIVE</div>
            <div className="text-gray-500">CAMERAS</div>
            <div className="text-gray-300 font-mono">48 ONLINE</div>
            <div className="text-gray-500">ALERTS</div>
            <div className="text-mission-danger font-mono">3 ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Top Right - Layer Controls */}
      <div className="absolute top-4 right-4">
        <div className="bg-mission-panel border border-mission-border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-mission-info" />
            <span className="text-xs font-semibold text-gray-300">LAYERS</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-mission-accent rounded" />
              <span className="text-xs text-gray-300">Traffic Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-mission-warning rounded" />
              <span className="text-xs text-gray-300">Incidents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-mission-info rounded" />
              <span className="text-xs text-gray-300">Camera Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Current Situation */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-mission-panel border border-mission-border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-mission-warning" />
            <span className="text-xs font-semibold text-gray-300">CURRENT SITUATION</span>
          </div>
          {pipelineData ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Queue Length</span>
                <span className="text-gray-300 font-mono">{pipelineData.queue_length_meters.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg Speed</span>
                <span className="text-gray-300 font-mono">{pipelineData.average_speed_kmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
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

      {/* Bottom Right - Legend */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-mission-panel border border-mission-border rounded p-3">
          <div className="text-xs font-semibold text-gray-400 mb-2">STATUS LEGEND</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-mission-accent rounded-full" />
              <span className="text-xs text-gray-300">NORMAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-mission-warning rounded-full" />
              <span className="text-xs text-gray-300">MODERATE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-mission-danger rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">CRITICAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-mission-info rounded-full" />
              <span className="text-xs text-gray-300">OFFLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alert Banner */}
      {pipelineData && pipelineData.risk_score > 0.5 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-mission-danger/20 border border-mission-danger rounded px-4 py-2">
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
