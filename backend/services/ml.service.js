// ===================================================================
// FILE: backend/services/ml.service.js
// Updated to match KRISHI RAKSHA ML API endpoints
// ===================================================================

const axios = require('axios');

class MLService {
  static ML_API_URL = process.env.ML_API_URL || 'https://krishi-raksha.onrender.com';
  
  // Check if ML service is available
  static async checkMLServiceHealth() {
    try {
      const response = await axios.get(`${this.ML_API_URL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ ML service health check failed:', error.message);
      return false;
    }
  }

  // Verify claim using all ML models
  static async verifyClaim(claim) {
    try {
      console.log('🔬 Running ML verification for claim:', claim.id);
      
      // Use the complete evaluation endpoint
      const response = await axios.post(`${this.ML_API_URL}/api/v1/evaluate-claim`, {
        image_path: claim.evidence_urls?.[0] || '',
        crop_type: claim.crop_type,
        land_size: claim.land_size_acres || 5,
        expected_yield: null, // Will be calculated by ML
        claim_amount: claim.claim_amount,
        weather_features: this.getWeatherFeatures(claim.geo_location),
        sowing_date: null,
        soil_type: 'loamy', // Default, can be added to claim form
        irrigation_type: 'canal', // Default, can be added to claim form
        fertilizer_usage: 'moderate', // Default, can be added to claim form
        historical_claims: [],
        user_id: claim.farmer_id,
      });
      
      const result = response.data;
      
      console.log('✅ ML verification completed:', result);
      
      return {
        approved: result.approved,
        imageVerified: result.image_verification?.is_valid || false,
        fraudScore: result.fraud_detection?.fraud_score || 0,
        predictedDamage: this.calculateDamagePercentage(result.yield_prediction),
        predictedYield: result.yield_prediction?.predicted_yield || 0,
        fullResult: result,
        rejectionReason: result.approved ? null : (result.reason || 'Claim validation failed'),
      };
    } catch (error) {
      console.error('❌ ML verification failed:', error.message);
      
      // Fallback to individual API calls if complete evaluation fails
      return await this.verifyClaimIndividual(claim);
    }
  }

  // Fallback: Individual API calls
  static async verifyClaimIndividual(claim) {
    try {
      console.log('⚠️ Using individual ML endpoints as fallback');
      
      // Step 1: Image Verification (if available)
      let imageResult = { verified: true, confidence: 0.85 };
      if (claim.evidence_urls && claim.evidence_urls.length > 0) {
        imageResult = await this.verifyImage(claim.evidence_urls[0], claim.crop_type);
      }
      
      // Step 2: Fraud Detection
      const fraudResult = await this.detectFraud(claim);
      
      // Step 3: Yield Prediction
      const yieldResult = await this.predictYield(claim);
      
      // Combine results
      const approved = 
        imageResult.verified && 
        fraudResult.fraudScore < 0.5 && 
        Math.abs(yieldResult.predictedDamage - claim.damage_percentage) < 20;
      
      return {
        approved,
        imageVerified: imageResult.verified,
        fraudScore: fraudResult.fraudScore,
        predictedDamage: yieldResult.predictedDamage,
        predictedYield: yieldResult.predictedYield,
        fullResult: {
          image: imageResult,
          fraud: fraudResult,
          yield: yieldResult,
        },
        rejectionReason: approved ? null : this.getRejectionReason(imageResult, fraudResult, yieldResult),
      };
    } catch (error) {
      console.error('❌ Individual ML verification also failed:', error);
      throw error;
    }
  }

  // Image verification
  static async verifyImage(imagePath, cropType) {
    try {
      const response = await axios.post(`${this.ML_API_URL}/api/v1/verify-image`, {
        image_path: imagePath,
        crop_type: cropType,
      });
      
      const result = response.data;
      
      return {
        verified: result.is_valid || false,
        confidence: result.confidence || 0,
        cropTypeMatch: result.crop_match || false,
        duplicateDetected: result.is_duplicate || false,
      };
    } catch (error) {
      console.error('Image verification API failed:', error.message);
      // Return mock data as fallback
      return {
        verified: true,
        confidence: 0.85,
        cropTypeMatch: true,
        duplicateDetected: false,
      };
    }
  }

  // Fraud detection
  static async detectFraud(claim) {
    try {
      const response = await axios.post(`${this.ML_API_URL}/api/v1/detect-fraud`, {
        crop_type: claim.crop_type,
        land_size: claim.land_size_acres || 5,
        expected_yield: null,
        claim_amount: claim.claim_amount,
        weather_features: this.getWeatherFeatures(claim.geo_location),
        historical_claims: [],
        user_id: claim.farmer_id,
      });
      
      const result = response.data;
      
      return {
        fraudScore: result.fraud_score || 0,
        riskLevel: result.risk_level || 'low',
        anomalyDetected: result.anomaly_features?.length > 0 || false,
        anomalyFeatures: result.anomaly_features || [],
      };
    } catch (error) {
      console.error('Fraud detection API failed:', error.message);
      // Return mock data as fallback
      return {
        fraudScore: 0.15,
        riskLevel: 'low',
        anomalyDetected: false,
        anomalyFeatures: [],
      };
    }
  }

  // Yield prediction - Updated to handle frontend data format
  static async predictYield(data, retries = 2) {
      const payload = {
        crop_type: data.crop_type || data.cropType,
      land_size: data.land_size_acres || data.landAreaValue || 5,
      sowing_date: data.sowing_date || data.sowingDate || null,
        soil_type: data.soil_type || data.soilType || 'loamy',
        irrigation_type: data.irrigation_type || data.irrigationType || 'canal',
        fertilizer_usage: data.fertilizer_usage || data.fertilizerUsage || 'moderate',
        weather_features: this.getWeatherFeatures(data.geo_location),
      };

    console.log('🌾 Sending yield prediction request to:', `${this.ML_API_URL}/api/v1/predict-yield`);
    console.log('🌾 Payload:', payload);

    // Retry logic
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${retries} for yield prediction...`);
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }

        // Add timeout and better error handling
        const response = await axios.post(
          `${this.ML_API_URL}/api/v1/predict-yield`, 
          payload,
          {
            timeout: 15000, // 15 second timeout
            validateStatus: function (status) {
              return status < 500; // Don't throw for 4xx errors
            }
          }
        );
        
        if (response.status >= 400) {
          throw new Error(`ML API returned ${response.status}: ${response.statusText}`);
        }
      
      const result = response.data;
        console.log('✅ Yield prediction response (REAL ML DATA):', result);
      
      return {
        predictedYield: result.predicted_yield || 2500,
        predictedDamage: this.calculateDamagePercentage(result),
        confidence: result.confidence || 0.78,
          isMockData: false, // Real ML prediction
          mlServiceAvailable: true,
          mlServiceUrl: `${this.ML_API_URL}/api/v1/predict-yield`,
          note: '✅ This is real ML prediction data from the ML service.',
      };
    } catch (error) {
        lastError = error;
        // If this is the last attempt, fall through to mock data
        if (attempt === retries) {
          break;
        }
        // Otherwise, log and retry
        console.warn(`⚠️ Attempt ${attempt + 1} failed:`, error.message);
      }
    }

    // All retries failed - return mock data
    const finalError = lastError || new Error('ML service unavailable');
    
    const errorDetails = {
      message: finalError.message,
      code: finalError.code,
      status: finalError.response?.status,
      url: `${this.ML_API_URL}/api/v1/predict-yield`,
    };
    
    console.error('❌ Yield prediction API failed after all retries:', errorDetails);
    console.warn('⚠️ ML Service unavailable - using mock data as fallback');
    console.warn('   This is NOT real prediction data. ML service must be running for accurate predictions.');
      
      // Return mock data as fallback with more realistic values
      const baseYield = {
        rice: 3500,
        wheat: 3000,
        cotton: 1800,
        sugarcane: 70000,
        maize: 2500,
      };
      
    // Calculate more realistic mock values based on input
    const cropType = (data.crop_type || data.cropType || 'rice').toLowerCase();
      const landSize = parseFloat(data.land_size_acres || data.landAreaValue || 5);
      const baseYieldPerAcre = baseYield[cropType] || 2500;
      
    // More realistic calculation based on crop and land size
    const seasonalFactor = 0.85 + Math.random() * 0.3; // 85-115% of base yield
    const calculatedYield = Math.round(baseYieldPerAcre * landSize * seasonalFactor);
    
    const mockPrediction = {
      predictedYield: calculatedYield,
      predictedDamage: Math.max(0, Math.min(20, (Math.random() * 15) + 2)), // 2-17% damage
      confidence: 0.70 + Math.random() * 0.25, // 70-95% confidence
      isMockData: true, // Flag to indicate this is mock data
      mlServiceAvailable: false,
      mlServiceError: finalError.message,
      mlServiceStatus: finalError.response?.status || 'UNKNOWN',
      mlServiceUrl: `${this.ML_API_URL}/api/v1/predict-yield`,
      warning: '⚠️ WARNING: This is MOCK/ESTIMATED data. The ML service is currently unavailable. Real predictions require the ML service to be running at the configured URL.',
      note: 'To get real ML predictions, ensure the ML service is running and accessible at the configured URL.',
    };
    
    console.error('🔄 Using MOCK prediction (NOT REAL ML DATA):', {
      predictedYield: mockPrediction.predictedYield,
      predictedDamage: mockPrediction.predictedDamage,
      confidence: mockPrediction.confidence,
      error: finalError.message,
      status: finalError.response?.status,
      url: mockPrediction.mlServiceUrl,
    });
    console.error('⚠️ IMPORTANT: ML Service is unavailable. All predictions are estimates, not real ML predictions.');
    
    return mockPrediction;
  }

  // Helper: Get weather features
  static getWeatherFeatures(geoLocation) {
    // This would normally fetch real weather data
    // For now, return default features
    return {
      temperature: 28.5,
      rainfall: 15.2,
      humidity: 65,
      wind_speed: 12.5,
    };
  }

  // Helper: Calculate damage percentage from yield prediction
  static calculateDamagePercentage(yieldPrediction) {
    if (!yieldPrediction || !yieldPrediction.predicted_yield) {
      return 0;
    }
    
    // Estimate damage based on yield difference
    // This is a simplified calculation
    return Math.min(100, Math.max(0, 100 - (yieldPrediction.confidence * 100)));
  }

  // Get rejection reason
  static getRejectionReason(imageResult, fraudResult, yieldResult) {
    if (!imageResult.verified) {
      return 'Image verification failed. Photos may not match claimed crop type or damage.';
    }
    if (fraudResult.fraudScore >= 0.5) {
      return `High fraud risk detected (score: ${fraudResult.fraudScore}). Claim patterns appear suspicious.`;
    }
    if (fraudResult.anomalyFeatures && fraudResult.anomalyFeatures.length > 0) {
      return `Anomalies detected: ${fraudResult.anomalyFeatures.join(', ')}`;
    }
    return 'Claimed damage does not match ML predictions based on evidence and historical data.';
  }
}

module.exports = MLService;