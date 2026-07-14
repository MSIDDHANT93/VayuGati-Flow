from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime


class VehicleType(str, Enum):
    """Types of vehicles detected."""
    CAR = "car"
    TRUCK = "truck"
    BUS = "bus"
    MOTORCYCLE = "motorcycle"
    BICYCLE = "bicycle"
    EMERGENCY = "emergency"
    UNKNOWN = "unknown"


class DetectionConfidence(str, Enum):
    """Confidence levels for detections."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class VehicleDetection(BaseModel):
    """Domain model representing a vehicle detection in a frame."""
    
    detection_id: str = Field(..., description="Unique identifier for the detection", min_length=1, max_length=50)
    frame_id: str = Field(..., description="ID of the frame where vehicle was detected", min_length=1, max_length=50)
    camera_id: str = Field(..., description="ID of the camera that captured the frame", min_length=1, max_length=50)
    intersection_id: str = Field(..., description="ID of the intersection being monitored", min_length=1, max_length=50)
    vehicle_type: VehicleType = Field(..., description="Type of vehicle detected")
    confidence: float = Field(..., description="Detection confidence score (0-1)", ge=0, le=1)
    confidence_level: DetectionConfidence = Field(..., description="Confidence level category")
    
    # Bounding box coordinates (normalized 0-1)
    bbox_x_min: float = Field(..., description="Bounding box minimum x coordinate (normalized)", ge=0, le=1)
    bbox_y_min: float = Field(..., description="Bounding box minimum y coordinate (normalized)", ge=0, le=1)
    bbox_x_max: float = Field(..., description="Bounding box maximum x coordinate (normalized)", ge=0, le=1)
    bbox_y_max: float = Field(..., description="Bounding box maximum y coordinate (normalized)", ge=0, le=1)
    
    # Vehicle attributes
    speed_kmh: Optional[float] = Field(None, description="Estimated vehicle speed in km/h", ge=0)
    direction_degrees: Optional[float] = Field(None, description="Vehicle direction in degrees (0-360)", ge=0, le=360)
    lane_id: Optional[str] = Field(None, description="Lane identifier if available", max_length=50)
    
    # Tracking
    track_id: Optional[str] = Field(None, description="Vehicle tracking ID for multi-frame tracking", max_length=50)
    is_stopped: bool = Field(default=False, description="Whether the vehicle is stopped")
    stop_duration_seconds: Optional[float] = Field(None, description="Duration vehicle has been stopped in seconds", ge=0)
    
    # Metadata
    detection_timestamp: datetime = Field(..., description="Timestamp when detection was made")
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when detection record was created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detection_id": "DET-001-0012345-001",
                "frame_id": "FRM-001-0012345",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_type": "car",
                "confidence": 0.95,
                "confidence_level": "high",
                "bbox_x_min": 0.25,
                "bbox_y_min": 0.30,
                "bbox_x_max": 0.45,
                "bbox_y_max": 0.60,
                "speed_kmh": 35.5,
                "direction_degrees": 90.0,
                "lane_id": "LANE-001",
                "track_id": "TRK-001-001",
                "is_stopped": False,
                "stop_duration_seconds": None,
                "detection_timestamp": "2024-01-01T12:00:00Z",
                "created_at": "2024-01-01T12:00:00Z"
            }
        }
    )
