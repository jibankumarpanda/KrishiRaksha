"""
Utility functions for the ML API.
Includes helper functions for data processing, validation, and error handling.
"""

import os
import re
from typing import Dict, Any, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_land_size(land_size: str) -> Tuple[float, str]:
    """
    Parse land size string into value and unit.
    
    Args:
        land_size: String like "5 acre" or "10 hectare"
        
    Returns:
        Tuple of (value, unit)
        
    Example:
        >>> parse_land_size("5 acre")
        (5.0, "acre")
    """
    try:
        # Remove extra whitespace and split
        parts = land_size.strip().split()
        if len(parts) < 2:
            raise ValueError("Land size must include value and unit")
        
        value = float(parts[0])
        unit = parts[1].lower()
        
        return value, unit
    except (ValueError, IndexError) as e:
        logger.error(f"Error parsing land size '{land_size}': {e}")
        raise ValueError(f"Invalid land size format: {land_size}. Expected format: '5 acre'")


def convert_to_hectares(value: float, unit: str) -> float:
    """
    Convert land area to hectares.
    
    Args:
        value: Land area value
        unit: Unit of measurement
        
    Returns:
        Area in hectares
        
    Conversion factors (approximate):
    - 1 acre = 0.404686 hectares
    - 1 hectare = 1 hectare
    - 1 bigha = 0.1338 hectares (varies by region)
    - 1 katha = 0.0067 hectares (varies by region)
    - 1 kanal = 0.0506 hectares
    - 1 marla = 0.0025 hectares
    - 1 guntha = 0.0101 hectares
    - 1 cent = 0.0040 hectares
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
        'cents': 0.0040,
    }
    
    unit_lower = unit.lower()
    if unit_lower not in conversion_factors:
        logger.warning(f"Unknown unit '{unit}', assuming hectares")
        return value
    
    return value * conversion_factors[unit_lower]


def validate_image_path(image_path: str) -> bool:
    """
    Validate that image path exists and is accessible.
    
    Args:
        image_path: Path to image file
        
    Returns:
        True if valid, raises exception otherwise
    """
    if not image_path:
        raise ValueError("Image path cannot be empty")
    
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Check if it's a valid image extension
    valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']
    ext = os.path.splitext(image_path)[1].lower()
    
    if ext not in valid_extensions:
        raise ValueError(f"Invalid image format: {ext}. Supported formats: {', '.join(valid_extensions)}")
    
    return True


def normalize_crop_type(crop_type: str) -> str:
    """
    Normalize crop type to standard format.
    
    Args:
        crop_type: Crop type string
        
    Returns:
        Normalized crop type
    """
    crop_mapping = {
        'rice': 'rice',
        'धान': 'rice',
        'wheat': 'wheat',
        'गेहूं': 'wheat',
        'cotton': 'cotton',
        'कपास': 'cotton',
        'sugarcane': 'sugarcane',
        'गन्ना': 'sugarcane',
        'maize': 'maize',
        'मक्का': 'maize',
        'corn': 'maize',
    }
    
    crop_lower = crop_type.lower().strip()
    return crop_mapping.get(crop_lower, crop_lower)


def extract_weather_features(weather_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Extract and normalize weather features from input data.
    
    Args:
        weather_data: Dictionary containing weather information
        
    Returns:
        Normalized weather features dictionary
    """
    default_features = {
        'temperature': 25.0,  # Celsius
        'rainfall': 0.0,  # mm
        'humidity': 60.0,  # percentage
        'wind_speed': 5.0,  # km/h
        'sunshine_hours': 8.0,  # hours per day
    }
    
    if not weather_data:
        return default_features
    
    features = {}
    for key, default_value in default_features.items():
        features[key] = float(weather_data.get(key, default_value))
    
    return features


def calculate_yield_per_acre(predicted_yield: float, land_size: str) -> float:
    """
    Calculate yield per acre for standardization.
    
    Args:
        predicted_yield: Total predicted yield
        land_size: Land size string with unit
        
    Returns:
        Yield per acre in quintals
    """
    try:
        value, unit = parse_land_size(land_size)
        area_hectares = convert_to_hectares(value, unit)
        area_acres = area_hectares / 0.404686
        
        if area_acres <= 0:
            return 0.0
        
        return predicted_yield / area_acres
    except Exception as e:
        logger.error(f"Error calculating yield per acre: {e}")
        return 0.0


def format_error_message(error: Exception) -> str:
    """
    Format error message for API response.
    
    Args:
        error: Exception object
        
    Returns:
        Formatted error message string
    """
    error_type = type(error).__name__
    error_msg = str(error)
    
    return f"{error_type}: {error_msg}"


def ensure_directory_exists(directory_path: str) -> None:
    """
    Ensure that a directory exists, create if it doesn't.
    
    Args:
        directory_path: Path to directory
    """
    if not os.path.exists(directory_path):
        os.makedirs(directory_path, exist_ok=True)
        logger.info(f"Created directory: {directory_path}")


def get_model_path(model_type: str, model_name: str) -> str:
    """
    Get the full path to a model file.
    
    Args:
        model_type: Type of model (image_verification, yield_prediction, fraud_detection)
        model_name: Name of the model file
        
    Returns:
        Full path to model file
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'models', model_type, model_name)
    return model_path