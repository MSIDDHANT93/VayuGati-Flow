from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import List, Optional
from datetime import datetime
from app.models.intersection import Intersection
from app.models.camera import Camera
from app.models.vehicle_detection import VehicleDetection
from app.models.traffic_signal import TrafficSignal


class LevelOfService(str, Enum):
    """Highway Capacity Manual Level of Service (LOS) categories."""
    LOS_A = "LOS_A"  # Free flow
    LOS_B = "LOS_B"  # Reasonably free flow
    LOS_C = "LOS_C"  # Stable flow
    LOS_D = "LOS_D"  # Approaching unstable flow
    LOS_E = "LOS_E"  # Unstable flow
    LOS_F = "LOS_F"  # Forced flow / breakdown


class TrafficAnalysisRequest(BaseModel):
    """Request model for comprehensive traffic analysis using domain models."""
    
    # Core domain entities
    intersection: Intersection = Field(..., description="Intersection data")
    camera: Camera = Field(..., description="Camera data")
    vehicle_detections: List[VehicleDetection] = Field(..., description="List of vehicle detections")
    traffic_signal: Optional[TrafficSignal] = Field(None, description="Traffic signal state if available")
    
    # Analysis parameters
    lane_count: int = Field(default=4, description="Number of lanes at intersection", ge=1, le=12)
    lane_length_meters: float = Field(default=100.0, description="Length of lane in meters", ge=10, le=1000)
    free_flow_speed_kmh: float = Field(default=60.0, description="Free flow speed in km/h", ge=20, le=120)
    capacity_vehicles_per_hour: int = Field(default=1800, description="Lane capacity in vehicles per hour", ge=500, le=3000)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "intersection": {
                    "intersection_id": "INT-001",
                    "name": "Main Street and 5th Avenue",
                    "location_lat": 40.7128,
                    "location_lon": -74.0060,
                    "intersection_type": "signalized",
                    "status": "active",
                    "num_lanes": 4,
                    "has_traffic_signal": True,
                    "municipality": "New York City"
                },
                "camera": {
                    "camera_id": "CAM-001",
                    "intersection_id": "INT-001",
                    "name": "Main Street Northbound Camera",
                    "location_lat": 40.7129,
                    "location_lon": -74.0061,
                    "status": "online",
                    "resolution": "1080p",
                    "fps": 30
                },
                "vehicle_detections": [
                    {
                        "detection_id": "DET-001",
                        "frame_id": "FRM-001",
                        "camera_id": "CAM-001",
                        "intersection_id": "INT-001",
                        "vehicle_type": "car",
                        "confidence": 0.95,
                        "confidence_level": "high",
                        "bbox_x_min": 0.25,
                        "bbox_y_min": 0.30,
                        "bbox_x_max": 0.45,
                        "bbox_y_max": 0.60,
                        "speed_kmh": 45.0,
                        "direction_degrees": 90.0,
                        "is_stopped": False
                    },
                    {
                        "detection_id": "DET-002",
                        "frame_id": "FRM-001",
                        "camera_id": "CAM-001",
                        "intersection_id": "INT-001",
                        "vehicle_type": "truck",
                        "confidence": 0.90,
                        "confidence_level": "high",
                        "bbox_x_min": 0.50,
                        "bbox_y_min": 0.30,
                        "bbox_x_max": 0.70,
                        "bbox_y_max": 0.60,
                        "speed_kmh": 35.0,
                        "direction_degrees": 90.0,
                        "is_stopped": False
                    }
                ],
                "traffic_signal": None,
                "lane_count": 4,
                "lane_length_meters": 100.0,
                "free_flow_speed_kmh": 60.0,
                "capacity_vehicles_per_hour": 1800
            }
        }
    )


class TrafficAnalysisResult(BaseModel):
    """Result of traffic analysis calculations."""
    
    # Basic metrics
    queue_length_meters: float = Field(..., description="Estimated queue length in meters", ge=0)
    vehicle_density_vehicles_per_km: float = Field(..., description="Vehicle density in vehicles per km", ge=0)
    average_speed_kmh: float = Field(..., description="Average speed in km/h", ge=0)
    occupancy_rate: float = Field(..., description="Lane occupancy rate (0-1)", ge=0, le=1)
    
    # Advanced metrics
    congestion_score: float = Field(..., description="Congestion severity score (0-1, higher is worse)", ge=0, le=1)
    level_of_service: LevelOfService = Field(..., description="Highway Capacity Manual LOS")
    risk_score: float = Field(..., description="Operational risk score (0-1, higher is worse)", ge=0, le=1)
    
    # Explanatory outputs
    congestion_explanation: str = Field(..., description="Human-readable explanation of congestion")
    los_explanation: str = Field(..., description="Explanation of LOS rating")
    risk_factors: List[str] = Field(default_factory=list, description="List of identified risk factors")
    
    # Metadata
    analysis_timestamp: datetime = Field(default_factory=lambda: datetime.now(), description="When analysis was performed")
    total_vehicles_analyzed: int = Field(..., description="Number of vehicles in analysis", ge=0)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "queue_length_meters": 45.5,
                "vehicle_density_vehicles_per_km": 125.0,
                "average_speed_kmh": 28.5,
                "occupancy_rate": 0.72,
                "congestion_score": 0.68,
                "level_of_service": "LOS_D",
                "risk_score": 0.55,
                "congestion_explanation": "Moderate congestion due to high vehicle density and reduced speeds",
                "los_explanation": "Approaching unstable flow conditions with reduced speeds and increased density",
                "risk_factors": ["High density", "Low speed", "Long queue"],
                "analysis_timestamp": "2024-01-01T12:00:00Z",
                "total_vehicles_analyzed": 42
            }
        }
    )
