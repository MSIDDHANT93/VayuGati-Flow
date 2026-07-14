from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from app.schemas.traffic_analysis import TrafficAnalysisRequest, TrafficAnalysisResult
from app.schemas.common import APIResponse
from app.services.traffic_analysis_service import TrafficAnalysisService


router = APIRouter(prefix="/traffic", tags=["traffic"])


def get_traffic_service() -> TrafficAnalysisService:
    """Dependency injection for traffic analysis service."""
    return TrafficAnalysisService()


@router.post("/analyze", response_model=APIResponse[TrafficAnalysisResult])
async def analyze_traffic(
    request: TrafficAnalysisRequest,
    service: Annotated[TrafficAnalysisService, Depends(get_traffic_service)]
) -> APIResponse[TrafficAnalysisResult]:
    """
    Analyze traffic for a given intersection using deterministic algorithms.
    
    This endpoint accepts domain models (Intersection, Camera, VehicleDetections, TrafficSignal)
    and returns comprehensive traffic analysis including:
    - Queue length
    - Vehicle density
    - Average speed
    - Occupancy rate
    - Congestion score
    - Level of Service (LOS)
    - Risk score
    - Explanatory outputs
    
    All calculations use deterministic algorithms based on Highway Capacity Manual.
    No AI, no ML, no LLM - pure mathematical calculations.
    """
    try:
        result = service.analyze(request)
        return APIResponse[TrafficAnalysisResult](
            success=True,
            data=result,
            errors=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Traffic analysis failed: {str(e)}")
