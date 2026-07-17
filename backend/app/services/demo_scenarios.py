"""
Demo Scenarios for VayuGati Flow

Pre-configured scenarios demonstrating different traffic conditions
for end-to-end pipeline testing and demonstrations.
"""

from datetime import datetime, UTC
from app.models.vehicle_detection import VehicleDetection, VehicleType, DetectionConfidence
from app.models.intersection import Intersection, IntersectionType, IntersectionStatus
from app.models.camera import Camera, CameraStatus, CameraResolution


class DemoScenario:
    """Base class for demo scenarios."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Return vehicle detections for this scenario."""
        raise NotImplementedError


class MorningRushScenario(DemoScenario):
    """Morning rush hour scenario with high traffic volume."""
    
    def __init__(self):
        super().__init__(
            name="Morning Rush",
            description="High traffic volume during peak morning hours with moderate congestion"
        )
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Generate vehicle detections for morning rush."""
        detections = []
        
        # Many cars with moderate speeds
        for i in range(40):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.92,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.1 + (i % 10) * 0.08,
                bbox_y_min=0.3 + (i // 10) * 0.15,
                bbox_x_max=0.2 + (i % 10) * 0.08,
                bbox_y_max=0.5 + (i // 10) * 0.15,
                speed_kmh=35.0 + (i % 5) * 5.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        # Some trucks
        for i in range(8):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{40+i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.TRUCK,
                confidence=0.88,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.15 + (i % 4) * 0.2,
                bbox_y_min=0.4 + (i // 4) * 0.3,
                bbox_x_max=0.35 + (i % 4) * 0.2,
                bbox_y_max=0.6 + (i // 4) * 0.3,
                speed_kmh=25.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        return detections


class SchoolZoneScenario(DemoScenario):
    """School zone scenario with reduced speeds and children present."""
    
    def __init__(self):
        super().__init__(
            name="School Zone",
            description="Reduced speed zone with pedestrian activity and stopped vehicles"
        )
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Generate vehicle detections for school zone."""
        detections = []
        
        # Cars moving slowly
        for i in range(15):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.90,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.1 + (i % 5) * 0.15,
                bbox_y_min=0.3 + (i // 5) * 0.2,
                bbox_x_max=0.25 + (i % 5) * 0.15,
                bbox_y_max=0.5 + (i // 5) * 0.2,
                speed_kmh=20.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        # Many stopped vehicles
        for i in range(10):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{15+i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.05 + i * 0.09,
                bbox_y_min=0.6,
                bbox_x_max=0.15 + i * 0.09,
                bbox_y_max=0.8,
                speed_kmh=0.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        return detections


class AccidentScenario(DemoScenario):
    """Accident scenario with blocked lanes and emergency vehicles."""
    
    def __init__(self):
        super().__init__(
            name="Accident",
            description="Traffic accident blocking lanes with emergency response"
        )
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Generate vehicle detections for accident scenario."""
        detections = []
        
        # Stopped vehicles behind accident
        for i in range(20):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.93,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=min(0.05 + (i % 5) * 0.18, 0.95),
                bbox_y_min=min(0.4 + (i // 5) * 0.15, 0.85),
                bbox_x_max=min(0.20 + (i % 5) * 0.18, 1.0),
                bbox_y_max=min(0.7 + (i // 5) * 0.15, 1.0),
                speed_kmh=0.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        # Emergency vehicle
        detections.append(VehicleDetection(
            detection_id=f"DET-{frame_id}-20",
            frame_id=frame_id,
            camera_id=camera_id,
            intersection_id=intersection_id,
            vehicle_type=VehicleType.EMERGENCY,
            confidence=0.98,
            confidence_level=DetectionConfidence.HIGH,
            bbox_x_min=0.4,
            bbox_y_min=0.3,
            bbox_x_max=0.6,
            bbox_y_max=0.6,
            speed_kmh=0.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ))
        
        return detections


class IllegalParkingScenario(DemoScenario):
    """Illegal parking scenario with vehicles blocking lanes."""
    
    def __init__(self):
        super().__init__(
            name="Illegal Parking",
            description="Vehicles illegally parked blocking traffic flow"
        )
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Generate vehicle detections for illegal parking."""
        detections = []
        
        # Moving vehicles
        for i in range(12):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.91,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.1 + (i % 4) * 0.2,
                bbox_y_min=0.3 + (i // 4) * 0.2,
                bbox_x_max=0.25 + (i % 4) * 0.2,
                bbox_y_max=0.5 + (i // 4) * 0.2,
                speed_kmh=40.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        # Illegally parked vehicles (stopped in travel lanes)
        for i in range(5):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{12+i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.94,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.3 + i * 0.12,
                bbox_y_min=0.5,
                bbox_x_max=0.45 + i * 0.12,
                bbox_y_max=0.7,
                speed_kmh=0.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        return detections


class EmergencyVehicleScenario(DemoScenario):
    """Emergency vehicle scenario with priority vehicle in traffic."""
    
    def __init__(self):
        super().__init__(
            name="Emergency Vehicle",
            description="Emergency vehicle requiring right-of-way in traffic"
        )
    
    def get_vehicle_detections(self, camera_id: str, intersection_id: str, frame_id: str) -> list:
        """Generate vehicle detections for emergency vehicle scenario."""
        detections = []
        
        # Normal traffic
        for i in range(25):
            detections.append(VehicleDetection(
                detection_id=f"DET-{frame_id}-{i}",
                frame_id=frame_id,
                camera_id=camera_id,
                intersection_id=intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.90,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=min(0.05 + (i % 5) * 0.18, 0.95),
                bbox_y_min=min(0.3 + (i // 5) * 0.2, 0.85),
                bbox_x_max=min(0.20 + (i % 5) * 0.18, 1.0),
                bbox_y_max=min(0.5 + (i // 5) * 0.2, 1.0),
                speed_kmh=30.0,
                direction_degrees=90.0,
                detection_timestamp=datetime.now(UTC)
            ))
        
        # Emergency vehicle moving through
        detections.append(VehicleDetection(
            detection_id=f"DET-{frame_id}-25",
            frame_id=frame_id,
            camera_id=camera_id,
            intersection_id=intersection_id,
            vehicle_type=VehicleType.EMERGENCY,
            confidence=0.97,
            confidence_level=DetectionConfidence.HIGH,
            bbox_x_min=0.4,
            bbox_y_min=0.35,
            bbox_x_max=0.6,
            bbox_y_max=0.65,
            speed_kmh=50.0,
            direction_degrees=90.0,
            detection_timestamp=datetime.now(UTC)
        ))
        
        return detections


# Demo scenario registry
DEMO_SCENARIOS = {
    "morning_rush": MorningRushScenario(),
    "school_zone": SchoolZoneScenario(),
    "accident": AccidentScenario(),
    "illegal_parking": IllegalParkingScenario(),
    "emergency_vehicle": EmergencyVehicleScenario(),
}


def get_scenario(scenario_name: str) -> DemoScenario:
    """Get demo scenario by name."""
    return DEMO_SCENARIOS.get(scenario_name)


def list_scenarios() -> list:
    """List all available demo scenarios."""
    return list(DEMO_SCENARIOS.keys())
