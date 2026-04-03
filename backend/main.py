"""
FastAPI Main Application - AI Smart Irrigation Recommendation System
Entry point for the backend API server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging

from state import app_state
from routes.irrigation_routes import router as irrigation_router
from utils.logger import setup_logger
from utils.config import Settings

# Load environment variables
load_dotenv()
settings = Settings()

# Setup logging
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context for startup and shutdown events"""
    # Startup
    logger.info("Starting AI Irrigation System API...")
    try:
        from ml_model.train_irrigation_model import load_model_artifacts
        # Load ML model artifacts once at startup
        model, scaler, encoder = load_model_artifacts(
            settings.MODEL_PATH,
            settings.SCALER_PATH,
            settings.ENCODER_PATH
        )
        app_state["model"] = model
        app_state["scaler"] = scaler
        app_state["encoder"] = encoder
        app_state["genai_model"] = None

        logger.info("ML models loaded successfully; GenAI will stay disabled until enabled explicitly")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Irrigation System API...")

# Initialize FastAPI app
app = FastAPI(
    title="AI Smart Irrigation Recommendation System",
    description="ML-powered irrigation predictions with GenAI explanations",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(irrigation_router, prefix="/api", tags=["irrigation"])

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Irrigation System API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
