"""
Tests for deterministic traffic analysis algorithms.

All tests verify the mathematical correctness of algorithms
based on documented formulas and edge cases.
"""

import pytest
from datetime import datetime, UTC
from app.models.vehicle_detection import VehicleDetection, VehicleType, DetectionConfidence
from app.schemas.traffic_analysis import LevelOfService
from app.utils.traffic_algorithms import (
    calculate_queue_length,
    calculate_vehicle_density,
    calculate_average_speed,
    calculate_occupancy_rate,
    calculate_congestion_score,
    calculate_level_of_service,
    calculate_risk_score,
    calculate_stopped_vehicle_ratio,
    count_emergency_vehicles,
    generate_congestion_explanation,
    generate_los_explanation,
    identify_risk_factors
)


@pytest.fixture
def sample_detections():
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


class TestQueueLengthCalculation:
    """Tests for queue length calculation algorithm."""
    
    def test_empty_detections(self):
        """Test queue length with no vehicles."""
        result = calculate_queue_length([], 100.0, 4)
        assert result == 0.0
    
    def test_no_stopped_vehicles(self):
        """Test queue length with no stopped vehicles."""
        detections = [
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
                speed_kmh=50.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
        ]
        result = calculate_queue_length(detections, 100.0, 2)
        assert result == 0.0
    
    def test_with_stopped_vehicles(self):
        """Test queue length with stopped vehicles."""
        detections = [
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
                speed_kmh=3.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ),
            VehicleDetection(
                detection_id="DET-002",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.50,
                bbox_y_min=0.30,
                bbox_x_max=0.70,
                bbox_y_max=0.60,
                speed_kmh=2.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
        ]
        result = calculate_queue_length(detections, 100.0, 2)
        # 2 stopped vehicles * 7m spacing / 2 lanes = 7m
        assert result == 7.0
    
    def test_queue_capped_at_lane_length(self):
        """Test that queue length is capped at lane length."""
        detections = [VehicleDetection(
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
            speed_kmh=0.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ) for _ in range(100)]
        
        result = calculate_queue_length(detections, 50.0, 1)
        assert result == 50.0  # Capped at lane length


class TestVehicleDensityCalculation:
    """Tests for vehicle density calculation algorithm."""
    
    def test_empty_detections(self):
        """Test density with no vehicles."""
        result = calculate_vehicle_density([], 100.0, 4)
        assert result == 0.0
    
    def test_normal_density(self):
        """Test density calculation with normal conditions."""
        detections = [VehicleDetection(
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
            speed_kmh=50.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ) for i in range(20)]
        
        result = calculate_vehicle_density(detections, 100.0, 4)
        # 20 vehicles / (4 lanes * 0.1 km) = 50 veh/km
        assert result == 50.0
    
    def test_high_density(self):
        """Test density calculation with high vehicle count."""
        detections = [VehicleDetection(
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
            speed_kmh=50.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ) for i in range(100)]
        
        result = calculate_vehicle_density(detections, 100.0, 4)
        # 100 vehicles / (4 lanes * 0.1 km) = 250 veh/km
        assert result == 250.0


class TestAverageSpeedCalculation:
    """Tests for average speed calculation algorithm."""
    
    def test_empty_detections(self):
        """Test average speed with no vehicles."""
        result = calculate_average_speed([])
        assert result == 0.0
    
    def test_no_valid_speeds(self):
        """Test average speed with no valid speed data."""
        detections = [VehicleDetection(
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
            speed_kmh=None,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        )]
        result = calculate_average_speed(detections)
        assert result == 0.0
    
    def test_normal_speeds(self):
        """Test average speed calculation."""
        detections = [
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
                speed_kmh=40.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ),
            VehicleDetection(
                detection_id="DET-002",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.50,
                bbox_y_min=0.30,
                bbox_x_max=0.70,
                bbox_y_max=0.60,
                speed_kmh=50.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
        ]
        result = calculate_average_speed(detections)
        assert result == 45.0

    def test_includes_stopped_vehicles(self):
        """Regression: stopped vehicles (0 km/h) must be included in the average."""
        detections = [
            VehicleDetection(
                detection_id=f"DET-{i:03d}",
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
                speed_kmh=0.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
            for i in range(9)
        ] + [
            VehicleDetection(
                detection_id="DET-009",
                frame_id="FRM-001",
                camera_id="CAM-001",
                intersection_id="INT-001",
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.50,
                bbox_y_min=0.30,
                bbox_x_max=0.70,
                bbox_y_max=0.60,
                speed_kmh=60.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            )
        ]
        # 9 stopped (0 km/h) + 1 moving (60 km/h) -> 60/10 = 6.0, not 60.0
        result = calculate_average_speed(detections)
        assert result == 6.0


class TestOccupancyRateCalculation:
    """Tests for occupancy rate calculation algorithm."""
    
    def test_empty_detections(self):
        """Test occupancy with no vehicles."""
        result = calculate_occupancy_rate([], 4, 1800)
        assert result == 0.0
    
    def test_normal_occupancy(self):
        """Test occupancy calculation."""
        # 30 vehicles in 1 minute = 1800 vehicles/hour
        # Capacity: 4 lanes * 1800 = 7200 vehicles/hour
        # Occupancy: 1800 / 7200 = 0.25
        detections = [VehicleDetection(
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
            speed_kmh=50.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ) for i in range(30)]
        
        result = calculate_occupancy_rate(detections, 4, 1800)
        assert result == 0.25
    
    def test_occupancy_capped_at_one(self):
        """Test that occupancy is capped at 1.0."""
        # Very high vehicle count should cap at 1.0
        detections = [VehicleDetection(
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
            speed_kmh=50.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ) for i in range(200)]
        
        result = calculate_occupancy_rate(detections, 4, 1800)
        assert result == 1.0


class TestCongestionScoreCalculation:
    """Tests for congestion score calculation algorithm."""
    
    def test_free_flow_conditions(self):
        """Test congestion score with free flow conditions."""
        result = calculate_congestion_score(
            density=50.0,
            speed=60.0,
            free_flow_speed=60.0,
            queue_length=10.0,
            lane_length_meters=100.0
        )
        # Speed factor: 0, Density factor: 0.33, Queue factor: 0.1
        # Expected: 0.4*0 + 0.3*0.33 + 0.3*0.1 = 0.129
        assert 0.1 < result < 0.15
    
    def test_congested_conditions(self):
        """Test congestion score with congested conditions."""
        result = calculate_congestion_score(
            density=150.0,
            speed=20.0,
            free_flow_speed=60.0,
            queue_length=80.0,
            lane_length_meters=100.0
        )
        # Speed factor: 0.67, Density factor: 1.0, Queue factor: 0.8
        # Expected: 0.4*0.67 + 0.3*1.0 + 0.3*0.8 = 0.828
        assert 0.8 < result < 0.85
    
    def test_zero_free_flow_speed(self):
        """Test congestion score with zero free flow speed."""
        result = calculate_congestion_score(
            density=100.0,
            speed=30.0,
            free_flow_speed=0.0,
            queue_length=50.0,
            lane_length_meters=100.0
        )
        # Speed factor: 1.0, Density factor: 0.67, Queue factor: 0.5
        # Expected: 0.4*1.0 + 0.3*0.67 + 0.3*0.5 = 0.75
        assert result == 0.75


class TestLevelOfServiceCalculation:
    """Tests for LOS calculation algorithm."""
    
    def test_los_a_free_flow(self):
        """Test LOS A with free flow conditions."""
        result = calculate_level_of_service(
            density=5.0,
            speed=58.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_A
    
    def test_los_b_reasonably_free(self):
        """Test LOS B with reasonably free flow."""
        result = calculate_level_of_service(
            density=10.0,
            speed=45.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_B
    
    def test_los_c_stable(self):
        """Test LOS C with stable flow."""
        result = calculate_level_of_service(
            density=15.0,
            speed=35.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_C
    
    def test_los_d_approaching_unstable(self):
        """Test LOS D approaching unstable flow."""
        result = calculate_level_of_service(
            density=22.0,
            speed=25.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_D
    
    def test_los_e_unstable(self):
        """Test LOS E unstable flow."""
        result = calculate_level_of_service(
            density=30.0,
            speed=18.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_E
    
    def test_los_f_forced_flow(self):
        """Test LOS F forced flow."""
        result = calculate_level_of_service(
            density=40.0,
            speed=10.0,
            free_flow_speed=60.0
        )
        assert result == LevelOfService.LOS_F


class TestRiskScoreCalculation:
    """Tests for risk score calculation algorithm."""
    
    def test_low_risk(self):
        """Test risk score with low risk conditions."""
        result = calculate_risk_score(
            congestion_score=0.2,
            queue_length=10.0,
            stopped_vehicle_ratio=0.1,
            emergency_vehicles=0
        )
        assert 0.0 < result < 0.3
    
    def test_high_risk(self):
        """Test risk score with high risk conditions."""
        result = calculate_risk_score(
            congestion_score=0.8,
            queue_length=80.0,
            stopped_vehicle_ratio=0.7,
            emergency_vehicles=1
        )
        assert 0.7 < result < 1.0
    
    def test_emergency_vehicle_impact(self):
        """Test emergency vehicle impact on risk."""
        result_with_emergency = calculate_risk_score(
            congestion_score=0.5,
            queue_length=30.0,
            stopped_vehicle_ratio=0.3,
            emergency_vehicles=2
        )
        result_without_emergency = calculate_risk_score(
            congestion_score=0.5,
            queue_length=30.0,
            stopped_vehicle_ratio=0.3,
            emergency_vehicles=0
        )
        assert result_with_emergency > result_without_emergency


class TestSupportingFunctions:
    """Tests for supporting utility functions."""
    
    def test_stopped_vehicle_ratio(self, sample_detections):
        """Test stopped vehicle ratio calculation."""
        result = calculate_stopped_vehicle_ratio(sample_detections)
        # 1 stopped vehicle out of 3 = 0.33
        assert 0.3 < result < 0.35
    
    def test_count_emergency_vehicles(self, sample_detections):
        """Test emergency vehicle counting."""
        result = count_emergency_vehicles(sample_detections)
        assert result == 0
    
    def test_count_emergency_vehicles_with_emergency(self):
        """Test emergency vehicle counting with emergency vehicles."""
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
            )
        ]
        result = count_emergency_vehicles(detections)
        assert result == 1
    
    def test_congestion_explanation_generation(self):
        """Test congestion explanation generation."""
        explanation_low = generate_congestion_explanation(0.1, 30.0, 55.0, 5.0)
        assert "Free flow" in explanation_low
        
        explanation_high = generate_congestion_explanation(0.9, 180.0, 10.0, 95.0)
        assert "Severe" in explanation_high
    
    def test_los_explanation_generation(self):
        """Test LOS explanation generation."""
        explanation = generate_los_explanation(LevelOfService.LOS_A)
        assert "Free flow" in explanation
        
        explanation = generate_los_explanation(LevelOfService.LOS_F)
        assert "Forced flow" in explanation
    
    def test_risk_factor_identification(self):
        """Test risk factor identification."""
        factors = identify_risk_factors(0.8, 60.0, 0.6, 1)
        assert "High congestion" in factors
        assert "Long queue" in factors
        assert "Emergency vehicle presence" in factors
