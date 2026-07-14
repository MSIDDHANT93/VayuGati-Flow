from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from typing import Optional
from datetime import datetime
from app.utils.fields import auto_timestamp_field, entity_id_field


class SignalPhase(str, Enum):
    """Traffic signal phases."""
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    RED_YELLOW = "red_yellow"
    FLASHING_RED = "flashing_red"
    FLASHING_YELLOW = "flashing_yellow"


class SignalDirection(str, Enum):
    """Directions for signal phases."""
    NORTHBOUND = "northbound"
    SOUTHBOUND = "southbound"
    EASTBOUND = "eastbound"
    WESTBOUND = "westbound"
    ALL = "all"


class TrafficSignal(BaseModel):
    """Domain model representing a traffic signal state."""
    
    signal_id: str = entity_id_field("Unique identifier for the traffic signal")
    intersection_id: str = entity_id_field("ID of the intersection where signal is located")
    direction: SignalDirection = Field(..., description="Direction this signal controls")
    current_phase: SignalPhase = Field(..., description="Current signal phase")
    
    # Timing information
    phase_start_time: datetime = Field(..., description="Timestamp when current phase started")
    time_in_phase_seconds: int = Field(..., description="Time elapsed in current phase in seconds", ge=0)
    time_until_change_seconds: int = Field(..., description="Time until phase changes in seconds", ge=0)
    
    # Cycle configuration
    cycle_time_seconds: int = Field(..., description="Total signal cycle time in seconds", ge=0)
    green_time_seconds: int = Field(..., description="Green phase duration in seconds", ge=0)
    yellow_time_seconds: int = Field(..., description="Yellow phase duration in seconds", ge=0)
    red_time_seconds: int = Field(..., description="Red phase duration in seconds", ge=0)
    
    # Status
    is_operational: bool = Field(default=True, description="Whether the signal is operational")
    is_override_active: bool = Field(default=False, description="Whether manual override is active")
    override_source: Optional[str] = Field(None, description="Source of override if active", max_length=100)
    
    # Metadata
    last_updated: datetime = auto_timestamp_field("Timestamp when signal state was last updated")
    created_at: datetime = auto_timestamp_field("Timestamp when signal was created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "signal_id": "SIG-001-NB",
                "intersection_id": "INT-001",
                "direction": "northbound",
                "current_phase": "green",
                "phase_start_time": "2024-01-01T12:00:00Z",
                "time_in_phase_seconds": 25,
                "time_until_change_seconds": 35,
                "cycle_time_seconds": 120,
                "green_time_seconds": 60,
                "yellow_time_seconds": 5,
                "red_time_seconds": 55,
                "is_operational": True,
                "is_override_active": False,
                "override_source": None,
                "last_updated": "2024-01-01T12:00:25Z",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
    )
