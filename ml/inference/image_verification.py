"""
Image verification module for damage classification and duplicate detection.
Uses CNN for damage classification and feature hashing for duplicate detection.
"""

import os
import numpy as np
import cv2
from PIL import Image
import hashlib
import pickle
import logging
from typing import Dict, Any, Optional, Tuple
import tensorflow as tf
from tensorflow import keras

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageVerifier:
    """
    Image verification class for damage classification and duplicate detection.
    """
    
    def __init__(self, model_dir: Optional[str] = None):
        """
        Initialize the image verifier.
        
        Args:
            model_dir: Directory containing model files
        """
        self.model_dir = model_dir or self._get_default_model_dir()
        self.damage_classifier = None
        self.duplicate_detector = None
        self.image_hashes = set()  # Store hashes of seen images
        self._load_models()
    
    def _get_default_model_dir(self) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base_dir, 'model', 'image_verification')

    
    def _load_models(self) -> None:
        """Load damage classifier and duplicate detector models."""
        try:
            # Load damage classifier (CNN)
            classifier_path = os.path.join(self.model_dir, 'damage_classifier.h5')
            if os.path.exists(classifier_path):
                self.damage_classifier = keras.models.load_model(classifier_path)
                logger.info(f"Loaded damage classifier from {classifier_path}")
            else:
                logger.warning(f"Damage classifier not found at {classifier_path}, using default model")
                self.damage_classifier = self._create_default_classifier()
            
            # Load duplicate detector (hash database)
            duplicate_path = os.path.join(self.model_dir, 'duplicate_detector.pkl')
            if os.path.exists(duplicate_path):
                with open(duplicate_path, 'rb') as f:
                    self.image_hashes = pickle.load(f)
                logger.info(f"Loaded duplicate detector from {duplicate_path}")
            else:
                logger.warning(f"Duplicate detector not found at {duplicate_path}, starting with empty database")
                self.image_hashes = set()
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Create default models if loading fails
            self.damage_classifier = self._create_default_classifier()
            self.image_hashes = set()
    
    def _create_default_classifier(self) -> keras.Model:
        """
        Create a default CNN model for damage classification.
        This is a simple model that can be replaced with a trained one.
        """
        model = keras.Sequential([
            keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Conv2D(64, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Conv2D(128, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D(2, 2),
            keras.layers.Flatten(),
            keras.layers.Dense(128, activation='relu'),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(1, activation='sigmoid')  # Binary: damaged or not
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        logger.info("Created default damage classifier model")
        return model
    
    def _preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for model input.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array
        """
        try:
            # Load image
            img = Image.open(image_path)
            img = img.convert('RGB')
            
            # Resize to model input size
            img = img.resize((224, 224))
            
            # Convert to array and normalize
            img_array = np.array(img) / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {e}")
            raise ValueError(f"Could not process image: {e}")
    
    def _compute_image_hash(self, image_path: str) -> str:
        """
        Compute perceptual hash of image for duplicate detection.
        Uses average hash (aHash) algorithm.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Hash string of the image
        """
        try:
            # Load and resize image
            img = Image.open(image_path)
            img = img.convert('RGB')
            img = img.resize((8, 8), Image.Resampling.LANCZOS)
            
            # Convert to grayscale
            img = img.convert('L')
            
            # Compute average
            pixels = np.array(img)
            avg = pixels.mean()
            
            # Create hash
            hash_bits = (pixels > avg).flatten()
            hash_string = ''.join(['1' if bit else '0' for bit in hash_bits])
            
            # Convert to hex
            hash_hex = hex(int(hash_string, 2))[2:]
            
            return hash_hex
            
        except Exception as e:
            logger.error(f"Error computing hash for {image_path}: {e}")
            # Fallback to file hash
            with open(image_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
    
    def _check_duplicate(self, image_hash: str, threshold: float = 0.95) -> Tuple[bool, float]:
        """
        Check if image is a duplicate based on hash similarity.
        
        Args:
            image_hash: Hash of the image
            threshold: Similarity threshold (0-1)
            
        Returns:
            Tuple of (is_duplicate, confidence)
        """
        if not self.image_hashes:
            return False, 0.0
        
        # For exact match
        if image_hash in self.image_hashes:
            return True, 100.0
        
        # For similar images (Hamming distance)
        max_similarity = 0.0
        for stored_hash in self.image_hashes:
            similarity = self._hash_similarity(image_hash, stored_hash)
            max_similarity = max(max_similarity, similarity)
        
        is_duplicate = max_similarity >= threshold
        confidence = max_similarity * 100.0
        
        return is_duplicate, confidence
    
    def _hash_similarity(self, hash1: str, hash2: str) -> float:
        """
        Calculate similarity between two hashes using Hamming distance.
        
        Args:
            hash1: First hash string
            hash2: Second hash string
            
        Returns:
            Similarity score (0-1)
        """
        try:
            # Convert hex to binary
            bin1 = bin(int(hash1, 16))[2:].zfill(64)
            bin2 = bin(int(hash2, 16))[2:].zfill(64)
            
            # Calculate Hamming distance
            hamming_distance = sum(c1 != c2 for c1, c2 in zip(bin1, bin2))
            
            # Convert to similarity (0-1)
            similarity = 1.0 - (hamming_distance / len(bin1))
            
            return similarity
            
        except Exception:
            # If conversion fails, return 0 similarity
            return 0.0
    
    def verify(self, image_path: str, crop_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Verify image for damage and duplicate detection.
        
        Args:
            image_path: Path to image file
            crop_type: Optional crop type for context
            
        Returns:
            Dictionary with verification results
        """
        try:
            # Validate image path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Preprocess image
            img_array = self._preprocess_image(image_path)
            
            # Predict damage
            damage_prediction = self.damage_classifier.predict(img_array, verbose=0)[0][0]
            damage_confidence = float(damage_prediction * 100.0)
            
            # Compute hash and check for duplicates
            image_hash = self._compute_image_hash(image_path)
            is_duplicate, duplicate_confidence = self._check_duplicate(image_hash)
            
            # Store hash for future duplicate detection
            if not is_duplicate:
                self.image_hashes.add(image_hash)
            
            result = {
                'damage_confidence': round(damage_confidence, 2),
                'is_duplicate': is_duplicate,
                'duplicate_confidence': round(duplicate_confidence, 2),
                'image_hash': image_hash,
            }
            
            logger.info(f"Image verification completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error in image verification: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if models are loaded."""
        return self.damage_classifier is not None
    
    def save_duplicate_detector(self, path: Optional[str] = None) -> None:
        """
        Save duplicate detector hash database.
        
        Args:
            path: Path to save the database (default: model_dir/duplicate_detector.pkl)
        """
        if path is None:
            path = os.path.join(self.model_dir, 'duplicate_detector.pkl')
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, 'wb') as f:
            pickle.dump(self.image_hashes, f)
        
        logger.info(f"Saved duplicate detector to {path}")


if __name__ == "__main__":
    print("============================================================")
    print("🚀 IMAGE VERIFICATION INFERENCE STARTED")
    print("============================================================")

    test_image_path = "inference/test_images/healthy1.jpg"

    verifier = ImageVerifier()
    result = verifier.verify(test_image_path)

    print("\n✅ RESULT:")
    print(result)