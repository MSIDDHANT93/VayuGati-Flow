from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from app.schemas.vision import VisionAnalysisRequest, VisionAnalysisResponse
from app.schemas.common import APIResponse
from app.services.computer_vision_service import ComputerVisionService


router = APIRouter(prefix="/vision", tags=["vision"])


def get_vision_service() -> ComputerVisionService:
    """Dependency injection for computer vision service."""
    return ComputerVisionService()


@router.post("/analyze", response_model=APIResponse[VisionAnalysisResponse])
async def analyze_image(
    request: VisionAnalysisRequest,
    service: Annotated[ComputerVisionService, Depends(get_vision_service)]
) -> APIResponse[VisionAnalysisResponse]:
    """
    Analyze image using YOLO computer vision.
    
    This endpoint accepts base64-encoded images and returns vehicle detections
    converted to VehicleDetection domain models for use by the Traffic Intelligence Engine.
    
    The service uses YOLO for object detection and converts results to standardized
    VehicleDetection objects with bounding boxes, confidence scores, and vehicle types.
    
    If YOLO is not available, the service returns mock detections for testing.
    """
    try:
        result = service.analyze_image(request)
        return APIResponse[VisionAnalysisResponse](
            success=True,
            data=result,
            errors=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Computer vision analysis failed: {str(e)}")
