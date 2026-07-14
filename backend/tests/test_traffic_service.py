"""
Tests for app.services.traffic_service.TrafficAnalysisService.

This is the MVP mock-based traffic analysis service. Tests cover the full
analyze_traffic pipeline as well as the deterministic helper methods for
congestion classification and risk scoring.
"""

import pytest

from app.schemas.traffic import (
    TrafficAnalysisRequest,
    TrafficAnalysisResponse,
    TrafficMetrics,
    VehicleCount,
    VehicleType,
    CongestionLevel,
    SignalState,
)
from app.services.traffic_service import TrafficAnalysisService


@pytest.fixture
def service():
    return TrafficAnalysisService()


def _metrics(density, speed=30.0, queue=50.0):
    return TrafficMetrics(
        total_vehicles=50,
        vehicle_counts=[VehicleCount(vehicle_type=VehicleType.CAR, count=50)],
        average_speed_kmh=speed,
        queue_length_meters=queue,
        density_vehicles_per_km=density,
        occupancy_rate=0.5,
    )


class TestAnalyzeTraffic:
    """Tests for the analyze_traffic pipeline."""

    def test_returns_response(self, service):
        request = TrafficAnalysisRequest(intersection_id="INT-001")
        result = service.analyze_traffic(request)

        assert isinstance(result, TrafficAnalysisResponse)
        assert result.intersection_id == "INT-001"

    def test_response_fields_valid(self, service):
        request = TrafficAnalysisRequest(intersection_id="INT-042", camera_id="CAM-1")
        result = service.analyze_traffic(request)

        assert isinstance(result.congestion_level, CongestionLevel)
        assert isinstance(result.metrics, TrafficMetrics)
        assert isinstance(result.signal_state, SignalState)
        assert 0.0 <= result.risk_score <= 1.0
        assert result.analysis_timestamp.tzinfo is not None

    def test_intersection_id_propagated(self, service):
        result = service.analyze_traffic(TrafficAnalysisRequest(intersection_id="XYZ"))
        assert result.intersection_id == "XYZ"


class TestGenerateMockMetrics:
    """Tests for _generate_mock_metrics."""

    def test_metrics_ranges(self, service):
        metrics = service._generate_mock_metrics()

        assert 20 <= metrics.total_vehicles <= 100
        assert 10 <= metrics.average_speed_kmh <= 60
        assert 10 <= metrics.queue_length_meters <= 150
        assert 50 <= metrics.density_vehicles_per_km <= 200
        assert 0.2 <= metrics.occupancy_rate <= 0.9

    def test_vehicle_count_breakdown(self, service):
        metrics = service._generate_mock_metrics()
        types = {vc.vehicle_type for vc in metrics.vehicle_counts}
        assert VehicleType.CAR in types
        assert VehicleType.MOTORCYCLE in types
        assert len(metrics.vehicle_counts) == 5


class TestCalculateCongestionLevel:
    """Tests for _calculate_congestion_level thresholds."""

    @pytest.mark.parametrize(
        "density,expected",
        [
            (50, CongestionLevel.LOW),
            (79, CongestionLevel.LOW),
            (80, CongestionLevel.MODERATE),
            (119, CongestionLevel.MODERATE),
            (120, CongestionLevel.HIGH),
            (159, CongestionLevel.HIGH),
            (160, CongestionLevel.SEVERE),
            (200, CongestionLevel.SEVERE),
        ],
    )
    def test_thresholds(self, service, density, expected):
        assert service._calculate_congestion_level(_metrics(density)) == expected


class TestCalculateRiskScore:
    """Tests for _calculate_risk_score."""

    def test_base_scores_increase_with_congestion(self, service):
        metrics = _metrics(density=100, speed=30.0, queue=0.0)
        low = service._calculate_risk_score(metrics, CongestionLevel.LOW)
        moderate = service._calculate_risk_score(metrics, CongestionLevel.MODERATE)
        high = service._calculate_risk_score(metrics, CongestionLevel.HIGH)
        severe = service._calculate_risk_score(metrics, CongestionLevel.SEVERE)
        assert low < moderate < high < severe

    def test_score_clamped_to_one(self, service):
        metrics = _metrics(density=200, speed=0.0, queue=1000.0)
        score = service._calculate_risk_score(metrics, CongestionLevel.SEVERE)
        assert score == 1.0

    def test_low_speed_increases_risk(self, service):
        fast = _metrics(density=100, speed=60.0, queue=0.0)
        slow = _metrics(density=100, speed=0.0, queue=0.0)
        assert service._calculate_risk_score(
            slow, CongestionLevel.LOW
        ) > service._calculate_risk_score(fast, CongestionLevel.LOW)

    def test_longer_queue_increases_risk(self, service):
        short = _metrics(density=100, speed=30.0, queue=0.0)
        long = _metrics(density=100, speed=30.0, queue=100.0)
        assert service._calculate_risk_score(
            long, CongestionLevel.LOW
        ) > service._calculate_risk_score(short, CongestionLevel.LOW)

    def test_score_within_bounds(self, service):
        metrics = _metrics(density=100, speed=25.0, queue=60.0)
        score = service._calculate_risk_score(metrics, CongestionLevel.MODERATE)
        assert 0.0 <= score <= 1.0


class TestGenerateMockSignalState:
    """Tests for _generate_mock_signal_state."""

    def test_signal_state_valid(self, service):
        state = service._generate_mock_signal_state()
        assert state.phase in {"green", "yellow", "red"}
        assert 5 <= state.time_until_change_seconds <= 60
        assert 90 <= state.cycle_time_seconds <= 180
