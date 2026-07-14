"""
Tests for Computer Vision Service.

Tests verify YOLO integration and conversion to VehicleDetection models.
"""

import base64
import io
import types

import pytest
from datetime import datetime, UTC
from PIL import Image as PILImage
from app.schemas.vision import VisionAnalysisRequest
from app.services.computer_vision_service import ComputerVisionService
from app.models.vehicle_detection import VehicleType, DetectionConfidence


class _FakeXYXY:
    """Minimal stand-in for a YOLO xyxy tensor row."""

    def __init__(self, values):
        self._values = values

    def tolist(self):
        return self._values


class _FakeBox:
    """Minimal stand-in for an Ultralytics detection box."""

    def __init__(self, class_id, confidence, xyxy, orig_shape):
        self.cls = [class_id]
        self.conf = [confidence]
        self.xyxy = [_FakeXYXY(xyxy)]
        self.orig_shape = orig_shape


def _encode_test_image(size=(8, 8), color=(255, 0, 0), fmt="PNG") -> str:
    buffer = io.BytesIO()
    PILImage.new("RGB", size, color).save(buffer, format=fmt)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


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


class TestYOLOInferenceConversion:
    """Regression tests for YOLO inference and detection conversion."""

    def test_yolo_detections_have_unique_ids(self, monkeypatch):
        """Regression: each detection in a frame gets a unique detection_id."""
        service = ComputerVisionService()

        # Two car detections (YOLO class 2) in the same frame.
        boxes = [
            _FakeBox(2, 0.95, [10.0, 10.0, 50.0, 50.0], (100, 200)),
            _FakeBox(2, 0.80, [60.0, 60.0, 90.0, 90.0], (100, 200)),
        ]
        fake_result = types.SimpleNamespace(boxes=boxes)

        monkeypatch.setattr(service, "_decode_image", lambda image_data: "decoded-image")
        service.model = lambda image, verbose=False: [fake_result]

        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data="ignored-because-decode-is-mocked",
        )

        detections = service._run_yolo_inference(request)

        assert len(detections) == 2
        ids = [d.detection_id for d in detections]
        assert len(set(ids)) == 2
        assert ids == ["DET-FRM-001-000", "DET-FRM-001-001"]

    def test_decode_image_returns_pil_image(self):
        """Regression: base64 image data is decoded into a PIL image for YOLO."""
        service = ComputerVisionService()
        image_data = _encode_test_image(size=(12, 8))

        image = service._decode_image(image_data)

        assert isinstance(image, PILImage.Image)
        assert image.size == (12, 8)
        assert image.mode == "RGB"

    def test_run_yolo_inference_decodes_real_image(self, monkeypatch):
        """Regression: inference path decodes a real image before calling the model."""
        service = ComputerVisionService()
        image_data = _encode_test_image(size=(16, 16))

        received = {}

        def fake_model(image, verbose=False):
            received["image"] = image
            return [types.SimpleNamespace(boxes=[])]

        service.model = fake_model

        request = VisionAnalysisRequest(
            camera_id="CAM-001",
            intersection_id="INT-001",
            frame_id="FRM-001",
            image_data=image_data,
        )

        detections = service._run_yolo_inference(request)

        assert detections == []
        assert isinstance(received["image"], PILImage.Image)
        assert received["image"].size == (16, 16)
