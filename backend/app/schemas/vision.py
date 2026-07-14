from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.utils.fields import auto_timestamp_field
from app.models.vehicle_detection import VehicleDetection


class VisionAnalysisRequest(BaseModel):
    """Request model for computer vision analysis."""
    
    camera_id: str = Field(..., description="Camera identifier")
    intersection_id: str = Field(..., description="Intersection identifier")
    frame_id: str = Field(..., description="Frame identifier")
    image_data: str = Field(..., description="Base64 encoded image data")
    image_format: str = Field(default="jpg", description="Image format (jpg, png, etc.)")
    timestamp: datetime = auto_timestamp_field("Image capture timestamp")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "frame_id": "FRM-001",
                "image_data": "base64_encoded_image_string",
                "image_format": "jpg",
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }
    )


class VisionAnalysisResponse(BaseModel):
    """Response model for computer vision analysis."""
    
    frame_id: str = Field(..., description="Frame identifier")
    camera_id: str = Field(..., description="Camera identifier")
    intersection_id: str = Field(..., description="Intersection identifier")
    vehicle_detections: List[VehicleDetection] = Field(..., description="List of vehicle detections from YOLO")
    total_detections: int = Field(..., description="Total number of detections")
    inference_time_ms: float = Field(..., description="YOLO inference time in milliseconds", ge=0)
    analysis_timestamp: datetime = auto_timestamp_field("When analysis was performed")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "frame_id": "FRM-001",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_detections": [],
                "total_detections": 5,
                "inference_time_ms": 125.5,
                "analysis_timestamp": "2024-01-01T12:00:00Z"
            }
        }
    )
