import React from 'react'
import { Scan, Car, Truck, Bus, Bike, AlertCircle } from 'lucide-react'
import { VehicleDetection } from '../../types'

interface YoloDetectionsProps {
  detections: VehicleDetection[]
  loading?: boolean
}

const YoloDetections: React.FC<YoloDetectionsProps> = ({ detections, loading }) => {
  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'car':
        return <Car className="w-3 h-3" />
      case 'truck':
        return <Truck className="w-3 h-3" />
      case 'bus':
        return <Bus className="w-3 h-3" />
      case 'motorcycle':
      case 'bike':
        return <Bike className="w-3 h-3" />
      default:
        return <Car className="w-3 h-3" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-mission-accent'
    if (confidence >= 0.6) return 'text-mission-warning'
    return 'text-mission-danger'
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'HIGH'
    if (confidence >= 0.6) return 'MEDIUM'
    return 'LOW'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">YOLO DETECTIONS</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500">Loading detections...</div>
        </div>
      </div>
    )
  }

  if (!detections || detections.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">YOLO DETECTIONS</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-mission-border mx-auto mb-2" />
            <div className="text-xs text-gray-500">No detections</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-mission-info" />
          <span className="text-xs font-semibold text-gray-400">YOLO DETECTIONS</span>
        </div>
        <span className="text-xs font-mono text-mission-accent">
          {detections.length} OBJECTS
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
        {detections.slice(0, 10).map((detection, index) => (
          <div
            key={detection.detection_id || index}
            className="bg-mission-dark rounded border border-mission-border p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={getConfidenceColor(detection.confidence)}>
                  {getVehicleIcon(detection.vehicle_type)}
                </span>
                <span className="text-xs text-gray-300 uppercase">
                  {detection.vehicle_type}
                </span>
              </div>
              <span className={`text-xs font-mono ${getConfidenceColor(detection.confidence)}`}>
                {getConfidenceLevel(detection.confidence)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Conf: {(detection.confidence * 100).toFixed(0)}%</span>
              <span>
                {detection.speed_kmh ? `${detection.speed_kmh.toFixed(1)} km/h` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-gray-600 font-mono mt-1">
              BBOX: [{detection.bbox_x_min.toFixed(0)}, {detection.bbox_y_min.toFixed(0)}, {detection.bbox_x_max.toFixed(0)}, {detection.bbox_y_max.toFixed(0)}]
            </div>
          </div>
        ))}
        {detections.length > 10 && (
          <div className="text-xs text-gray-500 text-center">
            +{detections.length - 10} more detections
          </div>
        )}
      </div>
    </div>
  )
}

export default YoloDetections
