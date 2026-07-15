import React, { useState } from 'react'
import { Camera, Car, Truck, Activity, AlertCircle } from 'lucide-react'
import CameraFeed from '../panels/CameraFeed'
import ImageUpload from '../panels/ImageUpload'
import YoloDetections from '../panels/YoloDetections'
import { PipelineResponse } from '../../api/pipeline'

interface LeftPanelProps {
  pipelineData: PipelineResponse | null
  loading: boolean
  error: string | null
}

const LeftPanel: React.FC<LeftPanelProps> = ({ pipelineData, loading, error }) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const handleImageUpload = (file: File) => {
    setUploadedImage(file)
  }

  return (
    <div className="w-80 bg-mission-panel border-r border-mission-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-mission-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-300">CAMERA FEED</span>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="text-xs text-mission-accent hover:text-mission-info"
        >
          {showUpload ? 'Hide Upload' : 'Upload Image'}
        </button>
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
            <div className="text-xs text-gray-500">Loading camera feed...</div>
          </div>
        ) : (
          <CameraFeed />
        )}
      </div>

      {/* YOLO Detections */}
      <div className="h-48 border-t border-mission-border p-3">
        <YoloDetections detections={[]} loading={loading} />
      </div>

      {/* Vehicle Counts */}
      <div className="h-32 border-t border-mission-border p-3">
        <div className="text-xs font-semibold text-gray-400 mb-2">DETECTED VEHICLES</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-3 h-3 text-mission-accent" />
              <span className="text-xs text-gray-400">CARS</span>
            </div>
            <div className="text-lg font-mono font-semibold text-gray-200">
              {loading ? '...' : pipelineData?.total_vehicles || 0}
            </div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-3 h-3 text-mission-warning" />
              <span className="text-xs text-gray-400">TRUCKS</span>
            </div>
            <div className="text-lg font-mono font-semibold text-gray-200">
              {loading ? '...' : Math.floor((pipelineData?.total_vehicles || 0) * 0.25)}
            </div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-mission-info" />
              <span className="text-xs text-gray-400">TOTAL</span>
            </div>
            <div className="text-lg font-mono font-semibold text-gray-200">
              {loading ? '...' : pipelineData?.total_vehicles || 0}
            </div>
          </div>
          <div className="bg-mission-dark rounded p-2 border border-mission-border">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-mission-danger" />
              <span className="text-xs text-gray-400">EMERGENCY</span>
            </div>
            <div className="text-lg font-mono font-semibold text-mission-danger">
              {loading ? '...' : (pipelineData?.scenario === 'accident' || pipelineData?.scenario === 'emergency_vehicle' ? 1 : 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftPanel
