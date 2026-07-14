"""
Tests for AI Reasoning Service.

Tests verify Fireworks AI integration and mock fallback behavior.
"""

import pytest
from app.schemas.reasoning import ReasoningRequest
from app.services.reasoning_service import ReasoningService


class TestReasoningService:
    """Tests for AI Reasoning Service."""
    
    def test_service_initialization(self):
        """Test service can be initialized."""
        service = ReasoningService()
        assert service is not None
        assert service.model is not None
    
    def test_analyze_with_mock_response(self):
        """Test analysis returns mock response when Fireworks unavailable."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=45.5,
            vehicle_density_vehicles_per_km=125.0,
            average_speed_kmh=28.5,
            occupancy_rate=0.72,
            congestion_score=0.68,
            level_of_service="LOS_D",
            risk_score=0.55,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=42
        )
        
        response = service.analyze_traffic(request)
        
        # Verify response structure
        assert response.congestion_explanation
        assert len(response.probable_root_causes) > 0
        assert len(response.traffic_recommendations) > 0
        assert 0 <= response.confidence_score <= 1
        assert response.model_used == "mock"
    
    def test_low_congestion_mock_response(self):
        """Test mock response for low congestion."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=5.0,
            vehicle_density_vehicles_per_km=30.0,
            average_speed_kmh=55.0,
            occupancy_rate=0.2,
            congestion_score=0.15,
            level_of_service="LOS_A",
            risk_score=0.1,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=10
        )
        
        response = service.analyze_traffic(request)
        
        # Should indicate good conditions
        assert "good" in response.congestion_explanation.lower() or "minimal" in response.congestion_explanation.lower()
        assert response.confidence_score >= 0.8
    
    def test_moderate_congestion_mock_response(self):
        """Test mock response for moderate congestion."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=30.0,
            vehicle_density_vehicles_per_km=80.0,
            average_speed_kmh=40.0,
            occupancy_rate=0.5,
            congestion_score=0.45,
            level_of_service="LOS_C",
            risk_score=0.35,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=25
        )
        
        response = service.analyze_traffic(request)
        
        # Should indicate moderate congestion
        assert "moderate" in response.congestion_explanation.lower()
        assert response.confidence_score >= 0.8
    
    def test_high_congestion_mock_response(self):
        """Test mock response for high congestion."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=80.0,
            vehicle_density_vehicles_per_km=180.0,
            average_speed_kmh=15.0,
            occupancy_rate=0.9,
            congestion_score=0.85,
            level_of_service="LOS_F",
            risk_score=0.75,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=60
        )
        
        response = service.analyze_traffic(request)
        
        # Should indicate severe congestion
        assert "severe" in response.congestion_explanation.lower()
        assert len(response.traffic_recommendations) >= 3
    
    def test_prompt_building(self):
        """Test prompt building includes all metrics."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=45.5,
            vehicle_density_vehicles_per_km=125.0,
            average_speed_kmh=28.5,
            occupancy_rate=0.72,
            congestion_score=0.68,
            level_of_service="LOS_D",
            risk_score=0.55,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=42
        )
        
        prompt = service._build_prompt(request)
        
        # Verify all metrics are in prompt
        assert "45.50" in prompt  # queue length
        assert "125.00" in prompt  # density
        assert "28.50" in prompt  # speed
        assert "0.72" in prompt  # occupancy
        assert "0.68" in prompt  # congestion score
        assert "LOS_D" in prompt  # LOS
        assert "0.55" in prompt  # risk score
        assert "INT-001" in prompt  # intersection
        assert "4" in prompt  # lane count
        assert "42" in prompt  # total vehicles
    
    def test_response_parsing_valid_json(self):
        """Test parsing of valid JSON response."""
        service = ReasoningService()
        
        valid_json = """{
  "congestion_explanation": "Test explanation",
  "probable_root_causes": ["Cause 1", "Cause 2"],
  "traffic_recommendations": ["Recommendation 1"],
  "confidence_score": 0.85
}"""
        
        result = service._parse_response(valid_json)
        
        assert result["congestion_explanation"] == "Test explanation"
        assert len(result["probable_root_causes"]) == 2
        assert len(result["traffic_recommendations"]) == 1
        assert result["confidence_score"] == 0.85
    
    def test_response_parsing_with_markdown(self):
        """Test parsing removes markdown formatting."""
        service = ReasoningService()
        
        markdown_json = """```json
{
  "congestion_explanation": "Test explanation",
  "probable_root_causes": ["Cause 1"],
  "traffic_recommendations": ["Recommendation 1"],
  "confidence_score": 0.9
}
```"""
        
        result = service._parse_response(markdown_json)
        
        assert result["congestion_explanation"] == "Test explanation"
        assert result["confidence_score"] == 0.9
    
    def test_response_parsing_invalid_json(self):
        """Test parsing returns default insights for invalid JSON."""
        service = ReasoningService()
        
        invalid_json = "This is not valid JSON"
        
        result = service._parse_response(invalid_json)
        
        assert result["congestion_explanation"] == "Unable to generate AI explanation due to parsing error."
        assert result["confidence_score"] == 0.0
    
    def test_default_insights(self):
        """Test default insights structure."""
        service = ReasoningService()
        
        insights = service._get_default_insights()
        
        assert "congestion_explanation" in insights
        assert "probable_root_causes" in insights
        assert "traffic_recommendations" in insights
        assert "confidence_score" in insights
    
    def test_response_includes_timestamp(self):
        """Test response includes reasoning timestamp."""
        service = ReasoningService()
        
        request = ReasoningRequest(
            queue_length_meters=45.5,
            vehicle_density_vehicles_per_km=125.0,
            average_speed_kmh=28.5,
            occupancy_rate=0.72,
            congestion_score=0.68,
            level_of_service="LOS_D",
            risk_score=0.55,
            intersection_id="INT-001",
            lane_count=4,
            total_vehicles=42
        )
        
        response = service.analyze_traffic(request)
        
        assert response.reasoning_timestamp is not None
