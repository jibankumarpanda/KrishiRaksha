"""
FastAPI application for KRISHI RAKSHA ML services.
Provides REST API endpoints for image verification, yield prediction, fraud detection, and claim evaluation.
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from api.schemas import (
    ImageVerificationRequest,
    ImageVerificationResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
    FraudDetectionRequest,
    FraudDetectionResponse,
    ClaimEvaluationRequest,
    ClaimEvaluationResponse,
    HealthResponse,
)
from api.utils import (
    validate_image_path,
    format_error_message,
    get_model_path,
)
from inference.image_verification import ImageVerifier
from inference.yield_prediction import YieldPredictor
from inference.fraud_detection import FraudDetector
from inference.claim_evaluator import ClaimEvaluator

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="KRISHI RAKSHA ML API",
    description="Machine Learning API for agricultural insurance claim evaluation",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models (lazy loading)
image_verifier = None
yield_predictor = None
fraud_detector = None
claim_evaluator = None


def initialize_models():
    """Initialize all ML models."""
    global image_verifier, yield_predictor, fraud_detector, claim_evaluator
    
    try:
        logger.info("Initializing ML models...")
        
        # Initialize image verifier
        image_verifier = ImageVerifier()
        logger.info("Image verifier initialized")
        
        # Initialize yield predictor
        yield_predictor = YieldPredictor()
        logger.info("Yield predictor initialized")
        
        # Initialize fraud detector
        fraud_detector = FraudDetector()
        logger.info("Fraud detector initialized")
        
        # Initialize claim evaluator (uses all above models)
        claim_evaluator = ClaimEvaluator(
            image_verifier=image_verifier,
            yield_predictor=yield_predictor,
            fraud_detector=fraud_detector
        )
        logger.info("Claim evaluator initialized")
        
        logger.info("All models initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing models: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize models on application startup."""
    initialize_models()


@app.get("/", response_model=dict)
async def root():
    """Root endpoint."""
    return {
        "message": "KRISHI RAKSHA ML API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "image_verification": "/api/v1/verify-image",
            "yield_prediction": "/api/v1/predict-yield",
            "fraud_detection": "/api/v1/detect-fraud",
            "claim_evaluation": "/api/v1/evaluate-claim",
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify service and model status."""
    try:
        models_status = {
            "image_verifier": image_verifier is not None and image_verifier.is_loaded(),
            "yield_predictor": yield_predictor is not None and yield_predictor.is_loaded(),
            "fraud_detector": fraud_detector is not None and fraud_detector.is_loaded(),
            "claim_evaluator": claim_evaluator is not None,
        }
        
        from datetime import datetime
        return HealthResponse(
            status="healthy" if all(models_status.values()) else "degraded",
            models_loaded=models_status,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            models_loaded={},
            timestamp=datetime.now().isoformat()
        )


@app.post("/api/v1/verify-image", response_model=ImageVerificationResponse)
async def verify_image(request: ImageVerificationRequest):
    """
    Verify image for damage and duplicate detection.
    
    Args:
        request: Image verification request with image path
        
    Returns:
        Image verification results including damage confidence and duplicate status
    """
    try:
        if image_verifier is None:
            raise HTTPException(status_code=503, detail="Image verifier not initialized")
        
        # Validate image path
        validate_image_path(request.image_path)
        
        # Perform verification
        result = image_verifier.verify(
            image_path=request.image_path,
            crop_type=request.crop_type
        )
        
        return ImageVerificationResponse(**result)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in image verification: {e}")
        raise HTTPException(status_code=500, detail=format_error_message(e))


@app.post("/api/v1/predict-yield", response_model=YieldPredictionResponse)
async def predict_yield(request: YieldPredictionRequest):
    """
    Predict crop yield based on agricultural parameters.
    
    Args:
        request: Yield prediction request with crop and farm parameters
        
    Returns:
        Predicted yield with confidence and recommendations
    """
    try:
        if yield_predictor is None:
            raise HTTPException(status_code=503, detail="Yield predictor not initialized")
        
        # Perform prediction
        result = yield_predictor.predict(
            crop_type=request.crop_type,
            land_size=request.land_size,
            sowing_date=request.sowing_date,
            soil_type=request.soil_type,
            irrigation_type=request.irrigation_type,
            fertilizer_usage=request.fertilizer_usage,
            weather_features=request.weather_features
        )
        
        return YieldPredictionResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in yield prediction: {e}")
        raise HTTPException(status_code=500, detail=format_error_message(e))


@app.post("/api/v1/detect-fraud", response_model=FraudDetectionResponse)
async def detect_fraud(request: FraudDetectionRequest):
    """
    Detect potential fraud in insurance claims.
    
    Args:
        request: Fraud detection request with claim details
        
    Returns:
        Fraud detection results with score and anomaly features
    """
    try:
        if fraud_detector is None:
            raise HTTPException(status_code=503, detail="Fraud detector not initialized")
        
        # Perform fraud detection
        result = fraud_detector.detect(
            crop_type=request.crop_type,
            land_size=request.land_size,
            expected_yield=request.expected_yield,
            claim_amount=request.claim_amount,
            weather_features=request.weather_features,
            historical_claims=request.historical_claims,
            user_id=request.user_id
        )
        
        return FraudDetectionResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in fraud detection: {e}")
        raise HTTPException(status_code=500, detail=format_error_message(e))


@app.post("/api/v1/evaluate-claim", response_model=ClaimEvaluationResponse)
async def evaluate_claim(request: ClaimEvaluationRequest):
    """
    Complete claim evaluation combining image verification, yield prediction, and fraud detection.
    
    Args:
        request: Complete claim evaluation request
        
    Returns:
        Comprehensive claim evaluation result with approval status and reasoning
    """
    try:
        if claim_evaluator is None:
            raise HTTPException(status_code=503, detail="Claim evaluator not initialized")
        
        # Perform complete evaluation
        result = claim_evaluator.evaluate(
            image_path=request.image_path,
            crop_type=request.crop_type,
            land_size=request.land_size,
            expected_yield=request.expected_yield,
            claim_amount=request.claim_amount,
            weather_features=request.weather_features,
            sowing_date=request.sowing_date,
            soil_type=request.soil_type,
            irrigation_type=request.irrigation_type,
            fertilizer_usage=request.fertilizer_usage,
            historical_claims=request.historical_claims,
            user_id=request.user_id
        )
        
        return ClaimEvaluationResponse(**result)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in claim evaluation: {e}")
        raise HTTPException(status_code=500, detail=format_error_message(e))


@app.post("/api/v1/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload image file for processing.
    Saves the image and returns the path for use in other endpoints.
    
    Args:
        file: Uploaded image file
        
    Returns:
        JSON with saved image path
    """
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Image uploaded: {file_path}")
        
        return JSONResponse({
            "image_path": file_path,
            "filename": unique_filename,
            "size": len(content)
        })
        
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=format_error_message(e))

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8000))  # Cloud Run uses PORT env variable
    
    print(f"🚀 Starting KRISHI RAKSHA ML API Server on port {port}...")
    print(f"📍 Server will run at: http://0.0.0.0:{port}")
    print(f"📖 API docs at: http://0.0.0.0:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)