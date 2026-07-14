from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime


class CameraStatus(str, Enum):
    """Operational status of a camera."""
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class CameraResolution(str, Enum):
    """Standard camera resolutions."""
    HD_720P = "720p"
    FULL_HD_1080P = "1080p"
    UHD_4K = "4k"


class Camera(BaseModel):
    """Domain model representing a traffic camera."""
    
    camera_id: str = Field(..., description="Unique identifier for the camera", min_length=1, max_length=50)
    intersection_id: str = Field(..., description="ID of the intersection this camera monitors", min_length=1, max_length=50)
    name: str = Field(..., description="Human-readable name of the camera", min_length=1, max_length=200)
    location_lat: float = Field(..., description="Latitude coordinate of camera position", ge=-90, le=90)
    location_lon: float = Field(..., description="Longitude coordinate of camera position", ge=-180, le=180)
    altitude_meters: Optional[float] = Field(None, description="Altitude in meters above sea level", ge=0)
    status: CameraStatus = Field(default=CameraStatus.ONLINE, description="Current operational status")
    resolution: CameraResolution = Field(default=CameraResolution.FULL_HD_1080P, description="Camera resolution")
    fps: int = Field(default=30, description="Frames per second", ge=1, le=120)
    field_of_view_degrees: float = Field(default=90.0, description="Horizontal field of view in degrees", ge=1, le=360)
    is_ptz: bool = Field(default=False, description="Whether camera is Pan-Tilt-Zoom capable")
    rtsp_url: Optional[str] = Field(None, description="RTSP stream URL if available", max_length=500)
    ip_address: Optional[str] = Field(None, description="IP address of the camera", max_length=45)
    manufacturer: Optional[str] = Field(None, description="Camera manufacturer", max_length=100)
    model: Optional[str] = Field(None, description="Camera model", max_length=100)
    installation_date: Optional[datetime] = Field(None, description="Date when camera was installed")
    last_maintenance: Optional[datetime] = Field(None, description="Date of last maintenance")
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when camera was created")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when camera was last updated")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "name": "Main Street Northbound Camera",
                "location_lat": 40.7129,
                "location_lon": -74.0061,
                "altitude_meters": 15.5,
                "status": "online",
                "resolution": "1080p",
                "fps": 30,
                "field_of_view_degrees": 90.0,
                "is_ptz": False,
                "rtsp_url": "rtsp://camera-001.local/stream",
                "ip_address": "192.168.1.100",
                "manufacturer": "Axis Communications",
                "model": "AXIS Q1659",
                "installation_date": "2024-01-01T00:00:00Z",
                "last_maintenance": "2024-06-01T00:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )
