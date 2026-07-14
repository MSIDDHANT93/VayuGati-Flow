from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime, UTC


class CongestionLevel(str, Enum):
    """Traffic congestion severity levels."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class VehicleType(str, Enum):
    """Vehicle classification types."""
    CAR = "car"
    TRUCK = "truck"
    BUS = "bus"
    MOTORCYCLE = "motorcycle"
    BICYCLE = "bicycle"
    EMERGENCY = "emergency"


class TrafficAnalysisRequest(BaseModel):
    """Request model for traffic analysis."""
    
    intersection_id: str = Field(..., description="Unique identifier for the intersection")
    camera_id: Optional[str] = Field(None, description="Camera identifier if available")
    timestamp: Optional[datetime] = Field(None, description="Analysis timestamp")
    analysis_duration_seconds: int = Field(default=60, ge=1, le=3600, description="Duration of traffic analysis window")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "intersection_id": "INT-001",
                "camera_id": "CAM-001",
                "analysis_duration_seconds": 60
            }
        }
    )


class VehicleCount(BaseModel):
    """Vehicle count by type."""
    vehicle_type: VehicleType
    count: int = Field(..., ge=0)


class TrafficMetrics(BaseModel):
    """Core traffic metrics."""
    total_vehicles: int = Field(..., ge=0, description="Total vehicle count")
    vehicle_counts: list[VehicleCount] = Field(default_factory=list, description="Breakdown by vehicle type")
    average_speed_kmh: float = Field(..., ge=0, description="Average speed in km/h")
    queue_length_meters: float = Field(..., ge=0, description="Average queue length in meters")
    density_vehicles_per_km: float = Field(..., ge=0, description="Traffic density")
    occupancy_rate: float = Field(..., ge=0, le=1, description="Lane occupancy rate (0-1)")


class SignalState(BaseModel):
    """Traffic signal state information."""
    phase: str = Field(..., description="Current signal phase")
    time_until_change_seconds: int = Field(..., ge=0, description="Time until signal changes")
    cycle_time_seconds: int = Field(..., ge=0, description="Total signal cycle time")


class TrafficAnalysisResponse(BaseModel):
    """Response model for traffic analysis."""
    
    intersection_id: str
    analysis_timestamp: datetime
    congestion_level: CongestionLevel
    metrics: TrafficMetrics
    signal_state: Optional[SignalState] = Field(None, description="Signal state if available")
    risk_score: float = Field(..., ge=0, le=1, description="Risk score (0-1, higher is worse)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "intersection_id": "INT-001",
                "analysis_timestamp": "2024-01-01T12:00:00Z",
                "congestion_level": "moderate",
                "metrics": {
                    "total_vehicles": 45,
                    "vehicle_counts": [
                        {"vehicle_type": "car", "count": 35},
                        {"vehicle_type": "motorcycle", "count": 8},
                        {"vehicle_type": "truck", "count": 2}
                    ],
                    "average_speed_kmh": 25.5,
                    "queue_length_meters": 45.0,
                    "density_vehicles_per_km": 120.0,
                    "occupancy_rate": 0.65
                },
                "signal_state": {
                    "phase": "green",
                    "time_until_change_seconds": 30,
                    "cycle_time_seconds": 120
                },
                "risk_score": 0.45
            }
        }
    )
