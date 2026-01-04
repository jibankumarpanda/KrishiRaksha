"""
Inference script for satellite image verification.
Loads trained model and provides prediction functionality.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2
from typing import Dict, List, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class SatelliteVerifier:
    """
    Satellite image verification inference class.
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the satellite verifier.
        
        Args:
            model_path: Path to the trained model file
        """
        self.model = None
        self.classes = ['healthy', 'damaged', 'cloud_cover', 'no_crop']
        self.class_to_label = {cls: i for i, cls in enumerate(self.classes)}
        self.image_size = (256, 256)
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """
        Load the trained satellite verification model.
        
        Args:
            model_path: Path to the model file
        """
        try:
            self.model = keras.models.load_model(model_path)
            logger.info(f"Model loaded from {model_path}")
            
            # Load class labels if available
            labels_path = os.path.join(os.path.dirname(model_path), 'class_labels.txt')
            if os.path.exists(labels_path):
                with open(labels_path, 'r') as f:
                    self.classes = [line.strip() for line in f.readlines()]
                logger.info(f"Class labels loaded: {self.classes}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess a satellite image for inference.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Preprocessed image array
        """
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image from {image_path}")
            
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize
            img = cv2.resize(img, self.image_size)
            
            # Normalize to [0, 1]
            img = img.astype(np.float32) / 255.0
            
            # Add batch dimension
            img = np.expand_dims(img, axis=0)
            
            return img
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {e}")
            raise
    
    def predict(self, image_path: str) -> Dict:
        """
        Predict the class of a satellite image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing prediction results
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Preprocess image
            img = self.preprocess_image(image_path)
            
            # Make prediction
            predictions = self.model.predict(img)[0]
            
            # Get predicted class and confidence
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[predicted_class_idx])
            predicted_class = self.classes[predicted_class_idx]
            
            # Create results dictionary
            results = {
                'predicted_class': predicted_class,
                'confidence': confidence,
                'class_probabilities': {
                    self.classes[i]: float(predictions[i]) 
                    for i in range(len(self.classes))
                },
                'status': 'success'
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return {
                'predicted_class': None,
                'confidence': 0.0,
                'class_probabilities': {},
                'status': 'error',
                'error': str(e)
            }
    
    def predict_batch(self, image_paths: List[str]) -> List[Dict]:
        """
        Predict classes for multiple satellite images.
        
        Args:
            image_paths: List of paths to image files
            
        Returns:
            List of prediction result dictionaries
        """
        results = []
        
        for image_path in image_paths:
            result = self.predict(image_path)
            result['image_path'] = image_path
            results.append(result)
        
        return results
    
    def verify_crop_health(self, image_path: str, confidence_threshold: float = 0.7) -> Dict:
        """
        Verify crop health from satellite image.
        
        Args:
            image_path: Path to the satellite image
            confidence_threshold: Minimum confidence for reliable prediction
            
        Returns:
            Dictionary containing verification results
        """
        prediction = self.predict(image_path)
        
        if prediction['status'] == 'error':
            return prediction
        
        # Determine verification status
        predicted_class = prediction['predicted_class']
        confidence = prediction['confidence']
        
        if confidence < confidence_threshold:
            verification_status = 'uncertain'
            recommendation = 'Low confidence - consider manual inspection or higher quality imagery'
        elif predicted_class == 'healthy':
            verification_status = 'healthy'
            recommendation = 'Crops appear healthy - continue normal monitoring'
        elif predicted_class == 'damaged':
            verification_status = 'damaged'
            recommendation = 'Crop damage detected - recommend field inspection'
        elif predicted_class == 'cloud_cover':
            verification_status = 'obscured'
            recommendation = 'Cloud cover detected - wait for clearer imagery'
        else:  # no_crop
            verification_status = 'no_crop'
            recommendation = 'No crops detected - verify planting status'
        
        return {
            **prediction,
            'verification_status': verification_status,
            'recommendation': recommendation,
            'confidence_threshold': confidence_threshold
        }


# Example usage
if __name__ == "__main__":
    # Initialize verifier
    verifier = SatelliteVerifier()
    
    # Try to load model
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                              'models', 'satellite_verification', 'satellite_verifier.h5')
    
    if os.path.exists(model_path):
        verifier.load_model(model_path)
        print(f"✅ Model loaded from {model_path}")
        
        # Example prediction
        test_image = "path/to/test/satellite_image.jpg"
        if os.path.exists(test_image):
            result = verifier.verify_crop_health(test_image)
            print("\n🛰️  Satellite Verification Results:")
            print(f"   Status: {result['verification_status']}")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   Recommendation: {result['recommendation']}")
        else:
            print(f"⚠ Test image not found: {test_image}")
    else:
        print(f"❌ Model not found at {model_path}")
        print("Please train the model first using train_satellite_model.py")
