"""
Dataset loader for satellite image verification.
Handles loading and preprocessing of satellite imagery for crop verification.
"""

import os
import numpy as np
import cv2
from typing import Tuple, List
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class SatelliteDatasetLoader:
    """
    Dataset loader for satellite image verification.
    """
    
    def __init__(self, image_size: Tuple[int, int] = (256, 256)):
        """
        Initialize the dataset loader.
        
        Args:
            image_size: Target size for resizing images
        """
        self.image_size = image_size
        self.classes = ['healthy', 'damaged', 'cloud_cover', 'no_crop']
        self.class_to_label = {cls: i for i, cls in enumerate(self.classes)}
        
    def load_images_from_directory(self, directory: str, label: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load images from a directory and assign labels.
        
        Args:
            directory: Path to directory containing images
            label: Label to assign to all images in this directory
            
        Returns:
            Tuple of (images, labels) arrays
        """
        images = []
        labels = []
        
        if not os.path.exists(directory):
            logger.warning(f"Directory {directory} does not exist")
            return np.array(images), np.array(labels)
        
        supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
        
        for filename in os.listdir(directory):
            if any(filename.lower().endswith(fmt) for fmt in supported_formats):
                filepath = os.path.join(directory, filename)
                try:
                    # Load and preprocess image
                    image = self._preprocess_image(filepath)
                    if image is not None:
                        images.append(image)
                        labels.append(label)
                except Exception as e:
                    logger.warning(f"Failed to load image {filepath}: {e}")
                    continue
        
        return np.array(images), np.array(labels)
    
    def _preprocess_image(self, filepath: str) -> np.ndarray:
        """
        Preprocess a single satellite image.
        
        Args:
            filepath: Path to the image file
            
        Returns:
            Preprocessed image array or None if failed
        """
        try:
            # Load image
            img = cv2.imread(filepath)
            if img is None:
                return None
            
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize
            img = cv2.resize(img, self.image_size)
            
            # Normalize to [0, 1]
            img = img.astype(np.float32) / 255.0
            
            return img
            
        except Exception as e:
            logger.error(f"Error preprocessing image {filepath}: {e}")
            return None
    
    def create_synthetic_dataset(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create synthetic satellite dataset for testing.
        
        Args:
            num_samples: Number of synthetic samples to generate
            
        Returns:
            Tuple of (images, labels) arrays
        """
        images = []
        labels = []
        
        samples_per_class = num_samples // len(self.classes)
        
        for class_idx, class_name in enumerate(self.classes):
            for i in range(samples_per_class):
                # Create synthetic image based on class
                if class_name == 'healthy':
                    # Green healthy crops
                    img = self._create_synthetic_healthy()
                elif class_name == 'damaged':
                    # Brown/yellow damaged crops
                    img = self._create_synthetic_damaged()
                elif class_name == 'cloud_cover':
                    # White/gray clouds
                    img = self._create_synthetic_cloudy()
                else:  # no_crop
                    # Brown soil/urban
                    img = self._create_synthetic_no_crop()
                
                images.append(img)
                labels.append(class_idx)
        
        # Shuffle dataset
        indices = np.random.permutation(len(images))
        images = np.array(images)[indices]
        labels = np.array(labels)[indices]
        
        return images, labels
    
    def _create_synthetic_healthy(self) -> np.ndarray:
        """Create synthetic healthy crop satellite image."""
        img = np.random.rand(*self.image_size, 3) * 0.3
        img[:, :, 1] = np.minimum(img[:, :, 1] + 0.4, 1.0)  # Boost green
        img[:, :, 0] *= 0.7  # Reduce red
        img[:, :, 2] *= 0.7  # Reduce blue
        return img
    
    def _create_synthetic_damaged(self) -> np.ndarray:
        """Create synthetic damaged crop satellite image."""
        img = np.random.rand(*self.image_size, 3) * 0.4
        img[:, :, 0] = np.minimum(img[:, :, 0] + 0.3, 1.0)  # Boost red/brown
        img[:, :, 1] *= 0.6  # Reduce green
        img[:, :, 2] *= 0.5  # Reduce blue
        return img
    
    def _create_synthetic_cloudy(self) -> np.ndarray:
        """Create synthetic cloud-covered satellite image."""
        img = np.random.rand(*self.image_size, 3) * 0.2 + 0.6  # Light gray/white
        return img
    
    def _create_synthetic_no_crop(self) -> np.ndarray:
        """Create synthetic no-crop (soil/urban) satellite image."""
        img = np.random.rand(*self.image_size, 3) * 0.3
        img[:, :, 0] = np.minimum(img[:, :, 0] + 0.2, 1.0)  # Brownish
        img[:, :, 1] *= 0.7
        img[:, :, 2] *= 0.5
        return img
    
    def split_dataset(self, images: np.ndarray, labels: np.ndarray, 
                      train_ratio: float = 0.7, val_ratio: float = 0.15) -> Tuple:
        """
        Split dataset into train, validation, and test sets.
        
        Args:
            images: Image array
            labels: Label array
            train_ratio: Ratio of data for training
            val_ratio: Ratio of data for validation
            
        Returns:
            Tuple of (X_train, y_train, X_val, y_val, X_test, y_test)
        """
        total_samples = len(images)
        train_size = int(total_samples * train_ratio)
        val_size = int(total_samples * val_ratio)
        
        X_train = images[:train_size]
        y_train = labels[:train_size]
        
        X_val = images[train_size:train_size + val_size]
        y_val = labels[train_size:train_size + val_size]
        
        X_test = images[train_size + val_size:]
        y_test = labels[train_size + val_size:]
        
        return X_train, y_train, X_val, y_val, X_test, y_test
