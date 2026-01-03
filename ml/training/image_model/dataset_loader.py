"""
Dataset loader for image classification training.
Handles loading and preprocessing of image datasets for damage classification.
"""

import os
import numpy as np
from PIL import Image
import cv2
from typing import Tuple, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageDatasetLoader:
    """
    Dataset loader for image classification tasks.
    """
    
    def __init__(self, image_size: Tuple[int, int] = (224, 224)):
        """
        Initialize the dataset loader.
        
        Args:
            image_size: Target image size (width, height)
        """
        self.image_size = image_size
    
    def load_images_from_directory(self, directory: str, label: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load images from a directory with a given label.
        
        Args:
            directory: Path to directory containing images
            label: Label for images in this directory (0 = no damage, 1 = damage)
            
        Returns:
            Tuple of (images, labels)
        """
        images = []
        labels = []
        
        if not os.path.exists(directory):
            logger.warning(f"Directory not found: {directory}")
            return np.array([]), np.array([])
        
        valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']
        
        for filename in os.listdir(directory):
            if any(filename.lower().endswith(ext) for ext in valid_extensions):
                image_path = os.path.join(directory, filename)
                try:
                    image = self._load_and_preprocess_image(image_path)
                    images.append(image)
                    labels.append(label)
                except Exception as e:
                    logger.warning(f"Error loading image {image_path}: {e}")
        
        logger.info(f"Loaded {len(images)} images from {directory} with label {label}")
        return np.array(images), np.array(labels)
    
    def _load_and_preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Load and preprocess a single image.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array
        """
        # Load image
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        # Resize
        img = img.resize(self.image_size, Image.Resampling.LANCZOS)
        
        # Convert to array and normalize
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        return img_array
    
    def create_synthetic_dataset(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create a synthetic dataset for training when real data is not available.
        This is a placeholder - in production, use real agricultural images.
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            Tuple of (images, labels)
        """
        logger.info(f"Creating synthetic dataset with {num_samples} samples")
        
        images = []
        labels = []
        
        for i in range(num_samples):
            # Generate random image (in production, use real crop images)
            image = np.random.rand(*self.image_size, 3).astype(np.float32)
            
            # Random label (0 = no damage, 1 = damage)
            label = np.random.randint(0, 2)
            
            # Add some structure to make it more realistic
            if label == 1:  # Damage
                # Add darker patches to simulate damage
                patch_size = 20
                num_patches = np.random.randint(3, 8)
                for _ in range(num_patches):
                    x = np.random.randint(0, self.image_size[0] - patch_size)
                    y = np.random.randint(0, self.image_size[1] - patch_size)
                    image[x:x+patch_size, y:y+patch_size] *= 0.3  # Darker patches
            
            images.append(image)
            labels.append(label)
        
        logger.info(f"Created synthetic dataset: {len(images)} images")
        return np.array(images), np.array(labels)
    
    def split_dataset(self, images: np.ndarray, labels: np.ndarray,
                     train_ratio: float = 0.7, val_ratio: float = 0.15) -> Tuple:
        """
        Split dataset into train, validation, and test sets.
        
        Args:
            images: Image array
            labels: Label array
            train_ratio: Ratio for training set
            val_ratio: Ratio for validation set
            
        Returns:
            Tuple of (X_train, y_train, X_val, y_val, X_test, y_test)
        """
        num_samples = len(images)
        indices = np.random.permutation(num_samples)
        
        train_end = int(num_samples * train_ratio)
        val_end = int(num_samples * (train_ratio + val_ratio))
        
        train_indices = indices[:train_end]
        val_indices = indices[train_end:val_end]
        test_indices = indices[val_end:]
        
        X_train, y_train = images[train_indices], labels[train_indices]
        X_val, y_val = images[val_indices], labels[val_indices]
        X_test, y_test = images[test_indices], labels[test_indices]
        
        logger.info(f"Dataset split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        return X_train, y_train, X_val, y_val, X_test, y_test