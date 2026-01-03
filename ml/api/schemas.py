"""
Pydantic schemas for API request/response validation.
These schemas define the data structures for ML API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ImageVerificationRequest(BaseModel):
    """Request schema for image verification endpoint."""
    image_path: str = Field(..., description="Path to the image file to verify")
    crop_type: Optional[str] = Field(None, description="Type of crop in the image")


class ImageVerificationResponse(BaseModel):
    """Response schema for image verification."""
    damage_confidence: float = Field(..., ge=0.0, le=100.0, description="Damage confidence percentage")
    is_duplicate: bool = Field(..., description="Whether the image is a duplicate")
    duplicate_confidence: float = Field(..., ge=0.0, le=100.0, description="Duplicate detection confidence")
    image_hash: str = Field(..., description="Hash of the image for duplicate detection")


class YieldPredictionRequest(BaseModel):
    """Request schema for yield prediction endpoint."""
    crop_type: str = Field(..., description="Type of crop (rice, wheat, cotton, sugarcane, maize)")
    land_size: str = Field(..., description="Land size with unit (e.g., '5 acre')")
    sowing_date: str = Field(..., description="Sowing date in YYYY-MM-DD format")
    soil_type: str = Field(..., description="Soil type (alluvial, black, red, laterite, desert)")
    irrigation_type: str = Field(..., description="Irrigation type (drip, sprinkler, flood, rainfed)")
    fertilizer_usage: float = Field(..., ge=0.0, description="Fertilizer usage in kg/acre")
    weather_features: Optional[Dict[str, Any]] = Field(None, description="Weather features (temperature, rainfall, humidity)")


class YieldPredictionResponse(BaseModel):
    """Response schema for yield prediction."""
    predicted_yield: float = Field(..., ge=0.0, description="Predicted yield in quintals")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Prediction confidence percentage")
    risk_level: str = Field(..., description="Risk level (low, medium, high)")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improving yield")


class FraudDetectionRequest(BaseModel):
    """Request schema for fraud detection endpoint."""
    crop_type: str = Field(..., description="Type of crop")
    land_size: str = Field(..., description="Land size with unit")
    expected_yield: float = Field(..., ge=0.0, description="Expected yield in quintals")
    claim_amount: float = Field(..., ge=0.0, description="Claim amount in currency")
    weather_features: Optional[Dict[str, Any]] = Field(None, description="Weather features")
    historical_claims: Optional[int] = Field(0, description="Number of historical claims")
    user_id: Optional[str] = Field(None, description="User ID for historical analysis")


class FraudDetectionResponse(BaseModel):
    """Response schema for fraud detection."""
    fraud_detected: bool = Field(..., description="Whether fraud is detected")
    fraud_score: float = Field(..., ge=0.0, le=100.0, description="Fraud score (0-100)")
    anomaly_features: List[str] = Field(default_factory=list, description="Features that triggered fraud detection")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Detection confidence percentage")


class ClaimEvaluationRequest(BaseModel):
    """Request schema for complete claim evaluation endpoint."""
    image_path: str = Field(..., description="Path to the damage image")
    crop_type: str = Field(..., description="Type of crop")
    land_size: str = Field(..., description="Land size with unit")
    expected_yield: float = Field(..., ge=0.0, description="Expected yield in quintals")
    claim_amount: float = Field(..., ge=0.0, description="Claim amount in currency")
    weather_features: Optional[Dict[str, Any]] = Field(None, description="Weather features")
    sowing_date: Optional[str] = Field(None, description="Sowing date in YYYY-MM-DD format")
    soil_type: Optional[str] = Field(None, description="Soil type")
    irrigation_type: Optional[str] = Field(None, description="Irrigation type")
    fertilizer_usage: Optional[float] = Field(None, description="Fertilizer usage in kg/acre")
    historical_claims: Optional[int] = Field(0, description="Number of historical claims")
    user_id: Optional[str] = Field(None, description="User ID for historical analysis")


class ClaimEvaluationResponse(BaseModel):
    """Response schema for claim evaluation."""
    approved: bool = Field(..., description="Whether the claim is approved")
    damage_confidence: float = Field(..., ge=0.0, le=100.0, description="Damage confidence percentage")
    predicted_yield: float = Field(..., ge=0.0, description="Predicted yield in quintals")
    fraud_detected: bool = Field(..., description="Whether fraud is detected")
    reason: str = Field(..., description="Reason for approval/rejection")
    fraud_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Fraud score if detected")
    is_duplicate: Optional[bool] = Field(None, description="Whether the image is a duplicate")
    recommendations: Optional[List[str]] = Field(None, description="Recommendations for the farmer")


class HealthResponse(BaseModel):
    """Response schema for health check endpoint."""
    status: str = Field(..., description="Service status")
    models_loaded: Dict[str, bool] = Field(..., description="Status of loaded models")
    timestamp: str = Field(..., description="Current timestamp")