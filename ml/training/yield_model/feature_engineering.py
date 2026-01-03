"""
Feature engineering for yield prediction model.
Handles feature creation, transformation, and encoding.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """
    Feature engineering class for yield prediction.
    """
    
    def __init__(self):
        """Initialize the feature engineer."""
        self.crop_encoding = {
            'rice': 0, 'wheat': 1, 'cotton': 2, 'sugarcane': 3, 'maize': 4
        }
        self.soil_encoding = {
            'alluvial': 0, 'black': 1, 'red': 2, 'laterite': 3, 'desert': 4
        }
        self.irrigation_encoding = {
            'drip': 0, 'sprinkler': 1, 'flood': 2, 'rainfed': 3
        }
    
    def encode_crop_type(self, crop_type: str) -> int:
        """Encode crop type to numeric value."""
        return self.crop_encoding.get(crop_type.lower().strip(), 0)
    
    def encode_soil_type(self, soil_type: str) -> int:
        """Encode soil type to numeric value."""
        return self.soil_encoding.get(soil_type.lower().strip(), 0)
    
    def encode_irrigation_type(self, irrigation_type: str) -> int:
        """Encode irrigation type to numeric value."""
        return self.irrigation_encoding.get(irrigation_type.lower().strip(), 0)
    
    def parse_land_size(self, land_size: str) -> float:
        """
        Parse land size string to hectares.
        
        Args:
            land_size: String like "5 acre"
            
        Returns:
            Area in hectares
        """
        conversion_factors = {
            'acre': 0.404686,
            'hectare': 1.0,
            'hectares': 1.0,
            'bigha': 0.1338,
            'katha': 0.0067,
            'kanal': 0.0506,
            'marla': 0.0025,
            'guntha': 0.0101,
            'cent': 0.0040,
        }
        
        try:
            parts = land_size.strip().split()
            value = float(parts[0])
            unit = parts[1].lower()
            return value * conversion_factors.get(unit, 1.0)
        except Exception as e:
            logger.error(f"Error parsing land size: {e}")
            return 1.0
    
    def calculate_days_since_sowing(self, sowing_date: str) -> int:
        """Calculate days since sowing date."""
        try:
            sowing = datetime.strptime(sowing_date, '%Y-%m-%d')
            today = datetime.now()
            return max(0, (today - sowing).days)
        except Exception:
            return 90
    
    def determine_season(self, sowing_date: str) -> tuple:
        """Determine if crop is in Kharif or Rabi season."""
        try:
            sowing = datetime.strptime(sowing_date, '%Y-%m-%d')
            month = sowing.month
            is_kharif = 6 <= month <= 10
            is_rabi = month >= 11 or month <= 4
            return (1 if is_kharif else 0, 1 if is_rabi else 0)
        except Exception:
            return (0, 0)
    
    def extract_weather_features(self, weather_data: Optional[Dict[str, Any]]) -> Dict[str, float]:
        """Extract and normalize weather features."""
        defaults = {
            'temperature': 25.0,
            'rainfall': 0.0,
            'humidity': 60.0,
            'wind_speed': 5.0,
            'sunshine_hours': 8.0,
        }
        
        if not weather_data:
            return defaults
        
        return {key: float(weather_data.get(key, default)) 
                for key, default in defaults.items()}
    
    def create_features(self, row: pd.Series) -> np.ndarray:
        """
        Create feature vector from a data row.
        
        Args:
            row: Pandas Series with crop data
            
        Returns:
            Feature array
        """
        # Encode categorical features
        crop_encoded = self.encode_crop_type(row.get('crop_type', 'rice'))
        soil_encoded = self.encode_soil_type(row.get('soil_type', 'alluvial'))
        irrigation_encoded = self.encode_irrigation_type(row.get('irrigation_type', 'drip'))
        
        # Parse land size
        land_size_hectares = self.parse_land_size(row.get('land_size', '1 hectare'))
        
        # Calculate days since sowing
        days_since_sowing = self.calculate_days_since_sowing(row.get('sowing_date', '2024-01-01'))
        
        # Determine season
        is_kharif, is_rabi = self.determine_season(row.get('sowing_date', '2024-01-01'))
        
        # Extract weather features
        weather = self.extract_weather_features(row.get('weather_features'))
        
        # Convert fertilizer usage to kg/hectare
        fertilizer_usage = float(row.get('fertilizer_usage', 50))
        fertilizer_kg_per_hectare = fertilizer_usage / 0.4047
        
        # Create feature vector
        features = np.array([
            crop_encoded,
            land_size_hectares,
            days_since_sowing,
            soil_encoded,
            irrigation_encoded,
            fertilizer_kg_per_hectare,
            weather['temperature'],
            weather['rainfall'],
            weather['humidity'],
            weather['wind_speed'],
            weather['sunshine_hours'],
            is_kharif,
            is_rabi
        ])
        
        return features
    
    def create_synthetic_dataset(self, num_samples: int = 1000) -> pd.DataFrame:
        """
        Create synthetic dataset for training when real data is not available.
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            DataFrame with synthetic data
        """
        logger.info(f"Creating synthetic dataset with {num_samples} samples")
        
        np.random.seed(42)
        
        crop_types = ['rice', 'wheat', 'cotton', 'sugarcane', 'maize']
        soil_types = ['alluvial', 'black', 'red', 'laterite', 'desert']
        irrigation_types = ['drip', 'sprinkler', 'flood', 'rainfed']
        
        data = []
        for i in range(num_samples):
            crop_type = np.random.choice(crop_types)
            soil_type = np.random.choice(soil_types)
            irrigation_type = np.random.choice(irrigation_types)
            
            # Generate realistic values
            land_size_value = np.random.uniform(0.5, 50)
            land_size_unit = np.random.choice(['acre', 'hectare', 'bigha'])
            land_size = f"{land_size_value:.1f} {land_size_unit}"
            
            # Generate sowing date (within last year)
            days_ago = np.random.randint(0, 365)
            sowing_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            fertilizer_usage = np.random.uniform(0, 200)
            
            # Weather features
            weather_features = {
                'temperature': np.random.uniform(15, 35),
                'rainfall': np.random.uniform(0, 300),
                'humidity': np.random.uniform(30, 90),
                'wind_speed': np.random.uniform(0, 20),
                'sunshine_hours': np.random.uniform(4, 12)
            }
            
            # Calculate approximate yield (simplified formula)
            base_yield = {
                'rice': 40, 'wheat': 35, 'cotton': 25, 'sugarcane': 60, 'maize': 30
            }[crop_type]
            
            # Add variations based on factors
            yield_multiplier = 1.0
            yield_multiplier += (fertilizer_usage - 50) / 500  # Fertilizer effect
            yield_multiplier += (weather_features['rainfall'] - 100) / 500  # Rainfall effect
            yield_multiplier += (weather_features['temperature'] - 25) / 100  # Temperature effect
            
            predicted_yield = base_yield * yield_multiplier * land_size_value
            predicted_yield = max(0, predicted_yield)  # Ensure non-negative
            
            data.append({
                'crop_type': crop_type,
                'land_size': land_size,
                'sowing_date': sowing_date,
                'soil_type': soil_type,
                'irrigation_type': irrigation_type,
                'fertilizer_usage': fertilizer_usage,
                'weather_features': weather_features,
                'yield': predicted_yield
            })
        
        df = pd.DataFrame(data)
        logger.info(f"Created synthetic dataset: {len(df)} samples")
        return df