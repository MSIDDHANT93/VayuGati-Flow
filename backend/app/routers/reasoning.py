from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from app.schemas.reasoning import ReasoningRequest, ReasoningResponse
from app.schemas.common import APIResponse
from app.services.reasoning_service import ReasoningService
from app.utils.logger import logger


router = APIRouter(prefix="/reasoning", tags=["reasoning"])


def get_reasoning_service() -> ReasoningService:
    """Dependency injection for reasoning service."""
    return ReasoningService()


@router.post("/analyze", response_model=APIResponse[ReasoningResponse])
async def analyze_reasoning(
    request: ReasoningRequest,
    service: Annotated[ReasoningService, Depends(get_reasoning_service)]
) -> APIResponse[ReasoningResponse]:
    """
    Analyze traffic metrics using AI reasoning.
    
    This endpoint accepts structured traffic metrics from the deterministic Traffic Intelligence Engine
    and uses Fireworks AI to generate:
    - Congestion explanation
    - Probable root causes
    - Traffic recommendations
    - Confidence score
    
    The AI only explains the provided metrics - it does not perform any calculations.
    All traffic metrics are calculated by the deterministic engine using Highway Capacity Manual algorithms.
    
    If Fireworks AI is not available, the service returns mock responses based on congestion score.
    """
    try:
        result = service.analyze_traffic(request)
        return APIResponse[ReasoningResponse](
            success=True,
            data=result,
            errors=None
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "AI reasoning failed for intersection '%s'",
            request.intersection_id,
        )
        raise HTTPException(status_code=500, detail="AI reasoning failed")
