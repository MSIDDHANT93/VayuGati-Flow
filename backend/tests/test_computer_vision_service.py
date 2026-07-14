"""
Tests for Computer Vision Service.

Tests verify YOLO integration and conversion to VehicleDetection models.
"""

import pytest
from datetime import datetime, UTC
from app.schemas.vision import VisionAnalysisRequest
from app.services.computer_vision_service import ComputerVisionService
from app.models.vehicle_detection import VehicleType, DetectionConfidence


class TestComputerVisionService:
    """Tests for Computer Vision Service."""
    
    def test_service_initialization(self):
        """Test service can be initialized."""
        service = ComputerVisionService()
        assert service is not None
        assert service.model_path == "yolov8n.pt"
    
    def test_service_initialization_with_custom_model(self):
        """Test service initialization with custom model path."""
        service = ComputerVisionService(model_path="custom_model.pt")
        assert service.model_path == "custom_model.pt"
    
    def test_analyze_image_with_mock_detections(self):
        """Test image analysis returns mock detections when YOLO not available."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data="base64_encoded_image_string",
            image_format="jpg"
        )
        
        response = service.analyze_image(request)
        
        # Verify response structure
        assert response.frame_id == "FRM-001"
        assert response.camera_id == "CAM-001"
        assert response.intersection_id == "INT-001"
        assert response.total_detections > 0
        assert response.inference_time_ms >= 0
        assert len(response.vehicle_detections) == response.total_detections
    
    def test_mock_detections_are_valid_vehicle_detections(self):
        """Test mock detections are valid VehicleDetection models."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data="base64_encoded_image_string"
        )
        
        response = service.analyze_image(request)
        
        # Verify each detection is a valid VehicleDetection
        for detection in response.vehicle_detections:
            assert detection.frame_id == "FRM-001"
            assert detection.camera_id == "CAM-001"
            assert detection.intersection_id == "INT-001"
            assert detection.vehicle_type in [VehicleType.CAR, VehicleType.TRUCK]
            assert 0 <= detection.confidence <= 1
            assert detection.confidence_level in [DetectionConfidence.HIGH, DetectionConfidence.MEDIUM, DetectionConfidence.LOW]
            assert 0 <= detection.bbox_x_min <= 1
            assert 0 <= detection.bbox_y_min <= 1
            assert 0 <= detection.bbox_x_max <= 1
            assert 0 <= detection.bbox_y_max <= 1
            assert detection.bbox_x_max > detection.bbox_x_min
            assert detection.bbox_y_max > detection.bbox_y_min
    
    def test_inference_time_is_measured(self):
        """Test inference time is measured and returned."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data="base64_encoded_image_string"
        )
        
        response = service.analyze_image(request)
        
        assert response.inference_time_ms >= 0
        assert isinstance(response.inference_time_ms, float)
    
    def test_response_includes_timestamp(self):
        """Test response includes analysis timestamp."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data="base64_encoded_image_string"
        )
        
        response = service.analyze_image(request)
        
        assert response.analysis_timestamp is not None
        assert isinstance(response.analysis_timestamp, datetime)
    
    def test_different_camera_and_intersection_ids(self):
        """Test service handles different camera and intersection IDs."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-999",
            intersection_id="INT-999",
            frame_id="FRM-999",
            image_data="base64_encoded_image_string"
        )
        
        response = service.analyze_image(request)
        
        assert response.camera_id == "CAM-999"
        assert response.intersection_id == "INT-999"
        assert response.frame_id == "FRM-999"
        
        # Verify detections have correct IDs
        for detection in response.vehicle_detections:
            assert detection.camera_id == "CAM-999"
            assert detection.intersection_id == "INT-999"
            assert detection.frame_id == "FRM-999"
    
    def test_empty_image_data(self):
        """Test service handles empty image data gracefully."""
        service = ComputerVisionService()
        
        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data=""
        )
        
        # Should still return response with mock detections
        response = service.analyze_image(request)
        assert response.total_detections >= 0
    
    def test_different_image_formats(self):
        """Test service handles different image formats."""
        service = ComputerVisionService()
        
        for format_type in ["jpg", "png", "jpeg"]:
            request = VisionAnalysisRequest(
                camera_id="CAM-001",
                intersection_id="INT-001",
                frame_id="FRM-001",
                image_data="base64_encoded_image_string",
                image_format=format_type
            )
            
            response = service.analyze_image(request)
            assert response.total_detections >= 0
