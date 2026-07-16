import React, { useState } from 'react'
import { Car, Truck, Activity, AlertCircle, Eye } from 'lucide-react'
import CameraFeed from '../panels/CameraFeed'
import ImageUpload from '../panels/ImageUpload'
import YoloDetections from '../panels/YoloDetections'
import ConnectorStatusPanel from '../panels/ConnectorStatusPanel'
import { PipelineResponse } from '../../api/pipeline'

interface LeftPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const LeftPanel: React.FC<LeftPanelProps> = ({ pipelineData, loading, error }) => {
  const [showUpload] = useState(false)

  const handleImageUpload = (_file: File) => {
    // Image is handled by ImageUpload component internally; hook reserved for future wiring.
  }

  const getSituationStatus = (data: PipelineResponse | null) => {
    if (!data) return 'unknown'
    if (data.risk_score > 0.6) return 'critical'
    if (data.risk_score > 0.3) return 'elevated'
    return 'normal'
  }

  const situationStatus = getSituationStatus(pipelineData)

  return (
    <div className="w-96 bg-mission-panel border-r border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-mission-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-300">SITUATION AWARENESS</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
          situationStatus === 'critical' ? 'bg-mission-danger/20 text-mission-danger' :
          situationStatus === 'elevated' ? 'bg-mission-warning/20 text-mission-warning' :
          'bg-mission-accent/20 text-mission-accent'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            situationStatus === 'critical' ? 'bg-mission-danger animate-pulse' :
            situationStatus === 'elevated' ? 'bg-mission-warning' :
            'bg-mission-accent'
          }`} />
          {situationStatus.toUpperCase()}
        </div>
      </div>

      {/* Camera Feed / Image Upload */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-mission-danger mx-auto mb-2" />
              <div className="text-xs text-mission-danger">{error}</div>
            </div>
          </div>
        ) : showUpload ? (
          <ImageUpload onImageUpload={handleImageUpload} loading={loading} />
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Acquiring sensor data...</div>
          </div>
        ) : (
          <CameraFeed />
        )}
      </div>

      {/* Connector Status - plug-and-play platform extensibility */}
      <div className="h-28 border-t border-mission-border p-3 overflow-y-auto scrollbar-thin">
        <ConnectorStatusPanel />
      </div>

      {/* YOLO Detections */}
      <div className="h-40 border-t border-mission-border p-3">
        <YoloDetections detections={[]} loading={loading} />
      </div>

      {/* Vehicle Counts */}
      <div className="h-28 border-t border-mission-border p-3">
        <div className="text-xs font-semibold text-gray-400 mb-2">DETECTED ASSETS</div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-3 h-3 text-mission-accent" />
            </div>
            <div className="text-sm font-mono font-semibold text-gray-200 text-center">
              {loading ? '...' : pipelineData?.total_vehicles || 0}
            </div>
            <div className="text-[9px] text-gray-500 text-center">CARS</div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center justify-center mb-1">
              <Truck className="w-3 h-3 text-mission-warning" />
            </div>
            <div className="text-sm font-mono font-semibold text-gray-200 text-center">
              {loading ? '...' : Math.floor((pipelineData?.total_vehicles || 0) * 0.25)}
            </div>
            <div className="text-[9px] text-gray-500 text-center">TRUCKS</div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-3 h-3 text-mission-info" />
            </div>
            <div className="text-sm font-mono font-semibold text-gray-200 text-center">
              {loading ? '...' : pipelineData?.total_vehicles || 0}
            </div>
            <div className="text-[9px] text-gray-500 text-center">TOTAL</div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-3 h-3 text-mission-danger" />
            </div>
            <div className="text-sm font-mono font-semibold text-mission-danger text-center">
              {loading ? '...' : (pipelineData?.scenario === 'accident' || pipelineData?.scenario === 'emergency_vehicle' ? 1 : 0)}
            </div>
            <div className="text-[9px] text-gray-500 text-center">EMERG</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftPanel
