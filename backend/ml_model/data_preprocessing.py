"""
Data Preprocessing Module - Cleaning, encoding, and scaling irrigation dataset
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import logging
import os
import re

logger = logging.getLogger(__name__)

class IrrigationDataPreprocessor:
    """Handles data cleaning and preprocessing for irrigation dataset"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.encoder = LabelEncoder()
        
    def load_and_preprocess(self, dataset_path: str) -> tuple:
        """
        Load and preprocess irrigation dataset
        
        Args:
            dataset_path: Path to irrigation_data.csv
            
        Returns:
            Tuple of (X_processed, y, scaler, encoder)
        """
        try:
            # Load dataset
            df = pd.read_csv(dataset_path)
            df = self._normalize_columns(df)
            logger.info(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
            
            # Data cleaning
            df = self._clean_data(df)
            logger.info("Data cleaned")
            
            # Feature engineering
            df = self._engineer_features(df)
            logger.info("Features engineered")
            
            # Separate features and target
            # Assuming 'irrigation_amount' is the target variable
            if 'irrigation_amount' in df.columns:
                y = df['irrigation_amount'].values
                X = df.drop('irrigation_amount', axis=1)
            else:
                # Fallback if target column name is different
                y = df.iloc[:, -1].values
                X = df.iloc[:, :-1]
            
            # Encode categorical features
            X = self._encode_features(X)
            logger.info("Features encoded")
            
            # Scale numerical features
            X_scaled = self.scaler.fit_transform(X)
            logger.info("Features scaled")
            
            return X_scaled, y, self.scaler, self.encoder
            
        except Exception as e:
            logger.error(f"Preprocessing error: {e}")
            raise

    def _normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize column names to snake_case field names used by the pipeline."""

        rename_map = {}

        for column in df.columns:
            normalized = column.strip().lower()
            normalized = re.sub(r"\(.*?\)", "", normalized)
            normalized = normalized.replace("%", "")
            normalized = normalized.replace("°", "")
            normalized = re.sub(r"[^a-z0-9]+", "_", normalized)
            normalized = re.sub(r"_+", "_", normalized).strip("_")
            rename_map[column] = normalized

        return df.rename(columns=rename_map)
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean dataset: handle missing values, outliers"""
        
        # Remove duplicate rows
        df = df.drop_duplicates()
        
        # Handle missing values
        for col in df.columns:
            if df[col].dtype in ['float64', 'int64']:
                # Fill numeric columns with median
                df[col] = df[col].fillna(df[col].median())
            else:
                # Fill categorical columns with mode
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'unknown')
        
        # Remove rows with missing values
        df = df.dropna()
        
        return df
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create engineered features from raw data"""
        
        # Example feature engineering for irrigation data
        # Adjust based on actual dataset columns
        
        if 'temperature' in df.columns and 'humidity' in df.columns:
            # Create VPD (Vapor Pressure Deficit) as proxy for evaporation
            df['vpd'] = df['temperature'] * (1 - df['humidity'] / 100)
        
        if 'rainfall' in df.columns and 'soil_moisture' in df.columns:
            # Create moisture deficit
            df['moisture_deficit'] = 100 - df['soil_moisture'] - (df['rainfall'] / 100)
            df['moisture_deficit'] = df['moisture_deficit'].clip(lower=0)
        
        return df
    
    def _encode_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical features"""
        
        # Find categorical columns
        categorical_cols = X.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col == 'crop_type':
                # Use label encoder for crop_type
                X[col] = self.encoder.fit_transform(X[col])
            else:
                # One-hot encode other categorical features
                X = pd.get_dummies(X, columns=[col], drop_first=True)
        
        return X
    
    @staticmethod
    def create_sample_dataset(output_path: str, num_samples: int = 1000):
        """
        Create sample irrigation dataset for testing
        
        Args:
            output_path: Path to save CSV
            num_samples: Number of samples to generate
        """
        np.random.seed(42)
        
        data = {
            'temperature': np.random.uniform(10, 40, num_samples),
            'humidity': np.random.uniform(20, 90, num_samples),
            'soil_moisture': np.random.uniform(20, 80, num_samples),
            'rainfall': np.random.uniform(0, 50, num_samples),
            'crop_type': np.random.choice(['wheat', 'rice', 'cotton', 'corn', 'vegetables', 'orchard'], num_samples),
            'irrigation_amount': np.random.uniform(5, 50, num_samples)
        }
        
        df = pd.DataFrame(data)
        df.to_csv(output_path, index=False)
        logger.info(f"Sample dataset created: {output_path}")
        
        return df
