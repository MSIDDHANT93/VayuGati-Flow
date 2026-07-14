"""
Integration tests for /api/v1/reasoning/analyze endpoint.

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
def sample_reasoning_request():
    """Create sample reasoning request for testing."""
    return {
        "queue_length_meters": 45.5,
        "vehicle_density_vehicles_per_km": 125.0,
        "average_speed_kmh": 28.5,
        "occupancy_rate": 0.72,
        "congestion_score": 0.68,
        "level_of_service": "LOS_D",
        "risk_score": 0.55,
        "intersection_id": "INT-001",
        "lane_count": 4,
        "total_vehicles": 42
    }


class TestReasoningAPI:
    """Integration tests for reasoning API endpoint."""
    
    def test_endpoint_returns_200(self, client, sample_reasoning_request):
        """Test endpoint returns 200 status code."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        assert response.status_code == 200
    
    def test_endpoint_returns_standardized_response(self, client, sample_reasoning_request):
        """Test endpoint returns standardized API response wrapper."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
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
    
    def test_endpoint_returns_reasoning_data(self, client, sample_reasoning_request):
        """Test endpoint returns reasoning analysis data."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        # Verify data field contains reasoning results
        assert "data" in data
        reasoning_data = data["data"]
        
        # Verify required fields
        assert "congestion_explanation" in reasoning_data
        assert "probable_root_causes" in reasoning_data
        assert "traffic_recommendations" in reasoning_data
        assert "confidence_score" in reasoning_data
        assert "model_used" in reasoning_data
    
    def test_endpoint_with_low_congestion(self, client):
        """Test endpoint with low congestion metrics."""
        request = {
            "queue_length_meters": 5.0,
            "vehicle_density_vehicles_per_km": 30.0,
            "average_speed_kmh": 55.0,
            "occupancy_rate": 0.2,
            "congestion_score": 0.15,
            "level_of_service": "LOS_A",
            "risk_score": 0.1,
            "intersection_id": "INT-001",
            "lane_count": 4,
            "total_vehicles": 10
        }
        
        response = client.post("/api/v1/reasoning/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        reasoning_data = data["data"]
        assert reasoning_data["confidence_score"] >= 0.8
    
    def test_endpoint_with_moderate_congestion(self, client):
        """Test endpoint with moderate congestion metrics."""
        request = {
            "queue_length_meters": 30.0,
            "vehicle_density_vehicles_per_km": 80.0,
            "average_speed_kmh": 40.0,
            "occupancy_rate": 0.5,
            "congestion_score": 0.45,
            "level_of_service": "LOS_C",
            "risk_score": 0.35,
            "intersection_id": "INT-001",
            "lane_count": 4,
            "total_vehicles": 25
        }
        
        response = client.post("/api/v1/reasoning/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        reasoning_data = data["data"]
        assert "moderate" in reasoning_data["congestion_explanation"].lower()
    
    def test_endpoint_with_high_congestion(self, client):
        """Test endpoint with high congestion metrics."""
        request = {
            "queue_length_meters": 80.0,
            "vehicle_density_vehicles_per_km": 180.0,
            "average_speed_kmh": 15.0,
            "occupancy_rate": 0.9,
            "congestion_score": 0.85,
            "level_of_service": "LOS_F",
            "risk_score": 0.75,
            "intersection_id": "INT-001",
            "lane_count": 4,
            "total_vehicles": 60
        }
        
        response = client.post("/api/v1/reasoning/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
        reasoning_data = data["data"]
        assert "severe" in reasoning_data["congestion_explanation"].lower()
        assert len(reasoning_data["traffic_recommendations"]) >= 3
    
    def test_endpoint_with_different_intersection_ids(self, client):
        """Test endpoint with different intersection IDs."""
        request = {
            "queue_length_meters": 45.5,
            "vehicle_density_vehicles_per_km": 125.0,
            "average_speed_kmh": 28.5,
            "occupancy_rate": 0.72,
            "congestion_score": 0.68,
            "level_of_service": "LOS_D",
            "risk_score": 0.55,
            "intersection_id": "INT-999",
            "lane_count": 4,
            "total_vehicles": 42
        }
        
        response = client.post("/api/v1/reasoning/analyze", json=request)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] is True
    
    def test_endpoint_validates_required_fields(self, client):
        """Test endpoint validates required fields."""
        # Missing required field
        invalid_request = {
            "queue_length_meters": 45.5,
            "vehicle_density_vehicles_per_km": 125.0
        }
        
        response = client.post("/api/v1/reasoning/analyze", json=invalid_request)
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_endpoint_root_causes_structure(self, client, sample_reasoning_request):
        """Test endpoint returns properly structured root causes."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        reasoning_data = data["data"]
        root_causes = reasoning_data["probable_root_causes"]
        
        # Verify root causes is a list
        assert isinstance(root_causes, list)
        # Verify at least one root cause
        assert len(root_causes) > 0
        # Verify each root cause is a string
        for cause in root_causes:
            assert isinstance(cause, str)
    
    def test_endpoint_recommendations_structure(self, client, sample_reasoning_request):
        """Test endpoint returns properly structured recommendations."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        reasoning_data = data["data"]
        recommendations = reasoning_data["traffic_recommendations"]
        
        # Verify recommendations is a list
        assert isinstance(recommendations, list)
        # Verify at least one recommendation
        assert len(recommendations) > 0
        # Verify each recommendation is a string
        for recommendation in recommendations:
            assert isinstance(recommendation, str)
    
    def test_endpoint_confidence_score_range(self, client, sample_reasoning_request):
        """Test endpoint returns confidence score in valid range."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        reasoning_data = data["data"]
        confidence = reasoning_data["confidence_score"]
        
        # Verify confidence is between 0 and 1
        assert 0 <= confidence <= 1
        assert isinstance(confidence, float)
    
    def test_endpoint_model_used(self, client, sample_reasoning_request):
        """Test endpoint returns model used."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        reasoning_data = data["data"]
        assert "model_used" in reasoning_data
        assert reasoning_data["model_used"] is not None
        assert isinstance(reasoning_data["model_used"], str)
    
    def test_endpoint_reasoning_timestamp(self, client, sample_reasoning_request):
        """Test endpoint includes reasoning timestamp."""
        response = client.post("/api/v1/reasoning/analyze", json=sample_reasoning_request)
        data = response.json()
        
        reasoning_data = data["data"]
        assert "reasoning_timestamp" in reasoning_data
        assert reasoning_data["reasoning_timestamp"] is not None
