import { MapLayerId } from '../../data/gisData'
import { MapService } from '../../services/MapService'
import { AppContext } from '../AppContext'

export class MapManager {
  constructor(
    private readonly context: AppContext,
    private readonly service: MapService,
  ) {}

  selectIntersection(intersectionId: string): void {
    this.context.update((state) => ({ ...state, selectedIntersectionId: intersectionId }))
  }

  toggleLayer(layerId: MapLayerId): void {
    this.context.update((state) => ({
      ...state,
      visibleLayers: this.service.toggleLayer(state.visibleLayers, layerId),
    }))
  }
}
