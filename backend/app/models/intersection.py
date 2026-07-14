from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime


class IntersectionType(str, Enum):
    """Types of traffic intersections."""
    FOUR_WAY = "four_way"
    THREE_WAY = "three_way"
    T_JUNCTION = "t_junction"
    ROUNDABOUT = "roundabout"
    SIGNALIZED = "signalized"
    UNSIGNALIZED = "unsignalized"


class IntersectionStatus(str, Enum):
    """Operational status of an intersection."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CONSTRUCTION = "construction"


class Intersection(BaseModel):
    """Domain model representing a traffic intersection."""
    
    intersection_id: str = Field(..., description="Unique identifier for the intersection", min_length=1, max_length=50)
    name: str = Field(..., description="Human-readable name of the intersection", min_length=1, max_length=200)
    location_lat: float = Field(..., description="Latitude coordinate", ge=-90, le=90)
    location_lon: float = Field(..., description="Longitude coordinate", ge=-180, le=180)
    intersection_type: IntersectionType = Field(..., description="Type of intersection")
    status: IntersectionStatus = Field(default=IntersectionStatus.ACTIVE, description="Current operational status")
    num_lanes: int = Field(..., description="Number of lanes at the intersection", ge=1, le=12)
    has_traffic_signal: bool = Field(default=False, description="Whether the intersection has traffic signals")
    municipality: str = Field(..., description="Municipality or city where intersection is located", min_length=1, max_length=100)
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when intersection was created")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when intersection was last updated")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "intersection_id": "INT-001",
                "name": "Main Street and 5th Avenue",
                "location_lat": 40.7128,
                "location_lon": -74.0060,
                "intersection_type": "signalized",
                "status": "active",
                "num_lanes": 4,
                "has_traffic_signal": True,
                "municipality": "New York City",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )
