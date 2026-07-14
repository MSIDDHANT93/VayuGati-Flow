"""
Computer Vision Service - YOLO Integration

This service provides independent computer vision capabilities using YOLO for object detection.
It converts YOLO detections into VehicleDetection domain models for the Traffic Intelligence Engine.
"""

import base64
import io
import time
from typing import List
from datetime import datetime, UTC

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

from app.schemas.vision import VisionAnalysisRequest, VisionAnalysisResponse
from app.models.vehicle_detection import VehicleDetection, VehicleType, DetectionConfidence
from app.utils.logger import logger


class ComputerVisionService:
    """Service for computer vision analysis using YOLO."""
    
    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Initialize computer vision service with YOLO model.
        
        Args:
            model_path: Path to YOLO model file (default: yolov8n.pt)
        """
        self.model_path = model_path
        self.model = None
        
        if YOLO_AVAILABLE:
            try:
                self.model = YOLO(model_path)
            except Exception:
                logger.warning(
                    "Failed to load YOLO model from '%s'; falling back to mock detections.",
                    model_path,
                    exc_info=True,
                )
    
    def analyze_image(self, request: VisionAnalysisRequest) -> VisionAnalysisResponse:
        """
        Analyze image using YOLO and convert detections to VehicleDetection models.
        
        Args:
            request: VisionAnalysisRequest with image data
            
        Returns:
            VisionAnalysisResponse with VehicleDetection objects
        """
        start_time = time.time()
        
        if self.model is None or not YOLO_AVAILABLE:
            # Use mock detections if YOLO is not available
            vehicle_detections = self._generate_mock_detections(request)
        else:
            # Run YOLO inference
            vehicle_detections = self._run_yolo_inference(request)
        
        inference_time_ms = (time.time() - start_time) * 1000
        
        return VisionAnalysisResponse(
            frame_id=request.frame_id,
            camera_id=request.camera_id,
            intersection_id=request.intersection_id,
            vehicle_detections=vehicle_detections,
            total_detections=len(vehicle_detections),
            inference_time_ms=inference_time_ms
        )
    
    def _run_yolo_inference(self, request: VisionAnalysisRequest) -> List[VehicleDetection]:
        """
        Run YOLO inference on image and convert to VehicleDetection models.
        
        Args:
            request: VisionAnalysisRequest with image data
            
        Returns:
            List of VehicleDetection objects
        """
        try:
            # Decode base64 image (validate=True rejects malformed input)
            image_bytes = base64.b64decode(request.image_data, validate=True)
            image = io.BytesIO(image_bytes)
            
            # Run YOLO inference
            results = self.model(image, verbose=False)
            
            # Convert YOLO detections to VehicleDetection models
            vehicle_detections = []
            
            for result in results:
                for box in result.boxes:
                    detection = self._convert_yolo_box_to_detection(
                        box, request.camera_id, request.intersection_id, request.frame_id
                    )
                    if detection:
                        vehicle_detections.append(detection)
            
            return vehicle_detections
            
        except Exception:
            logger.error(
                "YOLO inference failed for frame '%s'; falling back to mock detections.",
                request.frame_id,
                exc_info=True,
            )
            return self._generate_mock_detections(request)
    
    def _convert_yolo_box_to_detection(
        self, 
        box, 
        camera_id: str, 
        intersection_id: str, 
        frame_id: str
    ) -> VehicleDetection:
        """
        Convert YOLO box to VehicleDetection domain model.
        
        Args:
            box: YOLO detection box
            camera_id: Camera identifier
            intersection_id: Intersection identifier
            frame_id: Frame identifier
            
        Returns:
            VehicleDetection object or None if not a vehicle
        """
        # Get class ID and confidence
        class_id = int(box.cls[0]) if box.cls is not None else None
        confidence = float(box.conf[0]) if box.conf is not None else 0.0
        
        # Map YOLO class to vehicle type
        # YOLO classes: 0=person, 1=bicycle, 2=car, 3=motorcycle, 4=airplane, 5=bus, 6=train, 7=truck, 8=boat
        vehicle_type_map = {
            2: VehicleType.CAR,
            3: VehicleType.MOTORCYCLE,
            5: VehicleType.BUS,
            7: VehicleType.TRUCK,
        }
        
        vehicle_type = vehicle_type_map.get(class_id)
        if vehicle_type is None:
            return None  # Not a vehicle we track
        
        # Get bounding box coordinates (normalized 0-1)
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        bbox_x_min = x1 / box.orig_shape[1]  # Normalize by image width
        bbox_y_min = y1 / box.orig_shape[0]  # Normalize by image height
        bbox_x_max = x2 / box.orig_shape[1]
        bbox_y_max = y2 / box.orig_shape[0]
        
        # Determine confidence level
        if confidence >= 0.9:
            confidence_level = DetectionConfidence.HIGH
        elif confidence >= 0.7:
            confidence_level = DetectionConfidence.MEDIUM
        else:
            confidence_level = DetectionConfidence.LOW
        
        # Create VehicleDetection
        return VehicleDetection(
            detection_id=f"DET-{frame_id}-{len(box.xyxy)}",
            frame_id=frame_id,
            camera_id=camera_id,
            intersection_id=intersection_id,
            vehicle_type=vehicle_type,
            confidence=confidence,
            confidence_level=confidence_level,
            bbox_x_min=bbox_x_min,
            bbox_y_min=bbox_y_min,
            bbox_x_max=bbox_x_max,
            bbox_y_max=bbox_y_max,
            speed_kmh=None,  # Speed not available from single frame
            direction_degrees=None,  # Direction not available from single frame
            detection_timestamp=datetime.now(UTC)
        )
    
    def _generate_mock_detections(self, request: VisionAnalysisRequest) -> List[VehicleDetection]:
        """
        Generate mock vehicle detections for testing when YOLO is not available.
        
        Args:
            request: VisionAnalysisRequest
            
        Returns:
            List of mock VehicleDetection objects
        """
        return [
            VehicleDetection(
                detection_id=f"DET-{request.frame_id}-001",
                frame_id=request.frame_id,
                camera_id=request.camera_id,
                intersection_id=request.intersection_id,
                vehicle_type=VehicleType.CAR,
                confidence=0.95,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.25,
                bbox_y_min=0.30,
                bbox_x_max=0.45,
                bbox_y_max=0.60,
                speed_kmh=None,
                direction_degrees=None,
                detection_timestamp=datetime.now(UTC)
            ),
            VehicleDetection(
                detection_id=f"DET-{request.frame_id}-002",
                frame_id=request.frame_id,
                camera_id=request.camera_id,
                intersection_id=request.intersection_id,
                vehicle_type=VehicleType.TRUCK,
                confidence=0.88,
                confidence_level=DetectionConfidence.HIGH,
                bbox_x_min=0.50,
                bbox_y_min=0.30,
                bbox_x_max=0.70,
                bbox_y_max=0.60,
                speed_kmh=None,
                direction_degrees=None,
                detection_timestamp=datetime.now(UTC)
            )
        ]
