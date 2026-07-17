"""
Integrated Pipeline Service - End-to-End Traffic Analysis

This service orchestrates the complete pipeline:
Vision → Traffic Intelligence → AI Reasoning

It connects the three independent engines without modifying their architecture.
"""

from typing import Optional
from datetime import datetime, UTC

from app.schemas.vision import VisionAnalysisRequest, VisionAnalysisResponse
from app.schemas.traffic_analysis import TrafficAnalysisRequest, TrafficAnalysisResult
from app.schemas.reasoning import ReasoningRequest, ReasoningResponse
from app.services.computer_vision_service import ComputerVisionService
from app.services.traffic_analysis_service import TrafficAnalysisService
from app.services.reasoning_service import ReasoningService


class PipelineResult:
    """Complete pipeline result containing all analysis stages."""
    
    def __init__(
        self,
        vision_result: Optional[VisionAnalysisResponse],
        traffic_result: TrafficAnalysisResult,
        reasoning_result: ReasoningResponse,
        pipeline_duration_ms: float
    ):
        self.vision_result = vision_result
        self.traffic_result = traffic_result
        self.reasoning_result = reasoning_result
        self.pipeline_duration_ms = pipeline_duration_ms
        self.timestamp = datetime.now(UTC)


class PipelineService:
    """Service for end-to-end traffic analysis pipeline."""
    
    def __init__(self):
        """Initialize pipeline service with all engines."""
        self.vision_service = ComputerVisionService()
        self.traffic_service = TrafficAnalysisService()
        self.reasoning_service = ReasoningService()
    
    def analyze_from_image(
        self,
        image_data: str,
        intersection_id: str,
        camera_id: str,
        frame_id: str,
        lane_count: int = 4,
        lane_length_meters: float = 100.0,
        free_flow_speed_kmh: float = 60.0,
        capacity_vehicles_per_hour: int = 1800
    ) -> PipelineResult:
        """
        Run complete pipeline from image to AI reasoning.
        
        Args:
            image_data: Base64 encoded image
            intersection_id: Intersection identifier
            camera_id: Camera identifier
            frame_id: Frame identifier
            lane_count: Number of lanes
            lane_length_meters: Lane length in meters
            free_flow_speed_kmh: Free flow speed in km/h
            capacity_vehicles_per_hour: Lane capacity
            
        Returns:
            PipelineResult with all analysis stages
        """
        start_time = datetime.now(UTC)
        
        # Stage 1: Vision Analysis
        vision_request = VisionAnalysisRequest(
            camera_id=camera_id,
            intersection_id=intersection_id,
            frame_id=frame_id,
            image_data=image_data,
            image_format="jpg"
        )
        vision_result = self.vision_service.analyze_image(vision_request)
        
        # Stage 2: Traffic Intelligence
        # Build TrafficAnalysisRequest from vision results and domain models
        traffic_request = self._build_traffic_request(
            vision_result,
            intersection_id,
            lane_count,
            lane_length_meters,
            free_flow_speed_kmh,
            capacity_vehicles_per_hour
        )
        traffic_result = self.traffic_service.analyze(traffic_request)
        
        # Stage 3: AI Reasoning
        reasoning_request = ReasoningRequest(
            queue_length_meters=traffic_result.queue_length_meters,
            vehicle_density_vehicles_per_km=traffic_result.vehicle_density_vehicles_per_km,
            average_speed_kmh=traffic_result.average_speed_kmh,
            occupancy_rate=traffic_result.occupancy_rate,
            congestion_score=traffic_result.congestion_score,
            level_of_service=traffic_result.level_of_service.value,
            risk_score=traffic_result.risk_score,
            intersection_id=intersection_id,
            lane_count=lane_count,
            total_vehicles=traffic_result.total_vehicles_analyzed
        )
        reasoning_result = self.reasoning_service.analyze_traffic(reasoning_request)
        
        pipeline_duration_ms = (datetime.now(UTC) - start_time).total_seconds() * 1000
        
        return PipelineResult(
            vision_result=vision_result,
            traffic_result=traffic_result,
            reasoning_result=reasoning_result,
            pipeline_duration_ms=pipeline_duration_ms
        )
    
    def analyze_from_detections(
        self,
        vehicle_detections: list,
        intersection_id: str,
        camera_id: str,
        frame_id: str,
        lane_count: int = 4,
        lane_length_meters: float = 100.0,
        free_flow_speed_kmh: float = 60.0,
        capacity_vehicles_per_hour: int = 1800
    ) -> PipelineResult:
        """
        Run pipeline from existing vehicle detections (skip vision stage).
        
        Args:
            vehicle_detections: List of VehicleDetection objects
            intersection_id: Intersection identifier
            camera_id: Camera identifier
            frame_id: Frame identifier
            lane_count: Number of lanes
            lane_length_meters: Lane length in meters
            free_flow_speed_kmh: Free flow speed in km/h
            capacity_vehicles_per_hour: Lane capacity
            
        Returns:
            PipelineResult with traffic and reasoning stages
        """
        start_time = datetime.now(UTC)
        
        # Skip vision stage - use provided detections
        vision_result = None
        
        # Stage 2: Traffic Intelligence
        traffic_request = self._build_traffic_request_from_detections(
            vehicle_detections,
            intersection_id,
            camera_id,
            lane_count,
            lane_length_meters,
            free_flow_speed_kmh,
            capacity_vehicles_per_hour
        )
        traffic_result = self.traffic_service.analyze(traffic_request)
        
        # Stage 3: AI Reasoning
        reasoning_request = ReasoningRequest(
            queue_length_meters=traffic_result.queue_length_meters,
            vehicle_density_vehicles_per_km=traffic_result.vehicle_density_vehicles_per_km,
            average_speed_kmh=traffic_result.average_speed_kmh,
            occupancy_rate=traffic_result.occupancy_rate,
            congestion_score=traffic_result.congestion_score,
            level_of_service=traffic_result.level_of_service.value,
            risk_score=traffic_result.risk_score,
            intersection_id=intersection_id,
            lane_count=lane_count,
            total_vehicles=traffic_result.total_vehicles_analyzed
        )
        reasoning_result = self.reasoning_service.analyze_traffic(reasoning_request)
        
        pipeline_duration_ms = (datetime.now(UTC) - start_time).total_seconds() * 1000
        
        return PipelineResult(
            vision_result=vision_result,
            traffic_result=traffic_result,
            reasoning_result=reasoning_result,
            pipeline_duration_ms=pipeline_duration_ms
        )
    
    def _build_traffic_request(
        self,
        vision_result: VisionAnalysisResponse,
        intersection_id: str,
        lane_count: int,
        lane_length_meters: float,
        free_flow_speed_kmh: float,
        capacity_vehicles_per_hour: int
    ) -> TrafficAnalysisRequest:
        """Build TrafficAnalysisRequest from vision results."""
        from app.models.intersection import Intersection, IntersectionType, IntersectionStatus
        from app.models.camera import Camera, CameraStatus, CameraResolution
        from app.models.traffic_signal import TrafficSignal, SignalPhase, SignalDirection
        
        # Create domain models from vision results
        intersection = Intersection(
            intersection_id=intersection_id,
            name="Demo Intersection",
            location_lat=40.7128,
            location_lon=-74.0060,
            intersection_type=IntersectionType.SIGNALIZED,
            status=IntersectionStatus.ACTIVE,
            num_lanes=lane_count,
            has_traffic_signal=True,
            municipality="New York City"
        )
        
        camera = Camera(
            camera_id=vision_result.camera_id,
            intersection_id=intersection_id,
            name="Demo Camera",
            location_lat=40.7129,
            location_lon=-74.0061,
            status=CameraStatus.ONLINE,
            resolution=CameraResolution.FULL_HD_1080P,
            fps=30
        )
        
        # Use vehicle detections from vision
        vehicle_detections = vision_result.vehicle_detections
        
        # Create minimal traffic signal (optional)
        traffic_signal = TrafficSignal(
            signal_id=f"SIG-{intersection_id}",
            intersection_id=intersection_id,
            direction=SignalDirection.NORTHBOUND,
            current_phase=SignalPhase.GREEN,
            phase_start_time=datetime.now(UTC).isoformat(),
            time_in_phase_seconds=30,
            time_until_change_seconds=30,
            cycle_time_seconds=120,
            green_time_seconds=60,
            yellow_time_seconds=5,
            red_time_seconds=55
        )
        
        return TrafficAnalysisRequest(
            intersection=intersection,
            camera=camera,
            vehicle_detections=vehicle_detections,
            traffic_signal=traffic_signal,
            lane_count=lane_count,
            lane_length_meters=lane_length_meters,
            free_flow_speed_kmh=free_flow_speed_kmh,
            capacity_vehicles_per_hour=capacity_vehicles_per_hour
        )
    
    def _build_traffic_request_from_detections(
        self,
        vehicle_detections: list,
        intersection_id: str,
        camera_id: str,
        lane_count: int,
        lane_length_meters: float,
        free_flow_speed_kmh: float,
        capacity_vehicles_per_hour: int
    ) -> TrafficAnalysisRequest:
        """Build TrafficAnalysisRequest from existing vehicle detections."""
        from app.models.intersection import Intersection, IntersectionType, IntersectionStatus
        from app.models.camera import Camera, CameraStatus, CameraResolution
        from app.models.traffic_signal import TrafficSignal, SignalPhase, SignalDirection
        
        # Create domain models
        intersection = Intersection(
            intersection_id=intersection_id,
            name="Demo Intersection",
            location_lat=40.7128,
            location_lon=-74.0060,
            intersection_type=IntersectionType.SIGNALIZED,
            status=IntersectionStatus.ACTIVE,
            num_lanes=lane_count,
            has_traffic_signal=True,
            municipality="New York City"
        )
        
        camera = Camera(
            camera_id=camera_id,
            intersection_id=intersection_id,
            name="Demo Camera",
            location_lat=40.7129,
            location_lon=-74.0061,
            status=CameraStatus.ONLINE,
            resolution=CameraResolution.FULL_HD_1080P,
            fps=30
        )
        
        traffic_signal = TrafficSignal(
            signal_id=f"SIG-{intersection_id}",
            intersection_id=intersection_id,
            direction=SignalDirection.NORTHBOUND,
            current_phase=SignalPhase.GREEN,
            phase_start_time=datetime.now(UTC).isoformat(),
            time_in_phase_seconds=30,
            time_until_change_seconds=30,
            cycle_time_seconds=120,
            green_time_seconds=60,
            yellow_time_seconds=5,
            red_time_seconds=55
        )
        
        return TrafficAnalysisRequest(
            intersection=intersection,
            camera=camera,
            vehicle_detections=vehicle_detections,
            traffic_signal=traffic_signal,
            lane_count=lane_count,
            lane_length_meters=lane_length_meters,
            free_flow_speed_kmh=free_flow_speed_kmh,
            capacity_vehicles_per_hour=capacity_vehicles_per_hour
        )
