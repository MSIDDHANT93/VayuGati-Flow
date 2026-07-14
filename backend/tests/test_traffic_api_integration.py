"""
Integration tests for /api/v1/traffic/analyze endpoint.

Tests verify the complete API integration from HTTP request to response.
"""

import pytest
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from main import app

from app.models.intersection import Intersection, IntersectionType, IntersectionStatus
from app.models.camera import Camera, CameraStatus, CameraResolution
from app.models.vehicle_detection import VehicleDetection, VehicleType, DetectionConfidence


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_request_data():
    """Create sample request data for testing."""
    return {
        "intersection": {
            "intersection_id": "INT-001",
            "name": "Main Street and 5th Avenue",
            "location_lat": 40.7128,
            "location_lon": -74.0060,
            "intersection_type": "signalized",
            "status": "active",
            "num_lanes": 4,
            "has_traffic_signal": True,
            "municipality": "New York City"
        },
        "camera": {
            "camera_id": "CAM-001",
            "intersection_id": "INT-001",
            "name": "Main Street Northbound Camera",
            "location_lat": 40.7129,
            "location_lon": -74.0061,
            "status": "online",
            "resolution": "1080p",
            "fps": 30
        },
        "vehicle_detections": [
            {
                "detection_id": "DET-001",
                "frame_id": "FRM-001",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_type": "car",
                "confidence": 0.95,
                "confidence_level": "high",
                "bbox_x_min": 0.25,
                "bbox_y_min": 0.30,
                "bbox_x_max": 0.45,
                "bbox_y_max": 0.60,
                "speed_kmh": 45.0,
                "direction_degrees": 90.0,
                "is_stopped": False,
                "detection_timestamp": datetime.now(UTC).isoformat()
            },
            {
                "detection_id": "DET-002",
                "frame_id": "FRM-001",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_type": "truck",
                "confidence": 0.90,
                "confidence_level": "high",
                "bbox_x_min": 0.50,
                "bbox_y_min": 0.30,
                "bbox_x_max": 0.70,
                "bbox_y_max": 0.60,
                "speed_kmh": 35.0,
                "direction_degrees": 90.0,
                "is_stopped": False,
                "detection_timestamp": datetime.now(UTC).isoformat()
            }
        ],
        "traffic_signal": None,
        "lane_count": 4,
        "lane_length_meters": 100.0,
        "free_flow_speed_kmh": 60.0,
        "capacity_vehicles_per_hour": 1800
    }


class TestTrafficAnalysisAPI:
    """Integration tests for traffic analysis API endpoint."""
    
    def test_endpoint_returns_200(self, client, sample_request_data):
        """Test endpoint returns 200 status code."""
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        assert response.status_code == 200
    
    def test_endpoint_returns_standardized_response(self, client, sample_request_data):
        """Test endpoint returns standardized API response wrapper."""
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        # Verify standardized response structure
        assert "success" in data
        assert "timestamp" in data
        assert "data" in data
        assert "errors" in data
        
        # Verify success is True
        assert data["success"] is True
        
        # Verify errors is None
        assert data["errors"] is None
    
    def test_endpoint_returns_analysis_data(self, client, sample_request_data):
        """Test endpoint returns traffic analysis data."""
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        # Verify data field contains analysis results
        assert "data" in data
        analysis_data = data["data"]
        
        # Verify required metrics
        assert "queue_length_meters" in analysis_data
        assert "vehicle_density_vehicles_per_km" in analysis_data
        assert "average_speed_kmh" in analysis_data
        assert "occupancy_rate" in analysis_data
        assert "congestion_score" in analysis_data
        assert "level_of_service" in analysis_data
        assert "risk_score" in analysis_data
        assert "congestion_explanation" in analysis_data
        assert "los_explanation" in analysis_data
        assert "risk_factors" in analysis_data
        assert "total_vehicles_analyzed" in analysis_data
    
    def test_endpoint_with_no_vehicles(self, client, sample_request_data):
        """Test endpoint with no vehicle detections."""
        sample_request_data["vehicle_detections"] = []
        
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert data["data"]["total_vehicles_analyzed"] == 0
        assert data["data"]["queue_length_meters"] == 0.0
    
    def test_endpoint_with_congested_conditions(self, client, sample_request_data):
        """Test endpoint with congested traffic conditions."""
        # Add many stopped/slow vehicles
        sample_request_data["vehicle_detections"] = [
            {
                "detection_id": f"DET-{i}",
                "frame_id": "FRM-001",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_type": "car",
                "confidence": 0.95,
                "confidence_level": "high",
                "bbox_x_min": 0.25,
                "bbox_y_min": 0.30,
                "bbox_x_max": 0.45,
                "bbox_y_max": 0.60,
                "speed_kmh": 3.0 if i % 2 == 0 else 8.0,
                "direction_degrees": 90.0,
                "is_stopped": False,
                "detection_timestamp": datetime.now(UTC).isoformat()
            } for i in range(50)
        ]
        
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert data["data"]["congestion_score"] > 0.5
        assert data["data"]["total_vehicles_analyzed"] == 50
    
    def test_endpoint_with_emergency_vehicle(self, client, sample_request_data):
        """Test endpoint with emergency vehicle present."""
        sample_request_data["vehicle_detections"] = [
            {
                "detection_id": "DET-001",
                "frame_id": "FRM-001",
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "vehicle_type": "emergency",
                "confidence": 0.95,
                "confidence_level": "high",
                "bbox_x_min": 0.25,
                "bbox_y_min": 0.30,
                "bbox_x_max": 0.45,
                "bbox_y_max": 0.60,
                "speed_kmh": 60.0,
                "direction_degrees": 90.0,
                "is_stopped": False,
                "detection_timestamp": datetime.now(UTC).isoformat()
            }
        ]
        
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert "Emergency vehicle presence" in data["data"]["risk_factors"]
    
    def test_endpoint_validates_required_fields(self, client):
        """Test endpoint validates required fields."""
        # Missing required field
        invalid_request = {
            "intersection": {
                "intersection_id": "INT-001"
            },
            "camera": {
                "camera_id": "CAM-001"
            },
            "vehicle_detections": []
        }
        
        response = client.post("/api/v1/traffic/analyze", json=invalid_request)
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_endpoint_with_traffic_signal(self, client, sample_request_data):
        """Test endpoint with traffic signal data."""
        sample_request_data["traffic_signal"] = {
            "signal_id": "SIG-001-NB",
            "intersection_id": "INT-001",
            "direction": "northbound",
            "current_phase": "green",
            "phase_start_time": datetime.now(UTC).isoformat(),
            "time_in_phase_seconds": 25,
            "time_until_change_seconds": 35,
            "cycle_time_seconds": 120,
            "green_time_seconds": 60,
            "yellow_time_seconds": 5,
            "red_time_seconds": 55
        }
        
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
    
    def test_endpoint_explanatory_outputs(self, client, sample_request_data):
        """Test endpoint generates explanatory outputs."""
        response = client.post("/api/v1/traffic/analyze", json=sample_request_data)
        data = response.json()
        
        assert response.status_code == 200
        analysis_data = data["data"]
        
        # Verify explanations are generated
        assert analysis_data["congestion_explanation"]
        assert len(analysis_data["congestion_explanation"]) > 0
        assert analysis_data["los_explanation"]
        assert len(analysis_data["los_explanation"]) > 0
        assert isinstance(analysis_data["risk_factors"], list)
