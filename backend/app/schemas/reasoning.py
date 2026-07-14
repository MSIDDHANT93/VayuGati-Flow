from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class ReasoningRequest(BaseModel):
    """Request model for AI reasoning about traffic analysis."""
    
    # Traffic metrics from deterministic engine
    queue_length_meters: float = Field(..., description="Queue length in meters", ge=0)
    vehicle_density_vehicles_per_km: float = Field(..., description="Vehicle density in vehicles per km", ge=0)
    average_speed_kmh: float = Field(..., description="Average speed in km/h", ge=0)
    occupancy_rate: float = Field(..., description="Lane occupancy rate (0-1)", ge=0, le=1)
    congestion_score: float = Field(..., description="Congestion score (0-1)", ge=0, le=1)
    level_of_service: str = Field(..., description="Level of Service (LOS_A through LOS_F)")
    risk_score: float = Field(..., description="Risk score (0-1)", ge=0, le=1)
    
    # Context
    intersection_id: str = Field(..., description="Intersection identifier")
    lane_count: int = Field(..., description="Number of lanes", ge=1)
    total_vehicles: int = Field(..., description="Total vehicles analyzed", ge=0)
    
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
                "intersection_id": "INT-001",
                "lane_count": 4,
                "total_vehicles": 42
            }
        }
    )


class ReasoningResponse(BaseModel):
    """Response model for AI reasoning about traffic analysis."""
    
    # AI-generated insights
    congestion_explanation: str = Field(..., description="AI-generated explanation of congestion")
    probable_root_causes: List[str] = Field(..., description="List of probable root causes")
    traffic_recommendations: List[str] = Field(..., description="List of traffic recommendations")
    confidence_score: float = Field(..., description="AI confidence in analysis (0-1)", ge=0, le=1)
    
    # Metadata
    reasoning_timestamp: datetime = Field(default_factory=lambda: datetime.now(), description="When reasoning was performed")
    model_used: str = Field(..., description="Fireworks model used for reasoning")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "congestion_explanation": "High vehicle density combined with reduced speeds indicates moderate congestion likely caused by signal timing issues.",
                "probable_root_causes": [
                    "Suboptimal signal timing",
                    "High traffic volume during peak hours",
                    "Limited lane capacity"
                ],
                "traffic_recommendations": [
                    "Adjust signal timing to reduce cycle time",
                    "Implement adaptive signal control",
                    "Consider lane expansion during peak hours"
                ],
                "confidence_score": 0.85,
                "reasoning_timestamp": "2024-01-01T12:00:00Z",
                "model_used": "accounts/fireworks/models/llama-v3-70b-instruct"
            }
        }
    )
