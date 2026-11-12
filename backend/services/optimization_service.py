"""
Optimization Service - Water-saving strategies and drip irrigation recommendations
"""

import logging
from typing import Dict, Any, List
from numbers import Real
from schemas.irrigation_schema import IrrigationPredictionRequest, OptimizationStrategyResponse

logger = logging.getLogger(__name__)

class OptimizationService:
    """Service for generating water-saving optimization strategies"""

    DRIP_EFFICIENCY = 0.90
    CONVENTIONAL_EFFICIENCY = 0.60
    
    async def generate_optimization_strategy(
        self,
        request: IrrigationPredictionRequest
    ) -> OptimizationStrategyResponse:
        """
        Generate water-saving optimization strategies
        
        Args:
            request: Irrigation prediction request
            
        Returns:
            Optimization strategy with water saving tips and drip irrigation setup
        """
        try:
            water_metrics = self._calculate_water_metrics(request)
            water_savings = water_metrics["saving_percent"]
            drip_setup = self._generate_drip_setup(request)
            tips = self._generate_tips(request)
            
            logger.info(f"Optimization strategy generated - potential savings: {water_savings}%")
            
            return OptimizationStrategyResponse(
                potential_water_saving_percent=water_savings,
                drip_irrigation_setup=drip_setup,
                water_conservation_tips=tips,
                expected_cost_savings_percent=water_savings,
                recommended_water_mm=water_metrics["recommended_mm"],
                conventional_water_mm=water_metrics["conventional_mm"],
                water_saved_mm=water_metrics["saved_mm"],
                recommended_water_l_per_m2=water_metrics["recommended_mm"],
                water_saved_l_per_m2=water_metrics["saved_mm"],
                recommended_water_m3_per_hectare=water_metrics["recommended_mm"] * 10,
                water_saved_m3_per_hectare=water_metrics["saved_mm"] * 10,
                calculation_basis=(
                    "Per cycle: model-predicted net crop demand applied at "
                    "90% drip efficiency versus 60% conventional efficiency. "
                    "1 mm equals 1 L/m² or 10 m³/ha."
                )
            )
        except Exception as e:
            logger.error(f"Optimization error: {e}")
            raise
    
    def _calculate_water_metrics(self, request: IrrigationPredictionRequest) -> Dict[str, float]:
        """Convert the model's net demand into comparable applied water volumes."""
        recommendation = request.predicted_water_requirement_mm
        if recommendation is None:
            raise ValueError(
                "predicted_water_requirement_mm is required for an accurate water-saving calculation"
            )
        if isinstance(recommendation, bool) or not isinstance(recommendation, Real):
            raise ValueError("predicted_water_requirement_mm must be numeric")

        recommended_mm = max(0.0, float(recommendation))
        conventional_mm = recommended_mm * (
            self.DRIP_EFFICIENCY / self.CONVENTIONAL_EFFICIENCY
        )
        saved_mm = max(0.0, conventional_mm - recommended_mm)
        saving_percent = (
            (saved_mm / conventional_mm) * 100
            if conventional_mm > 0
            else 0.0
        )

        return {
            "recommended_mm": round(recommended_mm, 2),
            "conventional_mm": round(conventional_mm, 2),
            "saved_mm": round(saved_mm, 2),
            "saving_percent": round(saving_percent, 1),
        }
    
    def _generate_drip_setup(self, request: IrrigationPredictionRequest) -> Dict[str, Any]:
        """Generate drip irrigation setup recommendations"""
        
        setup = {
            "system_type": "Drip Irrigation System",
            "emitter_spacing_cm": self._calculate_emitter_spacing(request),
            "dripper_flow_rate_lph": self._calculate_dripper_flow(request),
            "setup_cost_estimation": "$500-$2000 per hectare",
            "roi_months": 12,
            "maintenance_schedule": "Weekly: Check for clogs, Monthly: Clean filters"
        }
        
        return setup
    
    def _calculate_emitter_spacing(self, request: IrrigationPredictionRequest) -> int:
        """Calculate optimal emitter spacing based on crop"""
        spacing_map = {
            "wheat": 20,
            "rice": 25,
            "cotton": 30,
            "corn": 35,
            "vegetables": 15,
            "orchard": 40
        }
        return spacing_map.get(request.crop_type.lower(), 25)
    
    def _calculate_dripper_flow(self, request: IrrigationPredictionRequest) -> float:
        """Calculate recommended dripper flow rate"""
        flow_map = {
            "wheat": 2.0,
            "rice": 3.0,
            "cotton": 2.5,
            "corn": 2.0,
            "vegetables": 1.5,
            "orchard": 4.0
        }
        return flow_map.get(request.crop_type.lower(), 2.0)
    
    def _generate_tips(self, request: IrrigationPredictionRequest) -> List[str]:
        """Generate water conservation tips based on conditions"""
        
        tips = [
            "Install drip irrigation for 40-50% water savings",
            "Irrigate during early morning (4-6 AM) to minimize evaporation",
            "Mulch around crops to retain soil moisture",
            "Use soil moisture sensors to optimize watering schedule"
        ]
        
        # Add condition-specific tips
        if request.temperature > 35:
            tips.append("High temperature detected - increase irrigation frequency slightly")
        
        if request.humidity < 30:
            tips.append("Low humidity - evaporation rate is high, water more frequently")
        
        if request.rainfall > 20:
            tips.append("Recent rainfall detected - consider reducing irrigation frequency")
        
        if request.soil_moisture < 40:
            tips.append("Soil moisture is low - prioritize immediate irrigation")
        else:
            tips.append("Soil moisture is adequate - maintain current schedule")
        
        return tips
