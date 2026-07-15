"""
Deterministic traffic analysis algorithms.

All algorithms are based on standard traffic engineering principles
from the Highway Capacity Manual (HCM) and Transportation Research Board (TRB).
No AI, no ML, no LLM - pure deterministic calculations.
"""

from typing import List
from app.models.vehicle_detection import VehicleDetection
from app.schemas.traffic_analysis import LevelOfService


def calculate_queue_length(
    vehicle_detections: List[VehicleDetection],
    lane_length_meters: float,
    lane_count: int
) -> float:
    """
    Calculate queue length based on stopped vehicles.
    
    Algorithm:
    1. Count vehicles with speed < 5 km/h (considered stopped)
    2. Multiply by average vehicle spacing (7 meters)
    3. Normalize by lane count
    
    Formula: queue_length = (stopped_vehicles * 7) / lane_count
    
    Args:
        vehicle_detections: List of vehicle detections
        lane_length_meters: Length of lane in meters
        lane_count: Number of lanes
        
    Returns:
        Queue length in meters (capped at lane_length_meters)
    """
    if not vehicle_detections:
        return 0.0
    
    stopped_vehicles = sum(
        1 for v in vehicle_detections 
        if v.speed_kmh is not None and v.speed_kmh < 5.0
    )
    
    # Average vehicle spacing including safety distance
    avg_vehicle_spacing = 7.0  # meters
    
    queue_length = (stopped_vehicles * avg_vehicle_spacing) / lane_count
    
    return min(queue_length, lane_length_meters)


def calculate_vehicle_density(
    vehicle_detections: List[VehicleDetection],
    lane_length_meters: float,
    lane_count: int
) -> float:
    """
    Calculate vehicle density (vehicles per km).
    
    Algorithm:
    1. Count total vehicles in analysis window
    2. Calculate total road length (lanes * length)
    3. Density = vehicles / (road_length_km)
    
    Formula: density = total_vehicles / ((lane_count * lane_length_meters) / 1000)
    
    Args:
        vehicle_detections: List of vehicle detections
        lane_length_meters: Length of lane in meters
        lane_count: Number of lanes
        
    Returns:
        Vehicle density in vehicles per km
    """
    if not vehicle_detections:
        return 0.0
    
    total_vehicles = len(vehicle_detections)
    total_road_length_km = (lane_count * lane_length_meters) / 1000.0
    
    if total_road_length_km == 0:
        return 0.0
    
    density = total_vehicles / total_road_length_km
    return density


def calculate_average_speed(vehicle_detections: List[VehicleDetection]) -> float:
    """
    Calculate average speed of all vehicles.
    
    Algorithm:
    1. Filter vehicles with valid speed data (including stopped vehicles at 0 km/h)
    2. Calculate arithmetic mean
    
    Formula: avg_speed = sum(speeds) / count
    
    Args:
        vehicle_detections: List of vehicle detections
        
    Returns:
        Average speed in km/h (0 if no valid data)
    """
    if not vehicle_detections:
        return 0.0
    
    valid_speeds = [
        v.speed_kmh for v in vehicle_detections 
        if v.speed_kmh is not None
    ]
    
    if not valid_speeds:
        return 0.0
    
    return sum(valid_speeds) / len(valid_speeds)


def calculate_occupancy_rate(
    vehicle_detections: List[VehicleDetection],
    lane_count: int,
    capacity_vehicles_per_hour: int
) -> float:
    """
    Calculate lane occupancy rate based on capacity utilization.
    
    Algorithm:
    1. Calculate current flow rate (vehicles per hour)
    2. Occupancy = flow_rate / (capacity * lane_count)
    3. Cap at 1.0 (100%)
    
    Formula: occupancy = (vehicles_per_hour) / (capacity * lane_count)
    
    Note: This assumes a 1-minute analysis window for flow calculation.
    
    Args:
        vehicle_detections: List of vehicle detections
        lane_count: Number of lanes
        capacity_vehicles_per_hour: Capacity per lane in vehicles/hour
        
    Returns:
        Occupancy rate (0-1)
    """
    if not vehicle_detections:
        return 0.0
    
    # Assuming 1-minute analysis window, extrapolate to hourly rate
    vehicles_per_minute = len(vehicle_detections)
    vehicles_per_hour = vehicles_per_minute * 60
    
    total_capacity = capacity_vehicles_per_hour * lane_count
    
    if total_capacity == 0:
        return 0.0
    
    occupancy = vehicles_per_hour / total_capacity
    return min(occupancy, 1.0)


def calculate_congestion_score(
    density: float,
    speed: float,
    free_flow_speed: float,
    queue_length: float,
    lane_length_meters: float
) -> float:
    """
    Calculate congestion severity score (0-1, higher is worse).
    
    Algorithm:
    1. Speed factor: (1 - speed/free_flow_speed)
    2. Density factor: normalized density (0-1 scale, >150 veh/km = 1)
    3. Queue factor: queue_length / lane_length
    4. Weighted average: 0.4*speed + 0.3*density + 0.3*queue
    
    Formula:
        speed_factor = max(0, 1 - speed/free_flow_speed)
        density_factor = min(1, density / 150)
        queue_factor = queue_length / lane_length_meters
        congestion = 0.4*speed_factor + 0.3*density_factor + 0.3*queue_factor
    
    Args:
        density: Vehicle density in vehicles per km
        speed: Average speed in km/h
        free_flow_speed: Free flow speed in km/h
        queue_length: Queue length in meters
        lane_length_meters: Lane length in meters
        
    Returns:
        Congestion score (0-1)
    """
    if free_flow_speed == 0:
        speed_factor = 1.0
    else:
        speed_factor = max(0.0, 1.0 - (speed / free_flow_speed))
    
    # Density factor: 150 veh/km is considered high congestion
    density_factor = min(1.0, density / 150.0)
    
    # Queue factor
    queue_factor = queue_length / lane_length_meters if lane_length_meters > 0 else 0.0
    
    # Weighted combination
    congestion_score = (
        0.4 * speed_factor +
        0.3 * density_factor +
        0.3 * queue_factor
    )
    
    return min(congestion_score, 1.0)


def calculate_level_of_service(
    density: float,
    speed: float,
    free_flow_speed: float
) -> LevelOfService:
    """
    Calculate Highway Capacity Manual Level of Service (LOS).
    
    Algorithm based on HCM 6th Edition urban street LOS criteria:
    - LOS A: Free flow, speed > 90% of free flow, density < 7 veh/km/ln
    - LOS B: Reasonably free flow, speed > 70% of free flow, density < 12 veh/km/ln
    - LOS C: Stable flow, speed > 50% of free flow, density < 18 veh/km/ln
    - LOS D: Approaching unstable, speed > 40% of free flow, density < 26 veh/km/ln
    - LOS E: Unstable flow, speed > 30% of free flow, density < 35 veh/km/ln
    - LOS F: Forced flow, speed < 30% of free flow or density > 35 veh/km/ln
    
    Args:
        density: Vehicle density in vehicles per km
        speed: Average speed in km/h
        free_flow_speed: Free flow speed in km/h
        
    Returns:
        Level of Service rating
    """
    if free_flow_speed == 0:
        return LevelOfService.LOS_F
    
    speed_ratio = speed / free_flow_speed
    
    # LOS F: Forced flow
    if speed_ratio < 0.3 or density > 35:
        return LevelOfService.LOS_F
    
    # LOS E: Unstable flow
    if speed_ratio < 0.4 or density > 26:
        return LevelOfService.LOS_E
    
    # LOS D: Approaching unstable
    if speed_ratio < 0.5 or density > 18:
        return LevelOfService.LOS_D
    
    # LOS C: Stable flow
    if speed_ratio < 0.7 or density > 12:
        return LevelOfService.LOS_C
    
    # LOS B: Reasonably free flow
    if speed_ratio < 0.9 or density > 7:
        return LevelOfService.LOS_B
    
    # LOS A: Free flow
    return LevelOfService.LOS_A


def calculate_risk_score(
    congestion_score: float,
    queue_length: float,
    stopped_vehicle_ratio: float,
    emergency_vehicles: int
) -> float:
    """
    Calculate operational risk score (0-1, higher is worse).
    
    Algorithm:
    1. Congestion risk: congestion_score * 0.5
    2. Queue risk: normalized queue length * 0.3
    3. Stopped vehicle risk: stopped_ratio * 0.15
    4. Emergency vehicle impact: emergency_count * 0.05
    
    Formula:
        queue_risk = min(1, queue_length / 100)
        risk = 0.5*congestion + 0.3*queue_risk + 0.15*stopped_ratio + 0.05*emergency_vehicles
    
    Args:
        congestion_score: Congestion score (0-1)
        queue_length: Queue length in meters
        stopped_vehicle_ratio: Ratio of stopped vehicles (0-1)
        emergency_vehicles: Count of emergency vehicles
        
    Returns:
        Risk score (0-1)
    """
    # Queue risk: 100m queue is high risk
    queue_risk = min(1.0, queue_length / 100.0)
    
    # Emergency vehicle impact
    emergency_risk = min(1.0, emergency_vehicles * 0.2)
    
    risk_score = (
        0.5 * congestion_score +
        0.3 * queue_risk +
        0.15 * stopped_vehicle_ratio +
        0.05 * emergency_risk
    )
    
    return min(risk_score, 1.0)


def calculate_stopped_vehicle_ratio(vehicle_detections: List[VehicleDetection]) -> float:
    """
    Calculate ratio of stopped vehicles.
    
    Algorithm:
    1. Count vehicles with speed < 5 km/h
    2. Divide by total vehicles
    
    Formula: stopped_ratio = stopped_vehicles / total_vehicles
    
    Args:
        vehicle_detections: List of vehicle detections
        
    Returns:
        Stopped vehicle ratio (0-1)
    """
    if not vehicle_detections:
        return 0.0
    
    stopped_vehicles = sum(
        1 for v in vehicle_detections 
        if v.speed_kmh is not None and v.speed_kmh < 5.0
    )
    
    return stopped_vehicles / len(vehicle_detections)


def count_emergency_vehicles(vehicle_detections: List[VehicleDetection]) -> int:
    """
    Count emergency vehicles in detections.
    
    Args:
        vehicle_detections: List of vehicle detections
        
    Returns:
        Count of emergency vehicles
    """
    return sum(
        1 for v in vehicle_detections 
        if v.vehicle_type.value == "emergency"
    )


def generate_congestion_explanation(
    congestion_score: float,
    density: float,
    speed: float,
    queue_length: float
) -> str:
    """
    Generate human-readable congestion explanation.
    
    Args:
        congestion_score: Congestion score (0-1)
        density: Vehicle density in vehicles per km
        speed: Average speed in km/h
        queue_length: Queue length in meters
        
    Returns:
        Human-readable explanation string
    """
    if congestion_score < 0.2:
        return "Free flow conditions with minimal congestion"
    elif congestion_score < 0.4:
        return f"Light congestion due to moderate vehicle density ({density:.1f} veh/km)"
    elif congestion_score < 0.6:
        return f"Moderate congestion with reduced speeds ({speed:.1f} km/h) and increased density"
    elif congestion_score < 0.8:
        return f"Heavy congestion caused by high density ({density:.1f} veh/km) and significant queue ({queue_length:.1f}m)"
    else:
        return f"Severe congestion with very high density, low speeds, and extensive queuing"


def generate_los_explanation(los: LevelOfService) -> str:
    """
    Generate human-readable LOS explanation.
    
    Args:
        los: Level of Service rating
        
    Returns:
        Human-readable explanation string
    """
    explanations = {
        LevelOfService.LOS_A: "Free flow with minimal delays and high speeds",
        LevelOfService.LOS_B: "Reasonably free flow with slight speed reductions",
        LevelOfService.LOS_C: "Stable flow with acceptable speeds and maneuverability",
        LevelOfService.LOS_D: "Approaching unstable flow with reduced speeds and freedom",
        LevelOfService.LOS_E: "Unstable flow with significant delays and breakdown potential",
        LevelOfService.LOS_F: "Forced flow with severe congestion and breakdown conditions"
    }
    return explanations.get(los, "Unknown LOS category")


def identify_risk_factors(
    congestion_score: float,
    queue_length: float,
    stopped_ratio: float,
    emergency_count: int
) -> List[str]:
    """
    Identify risk factors based on analysis metrics.
    
    Args:
        congestion_score: Congestion score (0-1)
        queue_length: Queue length in meters
        stopped_ratio: Stopped vehicle ratio (0-1)
        emergency_count: Emergency vehicle count
        
    Returns:
        List of identified risk factors
    """
    risk_factors = []
    
    if congestion_score > 0.7:
        risk_factors.append("High congestion")
    if queue_length > 50:
        risk_factors.append("Long queue")
    if stopped_ratio > 0.5:
        risk_factors.append("High stopped vehicle ratio")
    if emergency_count > 0:
        risk_factors.append("Emergency vehicle presence")
    
    return risk_factors
