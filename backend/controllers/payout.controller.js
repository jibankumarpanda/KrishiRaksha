// ===================================================================
// FILE: backend/controllers/payout.controller.js
// Payment & Payout Controller
// ===================================================================

const ClaimModel = require('../models/claim.model');
const FarmerModel = require('../models/farmer.model');
const PaymentService = require('../services/payment.service');
const blockchainService = require('../services/blockchain.service');

class PayoutController {
  // Initiate payout for approved claim
  async initiatePayout(req, res) {
    try {
      const { claimId } = req.params;

      const claim = await ClaimModel.findById(claimId);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      if (claim.status !== 'approved') {
        return res.status(400).json({ error: 'Claim not approved yet' });
      }

      if (claim.payment_status === 'completed') {
        return res.status(400).json({ error: 'Payment already completed' });
      }

      // Get farmer details
      const farmer = await FarmerModel.findById(claim.farmer_id);

      // Initiate payment
      const paymentResult = await PaymentService.initiatePayment(claim, farmer);

      if (paymentResult.success) {
        // Mark as paid on blockchain
        await blockchainService.markAsPaid(claim.blockchain_claim_id);

        // Update claim
        await ClaimModel.markAsPaid(claim.id, {
          reference: paymentResult.paymentReference,
          blockchainTxHash: paymentResult.transaction?.blockchain_tx_hash,
        });
      }

      res.json({
        success: paymentResult.success,
        message: paymentResult.success ? 'Payment initiated successfully' : 'Payment failed',
        paymentReference: paymentResult.paymentReference,
      });
    } catch (error) {
      console.error('Payout error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get payout status
  async getPayoutStatus(req, res) {
    try {
      const { claimId } = req.params;

      const claim = await ClaimModel.findById(claimId);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      res.json({
        success: true,
        payoutStatus: {
          status: claim.payment_status,
          amount: claim.claim_amount,
          reference: claim.payment_reference,
          completedAt: claim.payment_completed_at,
        },
      });
    } catch (error) {
      console.error('Get payout status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PayoutController();