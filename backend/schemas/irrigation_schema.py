"""
Pydantic schemas for request/response validation
Ensures type safety and API documentation
"""

from pydantic import BaseModel, Field
from pydantic import ConfigDict
from typing import Optional, List
from datetime import datetime

class IrrigationPredictionRequest(BaseModel):
    """Request model for irrigation prediction"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "temperature": 28.5,
                "humidity": 65,
                "soil_moisture": 45,
                "rainfall": 5.2,
                "crop_type": "wheat",
                "latitude": 28.6139,
                "longitude": 77.209,
                "soil_erosion_risk": "MODERATE",
            }
        }
    )
    
    temperature: float = Field(
        ...,
        ge=-10, le=50,
        description="Temperature in Celsius"
    )
    humidity: float = Field(
        ...,
        ge=0, le=100,
        description="Humidity percentage"
    )
    soil_moisture: float = Field(
        ...,
        ge=0, le=100,
        description="Soil moisture percentage"
    )
    rainfall: float = Field(
        ...,
        ge=0, le=500,
        description="Recent rainfall in mm"
    )
    crop_type: str = Field(
        ...,
        description="Type of crop (e.g., wheat, rice, cotton, corn)"
    )

    latitude: Optional[float] = Field(
        default=None,
        description="Selected farm latitude from map picker"
    )
    longitude: Optional[float] = Field(
        default=None,
        description="Selected farm longitude from map picker"
    )
    soil_erosion_risk: Optional[str] = Field(
        default=None,
        description="Estimated soil erosion risk from weather conditions"
    )
    predicted_water_requirement_mm: Optional[float] = Field(
        default=None,
        ge=0,
        description="Model-predicted net crop water requirement in mm, used by optimization calculations"
    )
    
class IrrigationPredictionResponse(BaseModel):
    """Response model for irrigation prediction"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "water_requirement_mm": 22.5,
                "crop_type": "wheat",
                "explanation": "Based on current conditions...",
                "confidence_score": 0.87,
                "watering_frequency_days": 3,
                "best_time_of_day": "Early morning (4-6 AM)",
            }
        }
    )
    
    water_requirement_mm: float = Field(
        ...,
        description="Recommended water requirement in millimeters"
    )
    crop_type: str = Field(
        ...,
        description="Crop type used for prediction"
    )
    explanation: str = Field(
        ...,
        description="GenAI-generated explanation for the recommendation"
    )
    confidence_score: float = Field(
        ...,
        ge=0, le=1,
        description="Model confidence score (0-1)"
    )
    watering_frequency_days: int = Field(
        ...,
        ge=1, le=30,
        description="Recommended watering frequency in days"
    )
    best_time_of_day: str = Field(
        ...,
        description="Best time to irrigate"
    )
    timestamp: Optional[datetime] = Field(
        default_factory=datetime.now,
        description="Response timestamp"
    )
    
class AlertResponse(BaseModel):
    """Response model for alert generation"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "severity": "high",
                "message": "HIGH ALERT: Drought conditions detected...",
                "recommended_action": "URGENT IRRIGATION NEEDED - Schedule irrigation within 4-6 hours...",
            }
        }
    )
    
    severity: str = Field(
        ...,
        description="Alert severity: low, medium, high, critical"
    )
    message: str = Field(
        ...,
        description="Descriptive alert message"
    )
    recommended_action: str = Field(
        ...,
        description="Recommended action to take"
    )
    alert_timestamp: Optional[datetime] = Field(
        default_factory=datetime.now,
        description="Alert generation timestamp"
    )
    
class OptimizationStrategyResponse(BaseModel):
    """Response model for optimization strategy"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "potential_water_saving_percent": 45,
                "drip_irrigation_setup": {
                    "system_type": "Drip Irrigation System",
                    "emitter_spacing_cm": 20,
                    "dripper_flow_rate_lph": 2.0,
                },
                "water_conservation_tips": [
                    "Install drip irrigation...",
                    "Irrigate during early morning...",
                ],
                "expected_cost_savings_percent": 22.5,
            }
        }
    )
    
    potential_water_saving_percent: float = Field(
        ...,
        description="Potential water saving percentage from optimization"
    )
    drip_irrigation_setup: dict = Field(
        ...,
        description="Drip irrigation system recommendations"
    )
    water_conservation_tips: List[str] = Field(
        ...,
        description="List of water conservation tips"
    )
    expected_cost_savings_percent: float = Field(
        ...,
        description="Expected cost savings percentage"
    )
    recommended_water_mm: float = Field(
        ...,
        description="Recommended applied irrigation depth per cycle in mm"
    )
    conventional_water_mm: float = Field(
        ...,
        description="Estimated conventional applied irrigation depth per cycle in mm"
    )
    water_saved_mm: float = Field(
        ...,
        description="Estimated water saved per cycle in mm"
    )
    recommended_water_l_per_m2: float = Field(
        ...,
        description="Recommended water volume per cycle in litres per square metre"
    )
    water_saved_l_per_m2: float = Field(
        ...,
        description="Estimated water saved per cycle in litres per square metre"
    )
    recommended_water_m3_per_hectare: float = Field(
        ...,
        description="Recommended water volume per cycle in cubic metres per hectare"
    )
    water_saved_m3_per_hectare: float = Field(
        ...,
        description="Estimated water saved per cycle in cubic metres per hectare"
    )
    calculation_basis: str = Field(
        ...,
        description="Efficiency assumptions used for the volume and saving calculation"
    )
    
