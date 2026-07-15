from fastapi import APIRouter, Depends
from functools import lru_cache
from typing import Annotated

from app.schemas.traffic_analysis import TrafficAnalysisRequest, TrafficAnalysisResult
from app.schemas.common import APIResponse
from app.services.traffic_analysis_service import TrafficAnalysisService
from app.utils.responses import execute_service


router = APIRouter(prefix="/traffic", tags=["traffic"])


@lru_cache
def get_traffic_service() -> TrafficAnalysisService:
    """Dependency injection for traffic analysis service.

    Cached so a single stateless service instance is reused across requests.
    """
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
    return execute_service(
        lambda: service.analyze(request),
        "Traffic analysis failed",
        "Traffic analysis failed for intersection '%s'",
        request.intersection.intersection_id,
    )
