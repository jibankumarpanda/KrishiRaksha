// ===================================================================
// FILE: backend/controllers/farmer.controller.js
// Farmer Profile & Dashboard Controller
// ===================================================================

const FarmerModel = require('../models/farmer.model');
const ClaimModel = require('../models/claim.model');
const DashboardStatsModel = require('../models/dashboardStats.model');
const MLService = require('../services/ml.service');
const { supabase } = require('../config/db');

class FarmerController {
  // Get farmer dashboard stats
  async getDashboard(req, res) {
    try {
      const farmerId = req.farmerId;

      // Get farmer details
      const farmer = await FarmerModel.findById(farmerId);

      // Get dashboard stats (if any)
      const dashboardStats = await DashboardStatsModel.findByFarmerId(farmerId);

      // Get all claims
      const claims = await ClaimModel.findByFarmerId(farmerId);

      // Calculate claim stats
      const claimStats = {
        totalClaims: claims.length,
        pendingClaims: claims.filter(
          (c) => c.status === 'submitted' || c.status === 'ml_verification'
        ).length,
        approvedClaims: claims.filter(
          (c) => c.status === 'approved' || c.status === 'paid'
        ).length,
        rejectedClaims: claims.filter((c) => c.status === 'rejected').length,
        totalPayout: claims
          .filter((c) => c.status === 'paid')
          .reduce((sum, c) => sum + parseFloat(c.claim_amount || 0), 0),
        avgClaimAmount:
          claims.length > 0
            ? claims.reduce((sum, c) => sum + parseFloat(c.claim_amount || 0), 0) /
              claims.length
            : 0,
      };

      // Compose dashboard data
      const dashboard = {
        farmer: {
          name: farmer.name,
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          cropType: farmer.crop_type,
          landSize: farmer.land_size_acres,
        },
        stats: {
          totalLandArea: dashboardStats?.total_land_area || farmer.land_size_acres || 0,
          landAreaUnit: dashboardStats?.land_area_unit || 'acre',
          predictedYield: dashboardStats?.predicted_yield || 0,
          yieldUnit: dashboardStats?.yield_unit || 'quintals',
          riskScore: dashboardStats?.risk_score || 0,
          riskScoreUnit: dashboardStats?.risk_score_unit || '/100',
          activeClaims: dashboardStats?.active_claims ?? claimStats.pendingClaims,
          trend: {
            landArea: dashboardStats?.trend_land_area || 'neutral',
            landAreaValue: dashboardStats?.trend_land_area_value || '0%',
            landAreaLabel: dashboardStats?.trend_land_area_label || '',
            claims: dashboardStats?.trend_claims || 'neutral',
            claimsValue: dashboardStats?.trend_claims_value || '0%',
            claimsLabel: dashboardStats?.trend_claims_label || '',
            yield: dashboardStats?.trend_yield || 'neutral',
            yieldValue: dashboardStats?.trend_yield_value || '0%',
            yieldLabel: dashboardStats?.trend_yield_label || '',
            risk: dashboardStats?.trend_risk || 'neutral',
            riskValue: dashboardStats?.trend_risk_value || '0%',
            riskLabel: dashboardStats?.trend_risk_label || '',
          },
          lastUpdated: dashboardStats?.last_updated || null,
        },
        claims: {
          summary: claimStats,
          recentClaims: claims.slice(0, 5),
        },
      };

      res.json({
        success: true,
        dashboard,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Predict yield and save stats
  async predictYield(req, res) {
    try {
      const farmerId = req.farmerId;
      const {
        cropType,
        landAreaValue,
        landAreaUnit = 'acre',
        sowingDate,
        soilType,
        irrigationType,
        fertilizerUsage,
      } = req.body;

      if (!cropType || !landAreaValue) {
        return res.status(400).json({ error: 'Crop type and land area are required' });
      }

      const landSizeAcres = FarmerController.convertToAcres(parseFloat(landAreaValue), landAreaUnit);

      const prediction = await MLService.predictYield({
        crop_type: cropType,
        land_size_acres: landSizeAcres,
        sowing_date: sowingDate,
        soil_type: soilType,
        irrigation_type: irrigationType,
        fertilizer_usage: fertilizerUsage,
        geo_location: null,
      });

      // Derive risk score (simple mapping from predictedDamage/confidence)
      const riskScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (prediction.predictedDamage || 0) > 0
              ? prediction.predictedDamage
              : (1 - (prediction.confidence || 0.8)) * 100
          )
        )
      );

      // Upsert dashboard stats (non-fatal - continue even if table doesn't exist or has constraint issues)
      try {
        await DashboardStatsModel.upsert(farmerId, {
          total_land_area: landSizeAcres,
          land_area_unit: landAreaUnit || 'acre',
          predicted_yield: prediction.predictedYield || 0,
          yield_unit: 'quintals',
          risk_score: riskScore,
          risk_score_unit: '/100',
          trend_yield: 'neutral',
          trend_yield_value: '0%',
          trend_risk: 'neutral',
          trend_risk_value: '0%',
        });
      } catch (dbError) {
        console.warn('⚠️ Dashboard stats not saved (table may not exist or missing constraint):', dbError.message);
        // Continue without failing the request - prediction is more important
      }

      // Check if this is mock data and add warnings
      const isMockData = prediction.isMockData === true;
      const response = {
        success: true,
        prediction: {
          predictedYield: prediction.predictedYield || 0,
          confidence: Math.round((prediction.confidence || 0) * 100),
          riskLevel: riskScore <= 30 ? 'low' : riskScore <= 70 ? 'medium' : 'high',
          recommendations: [
            'Maintain balanced fertilizer usage based on soil tests',
            'Monitor irrigation closely during flowering stage',
            'Schedule a field scout within 7-10 days for pest checks',
          ],
        },
      };

      // Add warnings if using mock data
      if (isMockData) {
        response.warning = prediction.warning || '⚠️ This prediction uses estimated/mock data. ML service is unavailable.';
        response.mlServiceStatus = {
          available: false,
          error: prediction.mlServiceError || 'Unknown error',
          status: prediction.mlServiceStatus || 'UNKNOWN',
          url: prediction.mlServiceUrl || 'Not configured',
        };
        response.note = prediction.note || 'Real ML predictions require the ML service to be running.';
        console.warn('⚠️ Returning mock prediction data to user. ML service unavailable.');
      } else {
        response.mlServiceStatus = {
          available: true,
          url: prediction.mlServiceUrl || 'Not configured',
        };
        response.note = prediction.note || '✅ Real ML prediction data.';
      }

      res.json(response);
    } catch (error) {
      console.error('Predict yield error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Helper: convert land area to acres
  static convertToAcres(value, unit = 'acre') {
    if (!value) return 0;
    switch (unit) {
      case 'acre':
        return value;
      case 'hectare':
        return value * 2.47105;
      case 'bigha':
        return value * 0.6198;
      case 'katha':
        return value * 0.06198;
      case 'kanal':
        return value * 0.125;
      case 'marla':
        return value * 0.00625;
      case 'guntha':
        return value * 0.025;
      case 'cent':
        return value * 0.01;
      default:
        return value;
    }
  }

  // Update farmer profile
  async updateProfile(req, res) {
    try {
      const farmerId = req.farmerId;
      const updates = req.body;

      // Don't allow updating sensitive fields
      delete updates.phone;
      delete updates.email;
      delete updates.password;
      delete updates.password_hash;

      const updatedFarmer = await FarmerModel.update(farmerId, updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        farmer: updatedFarmer,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get farmer by ID (admin only)
  async getFarmerById(req, res) {
    try {
      const { id } = req.params;
      const farmer = await FarmerModel.findById(id);

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      res.json({
        success: true,
        farmer,
      });
    } catch (error) {
      console.error('Get farmer error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FarmerController();