"""
Integration tests for /api/v1/vision/analyze endpoint.

Tests verify the complete API integration from HTTP request to response.
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_vision_request():
    """Create sample vision request for testing."""
    return {
        "camera_id": "CAM-001",
        "intersection_id": "INT-001",
        "frame_id": "FRM-001",
        "image_data": "base64_encoded_image_string",
        "image_format": "jpg"
    }


class TestVisionAPI:
    """Integration tests for vision API endpoint."""
    
    def test_endpoint_returns_200(self, client, sample_vision_request):
        """Test endpoint returns 200 status code."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
        assert response.status_code == 200
    
    def test_endpoint_returns_standardized_response(self, client, sample_vision_request):
        """Test endpoint returns standardized API response wrapper."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
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
    
    def test_endpoint_returns_vision_data(self, client, sample_vision_request):
        """Test endpoint returns vision analysis data."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
        data = response.json()
        
        # Verify data field contains vision results
        assert "data" in data
        vision_data = data["data"]
        
        # Verify required fields
        assert "frame_id" in vision_data
        assert "camera_id" in vision_data
        assert "intersection_id" in vision_data
        assert "vehicle_detections" in vision_data
        assert "total_detections" in vision_data
        assert "inference_time_ms" in vision_data
    
    def test_endpoint_with_different_camera_ids(self, client):
        """Test endpoint with different camera IDs."""
        request = {
            "camera_id": "CAM-999",
            "intersection_id": "INT-001",
            "frame_id": "FRM-001",
            "image_data": "base64_encoded_image_string"
        }
        
        response = client.post("/api/v1/vision/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert data["data"]["camera_id"] == "CAM-999"
    
    def test_endpoint_with_different_intersection_ids(self, client):
        """Test endpoint with different intersection IDs."""
        request = {
            "camera_id": "CAM-001",
            "intersection_id": "INT-999",
            "frame_id": "FRM-001",
            "image_data": "base64_encoded_image_string"
        }
        
        response = client.post("/api/v1/vision/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert data["data"]["intersection_id"] == "INT-999"
    
    def test_endpoint_with_different_frame_ids(self, client):
        """Test endpoint with different frame IDs."""
        request = {
            "camera_id": "CAM-001",
            "intersection_id": "INT-001",
            "frame_id": "FRM-999",
            "image_data": "base64_encoded_image_string"
        }
        
        response = client.post("/api/v1/vision/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        assert data["data"]["frame_id"] == "FRM-999"
    
    def test_endpoint_with_empty_image_data(self, client):
        """Test endpoint with empty image data."""
        request = {
            "camera_id": "CAM-001",
            "intersection_id": "INT-001",
            "frame_id": "FRM-001",
            "image_data": ""
        }
        
        response = client.post("/api/v1/vision/analyze", json=request)
        data = response.json()
        
        # Should still return 200 with mock detections
        assert response.status_code == 200
        assert data["success"] is True
    
    def test_endpoint_validates_required_fields(self, client):
        """Test endpoint validates required fields."""
        # Missing required field
        invalid_request = {
            "camera_id": "CAM-001"
        }
        
        response = client.post("/api/v1/vision/analyze", json=invalid_request)
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_endpoint_with_different_image_formats(self, client):
        """Test endpoint with different image formats."""
        for format_type in ["jpg", "png", "jpeg"]:
            request = {
                "camera_id": "CAM-001",
                "intersection_id": "INT-001",
                "frame_id": "FRM-001",
                "image_data": "base64_encoded_image_string",
                "image_format": format_type
            }
            
            response = client.post("/api/v1/vision/analyze", json=request)
            data = response.json()
            
            assert response.status_code == 200
            assert data["success"] is True
    
    def test_endpoint_vehicle_detections_structure(self, client, sample_vision_request):
        """Test endpoint returns properly structured vehicle detections."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
        data = response.json()
        
        vision_data = data["data"]
        vehicle_detections = vision_data["vehicle_detections"]
        
        # Verify each detection has required fields
        for detection in vehicle_detections:
            assert "detection_id" in detection
            assert "frame_id" in detection
            assert "camera_id" in detection
            assert "intersection_id" in detection
            assert "vehicle_type" in detection
            assert "confidence" in detection
            assert "confidence_level" in detection
            assert "bbox_x_min" in detection
            assert "bbox_y_min" in detection
            assert "bbox_x_max" in detection
            assert "bbox_y_max" in detection
    
    def test_endpoint_inference_time_measurement(self, client, sample_vision_request):
        """Test endpoint measures and returns inference time."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
        data = response.json()
        
        vision_data = data["data"]
        assert "inference_time_ms" in vision_data
        assert vision_data["inference_time_ms"] >= 0
        assert isinstance(vision_data["inference_time_ms"], float)
    
    def test_endpoint_total_detections_count(self, client, sample_vision_request):
        """Test endpoint returns correct total detections count."""
        response = client.post("/api/v1/vision/analyze", json=sample_vision_request)
        data = response.json()
        
        vision_data = data["data"]
        assert vision_data["total_detections"] == len(vision_data["vehicle_detections"])
