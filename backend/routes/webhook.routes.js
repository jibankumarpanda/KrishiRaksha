const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment.service');

// Razorpay webhook handler
router.post('/payment', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookData = JSON.parse(req.body.toString());
    await paymentService.handlePaymentWebhook(webhookData);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;