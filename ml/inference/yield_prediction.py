"""
Yield prediction module using RandomForest or XGBoost.
Predicts crop yield based on agricultural parameters.
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging

# Try to import XGBoost, fallback to RandomForest
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    from sklearn.ensemble import RandomForestRegressor

from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class YieldPredictor:
    """
    Yield prediction class using machine learning models.
    """
    
    def __init__(self, model_dir: Optional[str] = None):
        """
        Initialize the yield predictor.
        
        Args:
            model_dir: Directory containing model files
        """
        self.model_dir = model_dir or self._get_default_model_dir()
        self.model = None
        self.scaler = None
        self.feature_names = None
        self._load_models()
    
    def _get_default_model_dir(self) -> str:
        """Get default model directory path."""
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base_dir, 'models', 'yield_prediction')
    
    def _load_models(self) -> None:
        """Load yield prediction model and scaler."""
        try:
            # Load model
            model_path = os.path.join(self.model_dir, 'yield_model.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded yield model from {model_path}")
            else:
                logger.warning(f"Yield model not found at {model_path}, creating default model")
                self.model = self._create_default_model()
            
            # Load scaler
            scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info(f"Loaded scaler from {scaler_path}")
            else:
                logger.warning(f"Scaler not found at {scaler_path}, creating default scaler")
                self.scaler = StandardScaler()
            
            # Set feature names
            self.feature_names = [
                'crop_type_encoded', 'land_size_hectares', 'days_since_sowing',
                'soil_type_encoded', 'irrigation_type_encoded', 'fertilizer_usage',
                'temperature', 'rainfall', 'humidity', 'wind_speed', 'sunshine_hours',
                'season_kharif', 'season_rabi'
            ]
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.model = self._create_default_model()
            self.scaler = StandardScaler()
    
    def _create_default_model(self):
        """Create a default model if trained model is not available."""
        if XGBOOST_AVAILABLE:
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        else:
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        
        logger.info("Created default yield prediction model")
        return model
    
    def _encode_crop_type(self, crop_type: str) -> int:
        """Encode crop type to numeric value."""
        crop_encoding = {
            'rice': 0,
            'wheat': 1,
            'cotton': 2,
            'sugarcane': 3,
            'maize': 4,
        }
        crop_lower = crop_type.lower().strip()
        return crop_encoding.get(crop_lower, 0)
    
    def _encode_soil_type(self, soil_type: str) -> int:
        """Encode soil type to numeric value."""
        soil_encoding = {
            'alluvial': 0,
            'black': 1,
            'red': 2,
            'laterite': 3,
            'desert': 4,
        }
        soil_lower = soil_type.lower().strip()
        return soil_encoding.get(soil_lower, 0)
    
    def _encode_irrigation_type(self, irrigation_type: str) -> int:
        """Encode irrigation type to numeric value."""
        irrigation_encoding = {
            'drip': 0,
            'sprinkler': 1,
            'flood': 2,
            'rainfed': 3,
        }
        irrigation_lower = irrigation_type.lower().strip()
        return irrigation_encoding.get(irrigation_lower, 0)
    
    def _parse_land_size(self, land_size: str) -> float:
        """Parse land size string to hectares."""
        import sys
        from pathlib import Path
        sys.path.append(str(Path(__file__).parent.parent))
        from api.utils import parse_land_size, convert_to_hectares
        
        try:
            value, unit = parse_land_size(land_size)
            return convert_to_hectares(value, unit)
        except Exception as e:
            logger.error(f"Error parsing land size: {e}")
            return 1.0  # Default to 1 hectare
    
    def _calculate_days_since_sowing(self, sowing_date: str) -> int:
        """Calculate days since sowing date."""
        try:
            sowing = datetime.strptime(sowing_date, '%Y-%m-%d')
            today = datetime.now()
            days = (today - sowing).days
            return max(0, days)  # Ensure non-negative
        except Exception as e:
            logger.error(f"Error calculating days since sowing: {e}")
            return 90  # Default to 90 days
    
    def _determine_season(self, sowing_date: str) -> tuple:
        """
        Determine if crop is in Kharif or Rabi season.
        
        Args:
            sowing_date: Sowing date string
            
        Returns:
            Tuple of (is_kharif, is_rabi)
        """
        try:
            sowing = datetime.strptime(sowing_date, '%Y-%m-%d')
            month = sowing.month
            
            # Kharif: June-October (monsoon season)
            # Rabi: November-April (winter season)
            is_kharif = 6 <= month <= 10
            is_rabi = month >= 11 or month <= 4
            
            return (1 if is_kharif else 0, 1 if is_rabi else 0)
        except Exception:
            return (0, 0)
    
    def _extract_weather_features(self, weather_features: Optional[Dict[str, Any]]) -> Dict[str, float]:
        """Extract and normalize weather features."""
        import sys
        from pathlib import Path
        sys.path.append(str(Path(__file__).parent.parent))
        from api.utils import extract_weather_features
        return extract_weather_features(weather_features)
    
    def _prepare_features(self, crop_type: str, land_size: str, sowing_date: str,
                         soil_type: str, irrigation_type: str, fertilizer_usage: float,
                         weather_features: Optional[Dict[str, Any]]) -> np.ndarray:
        """
        Prepare feature vector for prediction.
        
        Args:
            crop_type: Type of crop
            land_size: Land size with unit
            sowing_date: Sowing date
            soil_type: Soil type
            irrigation_type: Irrigation type
            fertilizer_usage: Fertilizer usage in kg/acre
            weather_features: Weather features dictionary
            
        Returns:
            Feature array
        """
        # Encode categorical features
        crop_encoded = self._encode_crop_type(crop_type)
        soil_encoded = self._encode_soil_type(soil_type)
        irrigation_encoded = self._encode_irrigation_type(irrigation_type)
        
        # Parse land size
        land_size_hectares = self._parse_land_size(land_size)
        
        # Calculate days since sowing
        days_since_sowing = self._calculate_days_since_sowing(sowing_date)
        
        # Determine season
        is_kharif, is_rabi = self._determine_season(sowing_date)
        
        # Extract weather features
        weather = self._extract_weather_features(weather_features)
        
        # Convert fertilizer usage to kg/hectare (1 acre ≈ 0.4047 hectares)
        fertilizer_kg_per_hectare = fertilizer_usage / 0.4047
        
        # Create feature vector
        features = np.array([[
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
        ]])
        
        return features
    
    def predict(self, crop_type: str, land_size: str, sowing_date: str,
                soil_type: str, irrigation_type: str, fertilizer_usage: float,
                weather_features: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Predict crop yield.
        
        Args:
            crop_type: Type of crop
            land_size: Land size with unit
            sowing_date: Sowing date in YYYY-MM-DD format
            soil_type: Soil type
            irrigation_type: Irrigation type
            fertilizer_usage: Fertilizer usage in kg/acre
            weather_features: Optional weather features
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Prepare features
            features = self._prepare_features(
                crop_type, land_size, sowing_date, soil_type,
                irrigation_type, fertilizer_usage, weather_features
            )
            
            # Scale features
            if hasattr(self.scaler, 'mean_') and self.scaler.mean_ is not None:
                features_scaled = self.scaler.transform(features)
            else:
                features_scaled = features
            
            # Predict yield
            predicted_yield = self.model.predict(features_scaled)[0]
            predicted_yield = max(0.0, float(predicted_yield))  # Ensure non-negative
            
            # Calculate confidence (simplified - in production, use prediction intervals)
            confidence = 85.0  # Default confidence
            if hasattr(self.model, 'predict_proba'):
                # If model supports probability, use it
                pass
            
            # Determine risk level
            risk_level = self._determine_risk_level(predicted_yield, fertilizer_usage, weather_features)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                crop_type, predicted_yield, fertilizer_usage, weather_features, risk_level
            )
            
            result = {
                'predicted_yield': round(predicted_yield, 2),
                'confidence': round(confidence, 2),
                'risk_level': risk_level,
                'recommendations': recommendations
            }
            
            logger.info(f"Yield prediction completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error in yield prediction: {e}")
            raise
    
    def _determine_risk_level(self, predicted_yield: float, fertilizer_usage: float,
                            weather_features: Optional[Dict[str, Any]]) -> str:
        """Determine risk level based on prediction and inputs."""
        # Simple heuristic - can be improved with more sophisticated logic
        if weather_features:
            rainfall = weather_features.get('rainfall', 0)
            if rainfall > 200:  # Excessive rainfall
                return 'high'
            if rainfall < 50:  # Drought conditions
                return 'high'
        
        if fertilizer_usage < 30:  # Low fertilizer
            return 'medium'
        
        if predicted_yield < 20:  # Low predicted yield
            return 'high'
        
        return 'low'
    
    def _generate_recommendations(self, crop_type: str, predicted_yield: float,
                                 fertilizer_usage: float, weather_features: Optional[Dict[str, Any]],
                                 risk_level: str) -> List[str]:
        """Generate recommendations based on prediction."""
        recommendations = []
        
        if fertilizer_usage < 50:
            recommendations.append(f"Consider increasing organic fertilizer usage by 15-20% for better soil health")
        
        if weather_features:
            rainfall = weather_features.get('rainfall', 0)
            if rainfall < 50:
                recommendations.append("Irrigation levels should be monitored closely due to low rainfall")
            elif rainfall > 200:
                recommendations.append("Take measures to prevent waterlogging due to excessive rainfall")
        
        if risk_level == 'high':
            recommendations.append("High risk detected - consider consulting agricultural experts")
        
        if predicted_yield < 30:
            recommendations.append("Yield prediction is below average - review farming practices and consider crop rotation")
        
        # Crop-specific recommendations
        if crop_type.lower() == 'rice':
            recommendations.append("Monitor water levels closely during flowering stage for optimal rice yield")
        elif crop_type.lower() == 'wheat':
            recommendations.append("Ensure proper irrigation during grain filling stage")
        
        if not recommendations:
            recommendations.append("Conditions look favorable - maintain current farming practices")
        
        return recommendations
    
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.model is not None




# --------------------------------------------------
# Optional: test inference when running this script directly
# --------------------------------------------------
if __name__ == "__main__":
    print("🚀 Running Yield Prediction Test")

    # New sample input data
    sample_data = {
        "crop_type": "wheat",
        "land_size": "5 acre",
        "sowing_date": "2024-10-01",
        "soil_type": "black",
        "irrigation_type": "sprinkler",
        "fertilizer_usage": 60,  # kg/acre
        "weather_features": {
            "temperature": 28,
            "rainfall": 90,
            "humidity": 65,
            "wind_speed": 10,
            "sunshine_hours": 6
        }
    }

    # Initialize predictor
    predictor = YieldPredictor()

    # Make prediction
    result = predictor.predict(
        crop_type=sample_data["crop_type"],
        land_size=sample_data["land_size"],
        sowing_date=sample_data["sowing_date"],
        soil_type=sample_data["soil_type"],
        irrigation_type=sample_data["irrigation_type"],
        fertilizer_usage=sample_data["fertilizer_usage"],
        weather_features=sample_data["weather_features"]
    )

    # Print results
    print("🌾 Predicted Yield Result:")
    print(result)