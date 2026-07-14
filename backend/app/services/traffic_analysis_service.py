"""
Traffic Analysis Service - Complete Pipeline

This service orchestrates the complete traffic analysis pipeline:
Request → Validation → TrafficAnalysisService → TrafficMetrics → CongestionAnalysis → Response

All calculations use deterministic algorithms based on traffic engineering principles.
No AI, no ML, no LLM - pure deterministic calculations.
"""

from typing import List
from app.schemas.traffic_analysis import (
    TrafficAnalysisRequest,
    TrafficAnalysisResult,
    LevelOfService
)
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


class TrafficAnalysisService:
    """Service for comprehensive traffic analysis using deterministic algorithms."""
    
    def analyze(self, request: TrafficAnalysisRequest) -> TrafficAnalysisResult:
        """
        Execute complete traffic analysis pipeline.
        
        Pipeline:
        1. Extract vehicle detections from request
        2. Calculate basic metrics (queue, density, speed, occupancy)
        3. Calculate advanced metrics (congestion, LOS, risk)
        4. Generate explanatory outputs
        5. Return structured result
        
        Args:
            request: TrafficAnalysisRequest with domain entities and parameters
            
        Returns:
            TrafficAnalysisResult with all calculated metrics and explanations
        """
        vehicle_detections = request.vehicle_detections
        lane_count = request.lane_count
        lane_length = request.lane_length_meters
        free_flow_speed = request.free_flow_speed_kmh
        capacity = request.capacity_vehicles_per_hour
        
        # Step 1: Calculate basic metrics
        queue_length = calculate_queue_length(
            vehicle_detections, lane_length, lane_count
        )
        
        density = calculate_vehicle_density(
            vehicle_detections, lane_length, lane_count
        )
        
        average_speed = calculate_average_speed(vehicle_detections)
        
        occupancy = calculate_occupancy_rate(
            vehicle_detections, lane_count, capacity
        )
        
        # Step 2: Calculate advanced metrics
        congestion_score = calculate_congestion_score(
            density, average_speed, free_flow_speed, queue_length, lane_length
        )
        
        los = calculate_level_of_service(density, average_speed, free_flow_speed)
        
        stopped_ratio = calculate_stopped_vehicle_ratio(vehicle_detections)
        emergency_count = count_emergency_vehicles(vehicle_detections)
        
        risk_score = calculate_risk_score(
            congestion_score, queue_length, stopped_ratio, emergency_count
        )
        
        # Step 3: Generate explanatory outputs
        congestion_explanation = generate_congestion_explanation(
            congestion_score, density, average_speed, queue_length
        )
        
        los_explanation = generate_los_explanation(los)
        
        risk_factors = identify_risk_factors(
            congestion_score, queue_length, stopped_ratio, emergency_count
        )
        
        # Step 4: Return structured result
        return TrafficAnalysisResult(
            queue_length_meters=queue_length,
            vehicle_density_vehicles_per_km=density,
            average_speed_kmh=average_speed,
            occupancy_rate=occupancy,
            congestion_score=congestion_score,
            level_of_service=los,
            risk_score=risk_score,
            congestion_explanation=congestion_explanation,
            los_explanation=los_explanation,
            risk_factors=risk_factors,
            total_vehicles_analyzed=len(vehicle_detections)
        )
