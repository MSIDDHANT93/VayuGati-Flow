from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional, List
from datetime import datetime


class CongestionLevel(str, Enum):
    """Severity levels of traffic congestion."""
    FREE_FLOW = "free_flow"
    LIGHT = "light"
    MODERATE = "moderate"
    HEAVY = "heavy"
    SEVERE = "severe"
    GRIDLOCK = "gridlock"


class CongestionCause(str, Enum):
    """Potential causes of congestion."""
    HIGH_VOLUME = "high_volume"
    SIGNAL_TIMING = "signal_timing"
    INCIDENT = "incident"
    ROAD_WORK = "road_work"
    WEATHER = "weather"
    SPECIAL_EVENT = "special_event"
    INFRASTRUCTURE_LIMIT = "infrastructure_limit"
    UNKNOWN = "unknown"


class CongestionAnalysis(BaseModel):
    """Domain model representing a congestion analysis for an intersection."""
    
    analysis_id: str = Field(..., description="Unique identifier for the analysis", min_length=1, max_length=50)
    intersection_id: str = Field(..., description="ID of the intersection analyzed", min_length=1, max_length=50)
    metrics_id: str = Field(..., description="ID of the traffic metrics used for analysis", min_length=1, max_length=50)
    
    # Analysis window
    analysis_window_start: datetime = Field(..., description="Start of analysis time window")
    analysis_window_end: datetime = Field(..., description="End of analysis time window")
    analysis_timestamp: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when analysis was performed")
    
    # Congestion assessment
    congestion_level: CongestionLevel = Field(..., description="Current congestion level")
    congestion_score: float = Field(..., description="Congestion severity score (0-1, higher is worse)", ge=0, le=1)
    
    # Root cause analysis
    primary_cause: CongestionCause = Field(..., description="Primary cause of congestion")
    secondary_causes: List[CongestionCause] = Field(default_factory=list, description="Secondary contributing factors")
    cause_confidence: float = Field(..., description="Confidence in cause identification (0-1)", ge=0, le=1)
    
    # Impact metrics
    affected_lanes: List[str] = Field(default_factory=list, description="IDs of affected lanes")
    average_delay_seconds: Optional[float] = Field(None, description="Average delay per vehicle in seconds", ge=0)
    total_delay_vehicle_hours: Optional[float] = Field(None, description="Total delay in vehicle hours", ge=0)
    queue_length_meters: float = Field(..., description="Current queue length in meters", ge=0)
    queue_growth_rate_meters_per_min: Optional[float] = Field(None, description="Rate of queue growth in meters per minute", ge=0)
    
    # Comparison metrics
    baseline_comparison: Optional[float] = Field(None, description="Comparison to baseline traffic (1.0 = normal)", ge=0)
    historical_percentile: Optional[float] = Field(None, description="Historical percentile of current conditions (0-100)", ge=0, le=100)
    
    # Prediction
    predicted_duration_minutes: Optional[int] = Field(None, description="Predicted duration of congestion in minutes", ge=0)
    predicted_clearance_time: Optional[datetime] = Field(None, description="Predicted time when congestion will clear")
    
    # Recommendations
    recommended_actions: List[str] = Field(default_factory=list, description="Recommended mitigation actions")
    priority_level: str = Field(default="medium", description="Priority level for intervention (low/medium/high/critical)", max_length=20)
    
    # Quality indicators
    data_quality_score: float = Field(default=1.0, description="Quality of input data (0-1)", ge=0, le=1)
    analysis_confidence: float = Field(default=1.0, description="Overall confidence in analysis (0-1)", ge=0, le=1)
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when analysis was created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "analysis_id": "ANA-INT-001-202401011200",
                "intersection_id": "INT-001",
                "metrics_id": "MET-INT-001-202401011200",
                "analysis_window_start": "2024-01-01T12:00:00Z",
                "analysis_window_end": "2024-01-01T12:05:00Z",
                "analysis_timestamp": "2024-01-01T12:05:00Z",
                "congestion_level": "heavy",
                "congestion_score": 0.75,
                "primary_cause": "high_volume",
                "secondary_causes": ["signal_timing"],
                "cause_confidence": 0.85,
                "affected_lanes": ["LANE-001", "LANE-002"],
                "average_delay_seconds": 120.0,
                "total_delay_vehicle_hours": 15.5,
                "queue_length_meters": 85.0,
                "queue_growth_rate_meters_per_min": 5.0,
                "baseline_comparison": 1.8,
                "historical_percentile": 85.0,
                "predicted_duration_minutes": 25,
                "predicted_clearance_time": "2024-01-01T12:30:00Z",
                "recommended_actions": [
                    "Extend green phase for northbound traffic",
                    "Deploy traffic officers for manual control"
                ],
                "priority_level": "high",
                "data_quality_score": 0.95,
                "analysis_confidence": 0.85,
                "created_at": "2024-01-01T12:05:00Z"
            }
        }
    )
