from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime
from app.utils.fields import auto_timestamp_field, entity_id_field


class FrameQuality(str, Enum):
    """Quality assessment of camera frame."""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNUSABLE = "unusable"


class CameraFrame(BaseModel):
    """Domain model representing a single frame from a camera."""
    
    frame_id: str = entity_id_field("Unique identifier for the frame")
    camera_id: str = entity_id_field("ID of the camera that captured this frame")
    intersection_id: str = entity_id_field("ID of the intersection being monitored")
    timestamp: datetime = Field(..., description="Timestamp when the frame was captured")
    frame_number: int = Field(..., description="Sequential frame number from camera stream", ge=0)
    width_pixels: int = Field(..., description="Frame width in pixels", ge=1)
    height_pixels: int = Field(..., description="Frame height in pixels", ge=1)
    quality: FrameQuality = Field(default=FrameQuality.GOOD, description="Quality assessment of the frame")
    brightness: Optional[float] = Field(None, description="Average brightness level (0-1)", ge=0, le=1)
    contrast: Optional[float] = Field(None, description="Contrast level (0-1)", ge=0, le=1)
    is_night: bool = Field(default=False, description="Whether the frame was captured at night")
    weather_condition: Optional[str] = Field(None, description="Weather condition at capture time", max_length=50)
    file_path: Optional[str] = Field(None, description="Path to stored frame file", max_length=500)
    file_size_bytes: Optional[int] = Field(None, description="Size of frame file in bytes", ge=0)
    processing_status: str = Field(default="pending", description="Processing status of the frame", max_length=50)
    created_at: datetime = auto_timestamp_field("Timestamp when frame record was created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "frame_id": "FRM-001-0012345",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "timestamp": "2024-01-01T12:00:00Z",
                "frame_number": 12345,
                "width_pixels": 1920,
                "height_pixels": 1080,
                "quality": "good",
                "brightness": 0.65,
                "contrast": 0.72,
                "is_night": False,
                "weather_condition": "clear",
                "file_path": "/frames/2024/01/01/CAM-001/FRM-001-0012345.jpg",
                "file_size_bytes": 245760,
                "processing_status": "pending",
                "created_at": "2024-01-01T12:00:00Z"
            }
        }
    )
