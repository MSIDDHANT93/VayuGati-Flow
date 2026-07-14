from fastapi.testclient import TestClient
from main import app
from datetime import datetime, UTC

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint returns expected response."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "api_prefix" in data


def test_traffic_analyze_endpoint():
    """Test the traffic analysis endpoint with valid request using new schema."""
    request_data = {
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
            }
        ],
        "traffic_signal": None,
        "lane_count": 4,
        "lane_length_meters": 100.0,
        "free_flow_speed_kmh": 60.0,
        "capacity_vehicles_per_hour": 1800
    }
    
    response = client.post("/api/v1/traffic/analyze", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify standardized response structure
    assert "success" in data
    assert data["success"] is True
    assert "data" in data
    assert "errors" in data
    
    # Verify analysis data
    analysis_data = data["data"]
    assert "queue_length_meters" in analysis_data
    assert "vehicle_density_vehicles_per_km" in analysis_data
    assert "average_speed_kmh" in analysis_data
    assert "occupancy_rate" in analysis_data
    assert "congestion_score" in analysis_data
    assert "level_of_service" in analysis_data
    assert "risk_score" in analysis_data


def test_traffic_analyze_minimal_request():
    """Test traffic analysis with minimal required fields using new schema."""
    request_data = {
        "intersection": {
            "intersection_id": "INT-002",
            "name": "Test Intersection",
            "location_lat": 40.7128,
            "location_lon": -74.0060,
            "intersection_type": "signalized",
            "status": "active",
            "num_lanes": 2,
            "has_traffic_signal": True,
            "municipality": "Test City"
        },
        "camera": {
            "camera_id": "CAM-002",
            "intersection_id": "INT-002",
            "name": "Test Camera",
            "location_lat": 40.7129,
            "location_lon": -74.0061,
            "status": "online",
            "resolution": "1080p",
            "fps": 30
        },
        "vehicle_detections": [],
        "traffic_signal": None
    }
    
    response = client.post("/api/v1/traffic/analyze", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["total_vehicles_analyzed"] == 0
