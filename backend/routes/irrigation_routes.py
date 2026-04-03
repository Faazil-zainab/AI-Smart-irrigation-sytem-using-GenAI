"""
API Routes for Irrigation Recommendation System
Contains endpoints for predictions, alerts, and optimization strategies
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
import logging

from schemas.irrigation_schema import (
    IrrigationPredictionRequest,
    IrrigationPredictionResponse,
    AlertResponse,
    OptimizationStrategyResponse
)
from services.irrigation_service import IrrigationService
from services.alert_service import AlertService
from services.optimization_service import OptimizationService
from state import app_state

logger = logging.getLogger(__name__)
router = APIRouter()

def get_irrigation_service() -> IrrigationService:
    """Dependency injection for IrrigationService"""
    return IrrigationService(
        model=app_state["model"],
        scaler=app_state["scaler"],
        encoder=app_state["encoder"],
        genai_model=app_state["genai_model"]
    )

def get_alert_service() -> AlertService:
    """Dependency injection for AlertService"""
    return AlertService()

def get_optimization_service() -> OptimizationService:
    """Dependency injection for OptimizationService"""
    return OptimizationService()

@router.post("/predict-irrigation", response_model=IrrigationPredictionResponse)
async def predict_irrigation(
    request: IrrigationPredictionRequest,
    service: IrrigationService = Depends(get_irrigation_service)
) -> Dict[str, Any]:
    """
    Predict irrigation requirements based on sensor inputs
    
    Request body:
    - temperature: float (°C)
    - humidity: float (%)
    - soil_moisture: float (%)
    - rainfall: float (mm)
    - crop_type: str (e.g., "wheat", "rice", "cotton")
    
    Response: Irrigation recommendation with GenAI explanation
    """
    try:
        result = await service.predict_irrigation_requirement(request)
        return result
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-alert", response_model=AlertResponse)
async def generate_alert(
    request: IrrigationPredictionRequest,
    service: AlertService = Depends(get_alert_service)
) -> Dict[str, Any]:
    """
    Generate irrigation alert based on current conditions
    Returns alert severity and recommended action
    """
    try:
        alert = await service.generate_alert(request)
        return alert
    except Exception as e:
        logger.error(f"Alert generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimization-strategy", response_model=OptimizationStrategyResponse)
async def get_optimization_strategy(
    request: IrrigationPredictionRequest,
    service: OptimizationService = Depends(get_optimization_service)
) -> Dict[str, Any]:
    """
    Get water-saving optimization strategies
    Returns drip irrigation recommendations and water conservation tips
    """
    try:
        strategy = await service.generate_optimization_strategy(request)
        return strategy
    except Exception as e:
        logger.error(f"Strategy generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
async def get_model_info() -> Dict[str, Any]:
    """Get information about loaded ML model and GenAI engine"""
    return {
        "ml_model": "scikit-learn RandomForest Regressor",
        "genai_engine": "HuggingFace Transformers (flan-t5-base)",
        "model_status": "loaded" if app_state["model"] else "not loaded",
        "genai_status": "loaded" if app_state["genai_model"] else "not loaded"
    }
