// ===================================================================
// FILE: backend/controllers/claim.controller.js
// Updated to match comprehensive claims schema and frontend format
// ===================================================================

const ClaimModel = require('../models/claim.model');
const FarmerModel = require('../models/farmer.model');
const IPFSService = require('../services/ipfs.service');
const MLService = require('../services/ml.service');
const blockchainService = require('../services/blockchain.service');

class ClaimController {
  // Submit new claim
  async submitClaim(req, res) {
    try {
      const farmerId = req.farmerId;
      const {
        cropType,
        affectedArea,
        incidentDate,
        incidentDescription,
        damageType,
        estimatedLoss,
        // Additional fields for ML
        sowingDate,
        soilType,
        irrigationType,
        fertilizerUsage,
        landSizeAcres,
      } = req.body;

      // Get farmer details
      const farmer = await FarmerModel.findById(farmerId);
      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      // Upload evidence files to IPFS
      const files = req.files || [];
      const photos = [];
      const documents = [];
      let ipfsResult = { urls: [], mainHash: '' };

      if (files.length > 0) {
        try {
          ipfsResult = await IPFSService.uploadMultipleFiles(files);
          if (!ipfsResult.success) {
            console.warn('IPFS upload failed, continuing without IPFS storage');
          }

          // Separate photos and documents
          files.forEach((file, index) => {
            const isImage = file.mimetype?.startsWith('image/');
            const fileData = {
              filename: file.originalname,
              name: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              path: file.path,
              ipfsHash: ipfsResult.hashes?.[index] || '',
              ipfsUrl: ipfsResult.urls?.[index] || '',
            };

            if (isImage) {
              photos.push(fileData);
            } else {
              documents.push({ ...fileData, type: 'document' });
            }
          });
        } catch (ipfsError) {
          console.warn('IPFS upload error (non-fatal):', ipfsError.message);
          // Continue without IPFS - files are still uploaded locally
          files.forEach((file) => {
            const isImage = file.mimetype?.startsWith('image/');
            const fileData = {
              filename: file.originalname,
              name: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              path: file.path,
            };
            if (isImage) {
              photos.push(fileData);
            } else {
              documents.push({ ...fileData, type: 'document' });
            }
          });
        }
      }

      // Calculate expected yield (can be improved with ML prediction)
      // Use estimatedLoss as claimAmount, and calculate expected yield
      const claimAmount = parseFloat(estimatedLoss || req.body.claimAmount || 0);
      const affectedAreaValue = parseFloat(affectedArea || 0);
      const expectedYield = affectedAreaValue > 0 
        ? claimAmount / (affectedAreaValue * 1000) // Rough estimate
        : 0;

      // Create claim in database with new schema
      const claim = await ClaimModel.create({
        farmerId,
        cropType,
        claimedAmount: claimAmount,
        expectedYield: expectedYield || 0,
        affectedArea: affectedAreaValue,
        landSizeAcres: parseFloat(landSizeAcres || affectedAreaValue || 0),
        incidentDate,
        incidentDescription,
        sowingDate: sowingDate || null,
        soilType: soilType || 'loamy',
        irrigationType: irrigationType || 'canal',
        fertilizerUsage: parseFloat(fertilizerUsage) || 0,
        weatherFeatures: {}, // Can be enhanced with weather API
        photos,
        documents,
      });

      // Submit to blockchain (non-blocking)
      try {
        // Calculate damage percentage for blockchain (if we have expected yield)
        const damagePercentage = expectedYield > 0 
          ? Math.min(100, Math.max(0, ((expectedYield - (claimAmount / (affectedAreaValue * 1000))) / expectedYield) * 100))
          : 50; // Default to 50% if we can't calculate

        const blockchainResult = await blockchainService.submitClaim({
          farmerId: farmer.phone,
          cropType,
          damagePercentage,
          claimAmount: claimAmount,
          ipfsHash: ipfsResult.mainHash,
        });

        if (blockchainResult.success) {
          await ClaimModel.updateBlockchainData(claim.id, blockchainResult);
        }
      } catch (blockchainError) {
        console.warn('Blockchain submission failed (non-fatal):', blockchainError.message);
        // Continue - claim is saved in database
      }

      // Trigger ML processing asynchronously (don't wait)
      setImmediate(async () => {
        try {
          const fullClaim = await ClaimModel.findById(claim.id);
          const mlResult = await MLService.verifyClaim(fullClaim);
          
          // Check if ML result contains mock data warning
          if (mlResult.isMockData || mlResult.mlServiceAvailable === false) {
            console.warn('⚠️ ML verification used mock/estimated data for claim:', claim.id);
            console.warn('   ML service is unavailable. Results are estimates only.');
          }
          
          await ClaimModel.updateMLVerification(claim.id, mlResult);

          // If approved, update blockchain
          if (mlResult.approved && fullClaim.blockchain_claim_id) {
            try {
              const blockchainResult = await blockchainService.approveClaim(
                fullClaim.blockchain_claim_id
              );
              if (blockchainResult.success) {
                await ClaimModel.approve(claim.id, blockchainResult.transactionHash);
              }
            } catch (err) {
              console.error('Blockchain approval error:', err);
            }
          }
        } catch (mlError) {
          console.error('ML processing error:', mlError);
          console.error('⚠️ ML verification failed completely. Claim will remain in pending status.');
        }
      });

      res.status(201).json({
        success: true,
        message: 'Claim submitted successfully. ML verification is in progress.',
        claim: {
          id: claim.id,
          status: claim.status,
          submissionDate: claim.submission_date,
        },
      });
    } catch (error) {
      console.error('Submit claim error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all claims for current farmer
  async getMyClaims(req, res) {
    try {
      const farmerId = req.farmerId;
      const claims = await ClaimModel.findByFarmerId(farmerId);

      // Transform to frontend format
      const transformedClaims = claims.map((claim) => ({
        id: claim.id,
        submissionDate: claim.submission_date
          ? new Date(claim.submission_date).toLocaleDateString('en-GB')
          : new Date(claim.created_at).toLocaleDateString('en-GB'),
        cropType: claim.crop_type,
        claimedAmount: parseFloat(claim.claimed_amount || 0),
        status: claim.status,
        affectedArea: parseFloat(claim.affected_area || 0),
        incidentDate: claim.incident_date
          ? new Date(claim.incident_date).toLocaleDateString('en-GB')
          : '',
        incidentDescription: claim.incident_description,
        blockchainTxHash: claim.blockchain_tx_hash,
        mlApproved: claim.ml_approved,
        mlFraudScore: claim.ml_fraud_score,
        mlPredictedYield: claim.ml_predicted_yield,
      }));

      res.json({
        success: true,
        claims: transformedClaims,
      });
    } catch (error) {
      console.error('Get claims error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get claim by ID
  async getClaimById(req, res) {
    try {
      const { id } = req.params;
      const claim = await ClaimModel.findById(id);

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      // Check if farmer owns this claim
      if (claim.farmer_id !== req.farmerId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Transform to frontend format
      const transformedClaim = {
        id: claim.id,
        submissionDate: claim.submission_date
          ? new Date(claim.submission_date).toLocaleDateString('en-GB')
          : new Date(claim.created_at).toLocaleDateString('en-GB'),
        cropType: claim.crop_type,
        claimedAmount: parseFloat(claim.claimed_amount || 0),
        status: claim.status,
        affectedArea: parseFloat(claim.affected_area || 0),
        incidentDate: claim.incident_date
          ? new Date(claim.incident_date).toLocaleDateString('en-GB')
          : '',
        incidentDescription: claim.incident_description,
        assessorNotes: claim.reviewer_notes,
        blockchainTxHash: claim.blockchain_tx_hash,
        photos: (claim.photos || []).map((photo) => ({
          url: photo.ipfs_gateway_url || photo.local_file_path || '',
          alt: photo.original_filename || 'Claim photo',
        })),
        documents: (claim.documents || []).map((doc) => ({
          name: doc.document_name,
          url: doc.document_url,
          type: doc.document_type,
        })),
        mlApproved: claim.ml_approved,
        mlFraudScore: claim.ml_fraud_score,
        mlPredictedYield: claim.ml_predicted_yield,
        mlReason: claim.ml_reason,
      };

      res.json({
        success: true,
        claim: transformedClaim,
      });
    } catch (error) {
      console.error('Get claim error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Process claim with ML verification (admin/system route)
  async processClaim(req, res) {
    try {
      const { id } = req.params;

      const claim = await ClaimModel.findById(id);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      // Run ML verification
      const mlResult = await MLService.verifyClaim(claim);

      // Update claim with ML results
      await ClaimModel.updateMLVerification(claim.id, mlResult);

      if (mlResult.approved && claim.blockchain_claim_id) {
        // Approve on blockchain
        try {
          const blockchainResult = await blockchainService.approveClaim(
            claim.blockchain_claim_id
          );

          if (blockchainResult.success) {
            await ClaimModel.approve(claim.id, blockchainResult.transactionHash);
          }
        } catch (blockchainError) {
          console.error('Blockchain approval error:', blockchainError);
        }
      }

      // Check if ML result used mock data
      const response = {
        success: true,
        message: mlResult.approved ? 'Claim approved' : 'Claim rejected',
        mlResult,
      };

      if (mlResult.isMockData || mlResult.mlServiceAvailable === false) {
        response.warning = '⚠️ ML verification used estimated/mock data. ML service is unavailable.';
        response.mlServiceStatus = {
          available: false,
          note: 'Real ML verification requires the ML service to be running.',
        };
      }

      res.json(response);
    } catch (error) {
      console.error('Process claim error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ClaimController();
