"""
Tests for TrafficAnalysisService pipeline.

Tests verify the complete analysis pipeline from request to response.
"""

import pytest
from datetime import datetime, UTC
from app.models.intersection import Intersection, IntersectionType, IntersectionStatus
from app.models.camera import Camera, CameraStatus, CameraResolution
from app.models.vehicle_detection import VehicleDetection, VehicleType, DetectionConfidence
from app.models.traffic_signal import TrafficSignal, SignalPhase, SignalDirection
from app.schemas.traffic_analysis import TrafficAnalysisRequest, TrafficAnalysisResult, LevelOfService
from app.services.traffic_analysis_service import TrafficAnalysisService


@pytest.fixture
def sample_intersection():
    """Create sample intersection for testing."""
    return Intersection(
        intersection_id="INT-001",
        name="Main Street and 5th Avenue",
        location_lat=40.7128,
        location_lon=-74.0060,
        intersection_type=IntersectionType.SIGNALIZED,
        status=IntersectionStatus.ACTIVE,
        num_lanes=4,
        has_traffic_signal=True,
        municipality="New York City"
    )


@pytest.fixture
def sample_camera(sample_intersection):
    """Create sample camera for testing."""
    return Camera(
        camera_id="CAM-001",
        intersection_id="INT-001",
        name="Main Street Northbound Camera",
        location_lat=40.7129,
        location_lon=-74.0061,
        status=CameraStatus.ONLINE,
        resolution=CameraResolution.FULL_HD_1080P,
        fps=30
    )


@pytest.fixture
def sample_vehicle_detections():
    """Create sample vehicle detections for testing."""
    return [
        VehicleDetection(
            detection_id="DET-001",
            frame_id="FRM-001",
            camera_id="CAM-001",
            intersection_id="INT-001",
            vehicle_type=VehicleType.CAR,
            confidence=0.95,
            confidence_level=DetectionConfidence.HIGH,
            bbox_x_min=0.25,
            bbox_y_min=0.30,
            bbox_x_max=0.45,
            bbox_y_max=0.60,
            speed_kmh=45.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ),
        VehicleDetection(
            detection_id="DET-002",
            frame_id="FRM-001",
            camera_id="CAM-001",
            intersection_id="INT-001",
            vehicle_type=VehicleType.TRUCK,
            confidence=0.90,
            confidence_level=DetectionConfidence.HIGH,
            bbox_x_min=0.50,
            bbox_y_min=0.30,
            bbox_x_max=0.70,
            bbox_y_max=0.60,
            speed_kmh=35.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ),
        VehicleDetection(
            detection_id="DET-003",
            frame_id="FRM-001",
            camera_id="CAM-001",
            intersection_id="INT-001",
            vehicle_type=VehicleType.CAR,
            confidence=0.85,
            confidence_level=DetectionConfidence.MEDIUM,
            bbox_x_min=0.75,
            bbox_y_min=0.30,
            bbox_x_max=0.95,
            bbox_y_max=0.60,
            speed_kmh=3.0,  # Stopped vehicle
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        )
    ]


@pytest.fixture
def sample_traffic_signal():
    """Create sample traffic signal for testing."""
    return TrafficSignal(
        signal_id="SIG-001-NB",
        intersection_id="INT-001",
        direction=SignalDirection.NORTHBOUND,
        current_phase=SignalPhase.GREEN,
        phase_start_time=datetime.now(UTC),
        time_in_phase_seconds=25,
        time_until_change_seconds=35,
        cycle_time_seconds=120,
        green_time_seconds=60,
        yellow_time_seconds=5,
        red_time_seconds=55
    )


@pytest.fixture
def sample_request(sample_intersection, sample_camera, sample_vehicle_detections, sample_traffic_signal):
    """Create complete sample request for testing."""
    return TrafficAnalysisRequest(
        intersection=sample_intersection,
        camera=sample_camera,
        vehicle_detections=sample_vehicle_detections,
        traffic_signal=sample_traffic_signal,
        lane_count=4,
        lane_length_meters=100.0,
        free_flow_speed_kmh=60.0,
        capacity_vehicles_per_hour=1800
    )


class TestTrafficAnalysisService:
    """Tests for TrafficAnalysisService pipeline."""
    
    def test_service_initialization(self):
        """Test service can be initialized."""
        service = TrafficAnalysisService()
        assert service is not None
    
    def test_complete_analysis_pipeline(self, sample_request):
        """Test complete analysis pipeline from request to response."""
        service = TrafficAnalysisService()
        result = service.analyze(sample_request)
        
        # Verify response structure
        assert isinstance(result, TrafficAnalysisResult)
        assert result.queue_length_meters >= 0
        assert result.vehicle_density_vehicles_per_km >= 0
        assert result.average_speed_kmh >= 0
        assert 0 <= result.occupancy_rate <= 1
        assert 0 <= result.congestion_score <= 1
        assert isinstance(result.level_of_service, LevelOfService)
        assert 0 <= result.risk_score <= 1
        assert result.congestion_explanation
        assert result.los_explanation
        assert isinstance(result.risk_factors, list)
        assert result.total_vehicles_analyzed == len(sample_request.vehicle_detections)
    
    def test_analysis_with_no_vehicles(self, sample_intersection, sample_camera):
        """Test analysis with no vehicle detections."""
        request = TrafficAnalysisRequest(
            intersection=sample_intersection,
            camera=sample_camera,
            vehicle_detections=[],
            traffic_signal=None,
            lane_count=4,
            lane_length_meters=100.0,
            free_flow_speed_kmh=60.0,
            capacity_vehicles_per_hour=1800
        )
        
        service = TrafficAnalysisService()
        result = service.analyze(request)
        
        assert result.queue_length_meters == 0.0
        assert result.vehicle_density_vehicles_per_km == 0.0
        assert result.average_speed_kmh == 0.0
        assert result.occupancy_rate == 0.0
        assert result.total_vehicles_analyzed == 0
    
    def test_analysis_with_free_flow_conditions(self, sample_intersection, sample_camera):
        """Test analysis with free flow traffic conditions."""
        # Create high-speed detections with lower density for better LOS
        detections = [
            VehicleDetection(
                detection_id=f"DET-{i}",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.25,
                bbox_y_min=0.30,
                bbox_x_max=0.45,
                bbox_y_max=0.60,
                speed_kmh=55.0 + (i % 10),  # High speeds
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ) for i in range(5)  # Fewer vehicles for lower density
        ]
        
        request = TrafficAnalysisRequest(
            intersection=sample_intersection,
            camera=sample_camera,
            vehicle_detections=detections,
            traffic_signal=None,
            lane_count=4,
            lane_length_meters=100.0,
            free_flow_speed_kmh=60.0,
            capacity_vehicles_per_hour=1800
        )
        
        service = TrafficAnalysisService()
        result = service.analyze(request)
        
        # Free flow should result in low congestion, good LOS
        assert result.congestion_score < 0.3
        assert result.level_of_service in [LevelOfService.LOS_A, LevelOfService.LOS_B, LevelOfService.LOS_C]
        assert result.risk_score < 0.3
    
    def test_analysis_with_congested_conditions(self, sample_intersection, sample_camera):
        """Test analysis with congested traffic conditions."""
        # Create many stopped/slow vehicles
        detections = [
            VehicleDetection(
                detection_id=f"DET-{i}",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.25,
                bbox_y_min=0.30,
                bbox_x_max=0.45,
                bbox_y_max=0.60,
                speed_kmh=3.0 if i % 2 == 0 else 8.0,  # Many stopped/slow vehicles
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ) for i in range(50)
        ]
        
        request = TrafficAnalysisRequest(
            intersection=sample_intersection,
            camera=sample_camera,
            vehicle_detections=detections,
            traffic_signal=None,
            lane_count=4,
            lane_length_meters=100.0,
            free_flow_speed_kmh=60.0,
            capacity_vehicles_per_hour=1800
        )
        
        service = TrafficAnalysisService()
        result = service.analyze(request)
        
        # Congested conditions should result in high congestion, poor LOS
        assert result.congestion_score > 0.5
        assert result.level_of_service in [LevelOfService.LOS_D, LevelOfService.LOS_E, LevelOfService.LOS_F]
        assert result.risk_score > 0.4
    
    def test_analysis_with_emergency_vehicle(self, sample_intersection, sample_camera):
        """Test analysis with emergency vehicle present."""
        detections = [
            VehicleDetection(
                detection_id="DET-001",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.EMERGENCY,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.25,
                bbox_y_min=0.30,
                bbox_x_max=0.45,
                bbox_y_max=0.60,
                speed_kmh=60.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ),
            VehicleDetection(
                detection_id="DET-002",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.90,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.50,
                bbox_y_min=0.30,
                bbox_x_max=0.70,
                bbox_y_max=0.60,
                speed_kmh=40.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
        ]
        
        request = TrafficAnalysisRequest(
            intersection=sample_intersection,
            camera=sample_camera,
            vehicle_detections=detections,
            traffic_signal=None,
            lane_count=4,
            lane_length_meters=100.0,
            free_flow_speed_kmh=60.0,
            capacity_vehicles_per_hour=1800
        )
        
        service = TrafficAnalysisService()
        result = service.analyze(request)
        
        # Emergency vehicle should be identified as a risk factor
        assert "Emergency vehicle presence" in result.risk_factors
    
    def test_explanatory_outputs_are_generated(self, sample_request):
        """Test that explanatory outputs are generated."""
        service = TrafficAnalysisService()
        result = service.analyze(sample_request)
        
        assert result.congestion_explanation
        assert len(result.congestion_explanation) > 0
        assert result.los_explanation
        assert len(result.los_explanation) > 0
        assert isinstance(result.risk_factors, list)
    
    def test_different_lane_counts(self, sample_intersection, sample_camera, sample_vehicle_detections):
        """Test analysis with different lane counts."""
        for lane_count in [2, 4, 6]:
            request = TrafficAnalysisRequest(
                intersection=sample_intersection,
                camera=sample_camera,
                vehicle_detections=sample_vehicle_detections,
                traffic_signal=None,
                lane_count=lane_count,
                lane_length_meters=100.0,
                free_flow_speed_kmh=60.0,
                capacity_vehicles_per_hour=1800
            )
            
            service = TrafficAnalysisService()
            result = service.analyze(request)
            
            # Verify analysis completes successfully
            assert isinstance(result, TrafficAnalysisResult)
            assert result.total_vehicles_analyzed == len(sample_vehicle_detections)
    
    def test_different_free_flow_speeds(self, sample_intersection, sample_camera, sample_vehicle_detections):
        """Test analysis with different free flow speeds."""
        for free_flow_speed in [40.0, 60.0, 80.0]:
            request = TrafficAnalysisRequest(
                intersection=sample_intersection,
                camera=sample_camera,
                vehicle_detections=sample_vehicle_detections,
                traffic_signal=None,
                lane_count=4,
                lane_length_meters=100.0,
                free_flow_speed_kmh=free_flow_speed,
                capacity_vehicles_per_hour=1800
            )
            
            service = TrafficAnalysisService()
            result = service.analyze(request)
            
            # Verify analysis completes successfully
            assert isinstance(result, TrafficAnalysisResult)
