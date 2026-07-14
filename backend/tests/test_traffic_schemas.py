"""
Tests for app.schemas.traffic Pydantic schemas and enums.

Verifies enum values, field validation, defaults, and serialization for the
traffic analysis request/response models.
"""

import pytest
from datetime import datetime, UTC
from pydantic import ValidationError

from app.schemas.traffic import (
    CongestionLevel,
    VehicleType,
    TrafficAnalysisRequest,
    VehicleCount,
    TrafficMetrics,
    SignalState,
    TrafficAnalysisResponse,
)


class TestEnums:
    """Tests for schema enums."""

    def test_congestion_level_values(self):
        assert CongestionLevel.LOW == "low"
        assert CongestionLevel.MODERATE == "moderate"
        assert CongestionLevel.HIGH == "high"
        assert CongestionLevel.SEVERE == "severe"
        assert len(CongestionLevel) == 4

    def test_vehicle_type_values(self):
        assert VehicleType.CAR == "car"
        assert VehicleType.TRUCK == "truck"
        assert VehicleType.BUS == "bus"
        assert VehicleType.MOTORCYCLE == "motorcycle"
        assert VehicleType.BICYCLE == "bicycle"
        assert VehicleType.EMERGENCY == "emergency"
        assert len(VehicleType) == 6

    def test_enum_is_string(self):
        assert isinstance(CongestionLevel.LOW, str)
        assert isinstance(VehicleType.CAR, str)


class TestTrafficAnalysisRequest:
    """Tests for TrafficAnalysisRequest model."""

    def test_minimal_request(self):
        request = TrafficAnalysisRequest(intersection_id="INT-001")
        assert request.intersection_id == "INT-001"
        assert request.camera_id is None
        assert request.timestamp is None
        assert request.analysis_duration_seconds == 60

    def test_full_request(self):
        now = datetime.now(UTC)
        request = TrafficAnalysisRequest(
            intersection_id="INT-002",
            camera_id="CAM-002",
            timestamp=now,
            analysis_duration_seconds=120,
        )
        assert request.camera_id == "CAM-002"
        assert request.timestamp == now
        assert request.analysis_duration_seconds == 120

    def test_intersection_id_required(self):
        with pytest.raises(ValidationError):
            TrafficAnalysisRequest()

    def test_duration_below_minimum_rejected(self):
        with pytest.raises(ValidationError):
            TrafficAnalysisRequest(intersection_id="INT-001", analysis_duration_seconds=0)

    def test_duration_above_maximum_rejected(self):
        with pytest.raises(ValidationError):
            TrafficAnalysisRequest(intersection_id="INT-001", analysis_duration_seconds=3601)

    def test_duration_boundaries_accepted(self):
        assert TrafficAnalysisRequest(
            intersection_id="INT-001", analysis_duration_seconds=1
        ).analysis_duration_seconds == 1
        assert TrafficAnalysisRequest(
            intersection_id="INT-001", analysis_duration_seconds=3600
        ).analysis_duration_seconds == 3600


class TestVehicleCount:
    """Tests for VehicleCount model."""

    def test_valid_count(self):
        vc = VehicleCount(vehicle_type=VehicleType.CAR, count=10)
        assert vc.vehicle_type == VehicleType.CAR
        assert vc.count == 10

    def test_zero_count_allowed(self):
        assert VehicleCount(vehicle_type=VehicleType.BUS, count=0).count == 0

    def test_negative_count_rejected(self):
        with pytest.raises(ValidationError):
            VehicleCount(vehicle_type=VehicleType.CAR, count=-1)


class TestTrafficMetrics:
    """Tests for TrafficMetrics model."""

    def _valid_kwargs(self):
        return dict(
            total_vehicles=45,
            average_speed_kmh=25.5,
            queue_length_meters=45.0,
            density_vehicles_per_km=120.0,
            occupancy_rate=0.65,
        )

    def test_valid_metrics(self):
        metrics = TrafficMetrics(**self._valid_kwargs())
        assert metrics.total_vehicles == 45
        assert metrics.vehicle_counts == []

    def test_with_vehicle_counts(self):
        metrics = TrafficMetrics(
            vehicle_counts=[VehicleCount(vehicle_type=VehicleType.CAR, count=35)],
            **self._valid_kwargs(),
        )
        assert len(metrics.vehicle_counts) == 1
        assert metrics.vehicle_counts[0].count == 35

    def test_occupancy_rate_out_of_range_rejected(self):
        kwargs = self._valid_kwargs()
        kwargs["occupancy_rate"] = 1.5
        with pytest.raises(ValidationError):
            TrafficMetrics(**kwargs)

    def test_negative_speed_rejected(self):
        kwargs = self._valid_kwargs()
        kwargs["average_speed_kmh"] = -1.0
        with pytest.raises(ValidationError):
            TrafficMetrics(**kwargs)


class TestSignalState:
    """Tests for SignalState model."""

    def test_valid_signal_state(self):
        state = SignalState(
            phase="green", time_until_change_seconds=30, cycle_time_seconds=120
        )
        assert state.phase == "green"
        assert state.time_until_change_seconds == 30

    def test_negative_time_rejected(self):
        with pytest.raises(ValidationError):
            SignalState(phase="red", time_until_change_seconds=-1, cycle_time_seconds=120)


class TestTrafficAnalysisResponse:
    """Tests for TrafficAnalysisResponse model."""

    def _metrics(self):
        return TrafficMetrics(
            total_vehicles=45,
            vehicle_counts=[VehicleCount(vehicle_type=VehicleType.CAR, count=45)],
            average_speed_kmh=25.5,
            queue_length_meters=45.0,
            density_vehicles_per_km=120.0,
            occupancy_rate=0.65,
        )

    def test_valid_response(self):
        response = TrafficAnalysisResponse(
            intersection_id="INT-001",
            analysis_timestamp=datetime.now(UTC),
            congestion_level=CongestionLevel.MODERATE,
            metrics=self._metrics(),
            signal_state=SignalState(
                phase="green", time_until_change_seconds=30, cycle_time_seconds=120
            ),
            risk_score=0.45,
        )
        assert response.intersection_id == "INT-001"
        assert response.congestion_level == CongestionLevel.MODERATE
        assert response.signal_state is not None

    def test_signal_state_optional(self):
        response = TrafficAnalysisResponse(
            intersection_id="INT-001",
            analysis_timestamp=datetime.now(UTC),
            congestion_level=CongestionLevel.LOW,
            metrics=self._metrics(),
            risk_score=0.1,
        )
        assert response.signal_state is None

    def test_risk_score_out_of_range_rejected(self):
        with pytest.raises(ValidationError):
            TrafficAnalysisResponse(
                intersection_id="INT-001",
                analysis_timestamp=datetime.now(UTC),
                congestion_level=CongestionLevel.LOW,
                metrics=self._metrics(),
                risk_score=1.5,
            )

    def test_serialization_round_trip(self):
        response = TrafficAnalysisResponse(
            intersection_id="INT-001",
            analysis_timestamp=datetime.now(UTC),
            congestion_level=CongestionLevel.HIGH,
            metrics=self._metrics(),
            risk_score=0.7,
        )
        dumped = response.model_dump()
        assert dumped["intersection_id"] == "INT-001"
        assert dumped["congestion_level"] == "high"
        restored = TrafficAnalysisResponse.model_validate(dumped)
        assert restored == response
