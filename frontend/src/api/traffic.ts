import apiClient from './client'
import { APIResponse, TrafficAnalysisRequest, TrafficAnalysisResult } from '../types'

export const trafficApi = {
  analyzeTraffic: async (request: TrafficAnalysisRequest): Promise<APIResponse<TrafficAnalysisResult>> => {
    const response = await apiClient.post<APIResponse<TrafficAnalysisResult>>('/api/v1/traffic/analyze', request)
    return response.data
  },
}
