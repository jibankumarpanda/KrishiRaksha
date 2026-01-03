// ===================================================================
// FILE: backend/services/payment.service.js
// REPLACE YOUR EXISTING FILE WITH THIS
// Enhanced Payment Service with Mock + Razorpay Integration
// ===================================================================

const TransactionModel = require('../models/transaction.model');
const FarmerModel = require('../models/farmer.model');
// Uncomment for real Razorpay integration:
const Razorpay = require('razorpay');

class PaymentService {
  constructor() {
    this.USE_MOCK_PAYMENT = process.env.USE_MOCK_PAYMENT !== 'false'; // Default to mock
    
    // Razorpay instance (uncomment for real payments)
    
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
  }

  // ===================================================================
  // MAIN PAYMENT INITIATION
  // ===================================================================
  
  async initiatePayment(claim, farmer) {
    try {
      console.log(`💰 Initiating payment for claim ${claim.id}`);
      
      // Determine payment method (prefer UPI)
      const paymentMethod = farmer.upi_id ? 'upi' : 'bank_transfer';
      
      // Create transaction record
      const transaction = await TransactionModel.create({
        claimId: claim.id,
        farmerId: farmer.id,
        amount: claim.claim_amount,
        paymentMethod,
        upiId: farmer.upi_id,
        bankAccountNumber: farmer.bank_account_number,
      });
      
      console.log(`📝 Transaction created: ${transaction.id}`);
      
      // Process payment based on mode
      let paymentResult;
      if (this.USE_MOCK_PAYMENT) {
        paymentResult = await this.processMockPayment(
          paymentMethod,
          farmer.upi_id || farmer.bank_account_number,
          claim.claim_amount,
          transaction.id
        );
      } else {
        paymentResult = await this.processRazorpayPayment(
          farmer,
          claim.claim_amount,
          transaction.id
        );
      }
      
      // Update transaction status
      await TransactionModel.updateStatus(
        transaction.id,
        paymentResult.success ? 'success' : 'failed',
        paymentResult
      );
      
      return {
        success: paymentResult.success,
        transaction,
        paymentReference: paymentResult.reference,
        message: paymentResult.message,
      };
    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      throw error;
    }
  }

  // ===================================================================
  // MOCK PAYMENT PROCESSING (FOR DEMO)
  // ===================================================================
  
  async processMockPayment(method, destination, amount, transactionId) {
    try {
      console.log('🎭 Using MOCK payment service (demo mode)');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock reference
      const reference = `MOCK_PAY_${Date.now()}_${transactionId.slice(0, 8)}`;
      
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        console.log(`✅ Mock payment successful!`);
        console.log(`   Method: ${method}`);
        console.log(`   To: ${destination}`);
        console.log(`   Amount: ₹${amount}`);
        console.log(`   Reference: ${reference}`);
        
        return {
          success: true,
          reference,
          timestamp: new Date().toISOString(),
          method,
          amount,
          destination,
          message: `Mock payment of ₹${amount} successful to ${destination}`,
          mockData: {
            bankName: method === 'bank_transfer' ? 'State Bank of India' : null,
            upiApp: method === 'upi' ? 'PayTM' : null,
            status: 'COMPLETED',
          },
        };
      } else {
        console.log(`❌ Mock payment failed (simulated failure)`);
        return {
          success: false,
          error: 'Simulated payment failure for testing',
          message: 'Payment processing failed. Please try again.',
        };
      }
    } catch (error) {
      console.error('❌ Mock payment error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Payment processing error',
      };
    }
  }

  // ===================================================================
  // RAZORPAY PAYMENT PROCESSING (FOR PRODUCTION)
  // ===================================================================
  
  async processRazorpayPayment(farmer, amount, transactionId) {
    try {
      console.log('💳 Using Razorpay payment gateway');
      
      // UNCOMMENT THIS BLOCK FOR REAL RAZORPAY INTEGRATION:
      /*
      // Create Razorpay payout
      const payout = await this.razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
        amount: amount * 100, // Amount in paise (₹1 = 100 paise)
        currency: 'INR',
        mode: farmer.upi_id ? 'UPI' : 'NEFT',
        purpose: 'payout',
        fund_account: {
          account_type: farmer.upi_id ? 'vpa' : 'bank_account',
          vpa: {
            address: farmer.upi_id,
          },
          bank_account: {
            name: farmer.name,
            ifsc: farmer.bank_ifsc_code,
            account_number: farmer.bank_account_number,
          },
        },
        queue_if_low_balance: true,
        reference_id: transactionId,
        narration: `KRISHI RAKSHA claim payout`,
      });
      
      console.log('✅ Razorpay payout created:', payout.id);
      
      return {
        success: true,
        reference: payout.id,
        status: payout.status,
        timestamp: new Date().toISOString(),
        amount: amount,
        razorpayData: payout,
        message: `Payment of ₹${amount} initiated via Razorpay`,
      };
      */
      
      // PLACEHOLDER RESPONSE (remove when uncommenting above)
      console.log('⚠️  Razorpay code is commented out. Using mock response.');
      return await this.processMockPayment(
        farmer.upi_id ? 'upi' : 'bank_transfer',
        farmer.upi_id || farmer.bank_account_number,
        amount,
        transactionId
      );
      
    } catch (error) {
      console.error('❌ Razorpay payment failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Razorpay payment processing failed',
      };
    }
  }

  // ===================================================================
  // UPI DIRECT PAYMENT (ALTERNATIVE METHOD)
  // ===================================================================
  
  async processUPIPayment(upiId, amount, transactionId) {
    try {
      console.log(`💸 Processing UPI payment to ${upiId}`);
      
      // This would integrate with UPI payment gateway
      // For now, using mock
      
      return await this.processMockPayment('upi', upiId, amount, transactionId);
    } catch (error) {
      console.error('❌ UPI payment failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===================================================================
  // BANK TRANSFER (NEFT/IMPS)
  // ===================================================================
  
  async processBankTransfer(bankDetails, amount, transactionId) {
    try {
      console.log(`🏦 Processing bank transfer to ${bankDetails.account_number}`);
      
      // This would integrate with bank transfer API
      // For now, using mock
      
      return await this.processMockPayment(
        'bank_transfer',
        bankDetails.account_number,
        amount,
        transactionId
      );
    } catch (error) {
      console.error('❌ Bank transfer failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===================================================================
  // PAYMENT VERIFICATION
  // ===================================================================
  
  async verifyPayment(transactionId) {
    try {
      const transaction = await TransactionModel.findById(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }
      
      // For mock payments, always return verified
      if (this.USE_MOCK_PAYMENT) {
        return {
          success: true,
          verified: transaction.status === 'success',
          status: transaction.status,
        };
      }
      
      // For Razorpay, verify with API
      // UNCOMMENT FOR REAL RAZORPAY:
      /*
      const payout = await this.razorpay.payouts.fetch(transaction.payment_reference);
      
      return {
        success: true,
        verified: payout.status === 'processed',
        status: payout.status,
        razorpayData: payout,
      };
      */
      
      return {
        success: true,
        verified: transaction.status === 'success',
        status: transaction.status,
      };
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===================================================================
  // WEBHOOK HANDLER (FOR RAZORPAY CALLBACKS)
  // ===================================================================
  
  async handlePaymentWebhook(webhookData) {
    try {
      console.log('📨 Received payment webhook:', webhookData);
      
      // UNCOMMENT FOR REAL RAZORPAY WEBHOOKS:
      /*
      const crypto = require('crypto');
      
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookData))
        .digest('hex');
      
      if (expectedSignature !== webhookData.signature) {
        throw new Error('Invalid webhook signature');
      }
      
      // Process webhook event
      const event = webhookData.event;
      const payload = webhookData.payload;
      
      if (event === 'payout.processed') {
        // Update transaction status
        await TransactionModel.updateStatus(
          payload.payout.entity.reference_id,
          'success',
          payload
        );
      } else if (event === 'payout.failed') {
        await TransactionModel.updateStatus(
          payload.payout.entity.reference_id,
          'failed',
          payload
        );
      }
      */
      
      return { success: true };
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();