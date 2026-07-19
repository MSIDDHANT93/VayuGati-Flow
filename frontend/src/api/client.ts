import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.message || 'An unexpected network error occurred'
    const status = error.response?.status
    const detail = status
      ? `Request failed with status ${status}: ${message}`
      : message
    // Attach the original error as a property for downstream debugging
    const enrichedError = new Error(detail)
    ;(enrichedError as AxiosError & { originalError?: AxiosError }).originalError = error
    return Promise.reject(enrichedError)
  }
)

export default apiClient
