import React, { useState } from 'react'
import { Play, Pause, RotateCcw, Clock, ChevronLeft, ChevronRight, GitBranch } from 'lucide-react'
import HistoricalTrends from '../panels/HistoricalTrends'
import MissionTimeline from '../panels/MissionTimeline'
import { PipelineResponse } from '../../api/pipeline'

interface BottomPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const BottomPanel: React.FC<BottomPanelProps> = ({ pipelineData, loading }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime] = useState(12) // 12:00 PM

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
    <div className="h-56 bg-mission-panel border-t border-mission-border flex flex-col">
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
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-accent transition-colors">
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-accent transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-mission-warning" />
            ) : (
              <Play className="w-3 h-3 text-mission-accent" />
            )}
          </button>
          <button className="flex items-center gap-1 px-2 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-accent transition-colors">
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
          <div className="w-px h-6 bg-mission-border mx-2" />
          <button className="flex items-center gap-1 px-3 py-1 bg-mission-dark border border-mission-border rounded hover:border-mission-info transition-colors">
            <RotateCcw className="w-3 h-3 text-mission-info" />
            <span className="text-xs text-gray-300">RESET</span>
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

      {/* Scenario Timeline */}
      <div className="h-14 border-b border-mission-border px-4 py-2">
        <div className="flex items-center justify-between h-full">
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

      {/* Historical Trends */}
      <div className="flex-1 p-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Loading temporal data...</div>
          </div>
        ) : (
          <HistoricalTrends />
        )}
      </div>
    </div>
  )
}

export default BottomPanel
