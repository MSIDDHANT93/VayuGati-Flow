from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Optional
from pydantic import BaseModel, Field

from app.schemas.common import APIResponse
from app.services.pipeline_service import PipelineService, PipelineResult
from app.services.demo_scenarios import get_scenario, list_scenarios


router = APIRouter(prefix="/pipeline", tags=["pipeline"])


def get_pipeline_service() -> PipelineService:
    """Dependency injection for pipeline service."""
    return PipelineService()


class PipelineRequest(BaseModel):
    """Request for end-to-end pipeline analysis."""
    
    scenario: str = Field(..., description="Demo scenario name (morning_rush, school_zone, accident, illegal_parking, emergency_vehicle)")
    intersection_id: str = Field(default="INT-001", description="Intersection identifier")
    camera_id: str = Field(default="CAM-001", description="Camera identifier")
    frame_id: str = Field(default="FRM-001", description="Frame identifier")
    lane_count: int = Field(default=4, description="Number of lanes", ge=1, le=12)
    lane_length_meters: float = Field(default=100.0, description="Lane length in meters", ge=10, le=1000)
    free_flow_speed_kmh: float = Field(default=60.0, description="Free flow speed in km/h", ge=20, le=120)
    capacity_vehicles_per_hour: int = Field(default=1800, description="Lane capacity", ge=500, le=3000)


class PipelineResponse(BaseModel):
    """Response from end-to-end pipeline analysis."""
    
    scenario: str = Field(..., description="Scenario name")
    intersection_id: str = Field(..., description="Intersection identifier")
    total_vehicles: int = Field(..., description="Total vehicles detected")
    
    # Vision results
    vision_detections: int = Field(..., description="Number of vision detections")
    vision_inference_time_ms: float = Field(..., description="Vision inference time")
    
    # Traffic results
    queue_length_meters: float = Field(..., description="Queue length")
    vehicle_density_vehicles_per_km: float = Field(..., description="Vehicle density")
    average_speed_kmh: float = Field(..., description="Average speed")
    occupancy_rate: float = Field(..., description="Occupancy rate")
    congestion_score: float = Field(..., description="Congestion score")
    level_of_service: str = Field(..., description="Level of service")
    risk_score: float = Field(..., description="Risk score")
    
    # Reasoning results
    congestion_explanation: str = Field(..., description="AI congestion explanation")
    probable_root_causes: list = Field(..., description="Probable root causes")
    traffic_recommendations: list = Field(..., description="Traffic recommendations")
    ai_confidence: float = Field(..., description="AI confidence score")
    
    # Pipeline metrics
    pipeline_duration_ms: float = Field(..., description="Total pipeline duration")


@router.post("/demo", response_model=APIResponse[PipelineResponse])
async def run_demo_pipeline(
    request: PipelineRequest,
    service: Annotated[PipelineService, Depends(get_pipeline_service)]
) -> APIResponse[PipelineResponse]:
    """
    Run end-to-end demo pipeline with pre-configured scenarios.
    
    This endpoint orchestrates the complete analysis pipeline:
    1. Load demo scenario (vehicle detections)
    2. Traffic Intelligence Engine analysis
    3. AI Reasoning Engine analysis
    
    Available scenarios:
    - morning_rush: High traffic volume during peak hours
    - school_zone: Reduced speed zone with pedestrian activity
    - accident: Traffic accident blocking lanes
    - illegal_parking: Vehicles illegally parked blocking traffic
    - emergency_vehicle: Emergency vehicle requiring right-of-way
    """
    try:
        # Get demo scenario
        scenario = get_scenario(request.scenario)
        if scenario is None:
            raise HTTPException(status_code=400, detail=f"Unknown scenario: {request.scenario}")
        
        # Get vehicle detections from scenario
        vehicle_detections = scenario.get_vehicle_detections(
            request.camera_id,
            request.intersection_id,
            request.frame_id
        )
        
        # Run pipeline (skip vision stage, use scenario detections)
        result = service.analyze_from_detections(
            vehicle_detections=vehicle_detections,
            intersection_id=request.intersection_id,
            camera_id=request.camera_id,
            frame_id=request.frame_id,
            lane_count=request.lane_count,
            lane_length_meters=request.lane_length_meters,
            free_flow_speed_kmh=request.free_flow_speed_kmh,
            capacity_vehicles_per_hour=request.capacity_vehicles_per_hour
        )
        
        # Build response
        response = PipelineResponse(
            scenario=request.scenario,
            intersection_id=request.intersection_id,
            total_vehicles=result.traffic_result.total_vehicles_analyzed,
            vision_detections=len(vehicle_detections),
            vision_inference_time_ms=0.0,  # Skipped in demo mode
            queue_length_meters=result.traffic_result.queue_length_meters,
            vehicle_density_vehicles_per_km=result.traffic_result.vehicle_density_vehicles_per_km,
            average_speed_kmh=result.traffic_result.average_speed_kmh,
            occupancy_rate=result.traffic_result.occupancy_rate,
            congestion_score=result.traffic_result.congestion_score,
            level_of_service=result.traffic_result.level_of_service.value,
            risk_score=result.traffic_result.risk_score,
            congestion_explanation=result.reasoning_result.congestion_explanation,
            probable_root_causes=result.reasoning_result.probable_root_causes,
            traffic_recommendations=result.reasoning_result.traffic_recommendations,
            ai_confidence=result.reasoning_result.confidence_score,
            pipeline_duration_ms=result.pipeline_duration_ms
        )
        
        return APIResponse[PipelineResponse](
            success=True,
            data=response,
            errors=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


@router.get("/scenarios")
async def list_demo_scenarios():
    """List all available demo scenarios."""
    scenarios = list_scenarios()
    return {
        "scenarios": scenarios,
        "count": len(scenarios)
    }
