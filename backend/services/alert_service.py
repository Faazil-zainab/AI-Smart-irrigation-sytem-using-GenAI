"""
Alert Service - Generates irrigation alerts based on conditions
"""

import logging
from typing import Dict, Any
from datetime import datetime
from schemas.irrigation_schema import IrrigationPredictionRequest, AlertResponse
from enum import Enum

logger = logging.getLogger(__name__)

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertService:
    """Service for generating irrigation alerts"""
    
    async def generate_alert(
        self,
        request: IrrigationPredictionRequest
    ) -> AlertResponse:
        """
        Generate irrigation alert based on current conditions
        
        Args:
            request: Irrigation prediction request with sensor data
            
        Returns:
            Alert with severity and recommended action
        """
        try:
            if request.soil_erosion_risk and request.soil_erosion_risk.upper() == "HIGH":
                return AlertResponse(
                    severity=AlertSeverity.HIGH,
                    message="High soil erosion risk detected. Avoid heavy irrigation.",
                    recommended_action="Use low-pressure drip irrigation and reduce runoff by applying smaller water cycles.",
                    alert_timestamp=datetime.now(),
                )

            severity = self._determine_severity(request)
            alert_message = self._create_alert_message(request, severity)
            action = self._recommend_action(request, severity)
            
            logger.info(f"Alert generated: {severity} - {action}")
            
            return AlertResponse(
                severity=severity,
                message=alert_message,
                recommended_action=action,
                alert_timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Alert generation error: {e}")
            raise
    
    def _determine_severity(self, request: IrrigationPredictionRequest) -> AlertSeverity:
        """Determine alert severity based on conditions"""
        
        # Soil moisture critical
        if request.soil_moisture < 20:
            return AlertSeverity.CRITICAL
        
        # Soil moisture low
        if request.soil_moisture < 35:
            return AlertSeverity.HIGH
        
        # High temperature + low humidity + low soil moisture
        if request.temperature > 35 and request.humidity < 30 and request.soil_moisture < 50:
            return AlertSeverity.HIGH
        
        # Moderate drought conditions
        if request.soil_moisture < 45:
            return AlertSeverity.MEDIUM
        
        # Normal conditions
        return AlertSeverity.LOW
    
    def _create_alert_message(
        self,
        request: IrrigationPredictionRequest,
        severity: AlertSeverity
    ) -> str:
        """Create descriptive alert message"""
        
        messages = {
            AlertSeverity.CRITICAL: f"CRITICAL: Soil moisture critically low at {request.soil_moisture}%. Immediate irrigation required!",
            AlertSeverity.HIGH: f"HIGH ALERT: Drought conditions detected. Soil moisture at {request.soil_moisture}% with temperature {request.temperature}°C.",
            AlertSeverity.MEDIUM: f"MEDIUM ALERT: Moderate drought conditions. Soil moisture at {request.soil_moisture}%. Schedule irrigation soon.",
            AlertSeverity.LOW: f"LOW: Current conditions are normal. Soil moisture at {request.soil_moisture}%.",
        }
        
        return messages.get(severity, "Unknown alert")
    
    def _recommend_action(
        self,
        request: IrrigationPredictionRequest,
        severity: AlertSeverity
    ) -> str:
        """Recommend action based on alert severity"""
        
        actions = {
            AlertSeverity.CRITICAL: "IRRIGATE IMMEDIATELY - Apply emergency irrigation within 1 hour. Use flood or sprinkler irrigation if drip system not available.",
            AlertSeverity.HIGH: "URGENT IRRIGATION NEEDED - Schedule irrigation within 4-6 hours. Use drip irrigation for optimal water use.",
            AlertSeverity.MEDIUM: "SCHEDULE IRRIGATION - Plan irrigation for tomorrow morning. Monitor soil moisture closely.",
            AlertSeverity.LOW: "CONTINUE NORMAL SCHEDULE - No immediate action needed. Monitor conditions."
        }
        
        return actions.get(severity, "Monitor conditions")
