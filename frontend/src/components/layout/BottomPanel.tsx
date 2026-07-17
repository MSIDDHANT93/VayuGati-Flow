import React from 'react'
import { Clock, ChevronLeft, ChevronRight, GitBranch, AlertCircle } from 'lucide-react'
import HistoricalTrends from '../panels/HistoricalTrends'
import MissionTimeline from '../panels/MissionTimeline'
import OperationalMemory from '../panels/OperationalMemory'
import { PipelineResponse } from '../../api/pipeline'

interface BottomPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error?: string | null
}

const BottomPanel: React.FC<BottomPanelProps> = ({ pipelineData, loading, error }) => {
  const currentTime = 4 // index for '12:00' — matches the illustrative midday peak below

  const timeSlots = [
    { time: '08:00', label: '8AM' },
    { time: '09:00', label: '9AM' },
    { time: '10:00', label: '10AM' },
    { time: '11:00', label: '11AM' },
    { time: '12:00', label: '12PM' },
    { time: '13:00', label: '1PM' },
    { time: '14:00', label: '2PM' },
    { time: '15:00', label: '3PM' },
    { time: '16:00', label: '4PM' },
    { time: '17:00', label: '5PM' },
    { time: '18:00', label: '6PM' },
    { time: '19:00', label: '7PM' },
  ]

  const getCongestionLevel = (index: number) => {
    // Mock congestion levels based on time
    const levels = ['low', 'low', 'moderate', 'high', 'critical', 'high', 'moderate', 'high', 'critical', 'high', 'moderate', 'low']
    return levels[index]
  }

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-mission-danger'
      case 'high': return 'bg-mission-warning'
      case 'moderate': return 'bg-mission-info'
      default: return 'bg-mission-accent'
    }
  }

  return (
    <div className="h-64 bg-mission-panel border-t border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-mission-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-mission-warning" />
            <span className="text-xs font-semibold text-gray-300">TEMPORAL ANALYSIS</span>
          </div>
          {pipelineData && (
            <span className="text-xs text-gray-500">
              SCENARIO: {pipelineData.scenario.replace('_', ' ').toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Timeline navigation (reference pattern - not yet connected to live playback) */}
        <div className="flex items-center gap-2" aria-disabled="true">
          <button
            disabled
            aria-label="Previous time slot (unavailable)"
            className="flex items-center gap-1 px-2 py-1 bg-mission-dark border border-mission-border rounded opacity-40 cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          </button>
          <button
            disabled
            aria-label="Next time slot (unavailable)"
            className="flex items-center gap-1 px-2 py-1 bg-mission-dark border border-mission-border rounded opacity-40 cursor-not-allowed"
          >
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Mission Pipeline Timeline */}
      <div className="h-16 border-b border-mission-border px-4 py-2">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="w-3 h-3 text-mission-accent" />
          <span className="text-[10px] font-semibold text-gray-500">MISSION PIPELINE</span>
        </div>
        <MissionTimeline pipelineData={pipelineData} loading={loading} />
      </div>

      {/* Reference Daily Pattern (illustrative, not scenario-specific) */}
      <div className="h-16 border-b border-mission-border px-4 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold text-gray-600 tracking-wide">REFERENCE DAILY PATTERN</span>
        </div>
        <div className="flex items-center justify-between" style={{ height: 'calc(100% - 16px)' }}>
          {timeSlots.map((slot, index) => (
            <div key={slot.time} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full h-2 rounded ${getCongestionColor(getCongestionLevel(index))} ${
                index === currentTime ? 'ring-1 ring-white' : ''
              }`} />
              <span className={`text-xs font-mono ${
                index === currentTime ? 'text-mission-accent font-semibold' : 'text-gray-500'
              }`}>
                {slot.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Trends + Operational Memory */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-2 overflow-hidden border-r border-mission-border">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-mission-danger">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Temporal data unavailable — {error}</span>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-xs text-gray-500">Loading temporal data...</div>
            </div>
          ) : (
            <HistoricalTrends />
          )}
        </div>
        <div className="w-1/2 p-2 overflow-hidden">
          <OperationalMemory pipelineData={pipelineData} />
        </div>
      </div>
    </div>
  )
}

export default BottomPanel
