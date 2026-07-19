import apiClient from './client'
import { APIResponse } from '../types'

export interface PipelineRequest {
  scenario: string
  intersection_id?: string
  camera_id?: string
  frame_id?: string
  lane_count?: number
  lane_length_meters?: number
  free_flow_speed_kmh?: number
  capacity_vehicles_per_hour?: number
}

export interface PipelineResponse {
  scenario: string
  intersection_id: string
  total_vehicles: number
  vision_detections: number
  vision_inference_time_ms: number
  queue_length_meters: number
  vehicle_density_vehicles_per_km: number
  average_speed_kmh: number
  occupancy_rate: number
  congestion_score: number
  level_of_service: string
  risk_score: number
  congestion_explanation: string
  probable_root_causes: string[]
  traffic_recommendations: string[]
  ai_confidence: number
  pipeline_duration_ms: number
}

export const pipelineApi = {
  runDemo: async (request: PipelineRequest): Promise<APIResponse<PipelineResponse>> => {
    const response = await apiClient.post<APIResponse<PipelineResponse>>('/api/v1/pipeline/demo', request)
    return response.data
  },

  listScenarios: async (): Promise<{ scenarios: string[]; count: number }> => {
    const response = await apiClient.get('/api/v1/pipeline/scenarios')
    return response.data
  },
}
