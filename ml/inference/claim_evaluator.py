"""
Claim evaluator module that combines image verification, yield prediction, and fraud detection.
Provides comprehensive claim evaluation with approval/rejection decision.
"""

import logging
from typing import Dict, Any, Optional
from inference.image_verification import ImageVerifier
from inference.yield_prediction import YieldPredictor
from inference.fraud_detection import FraudDetector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ClaimEvaluator:
    """
    Claim evaluator class that combines all ML models for comprehensive claim evaluation.
    """
    
    def __init__(self, image_verifier: Optional[ImageVerifier] = None,
                 yield_predictor: Optional[YieldPredictor] = None,
                 fraud_detector: Optional[FraudDetector] = None):
        """
        Initialize the claim evaluator.
        
        Args:
            image_verifier: Image verification instance
            yield_predictor: Yield prediction instance
            fraud_detector: Fraud detection instance
        """
        self.image_verifier = image_verifier or ImageVerifier()
        self.yield_predictor = yield_predictor or YieldPredictor()
        self.fraud_detector = fraud_detector or FraudDetector()
    
    def evaluate(self, image_path: str, crop_type: str, land_size: str,
                expected_yield: float, claim_amount: float,
                weather_features: Optional[Dict[str, Any]] = None,
                sowing_date: Optional[str] = None, soil_type: Optional[str] = None,
                irrigation_type: Optional[str] = None, fertilizer_usage: Optional[float] = None,
                historical_claims: int = 0, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Evaluate complete insurance claim.
        
        Args:
            image_path: Path to damage image
            crop_type: Type of crop
            land_size: Land size with unit
            expected_yield: Expected yield in quintals
            claim_amount: Claim amount in currency
            weather_features: Optional weather features
            sowing_date: Optional sowing date
            soil_type: Optional soil type
            irrigation_type: Optional irrigation type
            fertilizer_usage: Optional fertilizer usage
            historical_claims: Number of historical claims
            user_id: Optional user ID
            
        Returns:
            Dictionary with complete evaluation results
        """
        try:
            # Step 1: Image verification
            logger.info("Starting image verification...")
            image_result = self.image_verifier.verify(
                image_path=image_path,
                crop_type=crop_type
            )
            damage_confidence = image_result['damage_confidence']
            is_duplicate = image_result['is_duplicate']
            
            # Step 2: Yield prediction (if sufficient data available)
            logger.info("Starting yield prediction...")
            predicted_yield = expected_yield  # Default to expected yield
            
            if sowing_date and soil_type and irrigation_type and fertilizer_usage is not None:
                try:
                    yield_result = self.yield_predictor.predict(
                        crop_type=crop_type,
                        land_size=land_size,
                        sowing_date=sowing_date,
                        soil_type=soil_type,
                        irrigation_type=irrigation_type,
                        fertilizer_usage=fertilizer_usage,
                        weather_features=weather_features
                    )
                    predicted_yield = yield_result['predicted_yield']
                except Exception as e:
                    logger.warning(f"Yield prediction failed, using expected yield: {e}")
            else:
                logger.info("Insufficient data for yield prediction, using expected yield")
            
            # Step 3: Fraud detection
            logger.info("Starting fraud detection...")
            fraud_result = self.fraud_detector.detect(
                crop_type=crop_type,
                land_size=land_size,
                expected_yield=expected_yield,
                claim_amount=claim_amount,
                weather_features=weather_features,
                historical_claims=historical_claims,
                user_id=user_id
            )
            fraud_detected = fraud_result['fraud_detected']
            fraud_score = fraud_result['fraud_score']
            
            # Step 4: Make approval decision
            approved, reason = self._make_decision(
                damage_confidence=damage_confidence,
                is_duplicate=is_duplicate,
                predicted_yield=predicted_yield,
                expected_yield=expected_yield,
                fraud_detected=fraud_detected,
                fraud_score=fraud_score,
                claim_amount=claim_amount
            )
            
            # Step 5: Generate recommendations
            recommendations = self._generate_recommendations(
                approved=approved,
                damage_confidence=damage_confidence,
                is_duplicate=is_duplicate,
                fraud_detected=fraud_detected,
                predicted_yield=predicted_yield,
                expected_yield=expected_yield
            )
            
            result = {
                'approved': approved,
                'damage_confidence': round(damage_confidence, 2),
                'predicted_yield': round(predicted_yield, 2),
                'fraud_detected': fraud_detected,
                'reason': reason,
                'fraud_score': round(fraud_score, 2) if fraud_detected else None,
                'is_duplicate': is_duplicate,
                'recommendations': recommendations
            }
            
            logger.info(f"Claim evaluation completed: Approved={approved}, Reason={reason}")
            return result
            
        except Exception as e:
            logger.error(f"Error in claim evaluation: {e}")
            raise
    
    def _make_decision(self, damage_confidence: float, is_duplicate: bool,
                      predicted_yield: float, expected_yield: float,
                      fraud_detected: bool, fraud_score: float,
                      claim_amount: float) -> tuple:
        """
        Make approval/rejection decision based on all factors.
        
        Args:
            damage_confidence: Damage confidence percentage
            is_duplicate: Whether image is duplicate
            predicted_yield: Predicted yield
            expected_yield: Expected yield
            fraud_detected: Whether fraud is detected
            fraud_score: Fraud score
            claim_amount: Claim amount
            
        Returns:
            Tuple of (approved: bool, reason: str)
        """
        reasons = []
        
        # Rule 1: Reject if duplicate image
        if is_duplicate:
            return False, "Claim rejected: Duplicate image detected. This image has been used in a previous claim."
        
        # Rule 2: Reject if fraud detected with high confidence
        if fraud_detected and fraud_score > 70:
            return False, f"Claim rejected: High fraud risk detected (score: {fraud_score:.1f}). Multiple anomalies identified in claim data."
        
        # Rule 3: Reject if damage confidence is too low
        if damage_confidence < 30:
            return False, f"Claim rejected: Insufficient evidence of crop damage (confidence: {damage_confidence:.1f}%). Please provide clearer images of the damage."
        
        # Rule 4: Check yield discrepancy
        yield_discrepancy = abs(predicted_yield - expected_yield) / expected_yield if expected_yield > 0 else 0
        if yield_discrepancy > 0.5:  # More than 50% difference
            reasons.append(f"Significant discrepancy between predicted yield ({predicted_yield:.1f}) and expected yield ({expected_yield:.1f})")
        
        # Rule 5: Moderate fraud risk
        if fraud_detected and fraud_score > 50:
            reasons.append(f"Moderate fraud risk detected (score: {fraud_score:.1f})")
        
        # Rule 6: Low damage confidence
        if damage_confidence < 50:
            reasons.append(f"Low damage confidence ({damage_confidence:.1f}%)")
        
        # Decision logic
        if len(reasons) >= 2:
            return False, f"Claim rejected: {', '.join(reasons)}"
        
        if fraud_detected and fraud_score > 60:
            return False, f"Claim rejected: Fraud detected with score {fraud_score:.1f}. {', '.join(reasons) if reasons else 'Anomalies found in claim data.'}"
        
        if damage_confidence < 40:
            return False, f"Claim rejected: Low damage confidence ({damage_confidence:.1f}%). Please provide better quality images showing clear crop damage."
        
        # Approve with conditions
        if reasons:
            return True, f"Claim approved with conditions: {', '.join(reasons)}. Further review recommended."
        
        # Full approval
        return True, "Claim approved: All checks passed. Damage verified, no fraud detected, yield predictions align."
    
    def _generate_recommendations(self, approved: bool, damage_confidence: float,
                                 is_duplicate: bool, fraud_detected: bool,
                                 predicted_yield: float, expected_yield: float) -> list:
        """
        Generate recommendations based on evaluation results.
        
        Args:
            approved: Whether claim is approved
            damage_confidence: Damage confidence
            is_duplicate: Whether image is duplicate
            fraud_detected: Whether fraud is detected
            predicted_yield: Predicted yield
            expected_yield: Expected yield
            
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        if not approved:
            if is_duplicate:
                recommendations.append("Please submit original images of the crop damage")
            if fraud_detected:
                recommendations.append("Review claim details and ensure all information is accurate")
            if damage_confidence < 50:
                recommendations.append("Submit clearer, higher resolution images showing crop damage")
        else:
            if damage_confidence < 70:
                recommendations.append("For future claims, provide clearer images to expedite processing")
            
            yield_diff = abs(predicted_yield - expected_yield)
            if yield_diff > 5:
                recommendations.append("Consider reviewing yield expectations based on current conditions")
        
        if not recommendations:
            recommendations.append("Claim processed successfully")
        
        return recommendations


        



if __name__ == "__main__":
    print("=" * 60)
    print("🚀 CLAIM EVALUATION TEST STARTED")
    print("=" * 60)

    evaluator = ClaimEvaluator()

    # -------- SAMPLE TEST INPUT --------
    test_image_path = "inference/test_images/damaged1.jpg"

    try:
        result = evaluator.evaluate(
            image_path=test_image_path,
            crop_type="Wheat",
            land_size="2 acres",
            expected_yield=20.0,        # quintals
            claim_amount=25000.0,
            weather_features={
                "rainfall": 120,
                "temperature": 28
            },
            sowing_date="2024-11-10",
            soil_type="Loamy",
            irrigation_type="Canal",
            fertilizer_usage=45.0,
            historical_claims=1,
            user_id="FARMER_101"
        )

        print("\n✅ FINAL CLAIM RESULT")
        print("-" * 40)
        for key, value in result.items():
            print(f"{key} : {value}")

    except Exception as e:
        print("\n❌ ERROR DURING CLAIM EVALUATION")
        print(str(e))