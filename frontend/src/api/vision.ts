import apiClient from './client'
import { APIResponse, VisionAnalysisRequest, VisionAnalysisResponse } from '../types'

export const visionApi = {
  analyzeImage: async (request: VisionAnalysisRequest): Promise<APIResponse<VisionAnalysisResponse>> => {
    const response = await apiClient.post<APIResponse<VisionAnalysisResponse>>('/api/v1/vision/analyze', request)
    return response.data
  },
}
