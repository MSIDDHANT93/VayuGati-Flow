import { MAP_LAYERS, MapLayerId } from '../data/gisData'

export class MapRepository {
  getDefaultVisibleLayers(): Set<MapLayerId> {
    return new Set(MAP_LAYERS.filter((layer) => layer.defaultOn).map((layer) => layer.id))
  }
}
