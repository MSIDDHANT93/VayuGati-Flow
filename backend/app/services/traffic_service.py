from datetime import datetime, UTC
from typing import Optional
import random

from app.schemas.traffic import (
    TrafficAnalysisRequest,
    TrafficAnalysisResponse,
    TrafficMetrics,
    VehicleCount,
    VehicleType,
    CongestionLevel,
    SignalState
)


class TrafficAnalysisService:
    """Service for traffic analysis operations."""
    
    def analyze_traffic(self, request: TrafficAnalysisRequest) -> TrafficAnalysisResponse:
        """
        Analyze traffic for a given intersection.
        
        Currently returns mock data for MVP foundation.
        Future: Integrate computer vision and AI agents.
        """
        # Generate mock traffic metrics
        metrics = self._generate_mock_metrics()
        
        # Determine congestion level based on metrics
        congestion_level = self._calculate_congestion_level(metrics)
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(metrics, congestion_level)
        
        # Generate mock signal state
        signal_state = self._generate_mock_signal_state()
        
        return TrafficAnalysisResponse(
            intersection_id=request.intersection_id,
            analysis_timestamp=datetime.now(UTC),
            congestion_level=congestion_level,
            metrics=metrics,
            signal_state=signal_state,
            risk_score=risk_score
        )
    
    def _generate_mock_metrics(self) -> TrafficMetrics:
        """Generate mock traffic metrics for testing."""
        total_vehicles = random.randint(20, 100)
        
        vehicle_counts = [
            VehicleCount(vehicle_type=VehicleType.CAR, count=int(total_vehicles * 0.7)),
            VehicleCount(vehicle_type=VehicleType.MOTORCYCLE, count=int(total_vehicles * 0.2)),
            VehicleCount(vehicle_type=VehicleType.TRUCK, count=int(total_vehicles * 0.05)),
            VehicleCount(vehicle_type=VehicleType.BUS, count=int(total_vehicles * 0.03)),
            VehicleCount(vehicle_type=VehicleType.BICYCLE, count=int(total_vehicles * 0.02)),
        ]
        
        return TrafficMetrics(
            total_vehicles=total_vehicles,
            vehicle_counts=vehicle_counts,
            average_speed_kmh=random.uniform(10, 60),
            queue_length_meters=random.uniform(10, 150),
            density_vehicles_per_km=random.uniform(50, 200),
            occupancy_rate=random.uniform(0.2, 0.9)
        )
    
    def _calculate_congestion_level(self, metrics: TrafficMetrics) -> CongestionLevel:
        """Calculate congestion level based on metrics."""
        if metrics.density_vehicles_per_km < 80:
            return CongestionLevel.LOW
        elif metrics.density_vehicles_per_km < 120:
            return CongestionLevel.MODERATE
        elif metrics.density_vehicles_per_km < 160:
            return CongestionLevel.HIGH
        else:
            return CongestionLevel.SEVERE
    
    def _calculate_risk_score(self, metrics: TrafficMetrics, congestion_level: CongestionLevel) -> float:
        """Calculate risk score (0-1, higher is worse)."""
        base_score = {
            CongestionLevel.LOW: 0.1,
            CongestionLevel.MODERATE: 0.4,
            CongestionLevel.HIGH: 0.7,
            CongestionLevel.SEVERE: 0.9
        }[congestion_level]
        
        # Adjust based on queue length and speed
        speed_factor = max(0, (30 - metrics.average_speed_kmh) / 30)
        queue_factor = min(1, metrics.queue_length_meters / 100)
        
        return min(1.0, base_score + (speed_factor * 0.2) + (queue_factor * 0.1))
    
    def _generate_mock_signal_state(self) -> SignalState:
        """Generate mock signal state."""
        phases = ["green", "yellow", "red"]
        return SignalState(
            phase=random.choice(phases),
            time_until_change_seconds=random.randint(5, 60),
            cycle_time_seconds=random.randint(90, 180)
        )
