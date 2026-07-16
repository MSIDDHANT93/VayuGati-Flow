import React from 'react'
import { Layers, Lock } from 'lucide-react'
import { MAP_LAYERS, MapLayerId } from '../../data/gisData'

interface LayerControlsProps {
  visibleLayers: Set<MapLayerId>
  onToggle: (id: MapLayerId) => void
}

const LayerControls: React.FC<LayerControlsProps> = ({ visibleLayers, onToggle }) => {
  return (
    <div className="bg-mission-panel/95 border border-mission-border rounded p-2 w-40">
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-mission-border">
        <Layers className="w-3 h-3 text-mission-info" />
        <span className="text-[10px] font-semibold text-gray-400">MAP LAYERS</span>
      </div>
      <div className="space-y-1">
        {MAP_LAYERS.map((layer) => {
          const active = visibleLayers.has(layer.id)
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className="w-full flex items-center justify-between text-[10px] px-1.5 py-1 rounded hover:bg-mission-dark transition-colors"
            >
              <span className={active ? 'text-gray-200' : 'text-gray-500'}>
                {layer.label}
              </span>
              <span className="flex items-center gap-1">
                {layer.placeholder && <Lock className="w-2.5 h-2.5 text-gray-600" />}
                <span
                  className={`w-2.5 h-2.5 rounded-sm border ${
                    active
                      ? 'bg-mission-accent border-mission-accent'
                      : 'bg-transparent border-gray-600'
                  }`}
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LayerControls
