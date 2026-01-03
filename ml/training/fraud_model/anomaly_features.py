"""
Feature engineering for fraud detection model.
Handles creation of anomaly detection features.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnomalyFeatureEngineer:
    """
    Feature engineering class for fraud/anomaly detection.
    """
    
    def __init__(self):
        """Initialize the anomaly feature engineer."""
        self.crop_encoding = {
            'rice': 0, 'wheat': 1, 'cotton': 2, 'sugarcane': 3, 'maize': 4
        }
    
    def encode_crop_type(self, crop_type: str) -> int:
        """Encode crop type to numeric value."""
        return self.crop_encoding.get(crop_type.lower().strip(), 0)
    
    def parse_land_size(self, land_size: str) -> float:
        """Parse land size string to hectares."""
        conversion_factors = {
            'acre': 0.404686, 'hectare': 1.0, 'hectares': 1.0,
            'bigha': 0.1338, 'katha': 0.0067, 'kanal': 0.0506,
            'marla': 0.0025, 'guntha': 0.0101, 'cent': 0.0040,
        }
        
        try:
            parts = land_size.strip().split()
            value = float(parts[0])
            unit = parts[1].lower()
            return value * conversion_factors.get(unit, 1.0)
        except Exception:
            return 1.0
    
    def extract_weather_features(self, weather_data: Optional[Dict[str, Any]]) -> Dict[str, float]:
        """Extract weather features."""
        defaults = {
            'temperature': 25.0, 'rainfall': 0.0, 'humidity': 60.0,
            'wind_speed': 5.0, 'sunshine_hours': 8.0
        }
        
        if not weather_data:
            return defaults
        
        return {key: float(weather_data.get(key, default))
                for key, default in defaults.items()}
    
    def calculate_weather_anomaly_score(self, weather_features: Dict[str, float]) -> float:
        """Calculate weather anomaly score."""
        normal_ranges = {
            'temperature': (20, 35),
            'rainfall': (50, 150),
            'humidity': (40, 80),
        }
        
        anomaly_score = 0.0
        
        temp = weather_features.get('temperature', 25)
        if temp < normal_ranges['temperature'][0] or temp > normal_ranges['temperature'][1]:
            anomaly_score += 30
        
        rainfall = weather_features.get('rainfall', 0)
        if rainfall < normal_ranges['rainfall'][0] or rainfall > normal_ranges['rainfall'][1]:
            anomaly_score += 40
        
        humidity = weather_features.get('humidity', 60)
        if humidity < normal_ranges['humidity'][0] or humidity > normal_ranges['humidity'][1]:
            anomaly_score += 30
        
        return min(100.0, anomaly_score)
    
    def create_features(self, row: pd.Series) -> np.ndarray:
        """Create feature vector for anomaly detection."""
        crop_encoded = self.encode_crop_type(row.get('crop_type', 'rice'))
        land_size_hectares = self.parse_land_size(row.get('land_size', '1 hectare'))
        expected_yield = float(row.get('expected_yield', 30))
        claim_amount = float(row.get('claim_amount', 10000))
        
        weather = self.extract_weather_features(row.get('weather_features'))
        weather_anomaly = self.calculate_weather_anomaly_score(weather)
        
        # Derived features
        yield_per_hectare = expected_yield / land_size_hectares if land_size_hectares > 0 else 0
        claim_per_hectare = claim_amount / land_size_hectares if land_size_hectares > 0 else 0
        claim_to_yield_ratio = claim_amount / expected_yield if expected_yield > 0 else 0
        historical_claims = int(row.get('historical_claims', 0))
        
        features = np.array([
            crop_encoded, land_size_hectares, expected_yield, claim_amount,
            yield_per_hectare, claim_per_hectare, claim_to_yield_ratio,
            historical_claims, weather['temperature'], weather['rainfall'],
            weather['humidity'], weather_anomaly
        ])
        
        return features
    
    def create_synthetic_dataset(self, num_samples: int = 1000, fraud_ratio: float = 0.1) -> pd.DataFrame:
        """
        Create synthetic dataset with normal and fraudulent claims.
        
        Args:
            num_samples: Total number of samples
            fraud_ratio: Ratio of fraudulent samples
            
        Returns:
            DataFrame with synthetic data
        """
        logger.info(f"Creating synthetic dataset with {num_samples} samples")
        
        np.random.seed(42)
        
        crop_types = ['rice', 'wheat', 'cotton', 'sugarcane', 'maize']
        num_fraud = int(num_samples * fraud_ratio)
        num_normal = num_samples - num_fraud
        
        data = []
        
        # Normal claims
        for i in range(num_normal):
            crop_type = np.random.choice(crop_types)
            land_size_value = np.random.uniform(1, 20)
            land_size = f"{land_size_value:.1f} hectare"
            
            # Realistic yield and claim
            base_yield = {'rice': 40, 'wheat': 35, 'cotton': 25,
                         'sugarcane': 60, 'maize': 30}[crop_type]
            expected_yield = base_yield * land_size_value * np.random.uniform(0.8, 1.2)
            claim_amount = expected_yield * 100 * np.random.uniform(0.5, 1.5)  # Realistic claim
            
            weather_features = {
                'temperature': np.random.uniform(20, 30),
                'rainfall': np.random.uniform(50, 150),
                'humidity': np.random.uniform(40, 80)
            }
            
            historical_claims = np.random.randint(0, 3)
            
            data.append({
                'crop_type': crop_type,
                'land_size': land_size,
                'expected_yield': expected_yield,
                'claim_amount': claim_amount,
                'weather_features': weather_features,
                'historical_claims': historical_claims,
                'is_fraud': 0
            })
        
        # Fraudulent claims
        for i in range(num_fraud):
            crop_type = np.random.choice(crop_types)
            land_size_value = np.random.uniform(1, 20)
            land_size = f"{land_size_value:.1f} hectare"
            
            # Suspicious patterns
            base_yield = {'rice': 40, 'wheat': 35, 'cotton': 25,
                         'sugarcane': 60, 'maize': 30}[crop_type]
            expected_yield = base_yield * land_size_value * np.random.uniform(0.3, 0.6)  # Low yield
            claim_amount = expected_yield * 100 * np.random.uniform(3, 10)  # Exaggerated claim
            
            # Unusual weather (to trigger anomaly)
            weather_features = {
                'temperature': np.random.uniform(35, 45),  # Extreme temperature
                'rainfall': np.random.uniform(0, 20),  # Drought
                'humidity': np.random.uniform(10, 30)  # Low humidity
            }
            
            historical_claims = np.random.randint(5, 15)  # Many previous claims
            
            data.append({
                'crop_type': crop_type,
                'land_size': land_size,
                'expected_yield': expected_yield,
                'claim_amount': claim_amount,
                'weather_features': weather_features,
                'historical_claims': historical_claims,
                'is_fraud': 1
            })
        
        df = pd.DataFrame(data)
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # Shuffle
        
        logger.info(f"Created synthetic dataset: {len(df)} samples ({num_normal} normal, {num_fraud} fraud)")
        return df