// API Response Wrapper
export interface APIResponse<T> {
  success: boolean
  timestamp: string
  data: T
  errors: string[] | null
}

// Traffic Analysis Types
export interface TrafficAnalysisRequest {
  intersection: Intersection
  camera: Camera
  vehicle_detections: VehicleDetection[]
  traffic_signal: TrafficSignal | null
  lane_count: number
  lane_length_meters: number
  free_flow_speed_kmh: number
  capacity_vehicles_per_hour: number
}

export interface TrafficAnalysisResult {
  queue_length_meters: number
  vehicle_density_vehicles_per_km: number
  average_speed_kmh: number
  occupancy_rate: number
  congestion_score: number
  level_of_service: string
  risk_score: number
  congestion_explanation: string
  los_explanation: string
  risk_factors: string[]
  analysis_timestamp: string
  total_vehicles_analyzed: number
}

// Vision Analysis Types
export interface VisionAnalysisRequest {
  camera_id: string
  intersection_id: string
  frame_id: string
  image_data: string
  image_format: string
  timestamp: string
}

export interface VisionAnalysisResponse {
  frame_id: string
  camera_id: string
  intersection_id: string
  vehicle_detections: VehicleDetection[]
  total_detections: number
  inference_time_ms: number
  analysis_timestamp: string
}

// Reasoning Types
export interface ReasoningRequest {
  queue_length_meters: number
  vehicle_density_vehicles_per_km: number
  average_speed_kmh: number
  occupancy_rate: number
  congestion_score: number
  level_of_service: string
  risk_score: number
  intersection_id: string
  lane_count: number
  total_vehicles: number
}

export interface ReasoningResponse {
  congestion_explanation: string
  probable_root_causes: string[]
  traffic_recommendations: string[]
  confidence_score: number
  reasoning_timestamp: string
  model_used: string
}

// Domain Models
export interface Intersection {
  intersection_id: string
  name: string
  location_lat: number
  location_lon: number
  intersection_type: string
  status: string
  num_lanes: number
  has_traffic_signal: boolean
  municipality: string
}

export interface Camera {
  camera_id: string
  intersection_id: string
  name: string
  location_lat: number
  location_lon: number
  status: string
  resolution: string
  fps: number
}

export interface VehicleDetection {
  detection_id: string
  frame_id: string
  camera_id: string
  intersection_id: string
  vehicle_type: string
  confidence: number
  confidence_level: string
  bbox_x_min: number
  bbox_y_min: number
  bbox_x_max: number
  bbox_y_max: number
  speed_kmh: number | null
  direction_degrees: number | null
  detection_timestamp: string
}

export interface TrafficSignal {
  signal_id: string
  intersection_id: string
  direction: string
  current_phase: string
  phase_start_time: string
  time_in_phase_seconds: number
  time_until_change_seconds: number
  cycle_time_seconds: number
  green_time_seconds: number
  yellow_time_seconds: number
  red_time_seconds: number
}
