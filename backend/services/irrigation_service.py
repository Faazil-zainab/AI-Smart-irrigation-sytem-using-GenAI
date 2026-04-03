"""
Irrigation Service - Core business logic for irrigation predictions
Handles ML model inference and GenAI explanation generation
"""

import logging
from typing import Dict, Any
import pandas as pd
from schemas.irrigation_schema import IrrigationPredictionRequest, IrrigationPredictionResponse

logger = logging.getLogger(__name__)

class IrrigationService:
    """Service for irrigation predictions and GenAI explanations"""
    
    def __init__(self, model, scaler, encoder, genai_model):
        """
        Initialize service with ML model artifacts
        
        Args:
            model: Trained scikit-learn regression model
            scaler: Preprocessing scaler for features
            encoder: Label encoder for crop types
            genai_model: HuggingFace GenAI model for explanations
        """
        self.model = model
        self.scaler = scaler
        self.encoder = encoder
        self.genai_model = genai_model
    
    async def predict_irrigation_requirement(
        self,
        request: IrrigationPredictionRequest
    ) -> IrrigationPredictionResponse:
        """
        Predict irrigation water requirement in mm
        Uses regression model and generates GenAI explanation
        
        Args:
            request: Irrigation prediction request with sensor data
            
        Returns:
            Prediction response with water requirement and explanation
        """
        try:
            # Extract features from request
            features = self._prepare_features(request)
            
            # Scale features using training scaler
            scaled_features = self.scaler.transform(features)[0]
            
            # Make prediction using trained model
            prediction = self.model.predict([scaled_features])[0]
            
            # Ensure non-negative prediction
            water_requirement_mm = max(0, float(prediction))
            
            # Generate GenAI explanation
            explanation = await self._generate_explanation(
                request,
                water_requirement_mm
            )
            
            logger.info(f"Prediction successful: {water_requirement_mm:.2f} mm")
            
            return IrrigationPredictionResponse(
                water_requirement_mm=water_requirement_mm,
                crop_type=request.crop_type,
                explanation=explanation,
                confidence_score=0.85,  # Can be computed from model
                watering_frequency_days=self._calculate_frequency(water_requirement_mm),
                best_time_of_day="Early morning (4-6 AM)"
            )
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def _prepare_features(self, request: IrrigationPredictionRequest) -> list:
        """
        Prepare feature array for ML model
        Order must match training data order
        """
        try:
            crop_type = request.crop_type.lower()
            valid_crops = list(getattr(self.encoder, "classes_", []))

            if valid_crops and crop_type not in valid_crops:
                logger.warning(
                    f"Unknown crop_type '{request.crop_type}', falling back to '{valid_crops[0]}'"
                )
                crop_type = valid_crops[0]

            crop_encoded = self.encoder.transform([crop_type])[0]
            vpd = request.temperature * (1 - request.humidity / 100)
            moisture_deficit = max(0, 100 - request.soil_moisture - (request.rainfall / 100))

            return pd.DataFrame(
                [
                    [
                        request.temperature,
                        request.humidity,
                        request.soil_moisture,
                        request.rainfall,
                        crop_encoded,
                        vpd,
                        moisture_deficit,
                    ]
                ],
                columns=[
                    "temperature",
                    "humidity",
                    "soil_moisture",
                    "rainfall",
                    "crop_type",
                    "vpd",
                    "moisture_deficit",
                ],
            )
        except Exception as e:
            logger.error(f"Feature preparation error: {e}")
            raise

    def _irrigation_advice_by_risk(self, soil_erosion_risk: str | None) -> str:
        """Return operational guidance based on erosion risk."""
        if not soil_erosion_risk:
            return ""

        if soil_erosion_risk.upper() == "HIGH":
            return " Soil erosion risk is high, so reduce irrigation pressure and prefer drip irrigation to minimize runoff."

        return ""
    
    async def _generate_explanation(
        self,
        request: IrrigationPredictionRequest,
        prediction: float
    ) -> str:
        """
        Generate GenAI explanation using HuggingFace Transformers
        
        Args:
            request: Original input request
            prediction: Model prediction
            
        Returns:
            Human-readable explanation string
        """
        try:
            # Create context for GenAI model
            context = f"""
            You are an irrigation advisor.
            Crop type: {request.crop_type}
            Latitude: {request.latitude if request.latitude is not None else 'unknown'}
            Longitude: {request.longitude if request.longitude is not None else 'unknown'}
            Temperature: {request.temperature}°C
            Humidity: {request.humidity}%
            Soil moisture: {request.soil_moisture}%
            Recent rainfall: {request.rainfall}mm
            Soil erosion risk level: {request.soil_erosion_risk or 'unknown'}
            Predicted irrigation water requirement: {prediction:.2f}mm

            Write a concise 2 sentence explanation for a farmer. Do not repeat phrases.
            """
            
            # Generate explanation using GenAI model
            if self.genai_model:
                explanation = self.genai_model(context, max_length=120, min_length=30)[0]["generated_text"]
                explanation = self._clean_explanation(explanation, request, prediction)
            else:
                # Fallback explanation if GenAI not available
                explanation = f"Based on current conditions, {request.crop_type} requires {prediction:.2f}mm of water. Temperature and humidity levels indicate moderate water demand. Apply irrigation through drip system for optimal efficiency."

            explanation += self._irrigation_advice_by_risk(request.soil_erosion_risk)
            
            return explanation
        except Exception as e:
            logger.warning(f"GenAI explanation error, using fallback: {e}")
            return f"Irrigation requirement: {prediction:.2f}mm based on current sensor conditions."

    def _clean_explanation(self, explanation: str, request: IrrigationPredictionRequest, prediction: float) -> str:
        """Remove repeated sentences and fall back to a clean summary when the model output is noisy."""
        if not explanation:
            return f"Based on the current field conditions, {request.crop_type} needs about {prediction:.2f} mm of irrigation. Monitor soil moisture and irrigate early in the morning for better efficiency."

        sentences = []
        seen = set()

        for raw_sentence in explanation.replace("\n", " ").split('.'):
            sentence = raw_sentence.strip()
            if not sentence:
                continue
            key = sentence.lower()
            if key in seen:
                continue
            seen.add(key)
            sentences.append(sentence)

        cleaned = '. '.join(sentences).strip()
        if cleaned and not cleaned.endswith('.'):
            cleaned += '.'

        if len(cleaned) < 40:
            return f"Based on the current field conditions, {request.crop_type} needs about {prediction:.2f} mm of irrigation. Monitor soil moisture and irrigate early in the morning for better efficiency."

        return cleaned
    
    def _calculate_frequency(self, water_requirement: float) -> int:
        """Calculate watering frequency in days based on requirement"""
        if water_requirement < 10:
            return 4  # Every 4 days
        elif water_requirement < 20:
            return 3  # Every 3 days
        elif water_requirement < 30:
            return 2  # Every 2 days
        else:
            return 1  # Daily
