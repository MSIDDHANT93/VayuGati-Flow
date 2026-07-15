from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime
from app.utils.fields import auto_timestamp_field, entity_id_field


class MetricsTimeWindow(str, Enum):
    """Time windows for traffic metrics aggregation."""
    REALTIME = "realtime"
    ONE_MINUTE = "one_minute"
    FIVE_MINUTES = "five_minutes"
    FIFTEEN_MINUTES = "fifteen_minutes"
    ONE_HOUR = "one_hour"
    ONE_DAY = "one_day"


class TrafficMetrics(BaseModel):
    """Domain model representing aggregated traffic metrics for an intersection."""
    
    metrics_id: str = entity_id_field("Unique identifier for the metrics record")
    intersection_id: str = entity_id_field("ID of the intersection")
    camera_id: Optional[str] = Field(None, description="ID of the camera if metrics are camera-specific", max_length=50)
    
    # Time window
    time_window: MetricsTimeWindow = Field(..., description="Time window for these metrics")
    window_start: datetime = Field(..., description="Start of the time window")
    window_end: datetime = Field(..., description="End of the time window")
    
    # Volume metrics
    total_vehicles: int = Field(..., description="Total vehicle count in time window", ge=0)
    vehicles_per_hour: float = Field(..., description="Vehicles per hour rate", ge=0)
    
    # Vehicle type breakdown
    car_count: int = Field(default=0, description="Number of cars detected", ge=0)
    truck_count: int = Field(default=0, description="Number of trucks detected", ge=0)
    bus_count: int = Field(default=0, description="Number of buses detected", ge=0)
    motorcycle_count: int = Field(default=0, description="Number of motorcycles detected", ge=0)
    bicycle_count: int = Field(default=0, description="Number of bicycles detected", ge=0)
    emergency_count: int = Field(default=0, description="Number of emergency vehicles detected", ge=0)
    
    # Speed metrics
    average_speed_kmh: float = Field(..., description="Average speed in km/h", ge=0)
    median_speed_kmh: Optional[float] = Field(None, description="Median speed in km/h", ge=0)
    max_speed_kmh: Optional[float] = Field(None, description="Maximum speed in km/h", ge=0)
    min_speed_kmh: Optional[float] = Field(None, description="Minimum speed in km/h", ge=0)
    speed_std_dev: Optional[float] = Field(None, description="Standard deviation of speed", ge=0)
    
    # Density metrics
    density_vehicles_per_km: float = Field(..., description="Traffic density in vehicles per km", ge=0)
    occupancy_rate: float = Field(..., description="Lane occupancy rate (0-1)", ge=0, le=1)
    
    # Queue metrics
    average_queue_length_meters: float = Field(..., description="Average queue length in meters", ge=0)
    max_queue_length_meters: Optional[float] = Field(None, description="Maximum queue length in meters", ge=0)
    average_queue_time_seconds: Optional[float] = Field(None, description="Average time spent in queue in seconds", ge=0)
    
    # Flow metrics
    flow_rate_vehicles_per_hour: Optional[float] = Field(None, description="Flow rate in vehicles per hour", ge=0)
    saturation_degree: Optional[float] = Field(None, description="Degree of saturation (0-1)", ge=0, le=1)
    
    # Quality metrics
    data_quality_score: float = Field(default=1.0, description="Quality score of the data (0-1)", ge=0, le=1)
    frames_processed: int = Field(default=0, description="Number of frames processed", ge=0)
    frames_with_detections: int = Field(default=0, description="Number of frames with detections", ge=0)
    
    # Metadata
    created_at: datetime = auto_timestamp_field("Timestamp when metrics were created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "metrics_id": "MET-INT-001-202401011200",
                "intersection_id": "INT-001",
                "camera_id": "CAM-001",
                "time_window": "one_minute",
                "window_start": "2024-01-01T12:00:00Z",
                "window_end": "2024-01-01T12:01:00Z",
                "total_vehicles": 45,
                "vehicles_per_hour": 2700.0,
                "car_count": 35,
                "truck_count": 5,
                "bus_count": 2,
                "motorcycle_count": 3,
                "bicycle_count": 0,
                "emergency_count": 0,
                "average_speed_kmh": 32.5,
                "median_speed_kmh": 30.0,
                "max_speed_kmh": 55.0,
                "min_speed_kmh": 15.0,
                "speed_std_dev": 8.5,
                "density_vehicles_per_km": 125.0,
                "occupancy_rate": 0.68,
                "average_queue_length_meters": 35.0,
                "max_queue_length_meters": 60.0,
                "average_queue_time_seconds": 45.0,
                "flow_rate_vehicles_per_hour": 2500.0,
                "saturation_degree": 0.75,
                "data_quality_score": 0.95,
                "frames_processed": 1800,
                "frames_with_detections": 1650,
                "created_at": "2024-01-01T12:01:00Z"
            }
        }
    )
