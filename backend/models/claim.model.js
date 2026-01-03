// ===================================================================
// FILE: backend/models/claim.model.js
// Updated to match comprehensive claims schema
// ===================================================================

const { supabase } = require('../config/db');

class ClaimModel {
  // Create new claim with comprehensive schema
  static async create(claimData) {
    const {
      farmerId,
      cropType,
      claimedAmount,
      expectedYield,
      affectedArea,
      landSizeAcres,
      incidentDate,
      incidentDescription,
      sowingDate,
      soilType,
      irrigationType,
      fertilizerUsage,
      weatherFeatures,
      photos = [],
      documents = [],
    } = claimData;

    // Insert main claim
    const { data, error } = await supabase
      .from('claims')
      .insert([
        {
          farmer_id: farmerId,
          crop_type: cropType,
          claimed_amount: claimedAmount,
          expected_yield: expectedYield,
          affected_area: affectedArea,
          land_size_acres: landSizeAcres,
          incident_date: incidentDate,
          incident_description: incidentDescription,
          sowing_date: sowingDate,
          soil_type: soilType,
          irrigation_type: irrigationType,
          fertilizer_usage: fertilizerUsage,
          weather_features: weatherFeatures,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const claimId = data.id;

    // Insert claim photos if provided
    if (photos.length > 0) {
      const photoRecords = photos.map((photo) => ({
        claim_id: claimId,
        original_filename: photo.filename || photo.name,
        file_size: photo.size,
        mime_type: photo.mimetype,
        ipfs_hash: photo.ipfsHash || '',
        ipfs_gateway_url: photo.ipfsUrl || '',
        local_file_path: photo.path || '',
        geo_latitude: photo.latitude,
        geo_longitude: photo.longitude,
        upload_source: 'web',
      }));

      await supabase.from('claim_photos').insert(photoRecords);
    }

    // Insert claim documents if provided
    if (documents.length > 0) {
      const docRecords = documents.map((doc) => ({
        claim_id: claimId,
        document_name: doc.filename || doc.name,
        document_url: doc.url || doc.ipfsUrl || '',
        document_type: doc.type || 'other',
        file_size: doc.size,
        mime_type: doc.mimetype,
        ipfs_hash: doc.ipfsHash || '',
      }));

      await supabase.from('claim_documents').insert(docRecords);
    }

    return data;
  }

  // Find claim by ID with related data
  static async findById(id) {
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (claimError) throw claimError;

    // Get related photos
    const { data: photos } = await supabase
      .from('claim_photos')
      .select('*')
      .eq('claim_id', id);

    // Get related documents
    const { data: documents } = await supabase
      .from('claim_documents')
      .select('*')
      .eq('claim_id', id);

    // Get ML evaluation history
    const { data: mlHistory } = await supabase
      .from('ml_evaluation_history')
      .select('*')
      .eq('claim_id', id)
      .order('created_at', { ascending: false });

    // Get fraud detection details
    const { data: fraudDetails } = await supabase
      .from('fraud_detection_details')
      .select('*')
      .eq('claim_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get yield prediction details
    const { data: yieldDetails } = await supabase
      .from('yield_prediction_details')
      .select('*')
      .eq('claim_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      ...claim,
      photos: photos || [],
      documents: documents || [],
      mlHistory: mlHistory || [],
      fraudDetails: fraudDetails || null,
      yieldDetails: yieldDetails || null,
    };
  }

  // Get all claims for a farmer
  static async findByFarmerId(farmerId) {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Update claim
  static async update(id, updates) {
    const { data, error } = await supabase
      .from('claims')
      .update({
        ...updates,
        last_updated: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update ML verification results
  static async updateMLVerification(id, mlResults) {
    const updates = {
      ml_evaluation_completed: true,
      ml_approved: mlResults.approved,
      ml_reason: mlResults.rejectionReason,
      ml_damage_confidence: mlResults.predictedDamage,
      ml_predicted_yield: mlResults.predictedYield,
      ml_fraud_detected: mlResults.fraudScore >= 0.5,
      ml_fraud_score: mlResults.fraudScore,
      ml_is_duplicate: mlResults.imageVerified === false,
      ml_evaluated_at: new Date().toISOString(),
      status: mlResults.approved ? 'ml_verification' : 'rejected',
    };

    // Save ML evaluation history
    await supabase.from('ml_evaluation_history').insert([
      {
        claim_id: id,
        evaluation_type: 'complete',
        evaluation_status: mlResults.approved ? 'approved' : 'rejected',
        evaluation_result: mlResults.fullResult || mlResults,
        processing_time_ms: null,
        model_version: '1.0',
        completed_at: new Date().toISOString(),
      },
    ]);

    // Save fraud detection details if fraud detected
    if (mlResults.fraudScore !== undefined) {
      await supabase.from('fraud_detection_details').insert([
        {
          claim_id: id,
          fraud_score: mlResults.fraudScore,
          fraud_detected: mlResults.fraudScore >= 0.5,
          confidence_level: mlResults.confidence || 0.8,
          anomaly_features: mlResults.fullResult?.fraud_detection?.anomaly_features || [],
          risk_factors: mlResults.fullResult?.fraud_detection || {},
        },
      ]);
    }

    // Save yield prediction details
    if (mlResults.predictedYield !== undefined) {
      await supabase.from('yield_prediction_details').insert([
        {
          claim_id: id,
          predicted_yield: mlResults.predictedYield,
          expected_yield: null, // Will be set from claim data
          yield_discrepancy_percentage: null,
          confidence_score: mlResults.confidence || 0.8,
          risk_level: mlResults.predictedDamage > 50 ? 'high' : mlResults.predictedDamage > 20 ? 'medium' : 'low',
          input_parameters: {},
          weather_factors: {},
          soil_factors: {},
          recommendations: mlResults.recommendations || [],
        },
      ]);
    }

    return await this.update(id, updates);
  }

  // Update blockchain data
  static async updateBlockchainData(id, blockchainData) {
    return await this.update(id, {
      blockchain_claim_id: blockchainData.claimId,
      blockchain_tx_hash: blockchainData.transactionHash,
      blockchain_status: blockchainData.status || 'pending',
      smart_contract_address: blockchainData.contractAddress,
    });
  }

  // Approve claim
  static async approve(id, approvalTxHash) {
    return await this.update(id, {
      blockchain_approval_tx_hash: approvalTxHash,
      status: 'approved',
    });
  }

  // Mark as paid
  static async markAsPaid(id, paymentData) {
    const updates = {
      payment_status: 'completed',
      payment_amount: paymentData.amount,
      payment_date: new Date().toISOString(),
      payment_method: paymentData.method,
      transaction_id: paymentData.transactionId,
      utr_number: paymentData.utrNumber,
      status: 'paid',
    };

    // Create payment transaction record
    if (paymentData.transactionId) {
      await supabase.from('payment_transactions').insert([
        {
          claim_id: id,
          payment_amount: paymentData.amount,
          payment_method: paymentData.method,
          payment_status: 'completed',
          transaction_id: paymentData.transactionId,
          utr_number: paymentData.utrNumber,
          processed_at: new Date().toISOString(),
        },
      ]);
    }

    return await this.update(id, updates);
  }

  // Get pending claims (for admin/system processing)
  static async getPendingClaims() {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .in('status', ['pending', 'under_review', 'ml_verification'])
      .order('submission_date', { ascending: true });

    if (error) throw error;
    return data;
  }
}

module.exports = ClaimModel;
