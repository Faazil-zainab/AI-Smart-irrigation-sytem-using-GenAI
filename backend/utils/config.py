"""
Configuration Management
Loads environment variables and provides config object
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Model paths
    MODEL_PATH: str = os.getenv("MODEL_PATH", "../models/irrigation_model.pkl")
    SCALER_PATH: str = os.getenv("SCALER_PATH", "../models/scaler.pkl")
    ENCODER_PATH: str = os.getenv("ENCODER_PATH", "../models/crop_encoder.pkl")
    
    # API settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))
    API_RELOAD: bool = os.getenv("API_RELOAD", "true").lower() == "true"
    
    # GenAI model settings
    GENAI_MODEL: str = os.getenv("GENAI_MODEL", "facebook/bart-large-cnn")
    USE_GPU: bool = os.getenv("USE_GPU", "false").lower() == "true"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Environment metadata
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    def validate_paths(self):
        """Validate that required model paths exist"""
        paths_to_check = [self.MODEL_PATH, self.SCALER_PATH, self.ENCODER_PATH]
        
        for path in paths_to_check:
            if path and not Path(path).exists():
                print(f"Warning: {path} does not exist. Model will be loaded on first request.")
