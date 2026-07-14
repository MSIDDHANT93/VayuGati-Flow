from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration using Pydantic Settings."""
    
    # Application
    app_name: str = "VayuGati Flow API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # API
    api_prefix: str = "/api/v1"
    
    # Fireworks AI (future)
    fireworks_api_key: str = ""
    fireworks_model: str = "accounts/fireworks/models/llama-v3-70b-instruct"
    
    # Computer Vision (future)
    yolo_model_path: str = "yolov8n.pt"
    confidence_threshold: float = 0.5
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
