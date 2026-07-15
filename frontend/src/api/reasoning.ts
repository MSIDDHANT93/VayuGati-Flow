import apiClient from './client'
import { APIResponse, ReasoningRequest, ReasoningResponse } from '../types'

export const reasoningApi = {
  analyzeReasoning: async (request: ReasoningRequest): Promise<APIResponse<ReasoningResponse>> => {
    const response = await apiClient.post<APIResponse<ReasoningResponse>>('/api/v1/reasoning/analyze', request)
    return response.data
  },
}
