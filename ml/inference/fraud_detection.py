"""
Fraud detection module using IsolationForest or similar anomaly detection algorithms.
Detects potential fraud in insurance claims based on various features.
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List
import logging

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FraudDetector:
    """
    Fraud detection class using anomaly detection algorithms.
    """
    
    def __init__(self, model_dir: Optional[str] = None):
        """
        Initialize the fraud detector.
        
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
        return os.path.join(base_dir, 'models', 'fraud_detection')
    
    def _load_models(self) -> None:
        """Load fraud detection model and scaler."""
        try:
            # Load model
            model_path = os.path.join(self.model_dir, 'fraud_model.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded fraud model from {model_path}")
            else:
                logger.warning(f"Fraud model not found at {model_path}, creating default model")
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
                'crop_type_encoded', 'land_size_hectares', 'expected_yield',
                'claim_amount', 'yield_per_hectare', 'claim_per_hectare',
                'claim_to_yield_ratio', 'historical_claims', 'temperature',
                'rainfall', 'humidity', 'weather_anomaly_score'
            ]
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.model = self._create_default_model()
            self.scaler = StandardScaler()
    
    def _create_default_model(self):
        """Create a default IsolationForest model if trained model is not available."""
        model = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42,
            n_estimators=100
        )
        
        logger.info("Created default fraud detection model")
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
    
    def _extract_weather_features(self, weather_features: Optional[Dict[str, Any]]) -> Dict[str, float]:
        """Extract and normalize weather features."""
        import sys
        from pathlib import Path
        sys.path.append(str(Path(__file__).parent.parent))
        from api.utils import extract_weather_features
        return extract_weather_features(weather_features)
    
    def _calculate_weather_anomaly_score(self, weather_features: Dict[str, float]) -> float:
        """
        Calculate weather anomaly score.
        Higher score indicates unusual weather conditions.
        
        Args:
            weather_features: Weather features dictionary
            
        Returns:
            Anomaly score (0-100)
        """
        # Normal weather ranges (can be adjusted)
        normal_ranges = {
            'temperature': (20, 35),  # Celsius
            'rainfall': (50, 150),  # mm per month
            'humidity': (40, 80),  # percentage
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
    
    def _prepare_features(self, crop_type: str, land_size: str, expected_yield: float,
                         claim_amount: float, weather_features: Optional[Dict[str, Any]],
                         historical_claims: int = 0) -> np.ndarray:
        """
        Prepare feature vector for fraud detection.
        
        Args:
            crop_type: Type of crop
            land_size: Land size with unit
            expected_yield: Expected yield in quintals
            claim_amount: Claim amount in currency
            weather_features: Weather features dictionary
            historical_claims: Number of historical claims
            
        Returns:
            Feature array
        """
        # Encode crop type
        crop_encoded = self._encode_crop_type(crop_type)
        
        # Parse land size
        land_size_hectares = self._parse_land_size(land_size)
        
        # Extract weather features
        weather = self._extract_weather_features(weather_features)
        
        # Calculate derived features
        yield_per_hectare = expected_yield / land_size_hectares if land_size_hectares > 0 else 0
        claim_per_hectare = claim_amount / land_size_hectares if land_size_hectares > 0 else 0
        
        # Calculate claim to yield ratio (normalized)
        claim_to_yield_ratio = claim_amount / expected_yield if expected_yield > 0 else 0
        
        # Calculate weather anomaly score
        weather_anomaly_score = self._calculate_weather_anomaly_score(weather)
        
        # Create feature vector
        features = np.array([[
            crop_encoded,
            land_size_hectares,
            expected_yield,
            claim_amount,
            yield_per_hectare,
            claim_per_hectare,
            claim_to_yield_ratio,
            historical_claims,
            weather['temperature'],
            weather['rainfall'],
            weather['humidity'],
            weather_anomaly_score
        ]])
        
        return features
    
    def detect(self, crop_type: str, land_size: str, expected_yield: float,
              claim_amount: float, weather_features: Optional[Dict[str, Any]] = None,
              historical_claims: int = 0, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Detect potential fraud in insurance claim.
        
        Args:
            crop_type: Type of crop
            land_size: Land size with unit
            expected_yield: Expected yield in quintals
            claim_amount: Claim amount in currency
            weather_features: Optional weather features
            historical_claims: Number of historical claims
            user_id: Optional user ID for historical analysis
            
        Returns:
            Dictionary with fraud detection results
        """
        try:
            # Prepare features
            features = self._prepare_features(
                crop_type, land_size, expected_yield, claim_amount,
                weather_features, historical_claims
            )
            
            # Scale features
            if hasattr(self.scaler, 'mean_') and self.scaler.mean_ is not None:
                features_scaled = self.scaler.transform(features)
            else:
                features_scaled = features
            
            # Predict anomaly (IsolationForest returns -1 for anomaly, 1 for normal)
            prediction = self.model.predict(features_scaled)[0]
            anomaly_score = self.model.score_samples(features_scaled)[0]
            
            # Convert to fraud detection result
            # IsolationForest: -1 = anomaly (fraud), 1 = normal
            fraud_detected = (prediction == -1)
            
            # Convert anomaly score to fraud score (0-100)
            # Lower scores indicate higher anomaly
            # Normalize to 0-100 scale
            fraud_score = max(0.0, min(100.0, (1.0 - (anomaly_score + 1) / 2) * 100))
            
            # Identify anomaly features
            anomaly_features = self._identify_anomaly_features(
                features[0], fraud_detected, crop_type, expected_yield, claim_amount
            )
            
            # Calculate confidence
            confidence = abs(anomaly_score) * 50  # Convert to percentage
            confidence = max(50.0, min(100.0, confidence))
            
            result = {
                'fraud_detected': bool(fraud_detected),
                'fraud_score': round(fraud_score, 2),
                'anomaly_features': anomaly_features,
                'confidence': round(confidence, 2)
            }
            
            logger.info(f"Fraud detection completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error in fraud detection: {e}")
            raise
    
    def _identify_anomaly_features(self, features: np.ndarray, fraud_detected: bool,
                                   crop_type: str, expected_yield: float,
                                   claim_amount: float) -> List[str]:
        """
        Identify which features contributed to fraud detection.
        
        Args:
            features: Feature array
            fraud_detected: Whether fraud was detected
            crop_type: Crop type
            expected_yield: Expected yield
            claim_amount: Claim amount
            
        Returns:
            List of anomaly feature descriptions
        """
        anomaly_features = []
        
        if not fraud_detected:
            return anomaly_features
        
        # Check claim amount relative to yield
        claim_to_yield_ratio = features[6]  # claim_to_yield_ratio
        if claim_to_yield_ratio > 1000:  # High claim relative to yield
            anomaly_features.append("Unusually high claim amount relative to expected yield")
        
        # Check yield per hectare
        yield_per_hectare = features[4]
        if yield_per_hectare < 10:  # Very low yield
            anomaly_features.append("Suspiciously low yield per hectare")
        elif yield_per_hectare > 100:  # Unusually high yield
            anomaly_features.append("Unusually high yield per hectare")
        
        # Check claim per hectare
        claim_per_hectare = features[5]
        if claim_per_hectare > 50000:  # Very high claim per hectare
            anomaly_features.append("Extremely high claim amount per hectare")
        
        # Check historical claims
        historical_claims = features[7]
        if historical_claims > 5:  # Many previous claims
            anomaly_features.append("High number of historical claims")
        
        # Check weather anomaly
        weather_anomaly = features[11]
        if weather_anomaly > 50:  # High weather anomaly
            anomaly_features.append("Unusual weather conditions reported")
        
        if not anomaly_features:
            anomaly_features.append("Multiple factors indicate potential fraud")
        
        return anomaly_features
    
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.model is not None




if __name__ == "__main__":
    print("🚀 Running Fraud Detection Inference Test")

    # Create a fraud detector instance
    detector = FraudDetector()

    # Example input for inference
    test_claim = {
        'crop_type': 'wheat',
        'land_size': '2 acres',  # or '0.8 hectares'
        'expected_yield': 200.0,  # in quintals
        'claim_amount': 6000.0,  # in currency units
        'weather_features': {
            'temperature': 38,  # Celsius
            'rainfall': 30,     # mm per month
            'humidity': 35      # percent
        },
        'historical_claims': 2,
        'user_id': 'user_123'
    }

    # Run fraud detection
    result = detector.detect(
        crop_type=test_claim['crop_type'],
        land_size=test_claim['land_size'],
        expected_yield=test_claim['expected_yield'],
        claim_amount=test_claim['claim_amount'],
        weather_features=test_claim['weather_features'],
        historical_claims=test_claim['historical_claims'],
        user_id=test_claim['user_id']
    )

    # Print the results
    print("Fraud Detection Result:")
    print(result)




        