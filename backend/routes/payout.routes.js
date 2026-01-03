// ===================================================================
// FILE: backend/routes/payout.routes.js
// NEW FILE - CREATE THIS
// ===================================================================

const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payout.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Initiate payout (admin/system route)
router.post('/:claimId/initiate', payoutController.initiatePayout);

// Get payout status (protected)
router.get('/:claimId/status', verifyToken, payoutController.getPayoutStatus);

module.exports = router;