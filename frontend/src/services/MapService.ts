import { MapLayerId } from '../data/gisData'
import { MapRepository } from '../repositories/MapRepository'

export class MapService {
  constructor(private readonly repository: MapRepository) {}

  getDefaultVisibleLayers(): Set<MapLayerId> {
    return this.repository.getDefaultVisibleLayers()
  }

  toggleLayer(visibleLayers: Set<MapLayerId>, layerId: MapLayerId): Set<MapLayerId> {
    const next = new Set(visibleLayers)
    if (next.has(layerId)) next.delete(layerId)
    else next.add(layerId)
    return next
  }
}
