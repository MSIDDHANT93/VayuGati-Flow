import React from 'react'
import { Video, Scan } from 'lucide-react'

const CameraFeed: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Camera 1 */}
      <div className="bg-mission-dark rounded border border-mission-border overflow-hidden">
        <div className="h-32 bg-gray-900 relative flex items-center justify-center">
          <Video className="w-8 h-8 text-mission-border" />
          <div className="absolute top-2 left-2 text-xs font-mono text-mission-accent">CAM-001</div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Scan className="w-3 h-3 text-mission-info animate-pulse" />
            <span className="text-xs font-mono text-mission-info">YOLO ACTIVE</span>
          </div>
        </div>
        <div className="p-2 border-t border-mission-border">
          <div className="text-xs text-gray-400">MAIN ST & 5TH AVE</div>
          <div className="text-xs font-mono text-gray-500">INT-001 • NORTHBOUND</div>
        </div>
      </div>

      {/* Camera 2 */}
      <div className="bg-mission-dark rounded border border-mission-border overflow-hidden">
        <div className="h-32 bg-gray-900 relative flex items-center justify-center">
          <Video className="w-8 h-8 text-mission-border" />
          <div className="absolute top-2 left-2 text-xs font-mono text-mission-accent">CAM-002</div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Scan className="w-3 h-3 text-mission-info animate-pulse" />
            <span className="text-xs font-mono text-mission-info">YOLO ACTIVE</span>
          </div>
        </div>
        <div className="p-2 border-t border-mission-border">
          <div className="text-xs text-gray-400">BROADWAY & 42ND</div>
          <div className="text-xs font-mono text-gray-500">INT-002 • EASTBOUND</div>
        </div>
      </div>

      {/* Camera 3 */}
      <div className="bg-mission-dark rounded border border-mission-border overflow-hidden">
        <div className="h-32 bg-gray-900 relative flex items-center justify-center">
          <Video className="w-8 h-8 text-mission-border" />
          <div className="absolute top-2 left-2 text-xs font-mono text-mission-warning">CAM-003</div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Scan className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-mono text-gray-500">OFFLINE</span>
          </div>
        </div>
        <div className="p-2 border-t border-mission-border">
          <div className="text-xs text-gray-400">PARK AVE & 59TH</div>
          <div className="text-xs font-mono text-gray-500">INT-003 • SOUTHBOUND</div>
        </div>
      </div>
    </div>
  )
}

export default CameraFeed
