"""
GenAI Engine - HuggingFace Transformers for irrigation explanations
Uses flan-t5-base for generating readable irrigation recommendations
"""

import logging

import torch

logger = logging.getLogger(__name__)


class FlanT5Generator:
    """Callable wrapper around a seq2seq FLAN-T5 model."""

    def __init__(self, model_name: str):
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def __call__(self, prompt: str, max_length: int = 150, min_length: int = 50):
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True).to(self.device)
        output_ids = self.model.generate(
            **inputs,
            max_new_tokens=max_length,
            min_new_tokens=min_length,
            do_sample=False,
        )
        generated_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        return [{"generated_text": generated_text}]


class IrrigationGenAIEngine:
    """GenAI engine for generating irrigation explanations and suggestions"""

    def __init__(self, model=None):
        """
        Initialize GenAI engine

        Args:
            model: Callable model object (optional, loaded on first use)
        """
        self.model = model
        self.model_name = "google/flan-t5-base"

    def generate_explanation(self, context: str, max_length: int = 150) -> str:
        """
        Generate GenAI explanation for irrigation recommendation

        Args:
            context: Context string with sensor data and prediction
            max_length: Maximum length of generated text

        Returns:
            Generated explanation string
        """
        try:
            if self.model is None:
                return self._get_fallback_explanation(context)

            output = self.model(context, max_length=max_length, min_length=50)
            return output[0]["generated_text"]
        except Exception as e:
            logger.warning(f"GenAI generation failed, using fallback: {e}")
            return self._get_fallback_explanation(context)

    def suggest_watering_frequency(self, soil_moisture: float, temperature: float) -> dict:
        """
        Suggest optimal watering frequency

        Args:
            soil_moisture: Current soil moisture percentage
            temperature: Current temperature in Celsius

        Returns:
            Dictionary with frequency suggestion
        """

        prompt = f"""
        Based on soil moisture of {soil_moisture}% and temperature of {temperature}°C,
        suggest the optimal watering frequency for crops.
        """

        try:
            if self.model:
                suggestion = self.model(prompt, max_length=100)[0]["generated_text"]
            else:
                suggestion = self._calculate_frequency_rule(soil_moisture, temperature)

            return {
                "suggestion": suggestion,
                "confidence": 0.85,
            }
        except Exception as e:
            logger.warning(f"Frequency suggestion error: {e}")
            return {
                "suggestion": self._calculate_frequency_rule(soil_moisture, temperature),
                "confidence": 0.70,
            }

    def suggest_drip_optimization(self, crop_type: str, soil_type: str) -> dict:
        """
        Suggest drip irrigation optimization strategies

        Args:
            crop_type: Type of crop
            soil_type: Type of soil

        Returns:
            Dictionary with drip irrigation suggestions
        """

        prompt = f"""
        For {crop_type} crops in {soil_type} soil, suggest optimal drip irrigation setup.
        Include emitter spacing, flow rate, and maintenance tips.
        """

        try:
            if self.model:
                suggestions = self.model(prompt, max_length=150)[0]["generated_text"]
            else:
                suggestions = self._get_drip_defaults(crop_type)

            return {
                "suggestions": suggestions,
                "implementation_effort": "Medium",
            }
        except Exception as e:
            logger.warning(f"Drip optimization error: {e}")
            return {
                "suggestions": self._get_drip_defaults(crop_type),
                "implementation_effort": "Medium",
            }

    def _get_fallback_explanation(self, context: str) -> str:
        """Provide rule-based explanation when GenAI unavailable"""

        return (
            "Based on current environmental conditions, the irrigation system recommends "
            "the specified water amount. Monitor soil moisture closely and adjust watering "
            "frequency based on weather patterns and crop growth stage."
        )

    def _calculate_frequency_rule(self, soil_moisture: float, temperature: float) -> str:
        """Rule-based watering frequency calculation"""

        if soil_moisture < 30:
            return "Daily irrigation required - soil is very dry"
        elif soil_moisture < 45:
            return "Irrigation every 2 days recommended"
        elif soil_moisture < 60:
            return "Irrigation every 3-4 days is suitable"
        else:
            return "Current moisture is sufficient - water only when needed"

    def _get_drip_defaults(self, crop_type: str) -> str:
        """Default drip irrigation recommendations by crop"""

        defaults = {
            "wheat": "20cm emitter spacing, 2.0 LPH flow rate, drip water on furrows",
            "rice": "25cm emitter spacing, 3.0 LPH flow rate, flood application method",
            "cotton": "30cm emitter spacing, 2.5 LPH flow rate, lateral line drip system",
            "corn": "35cm emitter spacing, 2.0 LPH flow rate, main line drip with laterals",
            "vegetables": "15cm emitter spacing, 1.5 LPH flow rate, closely spaced emitters",
            "orchard": "40cm emitter spacing, 4.0 LPH flow rate, tree-per-point application",
        }

        return defaults.get(crop_type.lower(), "Custom drip system recommended based on field assessment")


def initialize_genai_model():
    """
    Initialize HuggingFace Transformers model
    Currently configured for FLAN-T5

    Returns:
        Callable generator object or None if initialization fails
    """
    try:
        model = FlanT5Generator("google/flan-t5-base")
        logger.info("GenAI model initialized successfully")
        return model
    except Exception as e:
        logger.warning(f"GenAI model initialization failed: {e}")
        logger.info("Falling back to rule-based explanations")
        return None
