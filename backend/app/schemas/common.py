from pydantic import BaseModel, Field, ConfigDict
from typing import Generic, TypeVar, Optional, Any
from datetime import datetime, UTC

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API response wrapper for all endpoints."""
    
    success: bool = Field(..., description="Indicates if the request was successful")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Response timestamp")
    data: Optional[T] = Field(None, description="Response data payload")
    errors: Optional[list[str]] = Field(None, description="List of error messages if any")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2024-01-01T12:00:00Z",
                "data": {},
                "errors": None
            }
        }
    )
