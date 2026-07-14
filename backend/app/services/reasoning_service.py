"""
AI Reasoning Service - Fireworks AI Integration

This service provides AI-powered reasoning about traffic analysis using Fireworks AI.
It accepts structured traffic metrics from the deterministic engine and generates
explanations, root causes, and recommendations.
"""

import json
from typing import Dict, Any
from datetime import datetime, UTC

try:
    import openai
    FIREWORKS_AVAILABLE = True
except ImportError:
    FIREWORKS_AVAILABLE = False

from app.schemas.reasoning import ReasoningRequest, ReasoningResponse
from app.config import get_settings
from app.utils.logger import logger


class ReasoningService:
    """Service for AI reasoning about traffic analysis using Fireworks AI."""
    
    def __init__(self):
        """Initialize reasoning service with Fireworks AI configuration."""
        self.settings = get_settings()
        self.api_key = self.settings.fireworks_api_key
        self.model = self.settings.fireworks_model
        self.client = None
        
        if FIREWORKS_AVAILABLE and self.api_key:
            try:
                self.client = openai.OpenAI(
                    api_key=self.api_key,
                    base_url="https://api.fireworks.ai/inference/v1"
                )
            except Exception as e:
                logger.warning(
                    "Failed to initialize Fireworks client: %s. "
                    "Reasoning service will use mock responses.",
                    e,
                )
    
    def analyze_traffic(self, request: ReasoningRequest) -> ReasoningResponse:
        """
        Analyze traffic metrics using AI reasoning.
        
        Args:
            request: ReasoningRequest with traffic metrics from deterministic engine
            
        Returns:
            ReasoningResponse with AI-generated insights
        """
        if self.client is None or not FIREWORKS_AVAILABLE or not self.api_key:
            # Use mock response if Fireworks is not available
            return self._generate_mock_response(request)
        
        # Generate prompt with traffic metrics
        prompt = self._build_prompt(request)
        
        try:
            # Call Fireworks AI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a traffic engineering expert. Analyze the provided traffic metrics and generate insights. Return ONLY valid JSON. No markdown, no explanations outside JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse response
            content = response.choices[0].message.content
            insights = self._parse_response(content)
            
            return ReasoningResponse(
                congestion_explanation=insights.get("congestion_explanation", ""),
                probable_root_causes=insights.get("probable_root_causes", []),
                traffic_recommendations=insights.get("traffic_recommendations", []),
                confidence_score=insights.get("confidence_score", 0.5),
                model_used=self.model
            )
            
        except Exception as e:
            logger.error("Fireworks AI call failed: %s", e)
            return self._generate_mock_response(request)
    
    def _build_prompt(self, request: ReasoningRequest) -> str:
        """
        Build prompt for Fireworks AI with traffic metrics.
        
        Args:
            request: ReasoningRequest with traffic metrics
            
        Returns:
            Formatted prompt string
        """
        prompt = f"""Analyze the following traffic metrics and provide insights:

Traffic Metrics:
- Queue Length: {request.queue_length_meters:.2f} meters
- Vehicle Density: {request.vehicle_density_vehicles_per_km:.2f} vehicles/km
- Average Speed: {request.average_speed_kmh:.2f} km/h
- Occupancy Rate: {request.occupancy_rate:.2f}
- Congestion Score: {request.congestion_score:.2f} (0-1, higher is worse)
- Level of Service: {request.level_of_service}
- Risk Score: {request.risk_score:.2f} (0-1, higher is worse)

Context:
- Intersection ID: {request.intersection_id}
- Lane Count: {request.lane_count}
- Total Vehicles: {request.total_vehicles}

IMPORTANT:
- These metrics were calculated using deterministic algorithms based on the Highway Capacity Manual
- DO NOT perform any calculations
- Only explain the provided metrics
- Identify probable root causes based on the metrics
- Provide actionable recommendations
- Return ONLY valid JSON with this structure:
{{
  "congestion_explanation": "string",
  "probable_root_causes": ["string", "string"],
  "traffic_recommendations": ["string", "string"],
  "confidence_score": 0.0-1.0
}}

No markdown, no additional text outside JSON."""
        
        return prompt
    
    def _parse_response(self, content: str) -> Dict[str, Any]:
        """
        Parse Fireworks AI response.
        
        Args:
            content: Response content from Fireworks AI
            
        Returns:
            Parsed insights dictionary
        """
        try:
            # Try to parse as JSON
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()
            
            insights = json.loads(content)
            
            # Validate structure
            return {
                "congestion_explanation": insights.get("congestion_explanation", ""),
                "probable_root_causes": insights.get("probable_root_causes", []),
                "traffic_recommendations": insights.get("traffic_recommendations", []),
                "confidence_score": float(insights.get("confidence_score", 0.5))
            }
            
        except Exception as e:
            logger.error("Failed to parse Fireworks response: %s", e)
            return self._get_default_insights()
    
    def _generate_mock_response(self, request: ReasoningRequest) -> ReasoningResponse:
        """
        Generate mock response when Fireworks AI is not available.
        
        Args:
            request: ReasoningRequest with traffic metrics
            
        Returns:
            Mock ReasoningResponse
        """
        # Generate insights based on congestion score
        if request.congestion_score < 0.3:
            explanation = "Traffic conditions are good with minimal congestion. Vehicles are moving freely with optimal speed and density."
            root_causes = ["Normal traffic flow", "Good signal timing", "Adequate capacity"]
            recommendations = ["Maintain current signal timing", "Monitor for peak hour variations"]
            confidence = 0.9
        elif request.congestion_score < 0.6:
            explanation = "Moderate congestion detected. Vehicle density is elevated with reduced speeds, likely due to peak hour traffic volume."
            root_causes = ["Peak hour traffic volume", "Slightly suboptimal signal timing", "Increased demand"]
            recommendations = ["Adjust signal timing for peak hours", "Implement adaptive signal control", "Monitor queue lengths"]
            confidence = 0.85
        else:
            explanation = "Severe congestion with very high density and low speeds. Queue lengths are extended, indicating significant operational issues."
            root_causes = ["Excessive traffic volume", "Poor signal timing", "Insufficient lane capacity", "Possible incidents"]
            recommendations = ["Immediate signal timing optimization", "Deploy traffic management personnel", "Consider temporary lane usage changes", "Investigate for incidents"]
            confidence = 0.8
        
        return ReasoningResponse(
            congestion_explanation=explanation,
            probable_root_causes=root_causes,
            traffic_recommendations=recommendations,
            confidence_score=confidence,
            model_used="mock"
        )
    
    def _get_default_insights(self) -> Dict[str, Any]:
        """Get default insights when parsing fails."""
        return {
            "congestion_explanation": "Unable to generate AI explanation due to parsing error.",
            "probable_root_causes": ["Unknown"],
            "traffic_recommendations": ["Manual analysis required"],
            "confidence_score": 0.0
        }
