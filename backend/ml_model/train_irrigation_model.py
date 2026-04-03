"""
Model Training Module - Trains regression model and saves artifacts
"""

import joblib
import logging
import os
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import numpy as np

try:
    from ml_model.data_preprocessing import IrrigationDataPreprocessor
except ImportError:
    from data_preprocessing import IrrigationDataPreprocessor

logger = logging.getLogger(__name__)

class IrrigationModelTrainer:
    """Handles ML model training for irrigation prediction"""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.preprocessor = IrrigationDataPreprocessor()
    
    def train(self, dataset_path: str, models_dir: str = "models") -> dict:
        """
        Train irrigation prediction model
        
        Args:
            dataset_path: Path to irrigation_data.csv
            models_dir: Directory to save model artifacts
            
        Returns:
            Dictionary with training metrics
        """
        try:
            logger.info("Starting model training...")
            
            # Preprocess data
            X, y, scaler, encoder = self.preprocessor.load_and_preprocess(dataset_path)
            logger.info(f"Data shape: {X.shape}")
            
            # Train-test split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            logger.info(f"Training set: {X_train.shape}, Test set: {X_test.shape}")
            
            # Train model
            logger.info("Training RandomForest model...")
            self.model.fit(X_train, y_train)
            logger.info("Model training completed")
            
            # Evaluate model
            metrics = self._evaluate_model(X_test, y_test)
            logger.info(f"Model Metrics:\n{metrics}")
            
            # Save artifacts
            self._save_artifacts(self.model, scaler, encoder, models_dir)
            
            logger.info("All artifacts saved successfully")
            return metrics
            
        except Exception as e:
            logger.error(f"Training error: {e}")
            raise
    
    def _evaluate_model(self, X_test, y_test) -> dict:
        """Evaluate model performance"""
        
        y_pred = self.model.predict(X_test)
        
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2_score': r2_score(y_test, y_pred)
        }
        
        return metrics
    
    def _save_artifacts(self, model, scaler, encoder, models_dir: str):
        """Save trained model and preprocessing artifacts"""
        
        # Create models directory if not exists
        Path(models_dir).mkdir(parents=True, exist_ok=True)
        
        # Save model
        model_path = os.path.join(models_dir, "irrigation_model.pkl")
        joblib.dump(model, model_path)
        logger.info(f"Model saved: {model_path}")
        
        # Save scaler
        scaler_path = os.path.join(models_dir, "scaler.pkl")
        joblib.dump(scaler, scaler_path)
        logger.info(f"Scaler saved: {scaler_path}")
        
        # Save encoder
        encoder_path = os.path.join(models_dir, "crop_encoder.pkl")
        joblib.dump(encoder, encoder_path)
        logger.info(f"Encoder saved: {encoder_path}")

def load_model_artifacts(model_path: str, scaler_path: str, encoder_path: str) -> tuple:
    """
    Load saved model artifacts
    
    Args:
        model_path: Path to irrigation_model.pkl
        scaler_path: Path to scaler.pkl
        encoder_path: Path to crop_encoder.pkl
        
    Returns:
        Tuple of (model, scaler, encoder)
    """
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        encoder = joblib.load(encoder_path)
        
        logger.info("Model artifacts loaded successfully")
        return model, scaler, encoder
    except Exception as e:
        logger.error(f"Error loading artifacts: {e}")
        raise

if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Train model
    trainer = IrrigationModelTrainer()
    
    base_dir = Path(__file__).resolve().parents[2]
    dataset_path = str(base_dir / "dataset" / "irrigation_data.csv")
    models_dir = str(base_dir / "models")
    
    # Create sample dataset if it doesn't exist
    if not os.path.exists(dataset_path):
        IrrigationDataPreprocessor.create_sample_dataset(dataset_path)
    
    # Train
    metrics = trainer.train(dataset_path, models_dir)
    print("\nTraining completed successfully!")
    print(f"Model saved in: {models_dir}/")
