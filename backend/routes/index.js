// ===================================================================
// FILE: backend/routes/index.js
// NEW FILE - CREATE THIS (Central Routes Hub)
// ===================================================================

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const farmerRoutes = require('./farmer.routes');
const claimRoutes = require('./claims.routes');
const blockchainRoutes = require('./blockchain.routes');
const payoutRoutes = require('./payout.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/claims', claimRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/payouts', payoutRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KRISHI RAKSHA API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;