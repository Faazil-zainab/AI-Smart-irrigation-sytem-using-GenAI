"""
Optimization Service - Water-saving strategies and drip irrigation recommendations
"""

import logging
from typing import Dict, Any, List
from schemas.irrigation_schema import IrrigationPredictionRequest, OptimizationStrategyResponse

logger = logging.getLogger(__name__)

class OptimizationService:
    """Service for generating water-saving optimization strategies"""
    
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
            water_savings = self._calculate_water_savings(request)
            drip_setup = self._generate_drip_setup(request)
            tips = self._generate_tips(request)
            
            logger.info(f"Optimization strategy generated - potential savings: {water_savings}%")
            
            return OptimizationStrategyResponse(
                potential_water_saving_percent=water_savings,
                drip_irrigation_setup=drip_setup,
                water_conservation_tips=tips,
                expected_cost_savings_percent=water_savings * 0.5  # Cost savings approximately 50% of water savings
            )
        except Exception as e:
            logger.error(f"Optimization error: {e}")
            raise
    
    def _calculate_water_savings(self, request: IrrigationPredictionRequest) -> float:
        """
        Calculate potential water savings from optimization
        Assuming drip irrigation vs traditional flooding
        """
        # Base savings from drip irrigation
        base_savings = 40  # 40-50% typical savings
        
        # Additional savings based on conditions
        if request.humidity > 70:
            base_savings += 5  # High humidity - less water needed
        
        if request.rainfall > 10:
            base_savings += 5  # Recent rain - can reduce frequency
        
        if request.temperature < 20:
            base_savings += 3  # Cooler temps - less evaporation
        
        return min(base_savings, 60)  # Cap at 60% savings
    
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
